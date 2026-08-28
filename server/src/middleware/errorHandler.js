import config from '../config/environment.js';

/**
 * Middleware to catch requests to non-existent routes (404)
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

/**
 * Centralized global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      ...(config.isDevelopment && { stack: err.stack }),
    },
  };

  // Log server errors in development
  if (config.isDevelopment && statusCode >= 500) {
    console.error(`[Server Error] ${err.stack || err.message}`);
  }

  res.status(statusCode).json(errorResponse);
};

export default {
  notFoundHandler,
  errorHandler,
};
