import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  isSearchModalOpen: boolean;
  isSizeGuideOpen: boolean;
  toasts: ToastMessage[];
}

const initialState: UIState = {
  isSearchModalOpen: false,
  isSizeGuideOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSearchModal: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen;
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchModalOpen = action.payload;
    },
    setSizeGuideOpen: (state, action: PayloadAction<boolean>) => {
      state.isSizeGuideOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<{ type: 'success' | 'error' | 'info' | 'warning'; message: string }>) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleSearchModal, setSearchModalOpen, setSizeGuideOpen, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
