/* eslint-disable no-promise-executor-return, no-prototype-builtins */
/* eslint-disable no-use-before-define, no-restricted-globals */
const { randomUUID } = require('crypto');

/**
 * Generate a test correlation ID
 * @returns {string} UUID v4 correlation ID
 */
const generateCorrelationId = () => randomUUID();

/**
 * Create a test user agent string
 * @returns {string} Test user agent
 */
const getTestUserAgent = () => 'test-agent/1.0.0 (automated-test)';

/**
 * Sleep for testing async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after timeout
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate test timestamps
 * @returns {Object} Object with various timestamp formats
 */
const getTestTimestamps = () => {
  const now = new Date();
  return {
    iso: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
  };
};

/**
 * Create mock request object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock request object
 */
const createMockRequest = (overrides = {}) => ({
  correlationId: generateCorrelationId(),
  headers: {},
  query: {},
  params: {},
  body: {},
  method: 'GET',
  url: '/test',
  originalUrl: '/test',
  baseUrl: '',
  ip: '127.0.0.1',
  ...overrides,
});

/**
 * Create mock response object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock response object
 */
const createMockResponse = (overrides = {}) => {
  const res = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    set(header, value) {
      this.headers = this.headers || {};
      if (typeof header === 'object') {
        Object.assign(this.headers, header);
      } else {
        this.headers[header] = value;
      }
      return this;
    },
    get(header) {
      return this.headers?.[header];
    },
    locals: {},
    statusCode: 200,
    headers: {},
    ...overrides,
  };

  return res;
};

/**
 * Validate response structure for health endpoints
 * @param {Object} response - Response object to validate
 * @param {Object} expectedFields - Expected fields with types
 */
const validateHealthResponse = (response, expectedFields = {}) => {
  const defaultFields = {
    correlationId: 'string',
    timestamp: 'string',
  };

  const fields = { ...defaultFields, ...expectedFields };

  Object.entries(fields).forEach(([field, expectedType]) => {
    if (!response.hasOwnProperty(field)) {
      throw new Error(`Missing required field: ${field}`);
    }

    const actualType = typeof response[field];
    if (actualType !== expectedType) {
      throw new Error(`Field ${field} should be ${expectedType}, got ${actualType}`);
    }
  });

  // Validate timestamp format (ISO 8601)
  if (response.timestamp && !isValidISODate(response.timestamp)) {
    throw new Error(`Invalid timestamp format: ${response.timestamp}`);
  }

  // Validate correlation ID format (UUID)
  if (response.correlationId && !isValidUUID(response.correlationId)) {
    throw new Error(`Invalid correlation ID format: ${response.correlationId}`);
  }
};

/**
 * Check if string is valid ISO 8601 date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO date
 */
const isValidISODate = (dateString) => !isNaN(Date.parse(dateString)) && dateString.includes('T') && dateString.includes('Z');

/**
 * Check if string is valid UUID v4
 * @param {string} uuid - UUID string to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

module.exports = {
  generateCorrelationId,
  getTestUserAgent,
  sleep,
  getTestTimestamps,
  createMockRequest,
  createMockResponse,
  validateHealthResponse,
  isValidISODate,
  isValidUUID,
};
