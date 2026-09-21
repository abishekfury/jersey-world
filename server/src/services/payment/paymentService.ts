import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

export interface CreateOrderParams {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  private static razorpayInstance: any = null;

  private static getClient() {
    if (!PaymentService.razorpayInstance && config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
      try {
        PaymentService.razorpayInstance = new Razorpay({
          key_id: config.RAZORPAY_KEY_ID,
          key_secret: config.RAZORPAY_KEY_SECRET,
        });
      } catch (err) {
        logger.warn('Failed to initialize Razorpay client instance:', err);
      }
    }
    return PaymentService.razorpayInstance;
  }

  /**
   * Create Gateway Order
   */
  static async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
    const amountInPaise = Math.round(params.amountInINR * 100);

    // If Razorpay credentials are test keys or in simulator mode:
    const client = PaymentService.getClient();

    if (config.PAYMENT_PROVIDER === 'razorpay' && client && !config.RAZORPAY_KEY_ID.includes('sampleKey')) {
      try {
        const order = await client.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: params.receipt,
          notes: params.notes || {},
        });
        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
        };
      } catch (error) {
        logger.error('Razorpay order creation error:', error);
        throw error;
      }
    }

    // High-fidelity payment sandbox simulation
    const simulatedOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    return {
      id: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      status: 'created',
    };
  }

  /**
   * Secure server-side signature verification
   */
  static verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    if (!params.razorpay_order_id || !params.razorpay_payment_id) {
      return false;
    }

    // In simulator mode with explicit simulated signature
    if (config.PAYMENT_PROVIDER === 'simulator' && params.razorpay_signature === 'simulated_signature') {
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
        .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
        .digest('hex');

      return generatedSignature === params.razorpay_signature;
    } catch (error) {
      logger.error('Error verifying payment signature:', error);
      return false;
    }
  }
}
