import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { testConnection, closeConnections } from './config/database.js';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start HTTP server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info({
        port: env.PORT,
        host: env.HOST,
        env: env.NODE_ENV,
      }, `🚀 ${env.APP_NAME} is running`);

      logger.info(`📍 API available at http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`❤️  Health check at http://${env.HOST}:${env.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await closeConnections();
          logger.info('Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error({ error: error.message }, 'Error during shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception');
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled promise rejection');
    });

  } catch (error) {
    logger.fatal({ error: error.message }, 'Failed to start server');
    process.exit(1);
  }
};

// Start the server
startServer();
