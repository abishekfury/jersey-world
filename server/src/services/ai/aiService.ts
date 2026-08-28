import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { config } from '../../config/env';
import { logger } from '../../config/logger';
import { StorageService } from '../storage/storageService';
import { NeuralCanvasEngine } from './neuralCanvasEngine';
import { GeminiProvider } from './geminiProvider';
import { IProductDocument } from '../../models/Product';

export interface TryOnGenerationParams {
  userPhotoUrl: string;
  jersey: IProductDocument;
  selectedSize: string;
  customName?: string;
  customNumber?: string;
}

export interface TryOnResult {
  resultImageUrl: string;
  provider: string;
  durationMs: number;
  estimatedCost: number;
}

export interface ImageValidationResult {
  valid: boolean;
  message?: string;
  details?: {
    width: number;
    height: number;
    aspectRatio: number;
    hasProperResolution: boolean;
  };
}

export class AIService {
  /**
   * Validate uploaded user photo before running fitting room pipeline
   */
  static async validateUserImage(filePath: string): Promise<ImageValidationResult> {
    try {
      const metadata = await sharp(filePath).metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;

      if (width < 250 || height < 250) {
        return {
          valid: false,
          message: 'Image is too small. Please provide a clear upper-body photo of at least 250x250 pixels.',
        };
      }

      const aspectRatio = width / height;
      if (aspectRatio > 3.0 || aspectRatio < 0.3) {
        return {
          valid: false,
          message: 'Unusual photo aspect ratio. Please provide a standard portrait or vertical photo.',
        };
      }

      return {
        valid: true,
        details: {
          width,
          height,
          aspectRatio,
          hasProperResolution: true,
        },
      };
    } catch (error: any) {
      logger.error('Error validating image in AIService:', error);
      return {
        valid: false,
        message: 'Could not inspect image. Please verify the file is a valid JPEG, PNG, or WebP photo.',
      };
    }
  }

  /**
   * Provider-independent Virtual Try-On Generation
   */
  static async generateVirtualTryOn(params: TryOnGenerationParams): Promise<TryOnResult> {
    const startTime = Date.now();
    const provider = config.AI_PROVIDER || 'neural-canvas';

    logger.info(`Starting Virtual Try-On generation using provider: ${provider}`);

    // Resolve local absolute file path for user image
    const relativeUserPath = params.userPhotoUrl.replace('/uploads/', '');
    const userPhotoAbsolutePath = path.resolve(__dirname, '../../../uploads', relativeUserPath);

    if (!fs.existsSync(userPhotoAbsolutePath)) {
      throw new Error('User source photo not found on storage.');
    }

    let resultBuffer: Buffer;
    let usedProvider = 'neural-canvas';
    let estimatedCost = 0.005;

    // Check if Gemini or external provider should be used
    if (provider === 'gemini' && (config.GEMINI_API_KEY || config.AI_API_KEY)) {
      try {
        const geminiRes = await GeminiProvider.generate({
          userPhotoBase64: fs.readFileSync(userPhotoAbsolutePath).toString('base64'),
          jerseyPrompt: GeminiProvider.buildPrompt(
            params.jersey.team,
            params.jersey.season,
            params.jersey.type,
            params.customName,
            params.customNumber
          ),
        });

        if (geminiRes) {
          resultBuffer = Buffer.from(geminiRes, 'base64');
          usedProvider = 'gemini-vision';
          estimatedCost = 0.02;
        } else {
          // Fallback to neural canvas
          resultBuffer = await NeuralCanvasEngine.renderFit({
            userPhotoPath: userPhotoAbsolutePath,
            jerseyFrontUrl: params.jersey.images.front,
            jerseyName: params.jersey.name,
            team: params.jersey.team,
            size: params.selectedSize,
          });
        }
      } catch {
        resultBuffer = await NeuralCanvasEngine.renderFit({
          userPhotoPath: userPhotoAbsolutePath,
          jerseyFrontUrl: params.jersey.images.front,
          jerseyName: params.jersey.name,
          team: params.jersey.team,
          size: params.selectedSize,
        });
      }
    } else {
      // Default high-fidelity Neural Canvas Engine
      resultBuffer = await NeuralCanvasEngine.renderFit({
        userPhotoPath: userPhotoAbsolutePath,
        jerseyFrontUrl: params.jersey.images.front,
        jerseyName: params.jersey.name,
        team: params.jersey.team,
        size: params.selectedSize,
      });
    }

    // Save final generated result
    const resultImageUrl = await StorageService.saveTryOnResult(resultBuffer);
    const durationMs = Date.now() - startTime;

    return {
      resultImageUrl,
      provider: usedProvider,
      durationMs,
      estimatedCost,
    };
  }

  /**
   * Process & generate AI mask/metadata for a new Jersey catalog item
   */
  static async processJerseyImage(imagePath: string): Promise<{ frontImage: string; referenceImage: string }> {
    const processed = await StorageService.processUserPhoto(imagePath);
    return {
      frontImage: processed.url,
      referenceImage: processed.url,
    };
  }
}
