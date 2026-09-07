import { verifyToken } from '../utils/token.js';

/**
 * Authentication middleware to verify JWT from Authorization header
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check for Authorization header presence
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required. Authorization header is missing.',
        code: 'TOKEN_MISSING',
      },
    });
  }

  // 2. Validate Bearer token scheme
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authorization format. Format must be: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || !token.trim()) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token is empty.',
        code: 'TOKEN_MISSING',
      },
    });
  }

  try {
    // 3. Cryptographically verify token signature and claims
    const decoded = verifyToken(token);

    // 4. Attach authenticated user details to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Your session has expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or corrupted authentication token.',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - Roles permitted to access the route (e.g. 'admin')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access forbidden. Insufficient permissions for this resource.',
          code: 'FORBIDDEN',
        },
      });
    }

    next();
  };
};

export default {
  authenticate,
  requireRole,
};
