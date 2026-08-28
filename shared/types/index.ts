export type UserRole = 'customer' | 'manager' | 'admin';


export interface IUserAddress {
  _id?: string;
  fullName: string;
  phone: string;
  address: string;
  apartment?: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  street?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses: IUserAddress[];
  isEmailVerified: boolean;
  isActive?: boolean;
  dailyTryOnCount: number;
  lastTryOnDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type JerseyType =
  | 'Home'
  | 'Away'
  | 'Third Kit'
  | 'Training'
  | 'Retro'
  | 'Goalkeeper'
  | 'Limited Edition'
  | 'Fan Version'
  | 'Player Version'
  | 'Custom Jersey';

export type JerseySize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';
export type JerseyGender = 'Men' | 'Women' | 'Unisex' | 'Kids';


export interface IProductImage {
  front: string;
  back: string;
  detail?: string;
  lifestyle?: string;
}

export interface IAIAsset {
  frontImage: string;
  backImage?: string;
  maskUrl?: string;
  referenceImage: string;
  category: string;
  providerMetadata?: Record<string, any>;
}

export interface ISizeStock {
  size: JerseySize;
  stock: number;
}

export interface IProductShipping {
  weight: number; // in grams (e.g. 350)
  length: number; // in cm (e.g. 30)
  width: number;  // in cm (e.g. 25)
  height: number; // in cm (e.g. 3)
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  team: string;
  country: string;
  league: string;
  season: string;
  type: JerseyType;
  description: string;
  material: string;
  fit: string;
  washingInstructions: string;
  authenticityInfo: string;
  price: number;
  discountPrice?: number;
  shipping: IProductShipping;
  images: IProductImage;
  sizes: JerseySize[];
  sizeStock: ISizeStock[];
  totalStock: number;
  colors: string[];
  tags: string[];
  aiAsset: IAIAsset;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isCustomizable: boolean;
  customizationPrice?: number;
  gender?: JerseyGender;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICartCustomization {
  playerName?: string;
  playerNumber?: string;
  customizationPrice?: number;
}

export interface ICartItem {
  _id?: string;
  product: IProduct;
  size: JerseySize;
  quantity: number;
  price: number;
  customization?: ICartCustomization;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  couponCode?: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded';

export type PaymentMethodType = 'PREPAID' | 'COD' | 'Razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  tax: number;
  total: number;
  customerShippingCharge?: number;
  courierCost?: number;
}

export interface IOrderItem {
  product: string;
  productName: string;
  productImage: string;
  team: string;
  season: string;
  size: JerseySize;
  quantity: number;
  price: number;
  customization?: ICartCustomization;
}

export interface IOrderReturnDetails {
  reason: string;
  customerNotes?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  adminNotes?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string;
  items: IOrderItem[];
  shippingAddress: IUserAddress;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  paymentResult?: {
    orderId?: string;
    paymentId?: string;
    signature?: string;
    paidAt?: string;
  };
  pricing: IOrderPricing;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  orderStatus: OrderStatus;
  returnDetails?: IOrderReturnDetails;
  shipmentId?: string;
  trackingNumber?: string;
  trackingCourier?: string;
  statusHistory: Array<{
    status: OrderStatus;
    note?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}


export type ShipmentStatus =
  | 'PENDING'
  | 'READY_TO_SHIP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RTO';

export interface IShipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  provider: string;
  awbNumber: string;
  courierName?: string;
  trackingUrl?: string;
  weight: number; // in grams
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingCost: number; // what business pays courier
  customerPaidShipping: number; // what customer was charged
  codAmount?: number;
  status: ShipmentStatus;
  estimatedDelivery: string;
  pickupPincode: string;
  deliveryPincode: string;
  statusHistory: Array<{
    status: ShipmentStatus;
    note?: string;
    location?: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IServiceabilityResponse {
  pincode: string;
  available: boolean;
  city?: string;
  state?: string;
  estimatedDeliveryDays: string;
  estimatedDeliveryDate: string;
  codAvailable: boolean;
  courierPartner: string;
  message: string;
}

export interface IShippingRateResponse {
  available: boolean;
  pincode: string;
  totalWeightGrams: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  subtotal: number;
  shippingCharge: number; // Customer charge
  courierCost: number;    // Internal business cost
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  codAvailable: boolean;
  codCharge: number;
  estimatedDeliveryDays: string;
  estimatedDeliveryDate: string;
  finalTotal: number;
}

export interface IShippingSettings {
  enableShipping: boolean;
  freeShippingThreshold: number; // e.g. 1499
  defaultShippingCharge: number; // e.g. 79
  enableCod: boolean;
  codFee: number; // e.g. 25
  activeProvider: 'mock' | 'shiprocket';
  pickupPincode: string;
}

export type TryOnJobStatus =
  | 'queued'
  | 'analyzing'
  | 'detecting_body'
  | 'mapping_jersey'
  | 'generating_fit'
  | 'finalizing_image'
  | 'completed'
  | 'failed'
  | 'expired';

export interface ITryOnJob {
  _id: string;
  userId?: string;
  guestSessionId?: string;
  sourceImageUrl: string;
  jerseyId: string | IProduct;
  selectedSize?: JerseySize;
  resultImageUrl?: string;
  status: TryOnJobStatus;
  progressPercent: number;
  statusMessage?: string;
  provider: string;
  error?: string;
  metrics?: {
    durationMs?: number;
    estimatedCost?: number;
  };
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface ISavedLook {
  _id: string;
  user: string;
  jersey: IProduct;
  resultImageUrl: string;
  sourceImageUrl?: string;
  selectedSize: JerseySize;
  notes?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string | IProduct;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  likes: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CouponDiscountType = 'percentage' | 'fixed';

export interface ICoupon {

  _id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountPercent?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  userUsageLimit?: number;
  active: boolean;
  createdAt?: string;
}


export interface IAuditLog {
  _id: string;
  actor: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface IProductFilterQuery {
  search?: string;
  team?: string;
  country?: string;
  league?: string;
  season?: string;
  type?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  inStock?: boolean;
  rating?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

const SharedTypes = {};
export default SharedTypes;
