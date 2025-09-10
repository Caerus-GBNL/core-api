const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/api-error');

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  // Log error with request context
  const logContext = {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode,
      isOperational: err.isOperational,
    },
    request: {
      method: req.method,
      url: req.url,
      correlationId: req.correlationId || 'unknown',
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    },
    timestamp: new Date().toISOString(),
  };

  logger.error('Request error occurred', logContext);

  const response = {
    code: statusCode,
    message,
    correlationId: req.correlationId,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
