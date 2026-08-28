export type UserRole = 'customer' | 'manager' | 'admin';
export interface IUserAddress {
    _id?: string;
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
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
    dailyTryOnCount: number;
    lastTryOnDate?: string;
    createdAt: string;
    updatedAt: string;
}
export type JerseyType = 'Home' | 'Away' | 'Third Kit' | 'Training' | 'Retro' | 'Goalkeeper' | 'Limited Edition' | 'Fan Version' | 'Player Version' | 'Custom Jersey';
export type JerseySize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';
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
    active: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ICartCustomization {
    playerName?: string;
    playerNumber?: string;
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
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
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
export interface IOrder {
    _id: string;
    orderNumber: string;
    user: string;
    items: IOrderItem[];
    shippingAddress: IUserAddress;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    paymentResult?: {
        orderId?: string;
        paymentId?: string;
        signature?: string;
        paidAt?: string;
    };
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    grandTotal: number;
    orderStatus: OrderStatus;
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
export type TryOnJobStatus = 'queued' | 'analyzing' | 'detecting_body' | 'mapping_jersey' | 'generating_fit' | 'finalizing_image' | 'completed' | 'failed' | 'expired';
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
    product: string;
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
    sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
    page?: number;
    limit?: number;
}
