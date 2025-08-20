const { Basket: BasketEntity } = require('../entities');

class BasketRepository {
  constructor({ basketModel }) {
    this.basketModel = basketModel;
  }

  async create(basket) {
    const created = await this.basketModel.create({
      employeeId: basket.employeeId,
      productId: basket.productId,
      productCode: basket.productCode,
      qty: basket.qty,
    });

    return new BasketEntity(
      created.employeeId,
      created.productId,
      created.productCode,
      created.qty,
    );
  }

  async getByEmployeeId(employeeId) {
    const baskets = await this.basketModel.findAll({
      where: { employeeId },
    });

    return baskets.map((basket) => new BasketEntity(
      basket.employeeId,
      basket.productId,
      basket.productCode,
      basket.qty,
    ));
  }
}

module.exports = BasketRepository;
