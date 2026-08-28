import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models/Coupon';
import { AppError } from '../middleware/errorHandler';

export const getAllCouponsAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const createCouponAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      userUsageLimit,
    } = req.body;

    if (!code || !discountValue || !validUntil) {
      return next(new AppError('Coupon code, discount value, and validity end date are required.', 400));
    }

    const existing = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
    if (existing) {
      return next(new AppError('A coupon with this code already exists.', 400));
    }

    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      userUsageLimit: userUsageLimit ? Number(userUsageLimit) : 1,
      active: true,
    });

    res.status(201).json({
      success: true,
      message: `Coupon ${coupon.code} created successfully.`,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCouponAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!coupon) {
      return next(new AppError('Coupon not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCouponAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return next(new AppError('Coupon not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
