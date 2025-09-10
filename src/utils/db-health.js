/* eslint-disable global-require */
const { sequelize } = require('../config/sequelize');

/**
 * Check database connection health
 * @returns {Promise<Object>} Health status object
 */
const checkDatabaseHealth = async () => {
  try {
    // Test basic connection
    await sequelize.authenticate();

    // Test a simple query to ensure database is responsive
    const startTime = Date.now();
    await sequelize.query('SELECT 1 as test');
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      connection: true,
      pool: {
        max: sequelize.options.pool.max,
        min: sequelize.options.pool.min,
        acquire: sequelize.options.pool.acquire,
        idle: sequelize.options.pool.idle,
      },
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connection: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get database connection statistics
 * @returns {Object} Connection pool statistics
 */
const getDatabaseStats = () => {
  const { Sequelize } = require('sequelize');
  return {
    pool: {
      max: sequelize.options.pool.max,
      min: sequelize.options.pool.min,
      acquire: sequelize.options.pool.acquire,
      idle: sequelize.options.pool.idle,
    },
    dialect: sequelize.getDialect(),
    version: Sequelize.version,
  };
};

module.exports = {
  checkDatabaseHealth,
  getDatabaseStats,
};
