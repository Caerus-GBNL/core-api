const express = require('express');
const config = require('../../../../../common/config/config');
const docsRoute = require('./docs.route');
const testRoute = require('./test.route');

const router = express.Router();

router.use('/test', testRoute);

if (config.env === 'development') {
  router.use('/docs', docsRoute);
}

module.exports = router;
