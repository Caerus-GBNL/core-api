const { randomUUID } = require('crypto');

const correlationId = (req, res, next) => {
  // Check if correlation ID already exists in request headers
  const existingCorrelationId = req.headers['x-correlation-id'] || req.headers['correlation-id'];

  // Generate new correlation ID if none exists
  req.correlationId = existingCorrelationId || randomUUID();

  // Set response header for correlation ID
  res.set('X-Correlation-ID', req.correlationId);

  next();
};

module.exports = correlationId;
