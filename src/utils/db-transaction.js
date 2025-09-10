/* eslint-disable no-await-in-loop, no-promise-executor-return, no-plusplus */
const { Transaction } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const logger = require('../config/logger');

/**
 * Execute operations within a database transaction
 * @param {Function} operations - Async function containing database operations
 * @param {Object} options - Transaction options
 * @returns {Promise<any>} Result of operations
 */
const withTransaction = async (operations, options = {}) => {
  const transaction = await sequelize.transaction({
    isolationLevel: options.isolationLevel || Transaction.ISOLATION_LEVELS.READ_COMMITTED,
    ...options,
  });

  const startTime = Date.now();

  try {
    logger.debug('Starting database transaction', {
      transactionId: transaction.id,
      isolationLevel: options.isolationLevel,
    });

    const result = await operations(transaction);

    await transaction.commit();

    const duration = Date.now() - startTime;
    logger.debug('Transaction committed successfully', {
      transactionId: transaction.id,
      duration: `${duration}ms`,
    });

    return result;
  } catch (error) {
    await transaction.rollback();

    const duration = Date.now() - startTime;
    logger.error('Transaction rolled back due to error', {
      transactionId: transaction.id,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

/**
 * Execute operations with retry logic and transactions
 * @param {Function} operations - Async function containing database operations
 * @param {Object} options - Options including retry configuration
 * @returns {Promise<any>} Result of operations
 */
const withTransactionRetry = async (operations, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = () => true,
    ...transactionOptions
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(operations, transactionOptions);
    } catch (error) {
      lastError = error;

      // Don't retry if condition is not met
      if (!retryCondition(error)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      const delay = retryDelay * 2 ** (attempt - 1); // Exponential backoff

      logger.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: error.message,
        attempt,
        maxRetries,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if an error should trigger a transaction retry
 * @param {Error} error - The error to check
 * @returns {boolean} True if should retry
 */
const shouldRetryTransaction = (error) => {
  // Retry on connection issues, deadlocks, etc.
  const retryableErrors = [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'SequelizeConnectionRefusedError',
    'SequelizeConnectionTimedOutError',
    'SequelizeTimeoutError',
    'SequelizeConnectionError',
  ];

  return retryableErrors.some((errorType) => error.name === errorType
    || error.message.includes(errorType)
    || error.original?.code === errorType);
};

/**
 * Transaction isolation levels
 */
const ISOLATION_LEVELS = {
  READ_UNCOMMITTED: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
  READ_COMMITTED: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  REPEATABLE_READ: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  SERIALIZABLE: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
};

module.exports = {
  withTransaction,
  withTransactionRetry,
  shouldRetryTransaction,
  ISOLATION_LEVELS,
};
