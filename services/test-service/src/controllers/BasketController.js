const httpStatus = require('http-status');
const catchAsync = require('../../../../common/utils/catchAsync');
const BasketRepository = require('../adapters/BasketRepository');
const BasketUseCase = require('../useCases/BasketUseCase');

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
