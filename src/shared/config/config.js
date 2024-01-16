require('dotenv').config();

const envVars = process.env;

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  postgres: {
    db_host: envVars.DB_HOST,
    db_port: envVars.DB_PORT,
    db_username: envVars.DB_USERNAME,
    db_password: envVars.DB_PASSWORD,
    db_name: envVars.DB_NAME,
  },
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {},
  },
};
