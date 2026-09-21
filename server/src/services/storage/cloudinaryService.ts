import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

// Configure Cloudinary SDK
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
  logger.info('☁️ Cloudinary SDK configured successfully.');
} else {
  logger.info('ℹ️ Cloudinary credentials not configured. Local file storage fallback active.');
}

export interface CloudinaryUploadResult {
  secure_url: string;
  url: string;
  public_id?: string;
}

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'jersey-world/products'
): Promise<CloudinaryUploadResult> => {
  if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });

      // Safely cleanup temporary local file
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          logger.warn('Failed to delete temporary local file after Cloudinary upload:', e);
        }
      }

      return {
        secure_url: result.secure_url,
        url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Graceful local fallback if Cloudinary is not configured in dev
  const targetDir = path.resolve(__dirname, '../../../uploads/products');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fileName = path.basename(filePath);
  const targetPath = path.join(targetDir, fileName);

  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, targetPath);
  }

  const localUrl = `/uploads/products/${fileName}`;
  return {
    secure_url: localUrl,
    url: localUrl,
    public_id: `local_${fileName}`,
  };
};

export class CloudinaryService {
  public static upload = uploadToCloudinary;
}

