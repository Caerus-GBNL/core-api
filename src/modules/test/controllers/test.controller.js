const httpStatus = require('http-status');
const catchAsync = require('../../../shared/utils/catchAsync');
const { testService } = require('../services');

const dummy = catchAsync(async (req, res) => {
  const data = { name: 'Test' };
  const result = await testService.dummy(data);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  dummy,
};
