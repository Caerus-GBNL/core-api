const sinon = require('sinon');
const setUp = require('../../set-up');
const BasketUseCase = require('../../../src/use-cases/basket-use-case');
const BasketRepository = require('../../../src/adapters/basket-repository');
const Basket = require('../../../src/entities/basket');

describe('BasketUseCase Class', () => {
  let expect;
  let basketUseCase;
  let sandbox;

  beforeEach(async () => {
    ({ expect } = await setUp.setupTests());
    sandbox = sinon.createSandbox();
    basketUseCase = new BasketUseCase(new BasketRepository());
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a basket and call repository create method', () => {
    const params = {
      employeeId: 'emp123',
      productId: 'prod456',
      productCode: 'ABC123',
      qty: 5,
    };

    sandbox.stub(BasketRepository.prototype, 'create').returns(new Basket(params));

    const result = basketUseCase.createBasket(params);

    expect(BasketRepository.prototype.create
      .calledOnceWith(sinon.match.instanceOf(Basket))).to.equal(true);
    expect(result).to.deep.equal(new Basket(params));
  });
});
