const { setupTests } = require('../../set-up');
const correlationId = require('../../../src/middlewares/correlation-id');

describe('Correlation ID middleware', () => {
  let expect;

  before(async () => {
    ({ expect } = await setupTests());
  });

  it('should generate correlation ID when none exists', () => {
    const req = { headers: {} };
    const res = {
      set(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
    };
    const next = () => {};

    correlationId(req, res, next);

    expect(req.correlationId).to.be.a('string');
    expect(req.correlationId).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(res.headers['X-Correlation-ID']).to.equal(req.correlationId);
  });

  it('should use existing correlation ID from x-correlation-id header', () => {
    const existingId = 'existing-correlation-id';
    const req = { headers: { 'x-correlation-id': existingId } };
    const res = {
      set(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
    };
    const next = () => {};

    correlationId(req, res, next);

    expect(req.correlationId).to.equal(existingId);
    expect(res.headers['X-Correlation-ID']).to.equal(existingId);
  });

  it('should use existing correlation ID from correlation-id header', () => {
    const existingId = 'another-correlation-id';
    const req = { headers: { 'correlation-id': existingId } };
    const res = {
      set(key, value) {
        this.headers = this.headers || {};
        this.headers[key] = value;
      },
    };
    const next = () => {};

    correlationId(req, res, next);

    expect(req.correlationId).to.equal(existingId);
    expect(res.headers['X-Correlation-ID']).to.equal(existingId);
  });
});
