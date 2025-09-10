const sinon = require('sinon');
const { setupTests } = require('../../set-up');
const BaseRepository = require('../../../src/repositories/base-repository');

describe('BaseRepository', () => {
  let expect;
  let mockModel;
  let repository;
  let mockEntityBuilder;

  before(async () => {
    ({ expect } = await setupTests());
  });

  beforeEach(() => {
    // Mock Sequelize model
    mockModel = {
      name: 'TestModel',
      findByPk: sinon.stub(),
      findAll: sinon.stub(),
      findOne: sinon.stub(),
      create: sinon.stub(),
      update: sinon.stub(),
      destroy: sinon.stub(),
      count: sinon.stub(),
      bulkCreate: sinon.stub(),
    };

    // Mock entity builder
    mockEntityBuilder = {
      fromDatabase: sinon.stub(),
      toDatabase: sinon.stub(),
    };

    repository = new BaseRepository({
      model: mockModel,
      entityBuilder: mockEntityBuilder,
    });
  });

  describe('constructor', () => {
    it('should throw error if model is not provided', () => {
      expect(() => new BaseRepository({})).to.throw('Model is required for repository');
    });

    it('should initialize with model and entity builder', () => {
      expect(repository.model).to.equal(mockModel);
      expect(repository.entityBuilder).to.equal(mockEntityBuilder);
      expect(repository.modelName).to.equal('TestModel');
    });
  });

  describe('toDomainEntity', () => {
    it('should return null for null input', () => {
      const result = repository.toDomainEntity(null);
      expect(result).to.equal(null);
    });

    it('should use entity builder if available', () => {
      const dbResult = { id: 1, name: 'test' };
      const domainEntity = { id: 1, name: 'test', isDomainEntity: true };

      mockEntityBuilder.fromDatabase.returns(domainEntity);

      const result = repository.toDomainEntity(dbResult);

      expect(mockEntityBuilder.fromDatabase).to.have.been.calledWith(dbResult);
      expect(result).to.equal(domainEntity);
    });

    it('should use toJSON if entity builder not available', () => {
      const repositoryWithoutBuilder = new BaseRepository({ model: mockModel });
      const dbResult = {
        id: 1,
        name: 'test',
        toJSON: () => ({ id: 1, name: 'test' }),
      };

      const result = repositoryWithoutBuilder.toDomainEntity(dbResult);

      expect(result).to.deep.equal({ id: 1, name: 'test' });
    });

    it('should return raw result if no toJSON and no builder', () => {
      const repositoryWithoutBuilder = new BaseRepository({ model: mockModel });
      const dbResult = { id: 1, name: 'test' };

      const result = repositoryWithoutBuilder.toDomainEntity(dbResult);

      expect(result).to.equal(dbResult);
    });
  });

  describe('fromDomainEntity', () => {
    it('should use entity builder if available', () => {
      const domainEntity = { id: 1, name: 'test' };
      const dbData = { id: 1, name: 'test', isDbData: true };

      mockEntityBuilder.toDatabase.returns(dbData);

      const result = repository.fromDomainEntity(domainEntity);

      expect(mockEntityBuilder.toDatabase).to.have.been.calledWith(domainEntity);
      expect(result).to.equal(dbData);
    });

    it('should return entity as-is if no builder', () => {
      const repositoryWithoutBuilder = new BaseRepository({ model: mockModel });
      const entity = { id: 1, name: 'test' };

      const result = repositoryWithoutBuilder.fromDomainEntity(entity);

      expect(result).to.equal(entity);
    });
  });

  describe('findById', () => {
    it('should find entity by ID and convert to domain entity', async () => {
      const dbResult = { id: 1, name: 'test' };
      const domainEntity = { id: 1, name: 'test', isDomainEntity: true };

      mockModel.findByPk.resolves(dbResult);
      mockEntityBuilder.fromDatabase.returns(domainEntity);

      const result = await repository.findById(1, { include: [] });

      expect(mockModel.findByPk).to.have.been.calledWith(1, {
        include: [],
        logging: sinon.match.func,
      });
      expect(result).to.equal(domainEntity);
    });

    it('should return null if entity not found', async () => {
      mockModel.findByPk.resolves(null);

      const result = await repository.findById(1);

      expect(result).to.equal(null);
    });

    it('should handle errors properly', async () => {
      const error = new Error('Database error');
      mockModel.findByPk.rejects(error);

      try {
        await repository.findById(1);
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe('findAll', () => {
    it('should find all entities with filter and options', async () => {
      const dbResults = [{ id: 1 }, { id: 2 }];
      const domainEntities = [{ id: 1, isDomain: true }, { id: 2, isDomain: true }];

      mockModel.findAll.resolves(dbResults);
      mockEntityBuilder.fromDatabase
        .onFirstCall().returns(domainEntities[0])
        .onSecondCall().returns(domainEntities[1]);

      const result = await repository.findAll(
        { status: 'active' },
        { limit: 10, offset: 0, order: [['name', 'ASC']] },
      );

      expect(mockModel.findAll).to.have.been.calledWith({
        where: { status: 'active' },
        limit: 10,
        offset: 0,
        order: [['name', 'ASC']],
        logging: sinon.match.func,
      });
      expect(result).to.deep.equal(domainEntities);
    });

    it('should cap limit to prevent large queries', async () => {
      mockModel.findAll.resolves([]);

      await repository.findAll({}, { limit: 5000 });

      expect(mockModel.findAll).to.have.been.calledWith(
        sinon.match({ limit: 1000 }),
      );
    });
  });

  describe('create', () => {
    it('should create entity with transaction support', async () => {
      const domainEntity = { name: 'test' };
      const dbData = { name: 'test', isDbData: true };
      const createdEntity = { id: 1, name: 'test' };
      const finalDomainEntity = { id: 1, name: 'test', isDomain: true };

      mockEntityBuilder.toDatabase.returns(dbData);
      mockModel.create.resolves(createdEntity);
      mockEntityBuilder.fromDatabase.returns(finalDomainEntity);

      const result = await repository.create(domainEntity);

      expect(mockEntityBuilder.toDatabase).to.have.been.calledWith(domainEntity);
      expect(mockModel.create).to.have.been.calledWith(
        dbData,
        sinon.match({
          transaction: sinon.match.any,
          logging: sinon.match.func,
        }),
      );
      expect(result).to.equal(finalDomainEntity);
    });
  });

  describe('count', () => {
    it('should count entities with criteria', async () => {
      mockModel.count.resolves(5);

      const result = await repository.count({ status: 'active' });

      expect(mockModel.count).to.have.been.calledWith({
        where: { status: 'active' },
        logging: sinon.match.func,
      });
      expect(result).to.equal(5);
    });
  });

  describe('exists', () => {
    it('should return true if count > 0', async () => {
      mockModel.count.resolves(3);

      const result = await repository.exists({ status: 'active' });

      expect(result).to.equal(true);
    });

    it('should return false if count = 0', async () => {
      mockModel.count.resolves(0);

      const result = await repository.exists({ status: 'active' });

      expect(result).to.equal(false);
    });
  });
});
