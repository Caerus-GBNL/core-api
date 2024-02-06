const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const OpayPayment = sequelize.define('OpayPayment', {
  transactionid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  depositcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  refid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  depositamount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deposittime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  urno_customer_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prefix: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receivedatetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  paytype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'opay_payment',
  timestamps: false,
});

module.exports = OpayPayment;
