import mongoose from 'mongoose';
import { IShippingProvider } from './shippingProvider';
import { MockShippingProvider } from './mockShippingProvider';
import { ShiprocketProvider } from './shiprocketProvider';
import { ShippingSettings } from '../../models/ShippingSettings';
import { Product } from '../../models/Product';
import { Shipment, IShipmentDocument } from '../../models/Shipment';
import { Order } from '../../models/Order';
import {
  IServiceabilityResponse,
  IShippingRateResponse,
  IShippingSettings,
} from '@shared/types';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../config/logger';

class ShippingService {
  private providers: Record<string, IShippingProvider> = {
    mock: new MockShippingProvider(),
    shiprocket: new ShiprocketProvider(),
  };

  private async getSettings(): Promise<IShippingSettings> {
    try {
      if (mongoose.connection.readyState === 1) {
        let settings = await ShippingSettings.findOne().maxTimeMS(1000);
        if (settings) {
          return settings.toObject();
        }
      }
      return {
        enableShipping: true,
        freeShippingThreshold: 1499,
        defaultShippingCharge: 79,
        enableCod: true,
        codFee: 25,
        activeProvider: 'mock',
        pickupPincode: '400001',
      };
    } catch {
      return {
        enableShipping: true,
        freeShippingThreshold: 1499,
        defaultShippingCharge: 79,
        enableCod: true,
        codFee: 25,
        activeProvider: 'mock',
        pickupPincode: '400001',
      };
    }
  }


  private async getActiveProvider(): Promise<IShippingProvider> {
    const settings = await this.getSettings();
    const providerKey = settings.activeProvider || 'mock';
    return this.providers[providerKey] || this.providers.mock;
  }

  async checkServiceability(pincode: string): Promise<IServiceabilityResponse> {
    const settings = await this.getSettings();
    if (!settings.enableShipping) {
      return {
        pincode,
        available: false,
        estimatedDeliveryDays: '',
        estimatedDeliveryDate: '',
        codAvailable: false,
        courierPartner: 'None',
        message: 'Shipping is temporarily paused by store administration.',
      };
    }

    const provider = await this.getActiveProvider();
    const result = await provider.checkServiceability({
      pickupPincode: settings.pickupPincode,
      deliveryPincode: pincode,
    });

    return {
      pincode,
      available: result.available,
      city: result.city,
      state: result.state,
      estimatedDeliveryDays: result.estimatedDeliveryDays,
      estimatedDeliveryDate: result.estimatedDeliveryDate,
      codAvailable: result.codAvailable && settings.enableCod,
      courierPartner: result.courierPartner,
      message: result.message,
    };
  }

  async calculateCartShipping(params: {
    pincode: string;
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: 'PREPAID' | 'COD' | 'Razorpay';
    couponDiscount?: number;
  }): Promise<IShippingRateResponse> {
    const { pincode, items, paymentMethod, couponDiscount = 0 } = params;
    const settings = await this.getSettings();

    // 1. Fetch products from MongoDB (Zero-trust backend calculation)
    const productIds = items.map((it) => it.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length === 0) {
      throw new AppError('No valid products found in cart to calculate shipping.', 400, 'EMPTY_CART');
    }

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // 2. Aggregate weight and dimensions
    let totalWeightGrams = 0;
    let maxLength = 30;
    let maxWidth = 25;
    let totalHeight = 0;
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      const qty = Math.max(1, item.quantity);
      const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      subtotal += effectivePrice * qty;

      // Product shipping specs (defaults to 350g per jersey)
      const weight = product.shipping?.weight || 350;
      const length = product.shipping?.length || 30;
      const width = product.shipping?.width || 25;
      const height = product.shipping?.height || 3;

      totalWeightGrams += weight * qty;
      maxLength = Math.max(maxLength, length);
      maxWidth = Math.max(maxWidth, width);
      totalHeight += height * qty;
    }

    // 3. Query Active Courier Provider
    const provider = await this.getActiveProvider();
    const rateResult = await provider.calculateRate({
      pickupPincode: settings.pickupPincode,
      deliveryPincode: pincode,
      weightGrams: totalWeightGrams,
      lengthCm: maxLength,
      widthCm: maxWidth,
      heightCm: Math.max(3, totalHeight),
      declaredValue: subtotal,
      paymentMethod,
    });

