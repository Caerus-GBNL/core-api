const Joi = require('joi');

const createBasket = {
  body: Joi.object().keys({
    qty: Joi.number().required().integer(),
  }),
};

const getBaskets = {
  query: Joi.object().keys({
    employeeId: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBasket = {
  params: Joi.object().keys({
    basketId: Joi.number().integer(),
  }),
};

module.exports = {
  createBasket,
  getBaskets,
  getBasket,
};
