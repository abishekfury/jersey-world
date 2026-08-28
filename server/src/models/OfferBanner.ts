import mongoose, { Document, Schema } from 'mongoose';
import { IOfferBanner } from '@shared/types';

export interface IOfferBannerDocument extends Omit<IOfferBanner, '_id'>, Document {}

const OfferBannerSchema = new Schema<IOfferBannerDocument>(
  {
    badgeText: { type: String, default: 'EXCLUSIVE STORE OFFER' },
    discountHeadline: { type: String, default: 'SPECIAL DISCOUNT' },
    description: {
      type: String,
      default: 'Use official promo code at checkout to unlock savings on matchwear and fan kits.',
    },
    couponCode: { type: String, default: 'WORLD20' },
    buttonText: { type: String, default: 'Shop Collection' },
    buttonLink: { type: String, default: '/shop' },
    leftImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85',
    },
    rightImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const OfferBanner = mongoose.model<IOfferBannerDocument>('OfferBanner', OfferBannerSchema);
