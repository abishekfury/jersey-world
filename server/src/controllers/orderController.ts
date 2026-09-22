import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { PaymentService } from '../services/payment/paymentService';
import { shippingService } from '../services/shipping/shippingService';
import { NotificationService } from '../services/notification/notificationService';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config/env';

/**
 * Atomically decrements stock for order items with race condition / concurrency protection.
 * Throws AppError if stock runs out concurrently.
 */
const atomicallyDeductInventory = async (items: any[]) => {
  const deductedItems: Array<{ productId: string; size: string; quantity: number }> = [];

  for (const item of items) {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.product,
        'sizeStock.size': item.size,
        'sizeStock.stock': { $gte: item.quantity },
        totalStock: { $gte: item.quantity },
      },
      {
        $inc: {
          'sizeStock.$.stock': -item.quantity,
          totalStock: -item.quantity,
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      // Concurrency race: Roll back previously decremented items
      for (const rolledBack of deductedItems) {
        await Product.updateOne(
          { _id: rolledBack.productId, 'sizeStock.size': rolledBack.size },
          {
            $inc: {
              'sizeStock.$.stock': rolledBack.quantity,
              totalStock: rolledBack.quantity,
            },
          }
        );
      }
      throw new AppError(
        `Insufficient stock for item (Size: ${item.size}). It may have just sold out.`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }

    deductedItems.push({
      productId: item.product.toString(),
      size: item.size,
      quantity: item.quantity,
    });
  }
};

/**
 * Atomically restores stock when an order is cancelled or returned.
 */
const atomicallyRestoreInventory = async (items: any[]) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product, 'sizeStock.size': item.size },
      {
        $inc: {
          'sizeStock.$.stock': item.quantity,
          totalStock: item.quantity,
        },
      }
    );
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod = 'PREPAID', items: bodyItems, couponCode: bodyCouponCode } = req.body;

    if (!shippingAddress || (!shippingAddress.pincode && !shippingAddress.postalCode)) {
      return next(new AppError('Complete delivery address with PIN code is required.', 400));
    }

    const deliveryPincode = (shippingAddress.pincode || shippingAddress.postalCode || '').trim();
    const guestEmail = (shippingAddress.email || req.body.email || req.user?.email || '').trim().toLowerCase();

    // 1. Resolve User (if logged in, or find/create guest account)
    let orderUserId = req.user?._id;
    if (!orderUserId && guestEmail) {
      let guestUser = await User.findOne({ email: guestEmail });
      if (!guestUser) {
        guestUser = await User.create({
          name: shippingAddress.fullName || 'Guest Customer',
          email: guestEmail,
          phone: shippingAddress.phone || '',
          authProvider: 'otp',
          isEmailVerified: false,
          role: 'customer',
        });
      }
      orderUserId = guestUser._id;
    }

    // 2. Resolve items & coupon (from Cart if logged in, or from body for guest)
    let cartItems: any[] = [];
    let cartCouponCode = bodyCouponCode;

    if (req.user) {
      const dbCart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (dbCart && dbCart.items && dbCart.items.length > 0) {
        cartItems = dbCart.items;
        cartCouponCode = dbCart.couponCode || bodyCouponCode;
      }
    }

    if (cartItems.length === 0 && bodyItems && Array.isArray(bodyItems) && bodyItems.length > 0) {
      for (const bItem of bodyItems) {
        const prodId = bItem.productId || (typeof bItem.product === 'object' ? bItem.product?._id : bItem.product);
        const productDoc = await Product.findById(prodId);
        if (productDoc) {
          cartItems.push({
            product: productDoc,
            size: bItem.size,
            quantity: bItem.quantity || 1,
            customization: bItem.customization,
          });
        }
      }
    }

    if (cartItems.length === 0) {
      return next(new AppError('Your cart is empty.', 400));
    }

    // 3. Verify stock and calculate zero-trust items from database
    const orderItems: any[] = [];
    const cartItemsForShipping: Array<{ productId: string; quantity: number }> = [];
    let calculatedSubtotal = 0;

    for (const item of cartItems) {
      const product = item.product as any;
      if (!product || !product.active) {
        return next(new AppError(`Jersey ${product?.name || ''} is no longer active.`, 400));
      }

      const sizeStock = product.sizeStock?.find((s: any) => s.size === item.size);
      if (sizeStock && sizeStock.stock < item.quantity) {
        return next(
          new AppError(`Only ${sizeStock.stock} units available for ${product.name} (Size: ${item.size}).`, 400)
        );
      }

      const basePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;
      const effectiveUnitPrice = basePrice;

      calculatedSubtotal += effectiveUnitPrice * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images?.front,
        team: product.team,
        season: product.season,
        size: item.size,
        quantity: item.quantity,
        price: effectiveUnitPrice,
      });

      cartItemsForShipping.push({
        productId: product._id.toString(),
        quantity: item.quantity,
      });
    }

    // 4. Zero-Trust Coupon Recalculation
    let validatedDiscount = 0;
    let usedCouponDoc: any = null;

    if (cartCouponCode) {
      const now = new Date();
      usedCouponDoc = await Coupon.findOne({
        code: cartCouponCode.toUpperCase(),
        active: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      });

      if (usedCouponDoc && calculatedSubtotal >= (usedCouponDoc.minOrderAmount || 0)) {
        if (usedCouponDoc.discountType === 'percentage') {
          validatedDiscount = (calculatedSubtotal * usedCouponDoc.discountValue) / 100;
          if (usedCouponDoc.maxDiscountAmount && validatedDiscount > usedCouponDoc.maxDiscountAmount) {
            validatedDiscount = usedCouponDoc.maxDiscountAmount;
          }
        } else {
          validatedDiscount = Math.min(usedCouponDoc.discountValue, calculatedSubtotal);
        }
        validatedDiscount = Math.min(validatedDiscount, calculatedSubtotal);
      }
    }

    // 5. Zero-Trust Payment Validation (Prepaid only via Razorpay)
    if (paymentMethod === 'COD') {
      return next(
        new AppError(
          'Cash on Delivery (COD) is not accepted. Please pay online via Razorpay.',
          400,
          'COD_NOT_SUPPORTED'
        )
      );
    }

    // 6. Zero-Trust Shipping Rate Recalculation on Backend
    const shippingRate = await shippingService.calculateCartShipping({
      pincode: deliveryPincode,
      items: cartItemsForShipping,
      paymentMethod: 'PREPAID',
      couponDiscount: validatedDiscount,
    });

    const isCod = false;
    const subtotal = Math.round(calculatedSubtotal);
    const discount = Math.round(validatedDiscount);
    const shipping = shippingRate.shippingCharge;
    const codFee = 0;
    const tax = Math.round(Math.max(0, subtotal - discount) * 0.05); // 5% GST on apparel
    const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

    // Generate unique order number (e.g. JW-2026-98124)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `JW-${new Date().getFullYear()}-${randomSuffix}`;

    // Create Razorpay payment order
    const gatewayOrder = await PaymentService.createOrder({
      amountInINR: grandTotal,
      receipt: orderNumber,
      notes: {
        userId: orderUserId ? orderUserId.toString() : 'guest',
        orderNumber,
      },
    });
    const gatewayOrderId = gatewayOrder.id;

    const order = await Order.create({
      orderNumber,
      user: orderUserId || undefined,
      guestEmail: guestEmail || undefined,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street || shippingAddress.address || '',
        address: shippingAddress.address || shippingAddress.street || '',
        apartment: shippingAddress.apartment || '',
        area: shippingAddress.area || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: deliveryPincode,
        postalCode: deliveryPincode,
        country: shippingAddress.country || 'India',
      },
      paymentMethod: isCod ? 'COD' : 'PREPAID',
      paymentStatus: 'pending',
      paymentResult: gatewayOrderId ? { orderId: gatewayOrderId } : undefined,
      pricing: {
        subtotal,
        discount,
        shipping,
        codFee,
        tax,
        total: grandTotal,
        customerShippingCharge: shipping,
        courierCost: shippingRate.courierCost,
      },
      subtotal,
      discount,
      shipping,
      tax,
      grandTotal,
      orderStatus: isCod ? 'Confirmed' : 'Pending',
      statusHistory: [
        {
          status: isCod ? 'Confirmed' : 'Pending',
          note: isCod ? 'Cash on Delivery order placed.' : 'Prepaid order initiated, awaiting payment verification.',
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    // If COD, generate initial shipment, update coupon tracking, notify, and clear cart
    if (isCod) {
      await shippingService.createShipmentForOrder(order._id.toString());

      if (usedCouponDoc && orderUserId) {
        await Coupon.updateOne(
          { _id: usedCouponDoc._id },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: { userId: orderUserId, count: 1 } },
          }
        );
      }

      if (req.user) {
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], discount: 0, couponCode: undefined });
      }

      const customer = req.user || { name: shippingAddress.fullName, email: guestEmail };
      NotificationService.notifyOrderPlaced(order, customer);
      NotificationService.notifyOrderConfirmed(order, customer);
    }

    res.status(201).json({
      success: true,
      message: isCod ? 'COD Order placed successfully!' : 'Order created! Please complete payment.',
      data: {
        order,
        paymentDetails: gatewayOrderId
          ? {
              orderId: gatewayOrderId,
              amount: grandTotal,
              currency: 'INR',
              key: config.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            }
          : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return next(new AppError('Missing payment verification parameters.', 400));
    }

    const order = await Order.findOne({ 'paymentResult.orderId': orderId });
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Check idempotency: if already paid, return success
    if (order.paymentStatus === 'paid') {
      res.status(200).json({ success: true, message: 'Order is already verified.', data: { order } });
      return;
    }

    const isVerified = PaymentService.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

    if (!isVerified) {
      order.paymentStatus = 'failed';
      await order.save();
      return next(new AppError('Payment signature verification failed.', 400));
    }

    // 1. Atomically deduct inventory with concurrency protection
    await atomicallyDeductInventory(order.items);

    // 2. Mark paid & confirmed
    order.paymentStatus = 'paid';
    order.orderStatus = 'Confirmed';
    order.paymentResult = {
      orderId,
      paymentId,
      signature,
      paidAt: new Date().toISOString(),
    };
    order.statusHistory.push({
      status: 'Confirmed',
      note: `Payment verified successfully via Razorpay (Txn ID: ${paymentId})`,
      updatedAt: new Date().toISOString(),
    });
    await order.save();

    // 3. Auto-create shipment with AWB
    await shippingService.createShipmentForOrder(order._id.toString());

    // 4. Update coupon tracking if applicable
    const activeUserId = req.user?._id || order.user;
    if (activeUserId) {
      const cart = await Cart.findOne({ user: activeUserId });
      if (cart?.couponCode) {
        await Coupon.updateOne(
          { code: cart.couponCode.toUpperCase() },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: { userId: activeUserId, count: 1 } },
          }
        );
      }
      await Cart.findOneAndUpdate({ user: activeUserId }, { items: [], discount: 0, couponCode: undefined });
    }

    // 5. Notify customer (SendGrid order confirmation email)
    const customer = req.user || {
      name: order.shippingAddress.fullName,
      email: (order as any).guestEmail || order.shippingAddress.email || '',
    };
    NotificationService.notifyOrderPlaced(order, customer);
    NotificationService.notifyOrderConfirmed(order, customer);

    res.status(200).json({
      success: true,
      message: 'Payment verified! Order confirmed & shipment queued.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = config.RAZORPAY_WEBHOOK_SECRET || config.RAZORPAY_KEY_SECRET;

    if (webhookSignature && webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const gatewayOrderId = paymentEntity.order_id;
      const order = await Order.findOne({ 'paymentResult.orderId': gatewayOrderId });

      if (order && order.paymentStatus !== 'paid') {
        await atomicallyDeductInventory(order.items);
        order.paymentStatus = 'paid';
        order.orderStatus = 'Confirmed';
        order.paymentResult = {
          orderId: gatewayOrderId,
          paymentId: paymentEntity.id,
          paidAt: new Date().toISOString(),
        };
        order.statusHistory.push({
          status: 'Confirmed',
          note: `Payment confirmed via webhook capture (${paymentEntity.id})`,
          updatedAt: new Date().toISOString(),
        });
        await order.save();
        await shippingService.createShipmentForOrder(order._id.toString());
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: orders.length,
      orders,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'manager');

    let order;
    if (isPrivileged) {
      order = await Order.findById(id).populate('shipmentId');
    } else if (req.user) {
      order = await Order.findOne({ _id: id, user: req.user._id }).populate('shipmentId');
    } else {
      order = await Order.findById(id).populate('shipmentId');
    }

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    res.status(200).json({
      success: true,
      order,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const { reason = 'Cancelled by customer' } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded'].includes(order.orderStatus)) {
      return next(new AppError(`Order cannot be cancelled in '${order.orderStatus}' status.`, 400));
    }

    // Atomically restore inventory
    await atomicallyRestoreInventory(order.items);

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      note: reason,
      updatedAt: new Date().toISOString(),
    });
    await order.save();

    NotificationService.notifyOrderCancelled(order, req.user, reason);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      order,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const { reason, customerNotes } = req.body;

    if (!reason || !String(reason).trim()) {
      return next(new AppError('A valid return reason is required.', 400));
    }

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (order.orderStatus !== 'Delivered') {
      return next(new AppError('Returns can only be requested for Delivered orders.', 400));
    }

    // 7-day return window check
    const deliveredDate = new Date(order.updatedAt).getTime();
    const daysSinceDelivery = (Date.now() - deliveredDate) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return next(new AppError('The 7-day return window for this order has expired.', 400));
    }

    order.orderStatus = 'Return Requested';
    order.returnDetails = {
      reason: String(reason).trim(),
      customerNotes: customerNotes ? String(customerNotes).trim() : undefined,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    order.statusHistory.push({
      status: 'Return Requested',
      note: `Return requested: ${reason}`,
      updatedAt: new Date().toISOString(),
    });
    await order.save();

    NotificationService.notifyReturnRequested(order, req.user, reason);

    res.status(200).json({
      success: true,
      message: 'Return request submitted. Our support team will review within 24 hours.',
      order,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

