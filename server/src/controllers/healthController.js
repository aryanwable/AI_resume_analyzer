import config from '../config/environment.js';
import { getDatabaseStatus } from '../config/database.js';

/**
 * Health check controller to verify server readiness, database connection, and system metrics
 */
export const getHealth = (req, res) => {
  const memoryUsage = process.memoryUsage();
  const dbStatus = getDatabaseStatus();

  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'ai-resume-analyzer-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.env,
      database: dbStatus,
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    },
  });
};

export default {
  getHealth,
};
