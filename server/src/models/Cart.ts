import mongoose, { Document, Schema } from 'mongoose';
import { ICart, ICartItem } from '@shared/types';

export interface ICartDocument extends Omit<ICart, '_id' | 'updatedAt'>, Document {}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId as any, ref: 'Product', required: true },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    customization: {
      playerName: { type: String, trim: true, maxlength: 16 },
      playerNumber: { type: String, trim: true, maxlength: 2 },
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICartDocument>(
  {
    user: { type: Schema.Types.ObjectId as any, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    couponCode: { type: String },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICartDocument>('Cart', CartSchema);
