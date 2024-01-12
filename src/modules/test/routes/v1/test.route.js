const express = require('express');
const testController = require('../../controllers/test.controller');

const router = express.Router();

router.get('/dummy', testController.dummy);
router.get('/fetch', testController.fetch);

module.exports = router;
