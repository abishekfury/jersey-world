import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '@shared/types';
import { api, setAuthToken } from '../services/api';

interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialToken = localStorage.getItem('jw_token');

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<{ success: boolean; user: IUser }>('/auth/me');
    return res.data.user;
  } catch (err: any) {
    setAuthToken(null);
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const res = await api.post<{ success: boolean; accessToken: string; user: IUser }>('/auth/login', credentials);
    setAuthToken(res.data.accessToken);
    return { user: res.data.user, token: res.data.accessToken };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (formData: any, { rejectWithValue }) => {
  try {
    const res = await api.post<{ success: boolean; accessToken: string; user: IUser }>('/auth/register', formData);
    setAuthToken(res.data.accessToken);
    return { user: res.data.user, token: res.data.accessToken };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore error
  } finally {
    setAuthToken(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearAuthError, updateUserAvatar } = authSlice.actions;
export default authSlice.reducer;
