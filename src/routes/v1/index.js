const express = require('express');
const config = require('../../config/config');
const docsRoute = require('./docs.route');
const testRoute = require('./test.route');
const healthRoute = require('./health.route');

const router = express.Router();

// v1 routes
router.use('/v1/health', healthRoute);
router.use('/v1', testRoute);

// Default routes (no version prefix defaults to v1)
router.use('/health', healthRoute);

// Documentation (development only)
if (config.env === 'development') {
  router.use('/v1/docs', docsRoute);
  router.use('/docs', docsRoute);
}

module.exports = router;
