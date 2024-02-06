const express = require('express');
const { BasketController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const basketValidation = require('../../validations/basket.validation');

const router = express.Router();

router.get('/baskets/:id', BasketController.basket);
router.post('/baskets', validate(basketValidation.createBasket), BasketController.create);

module.exports = router;

/**
 * @swagger
 * /test/baskets:
 *   post:
 *     description: Get an example
 *     responses:
 *       200:
 *         description: Successful response
 */
