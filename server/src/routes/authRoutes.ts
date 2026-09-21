import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  sendOtp,
  verifyOtp,
  googleAuth,
  googleOAuthCallback,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validate';
import { config } from '../config/env';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addAddressSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidator';

const router = Router();

router.post('/register', authLimiter, validateRequest({ body: registerSchema }), register);
router.post('/login', authLimiter, validateRequest({ body: loginSchema }), login);
router.post('/otp/send', authLimiter, sendOtp);
router.post('/otp/verify', authLimiter, verifyOtp);

// Google OAuth endpoints (Passport Strategy + Direct GIS Token & Credential Exchange)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.CLIENT_URL}/login?error=google_failed`,
  }),
  googleOAuthCallback
);
router.post('/google', authLimiter, googleAuth);
router.post('/google/callback', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password/:token', authLimiter, validateRequest({ body: resetPasswordSchema }), resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, validateRequest({ body: updateProfileSchema }), updateProfile);
router.post('/addresses', requireAuth, validateRequest({ body: addAddressSchema }), addAddress);
router.delete('/addresses/:addressId', requireAuth, deleteAddress);

export default router;
