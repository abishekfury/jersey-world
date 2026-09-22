import mongoose, { Document, Schema } from 'mongoose';
import { IShippingSettings } from '@shared/types';

export interface IShippingSettingsDocument extends Omit<IShippingSettings, '_id'>, Document {}

const ShippingSettingsSchema = new Schema<IShippingSettingsDocument>(
  {
    enableShipping: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 1499 }, // Orders >= ₹1499 get FREE delivery
    defaultShippingCharge: { type: Number, default: 79 },
    enableCod: { type: Boolean, default: false },
    codFee: { type: Number, default: 0 },
    activeProvider: { type: String, enum: ['mock', 'shiprocket'], default: 'mock' },
    pickupPincode: { type: String, default: '400001' }, // Mumbai central hub
  },
  { timestamps: true }
);

export const ShippingSettings = mongoose.model<IShippingSettingsDocument>(
  'ShippingSettings',
  ShippingSettingsSchema
);

