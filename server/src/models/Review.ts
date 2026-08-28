import mongoose, { Document, Schema } from 'mongoose';
import { IReview } from '@shared/types';

export interface IReviewDocument extends Omit<IReview, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    user: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId as any,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, rating: -1 });

export const Review = mongoose.model<IReviewDocument>('Review', ReviewSchema);
