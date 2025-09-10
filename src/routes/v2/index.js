const express = require('express');
const config = require('../../config/config');
const healthRoute = require('../v1/health.route'); // Reuse v1 health route for now
const docsRoute = require('../v1/docs.route'); // Reuse v1 docs route for now

const router = express.Router();

router.use('/v2/health', healthRoute);

if (config.env === 'development') {
  router.use('/v2/docs', docsRoute);
}

module.exports = router;
