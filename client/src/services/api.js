import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Request Interceptor: Automatically attach Bearer token to Authorization headers
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle global errors and session expiration
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTokenError =
      error.response &&
      error.response.status === 401 &&
      ['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(error.response.data?.error?.code);

    if (isTokenError) {
      // Clear expired authentication credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch custom event for AuthContext to detect session expiration
      window.dispatchEvent(new Event('auth:session_expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
