import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';

export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const checkReviewEligibility = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId } = req.params;

    const deliveredOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      orderStatus: 'Delivered',
    });

    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    res.status(200).json({
      success: true,
      canReview: !!deliveredOrder && !existingReview,
      hasDeliveredOrder: !!deliveredOrder,
      hasExistingReview: !!existingReview,
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

  try {
    const userId = req.user!._id;
    const { productId, rating, title, comment, images } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be an integer between 1 and 5.', 400));
    }

    if (!title || !comment) {
      return next(new AppError('Review title and comment are required.', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ user: userId, product: productId });
    if (alreadyReviewed) {
      return next(new AppError('You have already submitted a review for this jersey.', 400));
    }

    // Verify user actually purchased and received the order (Delivered status)
    const hasDeliveredPurchase = await Order.exists({
      user: userId,
      'items.product': productId,
      orderStatus: 'Delivered',
    });

    if (!hasDeliveredPurchase) {
      return next(
        new AppError(
          'Reviews are restricted to verified buyers who have received delivery of this jersey.',
          403,
          'DELIVERY_REQUIRED_FOR_REVIEW'
        )
      );
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      title: String(title).trim(),
      comment: String(comment).trim(),
      images: Array.isArray(images) ? images : [],
      isVerifiedPurchase: true,
      isApproved: true,
    });

    // Recalculate Product average rating
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / (allReviews.length || 1)).toFixed(1));

    product.rating = avgRating;
    product.numReviews = allReviews.length;
    await product.save();

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};
