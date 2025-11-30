/**
 * Server entry point
 * Starts HTTP server and handles graceful shutdown
 */

const app = require('./src/app');
const sequelize = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`🛑 ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('✅ HTTP server closed');

    try {
      await sequelize.close();
      logger.info('✅ Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to restart the process
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
