import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer token to requests
API.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('fintrack_user');
    const token = localStorage.getItem('fintrack_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauth
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthenticated
      if (window.location.pathname.startsWith('/student') || 
          window.location.pathname.startsWith('/mentor') || 
          window.location.pathname.startsWith('/recruiter')) {
        localStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
