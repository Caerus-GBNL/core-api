const setUp = require('../../../setUp');
const Basket = require('../../../../services/test-service/src/entities/Basket');

describe('Basket Class', () => {
  let expect;

  before(async () => {
    ({ expect } = await setUp.setupTests());
  });

  it('should create a new basket with provided properties', () => {
    const basket = new Basket('emp123', 'prod456', 'ABC123', 5);

    expect(basket).to.be.an.instanceOf(Basket);
    expect(basket.employeeId).to.equal('emp123');
    expect(basket.productId).to.equal('prod456');
    expect(basket.productCode).to.equal('ABC123');
    expect(basket.qty).to.equal(5);
  });

  it('should have the correct properties after instantiation', () => {
    const basket = new Basket('emp789', 'prod789', 'XYZ789', 10);

    expect(basket.employeeId).to.equal('emp789');
    expect(basket.productId).to.equal('prod789');
    expect(basket.productCode).to.equal('XYZ789');
    expect(basket.qty).to.equal(10);
  });
});
