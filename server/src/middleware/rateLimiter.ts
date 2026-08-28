import rateLimit from 'express-rate-limit';

// Standard API rate limiter: 300 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive Auth limiter: 20 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login/registration attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Generation limiter: 15 requests per 10 minutes per IP
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'AI Try-On generation limit reached for this timeframe. Please wait a moment.',
    code: 'AI_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
