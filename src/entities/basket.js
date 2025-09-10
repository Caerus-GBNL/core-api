class Basket {
  constructor(
    employeeId,
    productId,
    productCode,
    qty,
    id = null,
  ) {
    this.id = id;
    this.employeeId = employeeId;
    this.productId = productId;
    this.productCode = productCode;
    this.qty = qty;
  }
}

module.exports = Basket;
