export interface ServiceabilityCheckInput {
  pickupPincode: string;
  deliveryPincode: string;
  weightGrams?: number;
  cod?: boolean;
}

export interface ServiceabilityResult {
  available: boolean;
  city?: string;
  state?: string;
  estimatedDeliveryDays: string;
  estimatedDeliveryDate: string;
  codAvailable: boolean;
  courierPartner: string;
  message: string;
}

export interface RateCalculationInput {
  pickupPincode: string;
  deliveryPincode: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValue: number;
  paymentMethod: 'PREPAID' | 'COD' | 'Razorpay';
}

export interface RateResult {
  available: boolean;
  shippingCharge: number; // Customer rate
  courierCost: number;    // Business courier rate
  codCharge: number;
  estimatedDeliveryDays: string;
  estimatedDeliveryDate: string;
  courierPartner: string;
}

export interface CreateShipmentInput {
  orderId: string;
  orderNumber: string;
  pickupPincode: string;
  deliveryPincode: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  items: Array<{
    name: string;
    sku?: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: 'PREPAID' | 'COD' | 'Razorpay';
  totalAmount: number;
  shippingCost: number;
  customerPaidShipping: number;
}

export interface CreateShipmentResult {
  success: boolean;
  awbNumber: string;
  trackingUrl: string;
  courierName: string;
  shippingCost: number;
  estimatedDelivery: string;
}

export interface IShippingProvider {
  name: string;
  checkServiceability(input: ServiceabilityCheckInput): Promise<ServiceabilityResult>;
  calculateRate(input: RateCalculationInput): Promise<RateResult>;
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
}

