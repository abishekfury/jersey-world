import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema, updateProfileSchema, addAddressSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), register);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.post('/refresh', refreshToken);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, validateRequest({ body: updateProfileSchema }), updateProfile);
router.post('/addresses', requireAuth, validateRequest({ body: addAddressSchema }), addAddress);
router.delete('/addresses/:addressId', requireAuth, deleteAddress);

export default router;
