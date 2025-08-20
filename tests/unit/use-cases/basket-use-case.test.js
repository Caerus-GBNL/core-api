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
    const mockBasketModel = {
      create: sinon.stub(),
      findAll: sinon.stub(),
    };
    basketUseCase = new BasketUseCase({
      basketRepository: new BasketRepository({ basketModel: mockBasketModel }),
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create a basket and call repository create method', () => {
    const basketData = {
      employeeId: 'emp123',
      productId: 'prod456',
      productCode: 'ABC123',
      qty: 5,
    };

    const expectedBasket = new Basket(
      basketData.employeeId,
      basketData.productId,
      basketData.productCode,
      basketData.qty,
    );

    sandbox.stub(BasketRepository.prototype, 'create').returns(expectedBasket);

    const result = basketUseCase.createBasket(basketData);

    expect(BasketRepository.prototype.create
      .calledOnceWith(sinon.match.instanceOf(Basket))).to.equal(true);
    expect(result).to.deep.equal(expectedBasket);
  });
});
