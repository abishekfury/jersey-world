import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Review } from '../models/Review';
import { TryOnJob } from '../models/TryOnJob';
import { AuditLog } from '../models/AuditLog';
import { AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from '../services/notification/notificationService';
import { uploadToCloudinary } from '../services/storage/cloudinaryService';


export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalReviews,
      totalTryOns,
      paidOrders,
      todayPaidOrders,
      recentOrders,
      lowStockProducts,
      returnedOrdersCount,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Review.countDocuments(),
      TryOnJob.countDocuments(),
      Order.find({ paymentStatus: 'paid' }),
      Order.find({ paymentStatus: 'paid', createdAt: { $gte: todayStart } }),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email').lean(),
      Product.find({ totalStock: { $lte: 15 } }).limit(8).lean(),
      Order.countDocuments({ orderStatus: { $in: ['Returned', 'Refunded'] } }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, ord) => sum + ord.grandTotal, 0);
    const todayRevenue = todayPaidOrders.reduce((sum, ord) => sum + ord.grandTotal, 0);

    // AI Telemetry
    const completedTryOns = await TryOnJob.countDocuments({ status: 'completed' });
    const failedTryOns = await TryOnJob.countDocuments({ status: 'failed' });
    const estimatedAiCost = Number((completedTryOns * 0.005).toFixed(3));

    const returnRatePercent = totalOrders > 0 ? Number(((returnedOrdersCount / totalOrders) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        totalReviews,
        returnRatePercent,
        lowStockCount: lowStockProducts.length,
        ai: {
          totalGenerations: totalTryOns,
          completed: completedTryOns,
          failed: failedTryOns,
          successRate: totalTryOns > 0 ? Math.round((completedTryOns / totalTryOns) * 100) : 100,
          estimatedCostUSD: estimatedAiCost,
        },
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProductsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query as any;

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { team: new RegExp(search, 'i') },
        { country: new RegExp(search, 'i') },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productData = req.body;

    const baseSlug = `${productData.name}-${productData.season || '2026'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const sizes = productData.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
    const totalStock = productData.totalStock || 50;
    const stockPerSize = Math.max(1, Math.floor(totalStock / sizes.length));

    const sizeStock = productData.sizeStock || sizes.map((sz: string) => ({
      size: sz,
      stock: stockPerSize,
      sku: `${productData.team?.slice(0, 3).toUpperCase() || 'JW'}-${productData.type?.slice(0, 3).toUpperCase() || 'HOM'}-${sz}`,
      color: productData.colors?.[0] || 'Default',
    }));

    const product = await Product.create({
      ...productData,
      slug,
      sizes,
      sizeStock,
      totalStock,
      isCustomizable: productData.isCustomizable !== undefined ? productData.isCustomizable : true,
      customizationPrice: productData.customizationPrice !== undefined ? Number(productData.customizationPrice) : 299,
      gender: productData.gender || 'Unisex',
    });

    res.status(201).json({
      success: true,
      message: 'Jersey created successfully with variant SKUs.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Array.isArray(updateData.sizeStock)) {
      updateData.totalStock = updateData.sizeStock.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0);
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted permanently.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 50 } = req.query as any;

    const filter: Record<string, any> = {};
    if (status) {
      filter.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('user', 'name email').lean(),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const sanitizeCsvCell = (val: any): string => {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Prevent CSV Formula Injection
  if (/^[=\-+@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
};

export const exportOrdersCSV = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email').lean();

    const headers = [
      'Order Number',
      'Date Placed',
      'Customer Name',
      'Customer Email',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Subtotal (INR)',
      'Discount (INR)',
      'Shipping (INR)',
      'Tax (INR)',
      'Grand Total (INR)',
      'Delivery City',
      'Delivery State',
      'PIN Code',
      'Items Summary',
    ];

    const rows = orders.map((o: any) => {
      const itemsSummary = (o.items || [])
        .map((i: any) => `${i.productName || 'Jersey'} (${i.size} × ${i.quantity})`)
        .join('; ');

      return [
        sanitizeCsvCell(o.orderNumber),
        sanitizeCsvCell(o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : ''),
        sanitizeCsvCell(o.shippingAddress?.fullName || o.user?.name || 'Customer'),
        sanitizeCsvCell(o.shippingAddress?.email || o.user?.email || ''),
        sanitizeCsvCell(o.paymentMethod || 'PREPAID'),
        sanitizeCsvCell(o.paymentStatus || 'pending'),
        sanitizeCsvCell(o.orderStatus || 'Pending'),
        sanitizeCsvCell(o.pricing?.subtotal || o.subtotal || 0),
        sanitizeCsvCell(o.pricing?.discount || o.discount || 0),
        sanitizeCsvCell(o.pricing?.shipping || o.shipping || 0),
        sanitizeCsvCell(o.pricing?.tax || o.tax || 0),
        sanitizeCsvCell(o.pricing?.total || o.grandTotal || 0),
        sanitizeCsvCell(o.shippingAddress?.city || ''),
        sanitizeCsvCell(o.shippingAddress?.state || ''),
        sanitizeCsvCell(o.shippingAddress?.pincode || o.shippingAddress?.postalCode || ''),
        sanitizeCsvCell(itemsSummary),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="jersey_world_orders_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, trackingCourier } = req.body;

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingCourier) order.trackingCourier = trackingCourier;

    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status}`,
      updatedAt: new Date().toISOString(),
    });

    await order.save();

    // Trigger transactional notifications
    if (status === 'Shipped') {
      NotificationService.notifyOrderShipped(order, order.user, trackingNumber || 'TRACKING_AWB', 'BlueDart Express');
    } else if (status === 'Delivered') {
      NotificationService.notifyOrderDelivered(order, order.user);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewReturnRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // 'APPROVE' | 'REJECT' | 'COMPLETE_REFUND'

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (!order.returnDetails) {
      return next(new AppError('No return request exists for this order.', 400));
    }

    if (action === 'APPROVE') {
      order.returnDetails.status = 'APPROVED';
      order.returnDetails.adminNotes = adminNotes;
      order.orderStatus = 'Returned';
      order.statusHistory.push({
        status: 'Returned',
        note: `Return approved by support. Courier reverse pickup initiated. Note: ${adminNotes || 'N/A'}`,
        updatedAt: new Date().toISOString(),
      });
      NotificationService.notifyReturnStatusUpdated(order, order.user, 'APPROVED', adminNotes);
    } else if (action === 'REJECT') {
      order.returnDetails.status = 'REJECTED';
      order.returnDetails.adminNotes = adminNotes;
      order.orderStatus = 'Delivered';
      order.statusHistory.push({
        status: 'Delivered',
        note: `Return rejected by admin. Reason: ${adminNotes || 'Did not meet return criteria.'}`,
        updatedAt: new Date().toISOString(),
      });
      NotificationService.notifyReturnStatusUpdated(order, order.user, 'REJECTED', adminNotes);
    } else if (action === 'COMPLETE_REFUND') {
      // 1. Atomically restore inventory
      for (const item of order.items) {
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

      order.returnDetails.status = 'REFUNDED';
      order.returnDetails.adminNotes = adminNotes;
      order.orderStatus = 'Refunded';
      order.paymentStatus = 'refunded';
      order.statusHistory.push({
        status: 'Refunded',
        note: `Refund completed of ₹${order.grandTotal}. Inventory stock restored. Admin notes: ${adminNotes || 'N/A'}`,
        updatedAt: new Date().toISOString(),
      });
      NotificationService.notifyReturnStatusUpdated(order, order.user, 'REFUNDED', adminNotes);
    } else {
      return next(new AppError("Invalid return action. Must be 'APPROVE', 'REJECT', or 'COMPLETE_REFUND'.", 400));
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Return action '${action}' processed successfully.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images price')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return next(new AppError('Review not found.', 404));
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Recalculate product ratings
    const remainingReviews = await Review.find({ product: productId, isApproved: true });
    const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = remainingReviews.length > 0 ? Number((totalRating / remainingReviews.length).toFixed(1)) : 5.0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: remainingReviews.length,
    });

    res.status(200).json({
      success: true,
      message: 'Review removed successfully and product rating recalculated.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'manager', 'admin'].includes(role)) {
      return next(new AppError("Role must be 'customer', 'manager', or 'admin'.", 400));
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAdminProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided.', 400));
    }

    const folder = (req.query.folder as string) || 'jersey-world/products';
    const result = await uploadToCloudinary(req.file.path, folder);

    res.status(200).json({
      success: true,
      message: 'Product image uploaded successfully.',
      imageUrl: result.secure_url,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    next(error);
  }
};



