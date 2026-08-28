import { Router } from 'express';
import { getProductReviews, addReview, checkReviewEligibility } from '../controllers/reviewController';

import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { addReviewSchema } from '../validators/productValidator';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', requireAuth, validateRequest({ body: addReviewSchema }), addReview);

export default router;
