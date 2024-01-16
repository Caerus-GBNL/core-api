const express = require('express');
const config = require('../config/config');
const docsRoute = require('./docs.route');
const testRoute = require('../../modules/test/routes/v1');

const router = express.Router();

router.get('/check', (req, res) => res.send('OK'));

router.use('/v1', testRoute);

if (config.env === 'development') {
  router.use('/docs', docsRoute);
}

module.exports = router;
