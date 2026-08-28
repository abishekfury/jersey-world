import { Request, Response, NextFunction } from 'express';
import { shippingService } from '../services/shipping/shippingService';
import { ShippingSettings } from '../models/ShippingSettings';
import { Shipment } from '../models/Shipment';
import { AppError } from '../middleware/errorHandler';

export const checkServiceability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pincode } = req.params;
    if (!pincode) {
      throw new AppError('PIN code parameter is required.', 400, 'MISSING_PINCODE');
    }

    const result = await shippingService.checkServiceability(pincode);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const calculateShippingRate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pincode, items, paymentMethod = 'PREPAID', couponDiscount = 0 } = req.body;

    if (!pincode || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('PIN code and cart items array are required.', 400, 'INVALID_INPUT');
    }

    const result = await shippingService.calculateCartShipping({
      pincode,
      items,
      paymentMethod,
      couponDiscount,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentByOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const shipment = await Shipment.findOne({ orderId });

    if (!shipment) {
      throw new AppError('No shipment found for this order.', 404, 'SHIPMENT_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};

export const generateShipmentAWB = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const shipment = await shippingService.createShipmentForOrder(orderId);

    res.status(201).json({
      success: true,
      message: 'AWB generated & shipment created with courier!',
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};

export const getShippingSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = await ShippingSettings.create({
        enableShipping: true,
        freeShippingThreshold: 1499,
        defaultShippingCharge: 79,
        enableCod: true,
        codFee: 25,
        activeProvider: 'mock',
        pickupPincode: '400001',
      });
    }

    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateShippingSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = new ShippingSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Shipping settings updated successfully.',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

