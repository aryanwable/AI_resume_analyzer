import jwt from 'jsonwebtoken';
import config from '../config/environment.js';

/**
 * Generate and sign a JSON Web Token (JWT)
 * @param {Object} payload - Data payload to encode into token claims (id, email, role)
 * @param {string|number} [expiresIn] - Optional custom token expiry (defaults to config.jwtExpiresIn: '7d')
 * @returns {string} - Signed JWT string
 */
export const generateToken = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn,
  });
};

/**
 * Verify and decode a JSON Web Token (JWT)
 * @param {string} token - JWT string to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is expired, malformed, or invalid signature
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

export default {
  generateToken,
  verifyToken,
};
