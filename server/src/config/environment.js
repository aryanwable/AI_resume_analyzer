import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or server directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local .env if present

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiApiKey: process.env.AI_API_KEY || '',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};

/**
 * Validate presence of required environment configuration and log warnings for development
 */
export const validateEnvironment = () => {
  const warnings = [];

  if (!config.mongoUri) {
    warnings.push('MONGODB_URI is not defined (MongoDB features will run in offline mode).');
  }

  if (config.isProduction && config.jwtSecret === 'dev_jwt_secret_change_in_production') {
    throw new Error('FATAL: JWT_SECRET must be set to a secure secret in production environment.');
  }

  if (!config.aiApiKey) {
    warnings.push('AI_API_KEY is not defined (LLM features will require key setup in Phase 5).');
  }

  if (warnings.length > 0 && config.isDevelopment) {
    console.log('\n[Environment Notice]');
    warnings.forEach((w) => console.log(`  ℹ  ${w}`));
    console.log('');
  }

  return { isValid: true, warnings };
};

export default config;
