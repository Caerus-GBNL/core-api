const Basket = require('../entities/basket');

class BasketUseCase {
  constructor({ basketRepository }) {
    this.basketRepository = basketRepository;
  }

  createBasket(params) {
    const data = {
      employeeId: 'emp123',
      productId: 'prod456',
      productCode: 'ABC123',
      qty: params,
    };
    const basket = new Basket(data.employeeId, data.productId, data.productCode, data.qty);
    return this.basketRepository.create(basket);
  }

  getBasketsByEmployeeId(employeeId) {
    return this.basketRepository.getByEmployeeId(employeeId);
  }
}

module.exports = BasketUseCase;
