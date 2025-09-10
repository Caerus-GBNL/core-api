const { Op } = require('sequelize');
const sinon = require('sinon');
const { setupTests } = require('../../set-up');
const { QueryBuilder, createQueryBuilder } = require('../../../src/utils/query-builder');

describe('QueryBuilder', () => {
  let expect;
  let mockModel;
  let queryBuilder;

  before(async () => {
    ({ expect } = await setupTests());
  });

  beforeEach(() => {
    mockModel = {
      name: 'TestModel',
      findAll: sinon.stub(),
      findOne: sinon.stub(),
      count: sinon.stub(),
    };

    queryBuilder = new QueryBuilder(mockModel);
  });

  describe('constructor', () => {
    it('should initialize with empty query', () => {
      expect(queryBuilder.model).to.equal(mockModel);
      expect(queryBuilder.query).to.deep.equal({
        where: {},
        include: [],
        attributes: null,
        order: [],
        limit: null,
        offset: null,
        group: null,
        having: null,
      });
    });
  });

  describe('where', () => {
    it('should add simple where condition', () => {
      queryBuilder.where('status', 'active');

      expect(queryBuilder.query.where).to.deep.equal({
        status: { [Op.eq]: 'active' },
      });
    });

    it('should add where condition with custom operator', () => {
      queryBuilder.where('age', 18, 'gte');

      expect(queryBuilder.query.where).to.deep.equal({
        age: { [Op.gte]: 18 },
      });
    });

    it('should add object-based where conditions', () => {
      queryBuilder.where({ status: 'active', userId: 123 });

      expect(queryBuilder.query.where).to.deep.equal({
        status: 'active',
        userId: 123,
      });
    });

    it('should merge multiple where conditions', () => {
      queryBuilder
        .where('status', 'active')
        .where('userId', 123);

      expect(queryBuilder.query.where).to.deep.equal({
        status: { [Op.eq]: 'active' },
        userId: { [Op.eq]: 123 },
      });
    });
  });

  describe('orWhere', () => {
    it('should add OR conditions', () => {
      const conditions = [{ status: 'active' }, { status: 'pending' }];
      queryBuilder.orWhere(conditions);

      expect(queryBuilder.query.where).to.deep.equal({
        [Op.or]: conditions,
      });
    });

    it('should not add OR conditions for empty array', () => {
      queryBuilder.orWhere([]);

      expect(queryBuilder.query.where).to.deep.equal({});
    });
  });

  describe('like', () => {
    it('should add case-insensitive LIKE condition by default', () => {
      queryBuilder.like('name', 'john');

      expect(queryBuilder.query.where).to.deep.equal({
        name: { [Op.iLike]: '%john%' },
      });
    });

    it('should add case-sensitive LIKE condition when specified', () => {
      queryBuilder.like('name', 'John', true);

      expect(queryBuilder.query.where).to.deep.equal({
        name: { [Op.like]: '%John%' },
      });
    });
  });

  describe('whereIn', () => {
    it('should add IN condition', () => {
      queryBuilder.whereIn('status', ['active', 'pending']);

      expect(queryBuilder.query.where).to.deep.equal({
        status: { [Op.in]: ['active', 'pending'] },
      });
    });

    it('should not add condition for empty array', () => {
      queryBuilder.whereIn('status', []);

      expect(queryBuilder.query.where).to.deep.equal({});
    });
  });

  describe('whereBetween', () => {
    it('should add BETWEEN condition', () => {
      queryBuilder.whereBetween('age', 18, 65);

      expect(queryBuilder.query.where).to.deep.equal({
        age: { [Op.between]: [18, 65] },
      });
    });
  });

  describe('whereNull', () => {
    it('should add IS NULL condition', () => {
      queryBuilder.whereNull('deletedAt');

      expect(queryBuilder.query.where).to.deep.equal({
        deletedAt: { [Op.is]: null },
      });
    });

    it('should add IS NOT NULL condition', () => {
      queryBuilder.whereNull('deletedAt', false);

      expect(queryBuilder.query.where).to.deep.equal({
        deletedAt: { [Op.not]: null },
      });
    });
  });

  describe('whereDateBetween', () => {
    it('should add date range condition', () => {
      const startDate = '2023-01-01';
      const endDate = '2023-12-31';

      queryBuilder.whereDateBetween('createdAt', startDate, endDate);

      expect(queryBuilder.query.where.createdAt).to.have.property(Op.gte);
      expect(queryBuilder.query.where.createdAt).to.have.property(Op.lte);
      expect(queryBuilder.query.where.createdAt[Op.gte]).to.be.instanceof(Date);
      expect(queryBuilder.query.where.createdAt[Op.lte]).to.be.instanceof(Date);
    });
  });

  describe('select', () => {
    it('should set attributes for single field', () => {
      queryBuilder.select('name');

      expect(queryBuilder.query.attributes).to.deep.equal(['name']);
    });

    it('should set attributes for multiple fields', () => {
      queryBuilder.select(['name', 'email', 'status']);

      expect(queryBuilder.query.attributes).to.deep.equal(['name', 'email', 'status']);
    });
  });

  describe('exclude', () => {
    it('should set exclude attributes', () => {
      queryBuilder.exclude(['password', 'secret']);

      expect(queryBuilder.query.attributes).to.deep.equal({
        exclude: ['password', 'secret'],
      });
    });
  });

  describe('orderBy', () => {
    it('should add single order clause', () => {
      queryBuilder.orderBy('name', 'DESC');

      expect(queryBuilder.query.order).to.deep.equal([['name', 'DESC']]);
    });

    it('should default to ASC direction', () => {
      queryBuilder.orderBy('name');

      expect(queryBuilder.query.order).to.deep.equal([['name', 'ASC']]);
    });

    it('should add multiple order clauses', () => {
      queryBuilder
        .orderBy('status', 'DESC')
        .orderBy('name', 'ASC');

      expect(queryBuilder.query.order).to.deep.equal([
        ['status', 'DESC'],
        ['name', 'ASC'],
      ]);
    });
  });

  describe('pagination', () => {
    it('should set limit', () => {
      queryBuilder.limit(50);

      expect(queryBuilder.query.limit).to.equal(50);
    });

    it('should set offset', () => {
      queryBuilder.offset(100);

      expect(queryBuilder.query.offset).to.equal(100);
    });

    it('should calculate pagination correctly', () => {
      queryBuilder.paginate(3, 20); // Page 3 with 20 items per page

      expect(queryBuilder.query.limit).to.equal(20);
      expect(queryBuilder.query.offset).to.equal(40); // (3-1) * 20
    });

    it('should cap page size to maximum', () => {
      queryBuilder.paginate(1, 5000);

      expect(queryBuilder.query.limit).to.equal(1000); // Capped to max
    });

    it('should handle invalid page numbers', () => {
      queryBuilder.paginate(0, 20);

      expect(queryBuilder.query.offset).to.equal(0); // Minimum page 1
    });
  });

  describe('joins', () => {
    it('should add simple join', () => {
      const association = { model: 'User', as: 'user' };
      queryBuilder.join(association);

      expect(queryBuilder.query.include).to.deep.equal([association]);
    });

    it('should add left join with conditions', () => {
      const UserModel = { name: 'User' };
      queryBuilder.leftJoin(UserModel, { active: true }, ['name', 'email']);

      expect(queryBuilder.query.include).to.deep.equal([{
        model: UserModel,
        where: { active: true },
        attributes: ['name', 'email'],
        required: false,
      }]);
    });

    it('should add inner join', () => {
      const UserModel = { name: 'User' };
      queryBuilder.innerJoin(UserModel, { active: true });

      expect(queryBuilder.query.include).to.deep.equal([{
        model: UserModel,
        where: { active: true },
        attributes: null,
        required: true,
      }]);
    });
  });

  describe('execute', () => {
    it('should execute findAll by default', async () => {
      const mockResults = [{ id: 1 }, { id: 2 }];
      mockModel.findAll.resolves(mockResults);

      queryBuilder.where('status', 'active');
      const results = await queryBuilder.execute();

      expect(mockModel.findAll).to.have.been.calledWith({
        where: { status: { [Op.eq]: 'active' } },
        include: [],
        attributes: null,
        order: [],
        limit: null,
        offset: null,
        group: null,
        having: null,
      });
      expect(results).to.equal(mockResults);
    });

    it('should execute specified method', async () => {
      const mockResult = { id: 1 };
      mockModel.findOne.resolves(mockResult);

      const result = await queryBuilder.execute('findOne');

      expect(mockModel.findOne.calledOnce).to.equal(true);
      expect(result).to.equal(mockResult);
    });
  });

  describe('build', () => {
    it('should return built query object', () => {
      queryBuilder
        .where('status', 'active')
        .orderBy('name')
        .limit(10);

      const query = queryBuilder.build();

      expect(query).to.deep.equal({
        where: { status: { [Op.eq]: 'active' } },
        include: [],
        attributes: null,
        order: [['name', 'ASC']],
        limit: 10,
        offset: null,
        group: null,
        having: null,
      });
    });
  });

  describe('reset', () => {
    it('should reset query to initial state', () => {
      queryBuilder
        .where('status', 'active')
        .orderBy('name')
        .limit(10);

      queryBuilder.reset();

      expect(queryBuilder.query).to.deep.equal({
        where: {},
        include: [],
        attributes: null,
        order: [],
        limit: null,
        offset: null,
        group: null,
        having: null,
      });
    });
  });

  describe('createQueryBuilder factory', () => {
    it('should create new QueryBuilder instance', () => {
      const builder = createQueryBuilder(mockModel);

      expect(builder).to.be.instanceof(QueryBuilder);
      expect(builder.model).to.equal(mockModel);
    });
  });
});
