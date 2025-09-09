/* eslint-disable no-unused-vars */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Baskets', [
      {
        employeeId: 'EMP001',
        productId: 'PROD001',
        productCode: 'LAPTOP-HP-001',
        qty: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employeeId: 'EMP002',
        productId: 'PROD002',
        productCode: 'MOUSE-LOGI-001',
        qty: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employeeId: 'EMP001',
        productId: 'PROD003',
        productCode: 'KEYBOARD-DELL-001',
        qty: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employeeId: 'EMP003',
        productId: 'PROD004',
        productCode: 'MONITOR-SAMSUNG-001',
        qty: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employeeId: 'EMP002',
        productId: 'PROD005',
        productCode: 'HEADSET-SONY-001',
        qty: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Baskets', null, {});
  },
};
