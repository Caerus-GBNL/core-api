const Basket = require('../entities/basket');

class BasketUseCase {
  constructor({ basketRepository }) {
    this.basketRepository = basketRepository;
  }

  createBasket(basketData) {
    const basket = new Basket(
      basketData.employeeId,
      basketData.productId,
      basketData.productCode,
      basketData.qty,
    );
    return this.basketRepository.create(basket);
  }

  getBasketsByEmployeeId(employeeId) {
    return this.basketRepository.getByEmployeeId(employeeId);
  }
}

module.exports = BasketUseCase;
