const sinon = require('sinon');
const setUp = require('../../set-up');
const BasketRepository = require('../../../src/adapters/basket-repository');
const Basket = require('../../../src/entities/basket');

describe('BasketRepository Class', () => {
  let expect;
  let basketRepository;
  let mockBasketModel;

  beforeEach(async () => {
    ({ expect } = await setUp.setupTests());

    mockBasketModel = {
      create: sinon.stub(),
      findAll: sinon.stub(),
    };

    basketRepository = new BasketRepository({ basketModel: mockBasketModel });
  });

  it('should create a basket and save to the database', async () => {
    const basketData = {
      employeeId: 'emp123',
      productId: 'prod456',
      productCode: 'ABC123',
      qty: 5,
    };

    const createdBasket = {
      id: 1,
      ...basketData,
    };

    mockBasketModel.create.resolves(createdBasket);

    const basket = new Basket(
      basketData.employeeId,
      basketData.productId,
      basketData.productCode,
      basketData.qty,
    );
    const result = await basketRepository.create(basket);

    expect(mockBasketModel.create.calledOnce).to.equal(true);
    expect(mockBasketModel.create.calledWith(basketData)).to.equal(true);
    expect(result).to.be.instanceOf(Basket);
    expect(result.employeeId).to.equal(basketData.employeeId);
  });

  it('should get baskets by employeeId from the database', async () => {
    const employeeId = 'emp789';
    const mockBaskets = [
      {
        employeeId: 'emp789',
        productId: 'prod1',
        productCode: 'ABC1',
        qty: 2,
      },
      {
        employeeId: 'emp789',
        productId: 'prod2',
        productCode: 'ABC2',
        qty: 3,
      },
    ];

    mockBasketModel.findAll.resolves(mockBaskets);

    const result = await basketRepository.getByEmployeeId(employeeId);

    expect(mockBasketModel.findAll.calledOnce).to.equal(true);
    expect(mockBasketModel.findAll.calledWith({ where: { employeeId } })).to.equal(true);
    expect(result).to.be.an('array');
    expect(result).to.have.length(2);
    expect(result[0]).to.be.instanceOf(Basket);
  });
});
