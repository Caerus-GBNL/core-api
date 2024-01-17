const sinon = require('sinon');
const setUp = require('../../../setUp');
const BasketRepository = require('../../../../services/test-service/src/adapters/BasketRepository');
const Basket = require('../../../../services/test-service/src/entities/Basket');

describe('BasketRepository Class', () => {
  let expect;
  let basketRepository;

  beforeEach(async () => {
    ({ expect } = await setUp.setupTests());
    basketRepository = new BasketRepository();
  });

  it('should create a basket and save to the database', () => {
    const saveStub = sinon.stub(basketRepository, 'create').returnsArg(0);

    const params = {
      employeeId: 'emp123',
      productId: 'prod456',
      productCode: 'ABC123',
      qty: 5,
    };

    const result = basketRepository.create(new Basket(params));

    expect(saveStub.calledOnceWith(sinon.match.instanceOf(Basket))).to.equal(true);
    expect(result).to.deep.equal(new Basket(params));
  });

  it('should get baskets by employeeId from the database', () => {
    const getByEmployeeIdStub = sinon.stub(basketRepository, 'getByEmployeeId').returns([]);

    const employeeId = 'emp789';
    const result = basketRepository.getByEmployeeId(employeeId);

    expect(getByEmployeeIdStub.calledOnceWith(employeeId)).to.equal(true);
    expect(result).to.deep.equal([]);
  });
});
