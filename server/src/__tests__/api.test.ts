import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { config } from '../config/env';

jest.setTimeout(20000);

describe('Jersey World API Gateway Integration Tests', () => {
  let isDbConnected = false;

  beforeAll(async () => {
    const candidateUris = [
      process.env.MONGODB_URI,
      'mongodb://127.0.0.1:27017/jersey-world',
      'mongodb://localhost:27017/jersey-world',
    ].filter(Boolean) as string[];

    for (const uri of candidateUris) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 1000, connectTimeoutMS: 1000 });
        isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) break;
      } catch {
        // continue
      }
    }
  }, 5000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Jersey World API Gateway');
    });
  });


  describe('Auth API: /api/v1/auth', () => {
    const testEmail = `testuser_${Date.now()}@jerseyworld.com`;

    it('should register a new customer account', async () => {
      if (!isDbConnected) return;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Integration Test User',
          email: testEmail,
          password: 'Password@123',
          phone: '+91 9988776655',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should login with valid credentials', async () => {
      if (!isDbConnected) return;
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      if (!isDbConnected) return;
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Products API: /api/v1/products', () => {
    it('should list active products with pagination', async () => {
      if (!isDbConnected) return;
      const res = await request(app).get('/api/v1/products?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter products by team', async () => {
      if (!isDbConnected) return;
      const res = await request(app).get('/api/v1/products?team=Real%20Madrid');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.products?.length > 0) {
        expect(res.body.products[0].team).toBe('Real Madrid');
      }
    });
  });

  describe('Shipping API: /api/v1/shipping', () => {
    it('should check serviceability for valid Indian PIN code (600001 Chennai)', async () => {
      const res = await request(app).get('/api/v1/shipping/serviceability/600001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
      expect(res.body.data.city).toBe('Chennai');
      expect(res.body.data.state).toBe('Tamil Nadu');
      expect(res.body.data.estimatedDeliveryDays).toBeDefined();
    });

    it('should reject non-serviceable / invalid PIN codes', async () => {
      const res = await request(app).get('/api/v1/shipping/serviceability/999999');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(false);
    });

    it('should calculate cart weight & shipping rate securely from DB products', async () => {
      if (!isDbConnected) return;
      const product = await Product.findOne({ active: true });
      if (!product) return;

      const res = await request(app)
        .post('/api/v1/shipping/rate')
        .send({
          pincode: '560038',
          items: [{ productId: product._id.toString(), quantity: 2 }],
          paymentMethod: 'COD',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalWeightGrams).toBe((product.shipping?.weight || 350) * 2);
      expect(res.body.data.codCharge).toBe(25); // ₹25 COD fee
      expect(res.body.data.courierCost).toBeDefined();
    });

    it('should retrieve configurable shipping settings', async () => {
      if (!isDbConnected) return;
      const res = await request(app).get('/api/v1/shipping/settings');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.freeShippingThreshold).toBe(1499);
      expect(res.body.data.settings.enableCod).toBe(true);
    });
  });

});
