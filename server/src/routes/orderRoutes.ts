import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createOrderSchema, verifyPaymentSchema } from '../validators/productValidator';

const router = Router();

// Guest and authenticated checkout & payment verification
router.post('/', optionalAuth, validateRequest({ body: createOrderSchema }), createOrder);
router.post('/verify-payment', optionalAuth, validateRequest({ body: verifyPaymentSchema }), verifyPayment);

// Customer portal & order lookup
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/', requireAuth, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);

export default router;
