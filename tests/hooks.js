const db = require('../src/models');

// Global after hook that runs after ALL tests complete
exports.mochaHooks = {
  async afterAll() {
    // Close the database connection after all tests complete
    if (db.sequelize) {
      await db.sequelize.close();
    }
  },
};
