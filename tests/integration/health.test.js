const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const { setupTests } = require('../set-up');
const config = require('../../src/config/config');

describe('Health endpoints', () => {
  const service = config.service.name;
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe(`GET /${service}/v1/health`, () => {
    it('should return health status with database check', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health`)
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.have.property('status');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('correlationId');
      expect(result).to.have.property('checks');
      expect(result.checks).to.have.property('database');
      expect(result.checks.database).to.have.property('status');
      expect(result.checks.database).to.have.property('pool');
    });

    it('should include correlation ID and API version in response', async () => {
      const correlationId = 'test-correlation-id';

      const response = await request(app)
        .get(`/${service}/v1/health`)
        .set('X-Correlation-ID', correlationId)
        .expect(httpStatus.OK);

      expect(response.body.correlationId).to.equal(correlationId);
      expect(response.headers['x-api-version']).to.equal('1');
    });
  });

  describe(`GET /${service}/v1/health/ready`, () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health/ready`)
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.have.property('status', 'READY');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('correlationId');
    });
  });

  describe(`GET /${service}/v1/health/live`, () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health/live`)
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.have.property('status', 'ALIVE');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('correlationId');
    });
  });

  describe(`GET /${service}/v1/health/stats`, () => {
    it('should return database statistics', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health/stats`)
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.have.property('database');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('correlationId');
      expect(result.database).to.have.property('pool');
      expect(result.database).to.have.property('dialect', 'postgres');
      expect(result.database).to.have.property('version');
    });

    it('should include pool configuration in stats', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health/stats`)
        .expect(httpStatus.OK);

      const { pool } = response.body.database;
      expect(pool).to.have.property('max');
      expect(pool).to.have.property('min');
      expect(pool).to.have.property('acquire');
      expect(pool).to.have.property('idle');
      expect(pool.max).to.be.a('number');
      expect(pool.min).to.be.a('number');
    });
  });

  // Test API versioning
  describe('API Versioning', () => {
    it('should return v1 for /v1/ endpoints', async () => {
      const response = await request(app)
        .get(`/${service}/v1/health/live`)
        .expect(httpStatus.OK);

      expect(response.headers['x-api-version']).to.equal('1');
    });

    it('should return v2 for /v2/ endpoints', async () => {
      const response = await request(app)
        .get(`/${service}/v2/health/live`)
        .expect(httpStatus.OK);

      expect(response.headers['x-api-version']).to.equal('2');
    });

    it('should default to v1 for endpoints without version', async () => {
      const response = await request(app)
        .get(`/${service}/health/live`)
        .expect(httpStatus.OK);

      expect(response.headers['x-api-version']).to.equal('1');
    });
  });
});
