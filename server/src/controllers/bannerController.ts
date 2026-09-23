import { Request, Response } from 'express';
import { OfferBanner } from '../models/OfferBanner';
import { Coupon } from '../models/Coupon';

export const getOfferBanner = async (_req: Request, res: Response): Promise<void> => {
  try {
    let banner = await OfferBanner.findOne();

    // Query active coupons in the database
    const activeCoupons = await Coupon.find({ active: true, validUntil: { $gte: new Date() } })
      .sort({ discountPercent: -1, discountValue: -1 });

    const topCoupon = activeCoupons[0];

    if (!banner) {
      const defaultCode = topCoupon?.code || 'WORLD20';
      const defaultDiscount = topCoupon?.discountPercent
        ? `${topCoupon.discountPercent}% OFF`
        : topCoupon?.discountValue
        ? `₹${topCoupon.discountValue} OFF`
        : 'EXCLUSIVE SAVINGS';

      banner = await OfferBanner.create({
        badgeText: 'EXCLUSIVE PROMO OFFER',
        discountHeadline: defaultDiscount,
        description: `Apply coupon ${defaultCode} at checkout to unlock instant discounts.`,
        couponCode: defaultCode,
        buttonText: 'Shop Collection',
        buttonLink: '/shop',
        leftImage: '/images/image2.jpg',
        rightImage: '/images/image3.jpg',
        heroBackgroundImage: '/images/image1.jpg',
        isActive: true,
      });
    } else if (banner.heroBackgroundImage && banner.heroBackgroundImage.includes('photo-1522778119026')) {
      banner.heroBackgroundImage = '/images/image1.jpg';
      await banner.save();
    }

    res.status(200).json({
      success: true,
      banner,
      activeCoupons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch offer banner',
    });
  }
};

export const updateOfferBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body;
    let banner = await OfferBanner.findOne();

    if (!banner) {
      banner = await OfferBanner.create(updateData);
    } else {
      Object.assign(banner, updateData);
      await banner.save();
    }

    res.status(200).json({
      success: true,
      message: 'Offer banner updated successfully!',
      banner,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update offer banner',
    });
  }
};
