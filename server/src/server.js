import app from './app.js';
import config from './config/environment.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(` AI Resume Analyzer API Server`);
  console.log(` Running in [${config.env}] mode`);
  console.log(` Listening on http://localhost:${PORT}`);
  console.log(` Health check at http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});

// Graceful shutdown handler
const handleGracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed. Process exiting.');
    process.exit(0);
  });

  // Force close after 10 seconds if hanging
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

export default server;
