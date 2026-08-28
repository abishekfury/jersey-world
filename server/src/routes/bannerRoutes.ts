import { Router } from 'express';
import { getOfferBanner, updateOfferBanner } from '../controllers/bannerController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public route to fetch current active banner
router.get('/', getOfferBanner);

// Protected route for Admin to update the banner
router.put('/', requireAuth, requireRole('admin', 'manager'), updateOfferBanner);

export default router;

