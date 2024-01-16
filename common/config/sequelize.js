const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.postgres.db_host,
  port: config.postgres.db_port || 5432,
  username: config.postgres.db_username,
  password: config.postgres.db_password,
  database: config.postgres.db_name,
});

module.exports = { sequelize };
