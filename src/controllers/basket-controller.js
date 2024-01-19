const httpStatus = require('http-status');
const catchAsync = require('../utils/catch-async');
const { BasketRepository } = require('../adapters');
const { BasketUseCase } = require('../use-cases');

const basket = catchAsync(async (req, res) => {
  const basketRepository = new BasketRepository();
  const basketUseCase = new BasketUseCase(basketRepository);
  const baskets = await basketUseCase.getBasketsByEmployeeId(965);
  res.status(httpStatus.OK).send(baskets);
});

const create = catchAsync(async (req, res) => {
  const basketRepository = new BasketRepository();
  const basketUseCase = new BasketUseCase(basketRepository);
  const created = await basketUseCase.createBasket(150);
  res.status(httpStatus.OK).send(created);
});

module.exports = {
  basket,
  create,
};
