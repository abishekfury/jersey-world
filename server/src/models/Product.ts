import mongoose, { Document, Schema } from 'mongoose';
import { IProduct, JerseyType, JerseySize } from '@shared/types';

export interface IProductDocument extends Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>, Document {}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    team: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    league: { type: String, required: true, index: true },
    season: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        'Home',
        'Away',
        'Third Kit',
        'Training',
        'Retro',
        'Goalkeeper',
        'Limited Edition',
        'Fan Version',
        'Player Version',
        'Custom Jersey',
      ],
      required: true,
      index: true,
    },
    description: { type: String, required: true },
    material: { type: String, default: '100% Recycled Polyester (AEROREADY / Dri-FIT Adv)' },
    fit: { type: String, default: 'Athletic Slim Fit' },
    washingInstructions: { type: String, default: 'Machine wash cold, inside out. Do not tumble dry or iron print.' },
    authenticityInfo: { type: String, default: 'Authentic club crest with heat-sealed sponsor branding and woven verification tag.' },
    price: { type: Number, required: true, min: 0, index: true },
    discountPrice: { type: Number, min: 0 },
    shipping: {
      weight: { type: Number, required: true, default: 350 }, // grams
      length: { type: Number, required: true, default: 30 },  // cm
      width: { type: Number, required: true, default: 25 },   // cm
      height: { type: Number, required: true, default: 3 },   // cm
    },
    images: {
      front: { type: String, required: true },
      back: { type: String, required: true },
      detail: { type: String },
      lifestyle: { type: String },
    },
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      default: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    sizeStock: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, default: 10, min: 0 },
        sku: { type: String, trim: true },
        priceOverride: { type: Number, min: 0 },
        color: { type: String },
      },
    ],
    totalStock: { type: Number, required: true, default: 50, min: 0 },

    colors: [{ type: String }],
    tags: [{ type: String, index: true }],
    aiAsset: {
      frontImage: { type: String, required: true },
      backImage: { type: String },
      maskUrl: { type: String },
      referenceImage: { type: String, required: true },
      category: { type: String, default: 'upper_body' },
      providerMetadata: { type: Schema.Types.Mixed },
    },
    rating: { type: Number, default: 5.0, min: 0, max: 5, index: true },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isCustomizable: { type: Boolean, default: true },
    customizationPrice: { type: Number, default: 299, min: 0 },
    gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids'], default: 'Unisex', index: true },
    active: { type: Boolean, default: true, index: true },

  },
  {
    timestamps: true,
  }
);

// Compound text and facet indexes for fast catalog searches
ProductSchema.index({ name: 'text', team: 'text', country: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ team: 1, season: 1, type: 1 });
ProductSchema.index({ price: 1, rating: -1 });

export const Product = mongoose.model<IProductDocument>('Product', ProductSchema);
