/* eslint-disable no-restricted-syntax, no-await-in-loop */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const { setupTests } = require('../set-up');
const config = require('../../src/config/config');

describe('Health E2E Tests', () => {
  const service = config.service.name;
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe('Complete health check workflow', () => {
    it('should perform full health check sequence', async () => {
      // 1. Check if service is alive
      const livenessResponse = await request(app)
        .get(`/${service}/v1/health/live`)
        .expect(httpStatus.OK);

      expect(livenessResponse.body.status).to.equal('ALIVE');
      expect(livenessResponse.headers['x-api-version']).to.equal('1');

      // 2. Check if service is ready
      const readinessResponse = await request(app)
        .get(`/${service}/v1/health/ready`)
        .expect(httpStatus.OK);

      expect(readinessResponse.body.status).to.equal('READY');

      // 3. Get detailed health status
      const healthResponse = await request(app)
        .get(`/${service}/v1/health`)
        .expect(httpStatus.OK);

      expect(healthResponse.body.status).to.equal('UP');
      expect(healthResponse.body.checks.database.status).to.equal('healthy');

      // 4. Verify database statistics are accessible
      const statsResponse = await request(app)
        .get(`/${service}/v1/health/stats`)
        .expect(httpStatus.OK);

      expect(statsResponse.body.database.dialect).to.equal('postgres');
      expect(statsResponse.body.database.pool.max).to.be.a('number');
    });

    it('should maintain consistent correlation IDs across requests', async () => {
      const correlationId = 'e2e-test-correlation-id';

      const responses = await Promise.all([
        request(app)
          .get(`/${service}/v1/health/live`)
          .set('X-Correlation-ID', correlationId),
        request(app)
          .get(`/${service}/v1/health/ready`)
          .set('X-Correlation-ID', correlationId),
        request(app)
          .get(`/${service}/v1/health`)
          .set('X-Correlation-ID', correlationId),
      ]);

      responses.forEach((response) => {
        expect(response.status).to.equal(httpStatus.OK);
        expect(response.body.correlationId).to.equal(correlationId);
        expect(response.headers['x-correlation-id']).to.equal(correlationId);
      });
    });

    it('should work correctly with both API versions', async () => {
      const endpoints = [
        `/${service}/v1/health/live`,
        `/${service}/v2/health/live`,
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(httpStatus.OK);

        expect(response.body.status).to.equal('ALIVE');
        expect(response.body.correlationId).to.be.a('string');
        expect(response.body.timestamp).to.be.a('string');
      }

      // Verify version headers
      const v1Response = await request(app).get(`/${service}/v1/health/live`);
      const v2Response = await request(app).get(`/${service}/v2/health/live`);

      expect(v1Response.headers['x-api-version']).to.equal('1');
      expect(v2Response.headers['x-api-version']).to.equal('2');
    });
  });

  describe('Error handling workflow', () => {
    it('should handle unknown endpoints gracefully', async () => {
      const response = await request(app)
        .get(`/${service}/v1/unknown-endpoint`)
        .expect(httpStatus.NOT_FOUND);

      expect(response.body.code).to.equal(404);
      expect(response.body.message).to.equal('Not found');
      expect(response.body.correlationId).to.be.a('string');
    });

    it('should include correlation ID in error responses', async () => {
      const correlationId = 'error-test-correlation-id';

      const response = await request(app)
        .get(`/${service}/v1/non-existent`)
        .set('X-Correlation-ID', correlationId)
        .expect(httpStatus.NOT_FOUND);

      expect(response.body.correlationId).to.equal(correlationId);
      expect(response.headers['x-correlation-id']).to.equal(correlationId);
    });
  });
});
