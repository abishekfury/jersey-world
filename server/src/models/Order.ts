import mongoose, { Document, Schema } from 'mongoose';
import { IOrder, IOrderItem, OrderStatus, PaymentMethodType, PaymentStatus, IOrderPricing } from '@shared/types';

export interface IOrderDocument extends Omit<IOrder, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId as any, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    team: { type: String, required: true },
    season: { type: String, required: true },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    customization: {
      playerName: { type: String },
      playerNumber: { type: String },
    },
  },
  { _id: true }
);

const PricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    customerShippingCharge: { type: Number, default: 0 },
    courierCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId as any, ref: 'User', required: false, index: true },
    guestEmail: { type: String, trim: true, lowercase: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, default: '' },
      street: { type: String, default: '' },
      apartment: { type: String },
      area: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['PREPAID', 'COD', 'Razorpay'],
      required: true,
      default: 'PREPAID',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentResult: {
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
      paidAt: { type: String },
    },
    pricing: {
      type: PricingSchema,
      required: true,
      default: function (this: any) {
        return {
          subtotal: this.subtotal || 0,
          discount: this.discount || 0,
          shipping: this.shipping || 0,
          codFee: 0,
          tax: this.tax || 0,
          total: this.grandTotal || 0,
        };
      },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
        'Refunded',
      ],
      default: 'Pending',
      index: true,
    },
    returnDetails: {
      reason: { type: String },
      customerNotes: { type: String },
      requestedAt: { type: String },
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'], default: 'PENDING' },
      adminNotes: { type: String },
    },
    shipmentId: { type: Schema.Types.ObjectId as any, ref: 'Shipment' },
    trackingNumber: { type: String },
    trackingCourier: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        updatedAt: { type: String, default: () => new Date().toISOString() },
      },
    ],

  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
