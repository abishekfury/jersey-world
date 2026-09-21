import dotenv from 'dotenv';
import path from 'path';

// Load .env from root if available or server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jersey-world',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'jersey_world_super_secret_access_jwt_key_2026_x9281!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jersey_world_super_secret_refresh_jwt_key_2026_w1928#',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  AI_PROVIDER: process.env.AI_PROVIDER || 'neural-canvas',
  AI_API_KEY: process.env.AI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'orders@jerseyworld.in',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'razorpay',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  MAX_FREE_DAILY_TRYONS: parseInt(process.env.MAX_FREE_DAILY_TRYONS || '5', 10),
  MAX_VIP_DAILY_TRYONS: parseInt(process.env.MAX_VIP_DAILY_TRYONS || '25', 10),
  TRYON_JOB_TIMEOUT_SECONDS: parseInt(process.env.TRYON_JOB_TIMEOUT_SECONDS || '60', 10),
};
