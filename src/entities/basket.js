class Basket {
  constructor(
    employeeId,
    productId,
    productCode,
    qty,
  ) {
    this.employeeId = employeeId;
    this.productId = productId;
    this.productCode = productCode;
    this.qty = qty;
  }
}

module.exports = Basket;
