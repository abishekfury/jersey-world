import mongoose, { Document, Schema } from 'mongoose';
import { IShipment, ShipmentStatus } from '@shared/types';

export interface IShipmentDocument extends Omit<IShipment, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentStatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        'PENDING',
        'READY_TO_SHIP',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RTO',
      ],
      required: true,
    },
    note: { type: String },
    location: { type: String },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipmentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId as any, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    provider: { type: String, required: true, default: 'Shiprocket' },
    awbNumber: { type: String, required: true, unique: true, index: true },
    courierName: { type: String, default: 'BlueDart Express' },
    trackingUrl: { type: String },
    weight: { type: Number, required: true }, // in grams
    dimensions: {
      length: { type: Number, required: true, default: 30 },
      width: { type: Number, required: true, default: 25 },
      height: { type: Number, required: true, default: 5 },
    },
    shippingCost: { type: Number, required: true, default: 64 }, // Business courier cost
    customerPaidShipping: { type: Number, required: true, default: 0 },
    codAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'PENDING',
        'READY_TO_SHIP',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RTO',
      ],
      default: 'READY_TO_SHIP',
      index: true,
    },
    estimatedDelivery: { type: String, default: '3-5 business days' },
    pickupPincode: { type: String, required: true, default: '400001' },
    deliveryPincode: { type: String, required: true, index: true },
    statusHistory: [ShipmentStatusHistorySchema],
  },
  {
    timestamps: true,
  }
);

export const Shipment = mongoose.model<IShipmentDocument>('Shipment', ShipmentSchema);

