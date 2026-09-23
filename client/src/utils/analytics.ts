declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params: Record<string, any> = {}): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackViewItem = (product: {
  _id?: string;
  name: string;
  price: number;
  team?: string;
  league?: string;
  type?: string;
}): void => {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.league || product.type || 'Jersey',
        item_brand: product.team || 'GOALZA',
        price: product.price,
        quantity: 1,
      },
    ],
  });
};

export const trackAddToCart = (item: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  team?: string;
}): void => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        item_variant: item.size,
        item_brand: item.team || 'GOALZA',
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
};

export const trackPurchase = (order: {
  orderNumber?: string;
  _id?: string;
  grandTotal: number;
  tax?: number;
  shipping?: number;
  items?: any[];
}): void => {
  trackEvent('purchase', {
    transaction_id: order.orderNumber || order._id,
    value: order.grandTotal,
    currency: 'INR',
    tax: order.tax || 0,
    shipping: order.shipping || 0,
    items: (order.items || []).map((item: any) => ({
      item_id: item.product?._id || item.product || item._id,
      item_name: item.productName || item.product?.name || 'Jersey',
      item_variant: item.size,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

