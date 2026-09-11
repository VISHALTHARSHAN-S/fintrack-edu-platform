import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [
    {
      id: 'notif-1',
      title: 'Welcome to FinTrack Edu!',
      message: 'Explore your personalized skill passport and learning path.',
      type: 'info',
      time: 'Just now',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Upcoming Live Mentor Class',
      message: 'Building HFT Bots in C++ begins today at 6:00 PM.',
      type: 'warning',
      time: '1 hour ago',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Skill Score Verified',
      message: 'Your Naan Mudhalvan FinTech certification badge is now active.',
      type: 'success',
      time: 'Yesterday',
      isRead: true,
    },
  ],
  isOpen: false,
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
  },
});

export const { toggleNotificationPanel, closeNotificationPanel, markAllAsRead, markNotificationAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
