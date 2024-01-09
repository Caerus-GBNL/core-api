const setupTests = async () => {
  const chai = await import('chai');
  return { expect: chai.expect };
};

module.exports = { setupTests };
