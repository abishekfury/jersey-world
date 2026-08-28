import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');
const TRYON_DIR = path.join(UPLOADS_ROOT, 'tryon');
const PRODUCTS_DIR = path.join(UPLOADS_ROOT, 'products');
const AVATARS_DIR = path.join(UPLOADS_ROOT, 'avatars');

// Ensure upload folders exist
[TRYON_DIR, PRODUCTS_DIR, AVATARS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface IProcessedImage {
  url: string;
  filePath: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export class StorageService {
  /**
   * Process and securely optimize uploaded user photo for AI Try-On
   */
  static async processUserPhoto(tempFilePath: string): Promise<IProcessedImage> {
    try {
      const metadata = await sharp(tempFilePath).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }

      // Check min resolution
      if (metadata.width < 250 || metadata.height < 250) {
        throw new Error('Image resolution too low. Minimum 250x250 pixels required.');
      }

      const fileName = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.webp`;
      const targetPath = path.join(TRYON_DIR, fileName);

      // Resize to max 1200x1200 maintaining aspect ratio and convert to optimized WebP
      const processed = await sharp(tempFilePath)
        .rotate() // auto-orient based on EXIF
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 88 })
        .toFile(targetPath);

      // Remove temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      const publicUrl = `/uploads/tryon/${fileName}`;

      return {
        url: publicUrl,
        filePath: targetPath,
        width: processed.width,
        height: processed.height,
        format: 'webp',
        size: processed.size,
      };
    } catch (error) {
      logger.error('Error processing user photo in StorageService:', error);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw error;
    }
  }

  /**
   * Save generated try-on result buffer
   */
  static async saveTryOnResult(imageBuffer: Buffer): Promise<string> {
    const fileName = `result_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.webp`;
    const targetPath = path.join(TRYON_DIR, fileName);

    await sharp(imageBuffer)
      .webp({ quality: 92 })
      .toFile(targetPath);

    return `/uploads/tryon/${fileName}`;
  }

  /**
   * Delete uploaded file
   */
  static async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith('/uploads/')) return false;
      const relativePath = fileUrl.replace('/uploads/', '');
      const absolutePath = path.join(UPLOADS_ROOT, relativePath);

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Failed to delete file:', err);
      return false;
    }
  }
}

export default StorageService;
