const db = require('../src/models');

const setupTests = async () => {
  const chai = await import('chai');

  // Sync database for tests
  if (process.env.NODE_ENV === 'test') {
    await db.sequelize.sync({ force: true });
  }

  return { expect: chai.expect };
};

module.exports = { setupTests };
