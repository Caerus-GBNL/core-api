const mongoose = require('mongoose');

const basketSchema = mongoose.Schema(
  {
    auto: { type: Number, required: true },
    employee_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    product_code: { type: String, required: true, trim: true },
    qty: { type: Number, required: true },
    soq: { type: String, required: true, trim: true },
    order_sold: { type: Number, required: true },
    price: { type: Number, required: true },
    product_name: { type: String, required: true, trim: true },
    separator: { type: String, required: true, trim: true },
    separatorname: { type: String, required: true, trim: true },
    dates: { type: Date, required: true },
    pricing: { type: Number, required: true },
    inventory: { type: Number, required: true },
    orders: { type: Number, required: true },
    entry_time: { type: String, trim: true },
    controlpricing: { type: Number, required: true },
    controlinventory: { type: Number, required: true },
    controlorder: { type: Number, required: true },
  },
);

const Basket = mongoose.model('baskets', basketSchema);

module.exports = Basket;
