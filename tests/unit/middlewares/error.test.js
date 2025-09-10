/* eslint-disable global-require */
const { setupTests } = require('../../set-up');
const ApiError = require('../../../src/utils/api-error');
const { errorConverter, errorHandler } = require('../../../src/middlewares/error');

describe('Error middlewares', () => {
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe('errorConverter', () => {
    it('should convert regular error to ApiError', () => {
      const error = new Error('Some error');
      error.statusCode = 400;

      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).to.be.instanceOf(ApiError);
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal('Some error');
        expect(err.isOperational).to.equal(false);
      };

      errorConverter(error, req, res, next);
    });

    it('should use 500 status code for errors without statusCode', () => {
      const error = new Error('Some error');

      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).to.be.instanceOf(ApiError);
        expect(err.statusCode).to.equal(500);
        expect(err.message).to.equal('Some error');
      };

      errorConverter(error, req, res, next);
    });

    it('should not convert ApiError instances', () => {
      const error = new ApiError(400, 'API Error', true);

      const req = {};
      const res = {};
      const next = (err) => {
        expect(err).to.equal(error);
        expect(err.isOperational).to.equal(true);
      };

      errorConverter(error, req, res, next);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApiError and include correlation ID', () => {
      const error = new ApiError(400, 'Bad Request', true);

      const req = {
        method: 'GET',
        url: '/test',
        correlationId: 'test-correlation-id',
        get: () => 'Test-Agent',
        ip: '127.0.0.1',
      };

      const res = {
        locals: {},
        status(code) {
          this.statusCode = code;
          return this;
        },
        send(data) {
          this.data = data;
          return this;
        },
      };

      const next = () => {};

      errorHandler(error, req, res, next);

      expect(res.statusCode).to.equal(400);
      expect(res.data).to.deep.include({
        code: 400,
        message: 'Bad Request',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle non-operational errors correctly', () => {
      const error = new ApiError(500, 'Database connection failed', false);

      const req = {
        method: 'GET',
        url: '/test',
        correlationId: 'test-id',
        get: () => 'Test-Agent',
        ip: '127.0.0.1',
      };

      const res = {
        locals: {},
        status(code) {
          this.statusCode = code;
          return this;
        },
        send(data) {
          this.data = data;
          return this;
        },
      };

      errorHandler(error, req, res, () => {});

      expect(res.statusCode).to.equal(500);
      expect(res.data.correlationId).to.equal('test-id');
      expect(res.data.code).to.equal(500);
    });

    it('should include stack trace in development', () => {
      // Mock config for development mode
      const originalConfig = require('../../../src/config/config');
      const mockConfig = { ...originalConfig, env: 'development' };

      // Override the config temporarily
      const configModule = require.cache[require.resolve('../../../src/config/config')];
      configModule.exports = mockConfig;

      // Re-require the error middleware to pick up the mocked config
      delete require.cache[require.resolve('../../../src/middlewares/error')];
      const { errorHandler: devErrorHandler } = require('../../../src/middlewares/error');

      const error = new ApiError(500, 'Database connection failed', false);
      error.stack = 'Error stack trace';

      const req = {
        method: 'GET',
        url: '/test',
        correlationId: 'test-id',
        get: () => 'Test-Agent',
        ip: '127.0.0.1',
      };

      const res = {
        locals: {},
        status(code) {
          this.statusCode = code;
          return this;
        },
        send(data) {
          this.data = data;
          return this;
        },
      };

      devErrorHandler(error, req, res, () => {});

      expect(res.statusCode).to.equal(500);
      expect(res.data.stack).to.equal('Error stack trace');

      // Restore original config
      configModule.exports = originalConfig;
      delete require.cache[require.resolve('../../../src/middlewares/error')];
    });
  });
});
