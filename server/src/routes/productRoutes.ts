import { Router } from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  getFeaturedJerseys,
  getRelatedJerseys,
} from '../controllers/productController';
import { validateRequest } from '../middleware/validate';
import { productFilterQuerySchema } from '../validators/productValidator';

const router = Router();

router.get('/', validateRequest({ query: productFilterQuerySchema }), getProducts);
router.get('/featured', getFeaturedJerseys);
router.get('/related/:id', getRelatedJerseys);
router.get('/:identifier', getProductBySlugOrId);

export default router;
