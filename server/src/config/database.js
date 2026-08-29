import mongoose from 'mongoose';
import config from './environment.js';

let isConnecting = false;

/**
 * Configure Mongoose settings and global event listeners
 */
mongoose.connection.on('connected', () => {
  console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Connection re-established');
});

/**
 * Connect to MongoDB database with retry and fallback handling
 */
export const connectDB = async () => {
  const uri = config.mongoUri;

  if (!uri) {
    console.warn('[MongoDB] Warning: MONGODB_URI is not set in environment. Running in disconnected mode.');
    return false;
  }

  if (mongoose.connection.readyState === 1 || isConnecting) {
    return true;
  }

  try {
    isConnecting = true;
    console.log('[MongoDB] Connecting to database...');

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnecting = false;
    return true;
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB] Initial connection failed: ${error.message}`);
    // Do not terminate process in development, allow health check to report degraded status
    if (config.isProduction) {
      throw error;
    }
    return false;
  }
};

/**
 * Disconnect from MongoDB gracefully
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Database connection closed cleanly');
  }
};

/**
 * Get current database connection state and diagnostics
 */
export const getDatabaseStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = mongoose.connection.readyState;

  if (!config.mongoUri) {
    return {
      status: 'not_configured',
      stateCode: state,
      host: null,
      name: null,
      message: 'MONGODB_URI is not set in environment variables',
    };
  }

  return {
    status: stateMap[state] || 'unknown',
    stateCode: state,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    message: state === 1 ? 'Database operational' : 'Database not connected',
  };
};

export default {
  connectDB,
  disconnectDB,
  getDatabaseStatus,
};
