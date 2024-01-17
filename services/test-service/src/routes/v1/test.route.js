const express = require('express');
const BasketController = require('../../controllers/BasketController');

const router = express.Router();

router.get('/baskets/:id', BasketController.basket);
router.post('/baskets', BasketController.create);

module.exports = router;

/**
 * @swagger
 * /test/basket:
 *   get:
 *     description: Get an example
 *     responses:
 *       200:
 *         description: Successful response
 */
