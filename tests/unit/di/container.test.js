/* eslint-disable max-classes-per-file */
const { createContainer, asClass } = require('awilix');
const setUp = require('../../set-up');

describe('Awilix DI Container', () => {
  let container;
  let expect;

  before(async () => {
    ({ expect } = await setUp.setupTests());
  });

  beforeEach(() => {
    container = createContainer();
  });

  describe('register and resolve', () => {
    it('should register and resolve a service', () => {
      class TestService {}

      container.register({
        testService: asClass(TestService),
      });

      const instance = container.resolve('testService');

      expect(instance).to.be.instanceOf(TestService);
    });

    it('should register a service as singleton', () => {
      class TestService {}

      container.register({
        testService: asClass(TestService).singleton(),
      });

      const instance1 = container.resolve('testService');
      const instance2 = container.resolve('testService');

      expect(instance1).to.equal(instance2);
    });

    it('should register a service with dependencies', () => {
      class Repository {}
      class Service {
        constructor({ repository }) {
          this.repository = repository;
        }
      }

      container.register({
        repository: asClass(Repository),
        service: asClass(Service),
      });

      const service = container.resolve('service');

      expect(service.repository).to.be.instanceOf(Repository);
    });

    it('should create new instances for non-singleton services', () => {
      class TestService {}

      container.register({
        testService: asClass(TestService),
      });

      const instance1 = container.resolve('testService');
      const instance2 = container.resolve('testService');

      expect(instance1).to.not.equal(instance2);
    });

    it('should throw error for unregistered service', () => {
      expect(() => container.resolve('unknownService')).to.throw();
    });
  });

  describe('hasRegistration', () => {
    it('should return true for registered service', () => {
      class TestService {}

      container.register({
        testService: asClass(TestService),
      });

      expect(container.hasRegistration('testService')).to.equal(true);
    });

    it('should return false for unregistered service', () => {
      expect(container.hasRegistration('unknownService')).to.equal(false);
    });
  });
});