    if (!rateResult.available) {
      throw new AppError(`Delivery is unavailable to PIN code ${pincode}`, 400, 'PINCODE_UNAVAILABLE');
    }

    // 4. Free Shipping Rule Evaluation
    const isFreeShipping = subtotal >= settings.freeShippingThreshold;
    const customerShipping = isFreeShipping ? 0 : rateResult.shippingCharge;
    const codCharge = paymentMethod === 'COD' && settings.enableCod ? settings.codFee : 0;
    const finalTotal = Math.max(0, subtotal - couponDiscount + customerShipping + codCharge);

    return {
      available: true,
      pincode,
      totalWeightGrams,
      dimensions: {
        length: maxLength,
        width: maxWidth,
        height: Math.max(3, totalHeight),
      },
      subtotal,
      shippingCharge: customerShipping,
      courierCost: rateResult.courierCost, // What business pays courier internally
      isFreeShipping,
      freeShippingThreshold: settings.freeShippingThreshold,
      codAvailable: settings.enableCod,
      codCharge,
      estimatedDeliveryDays: rateResult.estimatedDeliveryDays,
      estimatedDeliveryDate: rateResult.estimatedDeliveryDate,
      finalTotal,
    };
  }

  async createShipmentForOrder(orderId: string): Promise<IShipmentDocument> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Prevent duplicate shipments
    const existingShipment = await Shipment.findOne({ orderId: order._id });
    if (existingShipment) {
      return existingShipment;
    }

    const settings = await this.getSettings();
    const provider = await this.getActiveProvider();

    // Calculate weight from products
    const productIds = order.items.map((it) => it.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    let totalWeight = 0;
    for (const item of order.items) {
      const p = productMap.get(item.product.toString());
      const w = p?.shipping?.weight || 350;
      totalWeight += w * item.quantity;
    }

    const deliveryPin = order.shippingAddress.pincode || order.shippingAddress.postalCode || '400001';

    const shipmentResult = await provider.createShipment({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      pickupPincode: settings.pickupPincode,
      deliveryPincode: deliveryPin,
      customerName: order.shippingAddress.fullName,
      customerPhone: order.shippingAddress.phone,
      deliveryAddress: `${order.shippingAddress.address || order.shippingAddress.street}, ${order.shippingAddress.apartment || ''}`,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      weightGrams: totalWeight,
      lengthCm: 30,
      widthCm: 25,
      heightCm: Math.max(3, order.items.length * 3),
      items: order.items.map((it) => ({
        name: it.productName,
        quantity: it.quantity,
        price: it.price,
      })),
      paymentMethod: order.paymentMethod as any,
      totalAmount: order.grandTotal,
      shippingCost: order.pricing?.courierCost || 64,
      customerPaidShipping: order.pricing?.shipping || 0,
    });

    const shipment = await Shipment.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      provider: provider.name,
      awbNumber: shipmentResult.awbNumber,
      courierName: shipmentResult.courierName,
      trackingUrl: shipmentResult.trackingUrl,
      weight: totalWeight,
      shippingCost: shipmentResult.shippingCost,
      customerPaidShipping: order.pricing?.shipping || 0,
      codAmount: order.paymentMethod === 'COD' ? order.grandTotal : 0,
      status: 'READY_TO_SHIP',
      estimatedDelivery: shipmentResult.estimatedDelivery,
      pickupPincode: settings.pickupPincode,
      deliveryPincode: deliveryPin,
      statusHistory: [
        {
          status: 'READY_TO_SHIP',
          note: 'Shipment created & AWB generated. Package ready at Mumbai warehouse.',
          location: 'Mumbai Central Fulfillment Hub',
          timestamp: new Date().toISOString(),
        },
      ],
    });

    // Update order with AWB and tracking
    order.shipmentId = shipment._id as any;
    order.trackingNumber = shipmentResult.awbNumber;
    order.trackingCourier = shipmentResult.courierName;
    order.orderStatus = 'Processing';
    await order.save();

    logger.info(`Generated AWB ${shipmentResult.awbNumber} for order ${order.orderNumber}`);
    return shipment;
  }
}

export const shippingService = new ShippingService();

