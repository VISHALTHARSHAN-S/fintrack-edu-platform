import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchNotifications as fetchNotificationsApi,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';

export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchNotificationsApi();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markOneNotificationRead = createAsyncThunk(
  'notifications/markOneRead',
  async (id, { rejectWithValue }) => {
    try {
      return await markNotificationRead(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  notifications: [],
  isOpen: false,
  isLoading: false,
  error: '',
  actionError: '',
  hasLoaded: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    toggleNotificationPanel: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeNotificationPanel: (state) => {
      state.isOpen = false;
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((item) => {
        item.isRead = true;
      });
    },
    markNotificationAsRead: (state, action) => {
      const item = state.notifications.find((n) => n.id === action.payload);
      if (item) {
        item.isRead = true;
      }
    },
    replaceNotifications: (state, action) => {
      state.notifications = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasLoaded = true;
        state.error = '';
        state.notifications = action.payload;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.hasLoaded = true;
        state.error = action.payload || 'Unable to load notifications.';
      })
      .addCase(markOneNotificationRead.fulfilled, (state, action) => {
        state.actionError = '';
        const index = state.notifications.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) state.notifications[index] = action.payload;
      })
      .addCase(markOneNotificationRead.rejected, (state, action) => {
        state.actionError = action.payload || 'Unable to update notification.';
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.actionError = '';
        state.notifications.forEach((item) => {
          item.isRead = true;
        });
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.actionError = action.payload || 'Unable to update notifications.';
      });
  },
});

export const {
  toggleNotificationPanel,
  closeNotificationPanel,
  markAllAsRead,
  markNotificationAsRead,
  replaceNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
