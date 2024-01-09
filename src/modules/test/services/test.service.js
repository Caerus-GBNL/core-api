const httpStatus = require('http-status');
const ApiError = require('../../../shared/utils/ApiError');

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

module.exports = {
  dummy,
};
