import mongoose, { Document, Schema } from 'mongoose';
import { ICoupon, CouponDiscountType } from '@shared/types';

export interface ICouponDocument extends Omit<ICoupon, '_id' | 'validFrom' | 'validUntil'>, Document {
  validFrom: Date;
  validUntil: Date;
  usedBy: Array<{ userId: any; count: number }>;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 1 },
    discountPercent: { type: Number },
    maxDiscountAmount: { type: Number },
    minOrderAmount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    userUsageLimit: { type: Number, default: 1 },
    usedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 1 },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICouponDocument>('Coupon', CouponSchema);
