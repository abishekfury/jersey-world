import axios from 'axios';
import {
  IProduct,
  IProductFilterQuery,
  ICart,
  IOrder,
  IReview,
  IUser,
  IOfferBanner,
} from '@shared/types';


const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const SERVER_ORIGIN = rawApiUrl.replace(/\/api\/v1$/, '') || 'http://localhost:5000';
export const API_BASE_URL = rawApiUrl
  ? rawApiUrl.endsWith('/api/v1')
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set authorization header dynamically from Redux store or memory
let currentAccessToken: string | null = localStorage.getItem('jw_token');

export const setAuthToken = (token: string | null) => {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('jw_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jw_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize with stored token if present
if (currentAccessToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${currentAccessToken}`;
}

// Interceptor for 401 auto-token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.accessToken;
        setAuthToken(newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        setAuthToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

// Typed API services
export const authService = {
  forgotPassword: (email: string) => api.post<{ success: boolean; message: string; devResetUrl?: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ success: boolean; message: string; accessToken: string; user: IUser }>(`/auth/reset-password/${token}`, { password }),
};

export const productService = {
  getProducts: (params?: IProductFilterQuery) => api.get<{ success: boolean; products: IProduct[]; pagination: any }>('/products', { params }),
  getProductByIdOrSlug: (idOrSlug: string) => api.get<{ success: boolean; product: IProduct }>(`/products/${idOrSlug}`),
  getFeatured: () => api.get<{ success: boolean; featured: IProduct[]; trending: IProduct[]; retro: IProduct[] }>('/products/featured'),
  getRelated: (id: string) => api.get<{ success: boolean; related: IProduct[] }>(`/products/related/${id}`),
};

export const categoryService = {
  getMetadata: () =>
    api.get<{
      success: boolean;
      categories: any[];
      teams: any[];
      leagues: any[];
      seasons: any[];
      countries: any[];
      types: any[];
    }>('/categories/meta'),
};

export const cartService = {
  getCart: () => api.get<{ success: boolean; cart: ICart }>('/cart'),
  addToCart: (data: { productId: string; size: string; quantity: number; customization?: { playerName?: string; playerNumber?: string } }) =>
    api.post<{ success: boolean; cart: ICart }>('/cart/items', data),
  updateCartItem: (itemId: string, quantity: number) =>
    api.put<{ success: boolean; cart: ICart }>(`/cart/items/${itemId}`, { quantity }),
  updateItem: (itemId: string, quantity: number) =>
    api.put<{ success: boolean; cart: ICart }>(`/cart/items/${itemId}`, { quantity }),
  removeCartItem: (itemId: string) =>
    api.delete<{ success: boolean; cart: ICart }>(`/cart/items/${itemId}`),
  removeItem: (itemId: string) =>
    api.delete<{ success: boolean; cart: ICart }>(`/cart/items/${itemId}`),
  clearCart: () => api.delete<{ success: boolean; cart: ICart }>('/cart'),
  applyCoupon: (code: string) => api.post<{ success: boolean; cart: ICart }>('/cart/coupon', { code }),
  removeCoupon: () => api.delete<{ success: boolean; cart: ICart }>('/cart/coupon'),
};

export const orderService = {
  createOrder: (data: { shippingAddress: any; paymentMethod: string }) =>
    api.post<{ success: boolean; message: string; data: { order: IOrder; paymentDetails?: any } }>('/orders', data),
  verifyPayment: (data: { orderId: string; paymentId: string; signature: string }) =>
    api.post<{ success: boolean; message: string; data: { order: IOrder } }>('/orders/verify-payment', data),
  getMyOrders: () => api.get<{ success: boolean; orders: IOrder[] }>('/orders'),
  getOrderById: (id: string) => api.get<{ success: boolean; order: IOrder }>(`/orders/${id}`),
  cancelOrder: (id: string, reason?: string) => api.post<{ success: boolean; order: IOrder }>(`/orders/${id}/cancel`, { reason }),
};

export const shippingService = {
  checkServiceability: (pincode: string) =>
    api.get<{ success: boolean; data: any }>(`/shipping/serviceability/${pincode}`),
  calculateRate: (data: { pincode: string; items: Array<{ productId: string; quantity: number }>; paymentMethod?: string; couponDiscount?: number }) =>
    api.post<{ success: boolean; data: any }>('/shipping/rate', data),
  getShipmentByOrder: (orderId: string) =>
    api.get<{ success: boolean; data: { shipment: any } }>(`/shipping/shipments/${orderId}`),
  generateAWB: (orderId: string) =>
    api.post<{ success: boolean; message: string; data: { shipment: any } }>(`/shipping/shipments/${orderId}/generate-awb`),
  getSettings: () =>
    api.get<{ success: boolean; data: { settings: any } }>('/shipping/settings'),
  updateSettings: (data: any) =>
    api.put<{ success: boolean; message: string; data: { settings: any } }>('/shipping/settings', data),
};


export const reviewService = {
  getProductReviews: (productId: string) => api.get<{ success: boolean; reviews: IReview[] }>(`/reviews/product/${productId}`),
  addReview: (data: { productId: string; rating: number; title: string; comment: string }) =>
    api.post<{ success: boolean; review: IReview }>('/reviews', data),
};

export const adminService = {
  getDashboardStats: () => api.get<{ success: boolean; stats: any; recentOrders: any[]; lowStockProducts: any[] }>('/admin/dashboard'),
  getProducts: (params?: any) => api.get<{ success: boolean; products: IProduct[]; pagination: any }>('/admin/products', { params }),
  createProduct: (data: any) => api.post<{ success: boolean; product: IProduct }>('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put<{ success: boolean; product: IProduct }>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/products/${id}`),
  getOrders: (params?: any) => api.get<{ success: boolean; orders: IOrder[]; pagination: any }>('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: { status: string; note?: string; trackingNumber?: string }) =>
    api.put<{ success: boolean; order: IOrder }>(`/admin/orders/${id}/status`, data),
  getUsers: () => api.get<{ success: boolean; users: IUser[] }>('/admin/users'),
  updateUserRole: (id: string, role: string) => api.put<{ success: boolean; user: IUser }>(`/admin/users/${id}/role`, { role }),
  getCoupons: () => api.get<{ success: boolean; coupons: any[] }>('/admin/coupons'),
  createCoupon: (data: any) => api.post<{ success: boolean; coupon: any }>('/admin/coupons', data),
  updateCoupon: (id: string, data: any) => api.put<{ success: boolean; coupon: any }>(`/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/coupons/${id}`),
  getReviews: () => api.get<{ success: boolean; reviews: any[] }>('/admin/reviews'),
  deleteReview: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/reviews/${id}`),
  exportOrdersCSV: () => api.get('/admin/orders/export-csv', { responseType: 'blob' }),
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; imageUrl: string; message: string }>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const bannerService = {
  getBanner: () => api.get<{ success: boolean; banner: IOfferBanner }>('/banner'),
  updateBanner: (data: Partial<IOfferBanner>) =>
    api.put<{ success: boolean; message: string; banner: IOfferBanner }>('/banner', data),
};



