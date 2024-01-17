const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../../services/test-service/src/app');
const setUp = require('../../setUp');

describe('Test routes', () => {
  describe('POST /api/v1/test/baskets', () => {
    let expect;

    before(async () => {
      ({ expect } = await setUp.setupTests());
    });

    it('should return a response with status 200', async () => {
      const response = await request(app)
        .post('/api/v1/test/baskets')
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
