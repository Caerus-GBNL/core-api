const sinon = require('sinon');
const { setupTests } = require('../../set-up');
const BasketRepository = require('../../../src/repositories/basket-repository');
const Basket = require('../../../src/entities/basket');

describe('Enhanced BasketRepository', () => {
  let expect;
  let basketRepository;
  let mockBasketModel;

  beforeEach(async () => {
    ({ expect } = await setupTests());

    mockBasketModel = {
      name: 'Basket',
      create: sinon.stub(),
      findAll: sinon.stub(),
      findByPk: sinon.stub(),
      findOne: sinon.stub(),
      update: sinon.stub(),
      destroy: sinon.stub(),
      count: sinon.stub(),
      bulkCreate: sinon.stub(),
      sequelize: {
        fn: sinon.stub(),
        col: sinon.stub(),
        authenticate: sinon.stub().resolves(),
        transaction: sinon.stub().resolves({
          commit: sinon.stub().resolves(),
          rollback: sinon.stub().resolves(),
          id: 'mock-tx-id',
        }),
      },
    };

    basketRepository = new BasketRepository({ basketModel: mockBasketModel });
  });

  describe('Basic CRUD operations', () => {
    it('should create entity conversion properly', () => {
      const basketData = {
        employeeId: 'emp123',
        productId: 'prod456',
        productCode: 'ABC123',
        qty: 5,
      };

      const entity = basketRepository.entityBuilder.fromDatabase(basketData);
      expect(entity).to.be.an.instanceOf(Basket);
      expect(entity.employeeId).to.equal(basketData.employeeId);
      expect(entity.productId).to.equal(basketData.productId);
      expect(entity.productCode).to.equal(basketData.productCode);
      expect(entity.qty).to.equal(basketData.qty);
    });

    it('should convert entity to database format', () => {
      const basket = new Basket('emp123', 'prod456', 'ABC123', 5);
      const dbData = basketRepository.entityBuilder.toDatabase(basket);

      expect(dbData).to.deep.equal({
        employeeId: 'emp123',
        productId: 'prod456',
        productCode: 'ABC123',
        qty: 5,
      });
    });

    it('should find basket by ID using base repository', async () => {
      const basketData = {
        id: 1,
        employeeId: 'emp123',
        productId: 'prod456',
        productCode: 'ABC123',
        qty: 5,
        toJSON: () => ({
          id: 1,
          employeeId: 'emp123',
          productId: 'prod456',
          productCode: 'ABC123',
          qty: 5,
        }),
      };

      mockBasketModel.findByPk.resolves(basketData);

      const result = await basketRepository.findById(1);

      expect(mockBasketModel.findByPk).to.have.been.calledWith(1);
      expect(result).to.be.instanceOf(Basket);
      expect(result.id).to.equal(1);
      expect(result.employeeId).to.equal('emp123');
    });
  });

  describe('Basket-specific methods', () => {
    it('should get baskets by employee ID', async () => {
      const employeeId = 'emp789';
      const mockBaskets = [
        {
          id: 1,
          employeeId: 'emp789',
          productId: 'prod1',
          productCode: 'ABC1',
          qty: 2,
          toJSON: () => ({
            id: 1, employeeId: 'emp789', productId: 'prod1', productCode: 'ABC1', qty: 2,
          }),
        },
        {
          id: 2,
          employeeId: 'emp789',
          productId: 'prod2',
          productCode: 'ABC2',
          qty: 3,
          toJSON: () => ({
            id: 2, employeeId: 'emp789', productId: 'prod2', productCode: 'ABC2', qty: 3,
          }),
        },
      ];

      mockBasketModel.findAll.resolves(mockBaskets);

      const result = await basketRepository.getByEmployeeId(employeeId);

      expect(mockBasketModel.findAll).to.have.been.calledWith(
        sinon.match({
          where: { employeeId },
          limit: sinon.match.number,
        }),
      );
      expect(result).to.be.an('array');
      expect(result).to.have.length(2);
      expect(result[0]).to.be.instanceOf(Basket);
      expect(result[0].employeeId).to.equal('emp789');
    });

    it('should get baskets by product ID', async () => {
      const productId = 'prod123';
      mockBasketModel.findAll.resolves([]);

      await basketRepository.getByProductId(productId);

      expect(mockBasketModel.findAll).to.have.been.calledWith(
        sinon.match({
          where: { productId },
        }),
      );
    });

    it('should get baskets by product code', async () => {
      const productCode = 'ABC123';
      mockBasketModel.findAll.resolves([]);

      await basketRepository.getByProductCode(productCode);

      expect(mockBasketModel.findAll).to.have.been.calledWith(
        sinon.match({
          where: { productCode },
        }),
      );
    });

    it('should get total quantity by employee', async () => {
      const employeeId = 'emp123';
      const mockResult = { totalQty: '15' };

      mockBasketModel.sequelize.fn.returns('SUM_FUNCTION');
      mockBasketModel.sequelize.col.returns('qty_COLUMN');
      mockBasketModel.findOne.resolves(mockResult);

      const result = await basketRepository.getTotalQtyByEmployee(employeeId);

      expect(mockBasketModel.findOne.calledOnce).to.equal(true);
      expect(result).to.equal(15);
    });
  });

  describe('Domain-specific methods', () => {
    it('should call findAll with correct parameters for getByProductId', async () => {
      const productId = 'prod123';
      mockBasketModel.findAll.resolves([]);

      await basketRepository.getByProductId(productId);

      expect(mockBasketModel.findAll).to.have.been.calledWith(
        sinon.match({
          where: { productId },
        }),
      );
    });

    it('should call findAll with correct parameters for getByProductCode', async () => {
      const productCode = 'ABC123';
      mockBasketModel.findAll.resolves([]);

      await basketRepository.getByProductCode(productCode);

      expect(mockBasketModel.findAll).to.have.been.calledWith(
        sinon.match({
          where: { productCode },
        }),
      );
    });
  });

  describe('Error handling', () => {
    it('should handle empty bulk updates gracefully', async () => {
      const results = await basketRepository.bulkUpdateQuantities([]);
      expect(results).to.be.an('array');
      expect(results).to.have.length(0);
    });

    it('should handle invalid bulk update data', async () => {
      const updates = [
        { id: null, qty: 5 }, // Invalid ID
        { qty: 10 }, // Missing ID
        { id: 3 }, // Missing qty
      ];

      const results = await basketRepository.bulkUpdateQuantities(updates);
      expect(results).to.be.an('array');
      expect(results).to.have.length(0);
    });
  });
});
