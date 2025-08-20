const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setUp = require('../set-up');
const config = require('../../src/config/config');
const db = require('../../src/models');

describe('Test routes', () => {
  const service = config.service.name;
  describe(`POST /${service}/test/baskets`, () => {
    let expect;

    before(async () => {
      ({ expect } = await setUp.setupTests());
      // Ensure database tables exist for integration tests
      await db.sequelize.sync({ force: true });
    });

    it('should return a response with status 200', async () => {
      const basketData = {
        employeeId: 'EMP123',
        productId: 'PROD456',
        productCode: 'ABC123',
        qty: 5,
      };

      const response = await request(app)
        .post(`/${service}/test/baskets`)
        .send(basketData)
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.deep.equal(basketData);
    });
  });
});
