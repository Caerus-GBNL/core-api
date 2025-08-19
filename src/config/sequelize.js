const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
  config.postgres.database,
  config.postgres.username,
  config.postgres.password,
  {
    host: config.postgres.host,
    port: config.postgres.port,
    dialect: 'postgres',
  },
);

module.exports = { sequelize };
