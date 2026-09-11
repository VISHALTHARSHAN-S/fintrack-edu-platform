import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import studentLearningReducer from '../features/student/studentLearningSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    studentLearning: studentLearningReducer,
  },
});

export default store;
