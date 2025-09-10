const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { connectWithRetry } = require('./config/sequelize');

const startServer = async () => {
  try {
    // Initialize database connection with retry logic
    await connectWithRetry();

    // Start the server after successful database connection
    const server = app.listen(config.port, () => {
      logger.info(`Server started successfully on port ${config.port}`, {
        environment: config.env,
        serviceName: config.service.name,
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server and handle graceful shutdown
let serverInstance;

startServer()
  .then((server) => {
    serverInstance = server;
  })
  .catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });

const exitHandler = () => {
  if (serverInstance) {
    serverInstance.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error occurred:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (serverInstance) {
    serverInstance.close();
  }
});
