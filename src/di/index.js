const container = require('./container');
const { registerServices } = require('./bindings');

registerServices(container);

module.exports = container;