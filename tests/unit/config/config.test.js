const { setupTests } = require('../../set-up');
const config = require('../../../src/config/config');

describe('Configuration', () => {
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  describe('Configuration structure', () => {
    it('should have all required configuration sections', () => {
      expect(config).to.be.an('object');
      expect(config).to.have.property('service');
      expect(config).to.have.property('port');
      expect(config).to.have.property('env');
      expect(config).to.have.property('postgres');
      expect(config).to.have.property('cors');
      expect(config).to.have.property('request');
      expect(config).to.have.property('logging');
    });

    it('should have service configuration', () => {
      expect(config.service).to.be.an('object');
      expect(config.service).to.have.property('name');
      expect(config.service.name).to.be.a('string');
    });

    it('should have postgres configuration', () => {
      expect(config.postgres).to.be.an('object');
      expect(config.postgres).to.have.property('host');
      expect(config.postgres).to.have.property('port');
      expect(config.postgres).to.have.property('dialect').equal('postgres');
      expect(config.postgres).to.have.property('username');
      expect(config.postgres).to.have.property('password');
      expect(config.postgres).to.have.property('database');
      expect(config.postgres.port).to.be.a('number');
    });

    it('should have CORS configuration', () => {
      expect(config.cors).to.be.an('object');
      expect(config.cors).to.have.property('origins');
      expect(config.cors).to.have.property('credentials');
      expect(config.cors.credentials).to.be.a('boolean');
    });

    it('should have request configuration', () => {
      expect(config.request).to.be.an('object');
      expect(config.request).to.have.property('sizeLimit');
      expect(config.request.sizeLimit).to.be.a('string');
    });

    it('should have logging configuration', () => {
      expect(config.logging).to.be.an('object');
      expect(config.logging).to.have.property('enabled');
      expect(config.logging).to.have.property('maxFileSize');
      expect(config.logging).to.have.property('maxFiles');
      expect(config.logging.enabled).to.be.a('boolean');
    });

    it('should have correct data types', () => {
      expect(config.port).to.be.a('number');
      expect(config.env).to.be.a('string');
    });
  });
});
