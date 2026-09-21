import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  validateCouponPublic,
} from '../controllers/cartController';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../validators/productValidator';

const router = Router();

// Public coupon validation endpoint (works for guests & customers without 401)
router.post('/coupon/validate', validateCouponPublic);

router.use(requireAuth);

router.get('/', getCart);
router.post('/', validateRequest({ body: addToCartSchema }), addToCart);
router.put('/:itemId', validateRequest({ body: updateCartItemSchema }), updateCartItem);
router.delete('/:itemId', removeFromCart);
router.post('/coupon', applyCoupon);

export default router;
