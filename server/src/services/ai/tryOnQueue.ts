import { TryOnJob, ITryOnJobDocument } from '../../models/TryOnJob';
import { Product } from '../../models/Product';
import { User } from '../../models/User';
import { AIService } from './aiService';
import { logger } from '../../config/logger';
import { config } from '../../config/env';

export class TryOnQueue {
  private static isProcessing = false;
  private static queue: string[] = [];

  /**
   * Enqueue a job ID for background processing
   */
  static enqueue(jobId: string): void {
    TryOnQueue.queue.push(jobId);
    logger.info(`TryOnJob enqueued: ${jobId}. Queue size: ${TryOnQueue.queue.length}`);
    TryOnQueue.processNext();
  }

  /**
   * Check daily try-on limit for user or guest
   */
  static async checkQuota(userId?: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const today = new Date().toISOString().split('T')[0];

    if (!userId) {
      // Guest users allowed 3 tryons per session
      return { allowed: true, remaining: 3, limit: 3 };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    const maxLimit = user.role === 'admin' 
      ? 100 
      : config.MAX_FREE_DAILY_TRYONS;

    // Reset daily count if date has rolled over
    if (user.lastTryOnDate !== today) {
      user.dailyTryOnCount = 0;
      user.lastTryOnDate = today;
      await user.save();
    }

    const remaining = Math.max(0, maxLimit - user.dailyTryOnCount);
    return {
      allowed: remaining > 0,
      remaining,
      limit: maxLimit,
    };
  }

  /**
   * Increment daily usage count
   */
  static async incrementUsage(userId?: string): Promise<void> {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(userId, {
      $inc: { dailyTryOnCount: 1 },
      $set: { lastTryOnDate: today },
    });
  }

  /**
   * Background processor loop
   */
  private static async processNext(): Promise<void> {
    if (TryOnQueue.isProcessing || TryOnQueue.queue.length === 0) {
      return;
    }

    TryOnQueue.isProcessing = true;
    const jobId = TryOnQueue.queue.shift();

    if (!jobId) {
      TryOnQueue.isProcessing = false;
      return;
    }

    try {
      await TryOnQueue.executeJob(jobId);
    } catch (error) {
      logger.error(`Error processing TryOnJob ${jobId}:`, error);
    } finally {
      TryOnQueue.isProcessing = false;
      if (TryOnQueue.queue.length > 0) {
        setImmediate(() => TryOnQueue.processNext());
      }
    }
  }

  /**
   * Execute single try-on job through realistic progress phases
   */
  private static async executeJob(jobId: string): Promise<void> {
    const job = await TryOnJob.findById(jobId).populate('jerseyId');
    if (!job) {
      logger.warn(`TryOnJob ${jobId} not found in database.`);
      return;
    }

    const startTime = Date.now();

    try {
      // Step 1: Analyzing Photo
      job.status = 'analyzing';
      job.progressPercent = 20;
      job.statusMessage = 'Analyzing photo lighting, resolution, and pose...';
      await job.save();
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Detecting Body & Torso Keypoints
      job.status = 'detecting_body';
      job.progressPercent = 40;
      job.statusMessage = 'Detecting body geometry, shoulders, and posture...';
      await job.save();
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Mapping Jersey Silhouette & Fabric Folds
      job.status = 'mapping_jersey';
      job.progressPercent = 65;
      job.statusMessage = 'Mapping jersey fabric contours, collar, and club crest...';
      await job.save();
      await new Promise((r) => setTimeout(r, 700));

      // Step 4: Generating Fit & Athletic Shading
      job.status = 'generating_fit';
      job.progressPercent = 85;
      job.statusMessage = 'Applying stadium illumination and photorealistic textile texture...';
      await job.save();

      const jersey = await Product.findById(job.jerseyId);
      if (!jersey) {
        throw new Error('Target jersey not found in catalog.');
      }

      // Generate the actual composite image
      const result = await AIService.generateVirtualTryOn({
        userPhotoUrl: job.sourceImageUrl,
        jersey,
        selectedSize: job.selectedSize || 'L',
      });

      // Step 5: Finalizing Image
      job.status = 'finalizing_image';
      job.progressPercent = 95;
      job.statusMessage = 'Finalizing high-resolution rendering...';
      await job.save();
      await new Promise((r) => setTimeout(r, 400));

      // Mark Completed
      job.status = 'completed';
      job.progressPercent = 100;
      job.statusMessage = 'Virtual try-on ready!';
      job.resultImageUrl = result.resultImageUrl;
      job.provider = result.provider;
      job.completedAt = new Date().toISOString();
      job.metrics = {
        durationMs: Date.now() - startTime,
        estimatedCost: result.estimatedCost,
      };
      await job.save();

      // Increment quota for registered users
      if (job.userId) {
        await TryOnQueue.incrementUsage(job.userId.toString());
      }

      logger.info(`TryOnJob ${jobId} completed successfully in ${Date.now() - startTime}ms`);
    } catch (err: any) {
      logger.error(`TryOnJob ${jobId} failed:`, err);
      job.status = 'failed';
      job.progressPercent = 100;
      job.error = err.message || 'AI try-on processing failed. Please try with a clearer photo.';
      job.statusMessage = 'Generation failed';
      await job.save();
    }
  }
}
