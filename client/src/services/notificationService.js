import API from './api';

const request = async (promise, fallback) => {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

export const fetchNotifications = () => request(API.get('/notifications'), 'Unable to load notifications.');
export const markNotificationRead = (id) =>
  request(API.put(`/notifications/${encodeURIComponent(id)}/read`), 'Unable to mark the notification as read.');
export const markAllNotificationsRead = () =>
  request(API.put('/notifications/read-all'), 'Unable to mark notifications as read.');
export const fetchNotificationPreferences = () =>
  request(API.get('/notifications/preferences'), 'Unable to load notification preferences.');
export const updateNotificationPreferences = (preferences) =>
  request(API.put('/notifications/preferences', preferences), 'Unable to save notification preferences.');
