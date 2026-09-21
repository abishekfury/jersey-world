import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from 'passport';
import { config } from './config/env';
import { logger } from './config/logger';
import { configurePassport } from './config/passport';
import apiRouter from './routes';
import seoRouter from './routes/seoRoutes';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInputs } from './middleware/sanitizer';
import { apiLimiter } from './middleware/rateLimiter';

const app: Express = express();

// Initialize Passport OAuth strategies
configurePassport();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (config.CLIENT_URL && origin === config.CLIENT_URL.replace(/\/+$/, ''))
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize() as any);

// Sanitize inputs against NoSQL and XSS injections
app.use(sanitizeInputs);

// HTTP request logging
if (config.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    logger.debug(`[HTTP] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Serve uploaded assets
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// General API rate limiting
app.use('/api/v1', apiLimiter);

// Mount SEO endpoints (sitemap.xml and robots.txt)
app.use('/', seoRouter);

// Mount versioned API routes
app.use('/api/v1', apiRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
