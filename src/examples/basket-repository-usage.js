/* eslint-disable no-console */
/**
 * Basket Repository Usage Examples
 * Demonstrates how to use the enhanced repository pattern with interfaces
 */

const BasketRepository = require('../repositories/basket-repository');
const { Basket: BasketModel } = require('../models');

// Example of setting up the repository (normally done via DI)
const basketRepository = new BasketRepository({ basketModel: BasketModel });

/**
 * Example 1: Basic CRUD operations using base repository methods
 */
async function basicCrudExample() {
  console.log('=== Basic CRUD Operations ===');

  // Create a new basket
  const newBasket = await basketRepository.create({
    employeeId: 'emp123',
    productId: 'prod456',
    productCode: 'ABC123',
    qty: 5,
  });
  console.log('Created basket:', newBasket);

  // Find basket by ID
  const foundBasket = await basketRepository.findById(newBasket.id);
  console.log('Found basket:', foundBasket);

  // Update basket
  const updatedBasket = await basketRepository.update(newBasket.id, { qty: 10 });
  console.log('Updated basket:', updatedBasket);

  // Count baskets
  const count = await basketRepository.count({ employeeId: 'emp123' });
  console.log('Total baskets for employee:', count);

  // Check if basket exists
  const exists = await basketRepository.exists({ productCode: 'ABC123' });
  console.log('Basket with product code ABC123 exists:', exists);
}

/**
 * Example 2: Domain-specific methods
 */
async function domainSpecificExample() {
  console.log('\n=== Domain-Specific Operations ===');

  // Get all baskets for an employee
  const employeeBaskets = await basketRepository.getByEmployeeId('emp123');
  console.log('Employee baskets:', employeeBaskets.length);

  // Get baskets by product
  const productBaskets = await basketRepository.getByProductId('prod456');
  console.log('Product baskets:', productBaskets.length);

  // Get total quantity for employee
  const totalQty = await basketRepository.getTotalQtyByEmployee('emp123');
  console.log('Total quantity for employee:', totalQty);

  // Get employee statistics
  const stats = await basketRepository.getStatsByEmployee('emp123');
  console.log('Employee basket stats:', stats);
}

/**
 * Example 3: Advanced querying with query builder
 */
async function advancedQueryingExample() {
  console.log('\n=== Advanced Querying ===');

  // Complex search with multiple criteria
  const searchResults = await basketRepository.searchBaskets({
    employeeId: 'emp123',
    minQty: 2,
    maxQty: 20,
    productCodePattern: 'ABC',
    sortBy: 'qty',
    sortDirection: 'DESC',
    page: 1,
    pageSize: 10,
  });
  console.log('Search results:', searchResults.length);

  // Find baskets with minimum quantity
  const highQtyBaskets = await basketRepository.getByEmployeeIdWithMinQty('emp123', 5);
  console.log('High quantity baskets:', highQtyBaskets.length);

  // Date range query example
  const recentBaskets = await basketRepository.searchBaskets({
    createdAfter: new Date('2023-01-01'),
    createdBefore: new Date('2023-12-31'),
    limit: 50,
  });
  console.log('Recent baskets:', recentBaskets.length);
}

/**
 * Example 4: Bulk operations
 */
async function bulkOperationsExample() {
  console.log('\n=== Bulk Operations ===');

  // Bulk create baskets
  const basketsToCreate = [
    {
      employeeId: 'emp123', productId: 'prod1', productCode: 'ABC1', qty: 3,
    },
    {
      employeeId: 'emp123', productId: 'prod2', productCode: 'ABC2', qty: 7,
    },
    {
      employeeId: 'emp456', productId: 'prod3', productCode: 'XYZ1', qty: 2,
    },
  ];

  const createdBaskets = await basketRepository.bulkCreate(basketsToCreate);
  console.log('Bulk created baskets:', createdBaskets.length);

  // Bulk update quantities
  const quantityUpdates = [
    { id: createdBaskets[0].id, qty: 5 },
    { id: createdBaskets[1].id, qty: 10 },
  ];

  const updatedBaskets = await basketRepository.bulkUpdateQuantities(quantityUpdates);
  console.log('Bulk updated baskets:', updatedBaskets.length);

  // Bulk delete by criteria
  const deletedCount = await basketRepository.deleteByEmployeeId('emp456');
  console.log('Deleted baskets:', deletedCount);
}

/**
 * Example 5: Transaction handling (automatic in base repository)
 */
async function transactionExample() {
  console.log('\n=== Transaction Handling ===');

  try {
    // All create/update/delete operations automatically use transactions
    const basket = await basketRepository.create({
      employeeId: 'emp789',
      productId: 'prod999',
      productCode: 'TXN123',
      qty: 1,
    });

    // If any error occurs, transaction will be rolled back automatically
    const updated = await basketRepository.updateQuantity(basket.id, 5);
    console.log('Transaction completed successfully:', updated);
  } catch (error) {
    console.log('Transaction failed and was rolled back:', error.message);
  }
}

/**
 * Example 6: Pagination and filtering
 */
async function paginationExample() {
  console.log('\n=== Pagination and Filtering ===');

  // Get first page of baskets
  const page1 = await basketRepository.findAll({}, {
    limit: 5,
    offset: 0,
    order: [['createdAt', 'DESC']],
  });
  console.log('Page 1 baskets:', page1.length);

  // Get baskets with specific criteria and pagination
  const filteredPage = await basketRepository.searchBaskets({
    employeeId: 'emp123',
    page: 1,
    pageSize: 3,
    sortBy: 'qty',
    sortDirection: 'DESC',
  });
  console.log('Filtered page baskets:', filteredPage.length);
}

// Usage demonstration
async function runExamples() {
  try {
    await basicCrudExample();
    await domainSpecificExample();
    await advancedQueryingExample();
    await bulkOperationsExample();
    await transactionExample();
    await paginationExample();
  } catch (error) {
    console.error('Example execution error:', error);
  }
}

// Export examples for use in other files
module.exports = {
  basicCrudExample,
  domainSpecificExample,
  advancedQueryingExample,
  bulkOperationsExample,
  transactionExample,
  paginationExample,
  runExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
