import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '@shared/types';

interface WishlistState {
  items: IProduct[];
}

const loadStoredWishlist = (): IProduct[] => {
  try {
    const raw = localStorage.getItem('jw_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialState: WishlistState = {
  items: loadStoredWishlist(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<IProduct>) => {
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (exists) {
        state.items = state.items.filter((item) => item._id !== action.payload._id);
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem('jw_wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('jw_wishlist');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
