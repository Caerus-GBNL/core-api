const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const container = require('../di');

const basket = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  const baskets = await basketUseCase.getBasketsByEmployeeId(965);
  res.status(httpStatus.OK).send(baskets);
});

const create = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  const created = await basketUseCase.createBasket(150);
  res.status(httpStatus.OK).send(created);
});

module.exports = {
  basket,
  create,
};
