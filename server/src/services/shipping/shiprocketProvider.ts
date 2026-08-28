import axios from 'axios';
import {
  IShippingProvider,
  ServiceabilityCheckInput,
  ServiceabilityResult,
  RateCalculationInput,
  RateResult,
  CreateShipmentInput,
  CreateShipmentResult,
} from './shippingProvider';
import { MockShippingProvider } from './mockShippingProvider';
import { logger } from '../../config/logger';

export class ShiprocketProvider implements IShippingProvider {
  name = 'Shiprocket Logistics Engine';
  private fallbackMock = new MockShippingProvider();

  private email = process.env.SHIPROCKET_EMAIL || '';
  private password = process.env.SHIPROCKET_PASSWORD || '';
  private apiUrl = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private isConfigured(): boolean {
    return Boolean(this.email && this.password);
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.isConfigured()) return null;
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const res = await axios.post(`${this.apiUrl}/auth/login`, {
        email: this.email,
        password: this.password,
      });

      if (res.data?.token) {
        this.token = res.data.token;
        // Expire token in 9 days
        this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
        return this.token;
      }
    } catch (err: any) {
      logger.error('Failed to authenticate with Shiprocket API, falling back to simulator:', err.message);
    }
    return null;
  }

  async checkServiceability(input: ServiceabilityCheckInput): Promise<ServiceabilityResult> {
    const token = await this.getAuthToken();
    if (!token) {
      return this.fallbackMock.checkServiceability(input);
    }

    try {
      const res = await axios.get(`${this.apiUrl}/courier/serviceability/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode: input.pickupPincode,
          delivery_postcode: input.deliveryPincode,
          weight: (input.weightGrams || 350) / 1000,
          cod: input.cod ? 1 : 0,
        },
      });

      const data = res.data?.data;
      if (data?.available_courier_companies?.length > 0) {
        const bestCourier = data.available_courier_companies[0];
        return {
          available: true,
          city: bestCourier.city || 'Serviceable City',
          state: bestCourier.state || 'India',
          estimatedDeliveryDays: `${bestCourier.estimated_delivery_days || 3}–${(bestCourier.estimated_delivery_days || 3) + 2} days`,
          estimatedDeliveryDate: bestCourier.etd || 'Within 4-5 business days',
          codAvailable: Boolean(bestCourier.cod === 1),
          courierPartner: bestCourier.courier_name || 'Shiprocket Partner',
          message: `Delivery available to ${input.deliveryPincode}`,
        };
      }
    } catch (err: any) {
      logger.warn('Shiprocket serviceability query failed, using fallback:', err.message);
    }

    return this.fallbackMock.checkServiceability(input);
  }

  async calculateRate(input: RateCalculationInput): Promise<RateResult> {
    const token = await this.getAuthToken();
    if (!token) {
      return this.fallbackMock.calculateRate(input);
    }

    try {
      const res = await axios.get(`${this.apiUrl}/courier/serviceability/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode: input.pickupPincode,
          delivery_postcode: input.deliveryPincode,
          weight: input.weightGrams / 1000,
          cod: input.paymentMethod === 'COD' ? 1 : 0,
        },
      });

      const couriers = res.data?.data?.available_courier_companies;
      if (couriers?.length > 0) {
        const courier = couriers[0];
        const courierCost = Math.round(courier.rate || 64);
        const customerShipping = courierCost + 15; // 15 margin
        const codFee = input.paymentMethod === 'COD' ? 25 : 0;

        return {
          available: true,
          shippingCharge: customerShipping,
          courierCost,
          codCharge: codFee,
          estimatedDeliveryDays: `${courier.estimated_delivery_days || 3}–${(courier.estimated_delivery_days || 3) + 2} days`,
          estimatedDeliveryDate: courier.etd || 'Within 4-5 business days',
          courierPartner: courier.courier_name,
        };
      }
    } catch (err: any) {
      logger.warn('Shiprocket rate query failed, using fallback:', err.message);
    }

    return this.fallbackMock.calculateRate(input);
  }

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const token = await this.getAuthToken();
    if (!token) {
      return this.fallbackMock.createShipment(input);
    }

    try {
      const orderPayload = {
        order_id: input.orderNumber,
        order_date: new Date().toISOString().split('T')[0],
        pickup_location: 'Primary Warehouse',
        billing_customer_name: input.customerName,
        billing_last_name: '',
        billing_address: input.deliveryAddress,
        billing_city: input.city,
        billing_pincode: input.deliveryPincode,
        billing_state: input.state,
        billing_country: 'India',
        billing_email: 'customer@jerseyworld.com',
        billing_phone: input.customerPhone,
        shipping_is_billing: true,
        order_items: input.items.map((it) => ({
          name: it.name,
          sku: it.sku || 'JERSEY-SKU',
          units: it.quantity,
          selling_price: it.price,
        })),
        payment_method: input.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: input.totalAmount,
        length: input.lengthCm,
        breadth: input.widthCm,
        height: input.heightCm,
        weight: input.weightGrams / 1000,
      };

      const res = await axios.post(`${this.apiUrl}/orders/create/adhoc`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = res.data;
      if (orderData?.shipment_id || orderData?.order_id) {
        const awb = orderData.awb_code || `SR${orderData.shipment_id || Date.now()}IN`;
        return {
          success: true,
          awbNumber: awb,
          trackingUrl: `https://shiprocket.co/tracking/${awb}`,
          courierName: orderData.courier_name || 'Shiprocket Express',
          shippingCost: input.shippingCost,
          estimatedDelivery: '3–5 business days',
        };
      }
    } catch (err: any) {
      logger.error('Shiprocket order creation failed, falling back to simulator:', err.message);
    }

    return this.fallbackMock.createShipment(input);
  }
}

