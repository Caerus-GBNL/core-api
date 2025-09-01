const { asClass, asValue } = require('awilix');
const { BasketRepository } = require('../adapters');
const { BasketUseCase } = require('../use-cases');
const { Basket } = require('../models');

function registerServices(container) {
  container.register({
    basketModel: asValue(Basket),
    basketRepository: asClass(BasketRepository).singleton(),
    basketUseCase: asClass(BasketUseCase),
  });
}

module.exports = { registerServices };
