import { Router } from 'express';
import {
  getDashboardStats,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrdersAdmin,
  updateOrderStatus,
  reviewReturnRequest,
  getAllUsersAdmin,
  updateUserRole,
  getAllReviewsAdmin,
  deleteReviewAdmin,
  uploadAdminProductImage,
} from '../controllers/adminController';
import {
  getAllCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
} from '../controllers/couponController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { uploadSingleImage } from '../middleware/upload';
import { createProductSchema } from '../validators/productValidator';

const router = Router();

// Protect all admin routes: require authentication and admin/manager role
router.use(requireAuth, requireRole('admin', 'manager'));

// Image Uploads for Products & Assets
router.post('/upload', uploadSingleImage, uploadAdminProductImage);

// Dashboard Stats & AI Cost Telemetry
router.get('/dashboard', getDashboardStats);

// Products Management
router.get('/products', getAllProductsAdmin);
router.post('/products', validateRequest({ body: createProductSchema }), createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);


// Orders Management & Returns
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/return', reviewReturnRequest);

// Reviews Moderation
router.get('/reviews', getAllReviewsAdmin);
router.delete('/reviews/:id', deleteReviewAdmin);

// Coupon Management
router.get('/coupons', getAllCouponsAdmin);
router.post('/coupons', createCouponAdmin);
router.put('/coupons/:id', updateCouponAdmin);
router.delete('/coupons/:id', deleteCouponAdmin);

// Users Management (Strictly Admin only)
router.get('/users', requireRole('admin'), getAllUsersAdmin);
router.put('/users/:id/role', requireRole('admin'), updateUserRole);

export default router;

