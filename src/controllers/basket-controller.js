const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const container = require('../di');

const basket = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  const baskets = await basketUseCase.getBasketsByEmployeeId(req.params.id);
  res.status(httpStatus.OK).send(baskets);
});

const create = catchAsync(async (req, res) => {
  const basketUseCase = container.resolve('basketUseCase');
  const created = await basketUseCase.createBasket(req.body);
  res.status(httpStatus.OK).send(created);
});

module.exports = {
  basket,
  create,
};
