const httpStatus = require('http-status');
const catchAsync = require('../../../../common/utils/catchAsync');
const { testService } = require('../services');

const dummy = catchAsync(async (req, res) => {
  const data = { name: 'Test' };
  const result = await testService.dummy(data);
  res.status(httpStatus.OK).send(result);
});

const fetch = catchAsync(async (req, res) => {
  const result = await testService.fetch();
  res.status(httpStatus.OK).send(result);
});

const mongoose = catchAsync(async (req, res) => {
  const result = await testService.mongoose();
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  dummy,
  fetch,
  mongoose,
};
