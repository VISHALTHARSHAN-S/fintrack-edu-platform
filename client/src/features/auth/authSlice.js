import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

// Get user from localStorage
const storedUser = JSON.parse(localStorage.getItem('fintrack_user') || 'null');
const storedToken = localStorage.getItem('fintrack_token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedToken && storedUser),
  isLoading: false,
  error: null,
  verificationPendingEmail: null,
  toastMessage: null,
};

// Async Thunk for User Login
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('fintrack_token', token);
    localStorage.setItem('fintrack_user', JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const completeGoogleLogin = createAsyncThunk('auth/completeGoogleLogin', async (token, { rejectWithValue }) => {
  try {
    localStorage.setItem('fintrack_token', token);
    const response = await API.get('/auth/me');
    const user = response.data.user;

    localStorage.setItem('fintrack_user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    const message = error.response?.data?.message || error.message || 'Google login failed';
    return rejectWithValue(message);
  }
});

export const completeGoogleRegistration = createAsyncThunk('auth/completeGoogleRegistration', async (registrationData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/google/register', registrationData);
    const { token, user } = response.data;

    localStorage.setItem('fintrack_token', token);
    localStorage.setItem('fintrack_user', JSON.stringify(user));
    return { token, user };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Google registration failed';
    return rejectWithValue(message);
  }
});

// Async Thunk for User Registration
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/register', userData);
    return { email: userData.email, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Registration failed';
    return rejectWithValue(message);
  }
});

// Async Thunk for OTP Verification
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/verify-otp', otpData);
    const { token, user } = response.data;

    localStorage.setItem('fintrack_token', token);
    localStorage.setItem('fintrack_user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'OTP Verification failed';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('fintrack_token');
      localStorage.removeItem('fintrack_user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.verificationPendingEmail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setVerificationEmail: (state, action) => {
      state.verificationPendingEmail = action.payload;
    },
    setToast: (state, action) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeGoogleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeGoogleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(completeGoogleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(completeGoogleRegistration.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeGoogleRegistration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(completeGoogleRegistration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationPendingEmail = action.payload.email;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.verificationPendingEmail = null;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setVerificationEmail, setToast, clearToast } = authSlice.actions;
export default authSlice.reducer;
