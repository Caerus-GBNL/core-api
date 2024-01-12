const httpStatus = require('http-status');
const ApiError = require('../../../shared/utils/ApiError');
const { opayPayment } = require('../models');

/**
 * Dummy
 * @param {Array} error
 * @returns {Array}
 */
const dummy = async (data) => {
  if (typeof data !== 'object') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Validation Error');
  }
  return data;
};

const fetch = async () => {
  const first10Records = await opayPayment.findAll({
    limit: 10,
  });
  return first10Records;
};

module.exports = {
  dummy,
  fetch,
};
