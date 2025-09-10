/* eslint-disable global-require */
const db = require('../src/models');

const setupTests = async () => {
  const chai = await import('chai');
  const sinon = require('sinon');
  const sinonChai = await import('sinon-chai');

  // Add Sinon support to Chai
  chai.use(sinonChai.default);

  // Sync database for tests
  if (process.env.NODE_ENV === 'test') {
    await db.sequelize.sync({ force: true });
  }

  return { expect: chai.expect, sinon };
};

module.exports = { setupTests };
