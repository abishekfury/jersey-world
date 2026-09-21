import { Router, Request, Response, NextFunction } from 'express';
import { uploadSingleImage, uploadProductGallery } from '../middleware/upload';
import { uploadToCloudinary } from '../services/storage/cloudinaryService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Single image upload route
// Supports field name 'image' (or fallback 'file')
router.post('/', uploadSingleImage, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided for upload.', 400));
    }

    const folder = (req.query.folder as string) || 'jersey-world/products';
    const result = await uploadToCloudinary(req.file.path, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
});

// Alias route: /upload for direct compatibility
router.post('/upload', uploadSingleImage, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided for upload.', 400));
    }

    const folder = (req.query.folder as string) || 'jersey-world/products';
    const result = await uploadToCloudinary(req.file.path, folder);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
});

// Product Gallery Multi-Angle Upload
router.post('/gallery', uploadProductGallery, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files || Object.keys(files).length === 0) {
      return next(new AppError('No gallery images uploaded.', 400));
    }

    const galleryUrls: Record<string, string> = {};

    for (const [key, fileList] of Object.entries(files)) {
      if (fileList && fileList[0]) {
        const uploadResult = await uploadToCloudinary(fileList[0].path, `jersey-world/gallery/${key}`);
        galleryUrls[key] = uploadResult.secure_url;
      }
    }

    res.status(200).json({
      success: true,
      images: galleryUrls,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

