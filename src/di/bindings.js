const { asClass } = require('awilix');
const { BasketRepository } = require('../adapters');
const { BasketUseCase } = require('../use-cases');

function registerServices(container) {
  container.register({
    basketRepository: asClass(BasketRepository).singleton(),
    basketUseCase: asClass(BasketUseCase),
  });
}

module.exports = { registerServices };
