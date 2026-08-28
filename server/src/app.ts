import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInputs } from './middleware/sanitizer';
import { apiLimiter } from './middleware/rateLimiter';

const app: Express = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize inputs against NoSQL and XSS injections
app.use(sanitizeInputs);

// HTTP request logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded assets
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));


// General API rate limiting
app.use('/api/v1', apiLimiter);

// Mount versioned API routes
app.use('/api/v1', apiRouter);

// Centralized error handling
app.use(errorHandler);

export default app;
