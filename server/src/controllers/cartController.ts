import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AppError } from '../middleware/errorHandler';

// Recalculate cart totals strictly based on DB prices and verified customization charges
export const recalculateCart = async (cart: any) => {
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Use discount price if active, otherwise standard base price
      const basePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

      item.price = basePrice;
      item.customization = undefined;
      subtotal += basePrice * item.quantity;
    }
  }

  let discount = 0;
  if (cart.couponCode) {
    const now = new Date();
    const coupon = await Coupon.findOne({
      code: cart.couponCode.toUpperCase(),
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (coupon && subtotal >= (coupon.minOrderAmount || 0)) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
      discount = Math.min(discount, subtotal);
    } else {
      cart.couponCode = undefined;
    }
  }

  // Free express shipping threshold at ₹1499, otherwise ₹79 standard
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 79;
  // 5% GST on apparel
  const tax = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  cart.subtotal = Math.round(subtotal);
  cart.discount = Math.round(discount);
  cart.shipping = shipping;
  cart.tax = tax;
  cart.grandTotal = Math.round(grandTotal);

  await cart.save();
  return cart.populate('items.product');
};

export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
      });
    } else {
      cart = await recalculateCart(cart);
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { productId, size, quantity = 1, customization } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.active) {
      return next(new AppError('Jersey is not available.', 404));
    }

    // Check size stock
    const sizeStockObj = product.sizeStock.find((s: any) => s.size === size);
    if (sizeStockObj && sizeStockObj.stock < quantity) {
      return next(new AppError(`Only ${sizeStockObj.stock} units left for size ${size}.`, 400));
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if duplicate item with same size exists
    const existingIndex = cart.items.findIndex(
      (item: any) =>
        item.product.toString() === productId &&
        item.size === size
    );

    const basePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id as any,
        size,
        quantity,
        price: basePrice,
      });
    }

    const updatedCart = await recalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Added to cart.',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    const item = cart.items.find((i: any) => i._id.toString() === itemId);
    if (!item) {
      return next(new AppError('Item not found in cart.', 404));
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }

    const updatedCart = await recalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    cart.items = cart.items.filter((i: any) => i._id.toString() !== itemId);
    const updatedCart = await recalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed.',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { code } = req.body;

    if (!code || !String(code).trim()) {
      return next(new AppError('Coupon code is required.', 400));
    }

    const now = new Date();
    const coupon = await Coupon.findOne({
      code: String(code).trim().toUpperCase(),
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code.', 400));
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('This coupon has reached its maximum usage limit.', 400));
    }

    if (coupon.userUsageLimit) {
      const userUsage = coupon.usedBy?.find((u: any) => u.userId.toString() === userId.toString());
      if (userUsage && userUsage.count >= coupon.userUsageLimit) {
        return next(new AppError('You have already used this coupon.', 400));
      }
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Cannot apply coupon to an empty cart.', 400));
    }

    if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
      return next(new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`, 400));
    }

    cart.couponCode = coupon.code;
    const updatedCart = await recalculateCart(cart);

    const discountMsg =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} FLAT OFF`;

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! (${discountMsg})`,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCoupon = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return next(new AppError('Cart not found.', 404));
    }

    cart.couponCode = undefined;
    cart.discount = 0;
    const updatedCart = await recalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Coupon removed.',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const validateCouponPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return next(new AppError('Please enter a coupon code.', 400));
    }

    const cleanCode = String(code).trim().toUpperCase();
    const now = new Date();
    const coupon = await Coupon.findOne({
      code: cleanCode,
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code.', 400));
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('This coupon has reached its maximum usage limit.', 400));
    }

    if (coupon.minOrderAmount && subtotal > 0 && subtotal < coupon.minOrderAmount) {
      return next(
        new AppError(`Minimum order amount of ₹${coupon.minOrderAmount} required for ${coupon.code}.`, 400)
      );
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, subtotal > 0 ? subtotal : coupon.discountValue);
    }

    const discountMsg =
      coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} FLAT OFF`;

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied! (${discountMsg})`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountPercent: coupon.discountType === 'percentage' ? coupon.discountValue : undefined,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderAmount: coupon.minOrderAmount,
        discountAmount: Math.round(calculatedDiscount),
      },
    });
  } catch (error) {
    next(error);
  }
};

