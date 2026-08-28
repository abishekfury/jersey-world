import mongoose, { Document, Schema } from 'mongoose';
import { ITryOnJob, TryOnJobStatus, ISavedLook } from '@shared/types';

export interface ITryOnJobDocument extends Omit<ITryOnJob, '_id' | 'createdAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const TryOnJobSchema = new Schema<ITryOnJobDocument>(
  {
    userId: { type: Schema.Types.ObjectId as any, ref: 'User', index: true },
    guestSessionId: { type: String, index: true },
    sourceImageUrl: { type: String, required: true },
    jerseyId: { type: Schema.Types.ObjectId as any, ref: 'Product', required: true, index: true },
    selectedSize: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], default: 'L' },
    resultImageUrl: { type: String },
    status: {
      type: String,
      enum: [
        'queued',
        'analyzing',
        'detecting_body',
        'mapping_jersey',
        'generating_fit',
        'finalizing_image',
        'completed',
        'failed',
        'expired',
      ],
      default: 'queued',
      index: true,
    },
    progressPercent: { type: Number, default: 0 },
    statusMessage: { type: String, default: 'Job queued' },
    provider: { type: String, default: 'neural-canvas' },
    error: { type: String },
    metrics: {
      durationMs: { type: Number },
      estimatedCost: { type: Number, default: 0.005 },
    },
    completedAt: { type: String },
    expiresAt: {
      type: String,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  { timestamps: true }
);

TryOnJobSchema.index({ createdAt: -1 });

export const TryOnJob = mongoose.model<ITryOnJobDocument>('TryOnJob', TryOnJobSchema);

export interface ISavedLookDocument extends Omit<ISavedLook, '_id' | 'createdAt'>, Document {}

const SavedLookSchema = new Schema<ISavedLookDocument>(
  {
    user: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, index: true },
    jersey: { type: Schema.Types.ObjectId as any, ref: 'Product', required: true },
    resultImageUrl: { type: String, required: true },
    sourceImageUrl: { type: String },
    selectedSize: { type: String, default: 'L' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const SavedLook = mongoose.model<ISavedLookDocument>('SavedLook', SavedLookSchema);

export { Coupon, ICouponDocument } from './Coupon';

