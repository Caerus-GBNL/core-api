require('dotenv').config();

const envVars = process.env;

module.exports = {
  service: {
    name: 'test',
  },
  port: envVars.PORT,
  env: envVars.NODE_ENV,
  postgres: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    dialect: 'postgres',
  },
  logging: {
    enabled: envVars.LOGGING_ENABLED,
    maxFileSize: envVars.LOGGING_MAX_FILE_SIZE,
    maxFiles: envVars.LOGGING_MAX_FILES,
  },
};
