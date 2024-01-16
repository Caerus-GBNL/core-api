const express = require('express');
const testController = require('../../controllers/test.controller');

const router = express.Router();

router.get('/dummy', testController.dummy);
router.get('/sequelize', testController.fetch);
router.get('/mongoose', testController.mongoose);

module.exports = router;

/**
 * @swagger
 * /test/dummy:
 *   get:
 *     description: Get an example
 *     responses:
 *       200:
 *         description: Successful response
 */
