const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setUp = require('../set-up');
const config = require('../../src/config/config');

describe('Test routes', () => {
  const service = config.service.name;
  describe(`POST ${service}/test/baskets`, () => {
    let expect;

    before(async () => {
      ({ expect } = await setUp.setupTests());
    });

    it('should return a response with status 200', async () => {
      const response = await request(app)
        .post(`${service}/test/baskets`)
        .send({ qty: 1 })
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.deep.equal({
        employeeId: 'emp123',
        productId: 'prod456',
        productCode: 'ABC123',
        qty: 150,
      });
    });
  });
});
