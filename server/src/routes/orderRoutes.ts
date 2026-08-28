import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createOrderSchema, verifyPaymentSchema } from '../validators/productValidator';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest({ body: createOrderSchema }), createOrder);
router.post('/verify-payment', validateRequest({ body: verifyPaymentSchema }), verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
