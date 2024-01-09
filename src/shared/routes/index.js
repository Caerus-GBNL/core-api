const express = require('express');
const testRoute = require('../../modules/test/routes/v1');

const router = express.Router();

router.get('/check', (req, res) => res.send('OK'));

router.use('/v1', testRoute);

module.exports = router;
