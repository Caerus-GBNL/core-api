const { setupTests } = require('../../set-up');
const { checkDatabaseHealth, getDatabaseStats } = require('../../../src/utils/db-health');

describe('Database Health Utilities', () => {
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe('checkDatabaseHealth', () => {
    it('should return healthy status when database is available', async () => {
      const health = await checkDatabaseHealth();

      expect(health).to.be.an('object');
      expect(health.status).to.equal('healthy');
      expect(health.connection).to.equal(true);
      expect(health.pool).to.be.an('object');
      expect(health.responseTime).to.match(/^\d+ms$/);
      expect(health.timestamp).to.be.a('string');
    });

    it('should include pool configuration in health check', async () => {
      const health = await checkDatabaseHealth();

      expect(health.pool).to.have.property('max');
      expect(health.pool).to.have.property('min');
      expect(health.pool).to.have.property('acquire');
      expect(health.pool).to.have.property('idle');
      expect(health.pool.max).to.be.a('number');
      expect(health.pool.min).to.be.a('number');
    });
  });

  describe('getDatabaseStats', () => {
    it('should return database connection statistics', () => {
      const stats = getDatabaseStats();

      expect(stats).to.be.an('object');
      expect(stats).to.have.property('pool');
      expect(stats).to.have.property('dialect');
      expect(stats).to.have.property('version');
      expect(stats.dialect).to.equal('postgres');
    });

    it('should include pool configuration details', () => {
      const stats = getDatabaseStats();

      expect(stats.pool).to.have.property('max');
      expect(stats.pool).to.have.property('min');
      expect(stats.pool).to.have.property('acquire');
      expect(stats.pool).to.have.property('idle');
      expect(stats.pool.max).to.be.a('number');
      expect(stats.pool.min).to.be.a('number');
    });
  });
});
