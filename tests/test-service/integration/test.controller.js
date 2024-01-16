const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../../services/test-service/src/app');
const setUp = require('../../setUp');

describe('Test routes', () => {
  describe('GET /v1/test/dummy', () => {
    let expect;

    before(async () => {
      ({ expect } = await setUp.setupTests());
    });

    it('should return a response with status 200', async () => {
      const response = await request(app)
        .get('/api/v1/test/dummy')
        .expect(httpStatus.OK);

      const result = response.body;
      expect(result).to.deep.equal({ name: 'Test' });
    });
  });
});
