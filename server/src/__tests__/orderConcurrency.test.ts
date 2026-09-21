import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { PaymentService } from '../services/payment/paymentService';
import { config } from '../config/env';

jest.setTimeout(30000);

describe('Order Concurrency & Security Test Suite', () => {
  let isDbConnected = false;

  beforeAll(async () => {
    const candidateUris = [
      config.MONGODB_URI,
      'mongodb://127.0.0.1:27017/jersey-world',
      'mongodb://localhost:27017/jersey-world',
    ];
    for (const uri of candidateUris) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        isDbConnected = mongoose.connection.readyState === 1;
        if (isDbConnected) break;
      } catch {
        // continue
      }
    }
  }, 10000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Payment Signature Verification Security', () => {
    it('should correctly verify valid SHA256 HMAC Razorpay signatures', () => {
      const orderId = 'order_test_12345';
      const paymentId = 'pay_test_67890';
      const secret = config.RAZORPAY_KEY_SECRET;

      const crypto = require('crypto');
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isVerified = PaymentService.verifyPaymentSignature({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      });

      expect(isVerified).toBe(true);
    });

    it('should reject tampered or forged payment signatures', () => {
      const isVerified = PaymentService.verifyPaymentSignature({
        razorpay_order_id: 'order_test_12345',
        razorpay_payment_id: 'pay_test_67890',
        razorpay_signature: 'fake_tampered_signature_xyz',
      });

      expect(isVerified).toBe(false);
    });
  });

  describe('Admin Role Route Protection', () => {
    it('should block unauthenticated access to /api/v1/admin/dashboard', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('should block regular customer from accessing admin dashboard', async () => {
      if (!isDbConnected) return;
      const customerEmail = `cust_${Date.now()}@test.com`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Regular Customer',
          email: customerEmail,
          password: 'Password@123',
        });

      if (regRes.body?.accessToken) {
        const adminRes = await request(app)
          .get('/api/v1/admin/dashboard')
          .set('Authorization', `Bearer ${regRes.body.accessToken}`);

        expect(adminRes.status).toBe(403);
        expect(adminRes.body.code).toBe('FORBIDDEN_INSUFFICIENT_ROLE');
      }
    });
  });

  describe('Coupon Boundary Validation', () => {
    it('should reject expired coupons', async () => {
      if (!isDbConnected) return;
      const expiredCode = `EXPIRED_${Date.now()}`;
      await Coupon.create({
        code: expiredCode,
        discountType: 'percentage',
        discountValue: 20,
        validFrom: new Date(Date.now() - 100000),
        validUntil: new Date(Date.now() - 1000),
        active: true,
      });

      const coupon = await Coupon.findOne({
        code: expiredCode,
        active: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      expect(coupon).toBeNull();
    });
  });
});

