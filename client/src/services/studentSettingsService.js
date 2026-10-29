import API from './api';

const request = async (promise, fallback) => {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || fallback);
  }
};

export const fetchStudentSettingsProfile = () =>
  request(API.get('/student/settings/profile'), 'Unable to load your profile settings.');
export const saveStudentSettingsProfile = (profile) =>
  request(API.put('/student/settings/profile', profile), 'Unable to save your profile settings.');
export const updateStudentPassword = (passwordData) =>
  request(API.post('/student/settings/password', passwordData), 'Unable to update your password.');
export const fetchStudentTheme = () =>
  request(API.get('/student/settings/theme'), 'Unable to load your appearance settings.');
export const saveStudentTheme = (theme) =>
  request(API.put('/student/settings/theme', { theme }), 'Unable to save your appearance settings.');
