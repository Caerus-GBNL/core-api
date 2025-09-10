const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: `${config.service.name} API`,
    version,
    description: 'Microservice API built with Clean Architecture principles',
    contact: {
      name: 'Development Team',
      email: 'dev@company.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/${config.service.name}/v1`,
      description: 'Development server',
    },
    {
      url: `https://api.company.com/${config.service.name}/v1`,
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check and monitoring endpoints',
    },
    {
      name: 'Test',
      description: 'Test endpoints for API validation',
    },
  ],
};

module.exports = swaggerDef;
