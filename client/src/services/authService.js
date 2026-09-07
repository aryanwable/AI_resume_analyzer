import api from './api.js';

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Log in with email and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { token, user }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch current authenticated user profile
 * @returns {Promise<Object>} - { user }
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
};
