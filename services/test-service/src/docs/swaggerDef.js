// const { version } = require('../../../package.json');
const config = require('../../../../common/config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Core API documentation',
    version: 1,
  },
  servers: [
    {
      url: `http://localhost:${config.services.test.port}/api/v1`,
    },
  ],
};

module.exports = swaggerDef;
