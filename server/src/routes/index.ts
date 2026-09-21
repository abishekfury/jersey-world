import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import reviewRoutes from './reviewRoutes';
import adminRoutes from './adminRoutes';
import shippingRoutes from './shippingRoutes';
import bannerRoutes from './bannerRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/shipping', shippingRoutes);
router.use('/banner', bannerRoutes);
router.use('/upload', uploadRoutes);


// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jersey World API Gateway',
    version: '1.0.0',
  });
});

export default router;
