const setUp = require('./setUp');

describe('Example Test', () => {
  let expect;

  // Use a before hook to handle the asynchronous setup
  before(async () => {
    ({ expect } = await setUp.setupTests());
  });

  it('should pass if true is true', () => {
    expect(true).to.equal(true);
  });

  it('should pass if 1 + 1 equals 2', () => {
    expect(1 + 1).to.equal(2);
  });
});
