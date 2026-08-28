import { Router } from 'express';
import {
  validatePhoto,
  createTryOnJob,
  getJobStatus,
  saveLook,
  getMySavedLooks,
  deleteSavedLook,
  getUsageQuota,
} from '../controllers/aiController';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

// Validate user photo
router.post('/validate-photo', optionalAuth, uploadSingleImage, validatePhoto);

// Create Try-on Job (Async with queue)
router.post('/try-on', optionalAuth, aiLimiter, uploadSingleImage, createTryOnJob);

// Poll Try-on Job Status
router.get('/try-on/:jobId', optionalAuth, getJobStatus);

// Quota check
router.get('/quota', optionalAuth, getUsageQuota);

// Saved Looks
router.post('/saved-looks', requireAuth, saveLook);
router.get('/saved-looks', requireAuth, getMySavedLooks);
router.delete('/saved-looks/:lookId', requireAuth, deleteSavedLook);

export default router;
