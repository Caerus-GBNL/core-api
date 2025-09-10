require('dotenv').config();

module.exports = {
  service: {
    name: process.env.SERVICE_NAME || 'test',
  },
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',

  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.NODE_ENV === 'test'
      ? process.env.TEST_DB_NAME || `${process.env.DB_NAME}_test`
      : process.env.DB_NAME,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
      evict: parseInt(process.env.DB_POOL_EVICT, 10) || 10000,
    },
    dialectOptions: {
      connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
    },
    retry: {
      max: parseInt(process.env.DB_RETRY_MAX, 10) || 3,
    },
  },

  cors: {
    origins: process.env.CORS_ORIGINS === '*' || !process.env.CORS_ORIGINS
      ? '*'
      : process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  request: {
    sizeLimit: process.env.REQUEST_SIZE_LIMIT || '10mb',
  },

  logging: {
    enabled: process.env.LOGGING_ENABLED !== 'false',
    maxFileSize: process.env.LOGGING_MAX_FILE_SIZE || '20m',
    maxFiles: process.env.LOGGING_MAX_FILES || '30d',
  },
};
