import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { TryOnJob } from '../models/TryOnJob';
import { SavedLook } from '../models/TryOnJob';
import { Product } from '../models/Product';
import { StorageService } from '../services/storage/storageService';
import { AIService } from '../services/ai/aiService';
import { TryOnQueue } from '../services/ai/tryOnQueue';
import { AppError } from '../middleware/errorHandler';

export const validatePhoto = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No photo uploaded.', 400));
    }

    const validation = await AIService.validateUserImage(req.file.path);
    if (!validation.valid) {
      return next(new AppError(validation.message || 'Image validation failed.', 400));
    }

    // Optimize and persist user photo
    const processed = await StorageService.processUserPhoto(req.file.path);

    res.status(200).json({
      success: true,
      message: 'Photo passed validation criteria.',
      photoUrl: processed.url,
      details: validation.details,
    });
  } catch (error) {
    next(error);
  }
};

export const createTryOnJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const { jerseyId, selectedSize = 'L', sourceImageUrl, guestSessionId } = req.body;

    // Check daily quota
    const quota = await TryOnQueue.checkQuota(userId);
    if (!quota.allowed) {
      return next(
        new AppError(
          `You have reached your daily limit of ${quota.limit} AI try-on generations. Please check back tomorrow!`,
          429,
          'QUOTA_EXCEEDED'
        )
      );
    }

    let photoUrl = sourceImageUrl;

    // If file is uploaded directly in multipart form
    if (req.file) {
      const validation = await AIService.validateUserImage(req.file.path);
      if (!validation.valid) {
        return next(new AppError(validation.message || 'Invalid photo.', 400));
      }
      const processed = await StorageService.processUserPhoto(req.file.path);
      photoUrl = processed.url;
    }

    if (!photoUrl) {
      return next(new AppError('Photo is required for Virtual Try-On.', 400));
    }

    const jersey = await Product.findById(jerseyId);
    if (!jersey || !jersey.active) {
      return next(new AppError('Jersey is not available.', 404));
    }

    // Create TryOnJob
    const job = await TryOnJob.create({
      userId: userId ? (userId as any) : undefined,
      guestSessionId: !userId ? guestSessionId || 'guest' : undefined,
      sourceImageUrl: photoUrl,
      jerseyId: jersey._id,
      selectedSize,
      status: 'queued',
      progressPercent: 5,
      statusMessage: 'Queued in fitting room...',
    });

    // Enqueue job asynchronously
    TryOnQueue.enqueue(job._id.toString());

    res.status(202).json({
      success: true,
      message: 'Virtual Try-On job enqueued.',
      jobId: job._id,
      status: job.status,
      quotaRemaining: quota.remaining - 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await TryOnJob.findById(jobId).populate('jerseyId');
    if (!job) {
      return next(new AppError('Try-on job not found.', 404));
    }

    res.status(200).json({
      success: true,
      job: {
        _id: job._id,
        status: job.status,
        progressPercent: job.progressPercent,
        statusMessage: job.statusMessage,
        sourceImageUrl: job.sourceImageUrl,
        resultImageUrl: job.resultImageUrl,
        jersey: job.jerseyId,
        selectedSize: job.selectedSize,
        error: job.error,
        metrics: job.metrics,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveLook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { jerseyId, resultImageUrl, sourceImageUrl, selectedSize, notes } = req.body;

    const savedLook = await SavedLook.create({
      user: userId,
      jersey: jerseyId,
      resultImageUrl,
      sourceImageUrl,
      selectedSize: selectedSize || 'L',
      notes,
    });

    const populated = await SavedLook.findById(savedLook._id).populate('jersey');

    res.status(201).json({
      success: true,
      message: 'Look saved to your collection!',
      look: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySavedLooks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const looks = await SavedLook.find({ user: userId }).populate('jersey').sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      looks,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedLook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { lookId } = req.params;

    const look = await SavedLook.findOneAndDelete({ _id: lookId, user: userId });
    if (!look) {
      return next(new AppError('Saved look not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Saved look deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const getUsageQuota = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user ? req.user._id.toString() : undefined;
    const quota = await TryOnQueue.checkQuota(userId);

    res.status(200).json({
      success: true,
      quota,
    });
  } catch (error) {
    next(error);
  }
};
