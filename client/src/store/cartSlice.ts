import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICart, ICartItem, IProduct } from '@shared/types';
import { cartService } from '../services/api';

interface CartState {
  cart: ICart;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  error: string | null;
}

const calculateCartTotals = (items: ICartItem[], couponCode?: string, discountPercent = 0): Omit<ICart, '_id' | 'user' | 'updatedAt'> => {
  let subtotal = 0;
  for (const item of items) {
    const p = item.product;
    const price = p?.discountPrice && p.discountPrice > 0 ? p.discountPrice : (p?.price || item.price || 0);
    subtotal += price * item.quantity;
  }

  let discount = 0;
  if (discountPercent > 0) {
    discount = Math.round((subtotal * discountPercent) / 100);
  }

  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 79;
  const tax = Math.round((subtotal - discount) * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

  return {
    items,
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
    couponCode,
  };
};

const loadStoredCart = (): ICart => {
  try {
    const raw = localStorage.getItem('jw_cart');
    if (raw) {
      const parsed = JSON.parse(raw);
      const totals = calculateCartTotals(parsed.items || [], parsed.couponCode);
      return {
        _id: parsed._id || 'guest_cart',
        user: parsed.user || 'guest',
        ...totals,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch {
    // fallback
  }

  return {
    _id: 'guest_cart',
    user: 'guest',
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    grandTotal: 0,
    updatedAt: new Date().toISOString(),
  };
};

const saveCartToStorage = (cart: ICart) => {
  try {
    localStorage.setItem('jw_cart', JSON.stringify(cart));
  } catch {
    // ignore
  }
};

const initialState: CartState = {
  cart: loadStoredCart(),
  isLoading: false,
  isCartDrawerOpen: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('jw_token');
    if (!token) return null;
    const res = await cartService.getCart();
    return res.data.cart;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    payload: {
      productId: string;
      product?: IProduct;
      size: string;
      quantity: number;
      customization?: { playerName?: string; playerNumber?: string };
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('jw_token');
      if (token) {
        const res = await cartService.addToCart({
          productId: payload.productId,
          size: payload.size,
          quantity: payload.quantity,
          customization: payload.customization,
        });
        if (res.data?.cart) {
          return res.data.cart;
        }
      }
    } catch {
      // Fall through to local state handling
    }
    return null;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jw_token');
      if (token) {
        const res = await cartService.updateCartItem(itemId, quantity);
        if (res.data?.cart) return res.data.cart;
      }
    } catch {
      // Fall through to local state handling
    }
    return null;
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jw_token');
      if (token) {
        const res = await cartService.removeCartItem(itemId);
        if (res.data?.cart) return res.data.cart;
      }
    } catch {
      // Fall through to local state handling
    }
    return null;
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jw_token');
      if (token) {
        const res = await cartService.applyCoupon(code);
        if (res.data?.cart) return res.data.cart;
      }
    } catch {
      // Fallback
    }
    return null;
  }
);

export const removeCoupon = createAsyncThunk(
  'cart/removeCoupon',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('jw_token');
      if (token) {
        const res = await cartService.removeCoupon();
        if (res.data?.cart) return res.data.cart;
      }
    } catch {
      // Fallback
    }
    return null;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
    clearCart: (state) => {
      state.cart = {
        _id: 'guest_cart',
        user: 'guest',
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 0,
        updatedAt: new Date().toISOString(),
      };
      localStorage.removeItem('jw_cart');
    },
    addLocalItem: (
      state,
      action: PayloadAction<{
        product: IProduct;
        size: string;
        quantity: number;
        customization?: { playerName?: string; playerNumber?: string };
      }>
    ) => {
      const { product, size, quantity, customization } = action.payload;
      const effectivePrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

      const existingIndex = state.cart.items.findIndex(
        (it) =>
          it.product._id === product._id &&
          it.size === size &&
          (it.customization?.playerName || '') === (customization?.playerName || '') &&
          (it.customization?.playerNumber || '') === (customization?.playerNumber || '')
      );

      if (existingIndex > -1) {
        state.cart.items[existingIndex].quantity += quantity;
      } else {
        state.cart.items.push({
          _id: `local_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          product,
          size: size as any,
          quantity,
          price: effectivePrice,
          customization,
        });
      }

      const totals = calculateCartTotals(state.cart.items, state.cart.couponCode);
      Object.assign(state.cart, totals);
      state.isCartDrawerOpen = true;
      saveCartToStorage(state.cart);
    },
    updateLocalQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.cart.items = state.cart.items.filter((it) => it._id !== itemId);
      } else {
        const item = state.cart.items.find((it) => it._id === itemId);
        if (item) item.quantity = quantity;
      }

      const totals = calculateCartTotals(state.cart.items, state.cart.couponCode);
      Object.assign(state.cart, totals);
      saveCartToStorage(state.cart);
    },
    removeLocalItem: (state, action: PayloadAction<string>) => {
      state.cart.items = state.cart.items.filter((it) => it._id !== action.payload);
      const totals = calculateCartTotals(state.cart.items, state.cart.couponCode);
      Object.assign(state.cart, totals);
      saveCartToStorage(state.cart);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.cart = action.payload;
          saveCartToStorage(state.cart);
        }
        state.isLoading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload) {
          state.cart = action.payload;
          saveCartToStorage(state.cart);
        }
        state.isCartDrawerOpen = true;
        state.isLoading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.cart = action.payload;
          saveCartToStorage(state.cart);
        }
        state.isLoading = false;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.cart = action.payload;
          saveCartToStorage(state.cart);
        }
        state.isLoading = false;
      });
  },
});

export const {
  toggleCartDrawer,
  openCartDrawer,
  closeCartDrawer,
  clearCart,
  addLocalItem,
  updateLocalQuantity,
  removeLocalItem,
} = cartSlice.actions;

export default cartSlice.reducer;
