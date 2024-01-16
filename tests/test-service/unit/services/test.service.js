const httpStatus = require('http-status');
const setUp = require('../../../setUp');
const testService = require('../../../../services/test-service/src/services/test.service');
const ApiError = require('../../../../common/utils/ApiError');

describe('dummy function', () => {
  let expect;

  before(async () => {
    ({ expect } = await setUp.setupTests());
  });

  it('should return data if input is an object', async () => {
    const inputData = { key: 'value' };

    const result = await testService.dummy(inputData);

    expect(result).to.deep.equal(inputData);
  });

  it('should throw ApiError with BAD_REQUEST status for non-object input', async () => {
    const inputData = 'not an object';

    try {
      await testService.dummy(inputData);
      expect.fail('Expected an error to be thrown for non-object input');
    } catch (error) {
      expect(error).to.be.instanceOf(ApiError);
      expect(error.statusCode).to.equal(httpStatus.BAD_REQUEST);
      expect(error.message).to.equal('Validation Error');
      expect(error.isOperational).to.equal(true);
    }
  });
});
