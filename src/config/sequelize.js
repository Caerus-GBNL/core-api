/* eslint-disable no-await-in-loop, no-promise-executor-return */
const { Sequelize } = require('sequelize');
const config = require('./config');
const logger = require('./logger');

const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: config.postgres.dialect,
    pool: config.postgres.pool,
    dialectOptions: config.postgres.dialectOptions,
    retry: config.postgres.retry,
    logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
    logQueryParameters: config.env === 'development',
  },
);

// Connection health check with retry logic
const connectWithRetry = async () => {
  const maxRetries = config.postgres.retry.max;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
      return;
    } catch (error) {
      retryCount += 1;
      const delay = Math.min(1000 * (2 ** retryCount), 10000); // Exponential backoff, max 10s

      logger.error(`Database connection failed (attempt ${retryCount}/${maxRetries}):`, {
        error: error.message,
        retryIn: `${delay}ms`,
      });

      if (retryCount >= maxRetries) {
        logger.error('Max database connection retries exceeded');
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = { sequelize, connectWithRetry };
