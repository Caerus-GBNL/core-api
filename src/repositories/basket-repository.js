/* eslint-disable no-restricted-syntax, no-await-in-loop */
const { Op } = require('sequelize');
const BaseRepository = require('./base-repository');
const { Basket: BasketEntity } = require('../entities');
const { createQueryBuilder } = require('../utils/query-builder');

/**
 * Basket Repository implementing enhanced repository pattern
 * Extends BaseRepository to provide basket-specific operations
 */
class BasketRepository extends BaseRepository {
  constructor({ basketModel }) {
    // Entity builder for domain conversion
    const entityBuilder = {
      fromDatabase: (dbResult) => {
        if (!dbResult) return null;
        const data = dbResult.toJSON ? dbResult.toJSON() : dbResult;
        return new BasketEntity(
          data.employeeId,
          data.productId,
          data.productCode,
          data.qty,
          data.id,
        );
      },
      toDatabase: (entity) => ({
        employeeId: entity.employeeId,
        productId: entity.productId,
        productCode: entity.productCode,
        qty: entity.qty,
      }),
    };

    super({
      model: basketModel,
      entityBuilder,
    });
  }

  /**
   * Find baskets by employee ID
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of basket entities
   */
  async getByEmployeeId(employeeId, options = {}) {
    return this.findAll({ employeeId }, options);
  }

  /**
   * Find baskets by product ID
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of basket entities
   */
  async getByProductId(productId, options = {}) {
    return this.findAll({ productId }, options);
  }

  /**
   * Find baskets by product code
   * @param {string} productCode - Product code
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of basket entities
   */
  async getByProductCode(productCode, options = {}) {
    return this.findAll({ productCode }, options);
  }

  /**
   * Find baskets by employee with minimum quantity
   * @param {string} employeeId - Employee ID
   * @param {number} minQty - Minimum quantity
   * @returns {Promise<Array>} Array of basket entities
   */
  async getByEmployeeIdWithMinQty(employeeId, minQty) {
    const queryBuilder = createQueryBuilder(this.model);

    const baskets = await queryBuilder
      .where('employeeId', employeeId)
      .where('qty', minQty, 'gte')
      .orderBy('qty', 'DESC')
      .execute();

    return baskets.map((basket) => this.toDomainEntity(basket));
  }

  /**
   * Get total quantity by employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<number>} Total quantity
   */
  async getTotalQtyByEmployee(employeeId) {
    const result = await this.model.findOne({
      attributes: [
        [this.model.sequelize.fn('SUM', this.model.sequelize.col('qty')), 'totalQty'],
      ],
      where: { employeeId },
      raw: true,
    });

    return parseInt(result?.totalQty || 0, 10);
  }

  /**
   * Get basket statistics by employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Statistics object
   */
  async getStatsByEmployee(employeeId) {
    const queryBuilder = createQueryBuilder(this.model);

    const stats = await queryBuilder
      .select([
        [this.model.sequelize.fn('COUNT', '*'), 'totalBaskets'],
        [this.model.sequelize.fn('SUM', this.model.sequelize.col('qty')), 'totalQuantity'],
        [this.model.sequelize.fn('AVG', this.model.sequelize.col('qty')), 'avgQuantity'],
        [this.model.sequelize.fn('MAX', this.model.sequelize.col('qty')), 'maxQuantity'],
        [this.model.sequelize.fn('MIN', this.model.sequelize.col('qty')), 'minQuantity'],
      ])
      .where('employeeId', employeeId)
      .execute('findOne');

    if (!stats) return null;

    return {
      totalBaskets: parseInt(stats.dataValues.totalBaskets, 10),
      totalQuantity: parseInt(stats.dataValues.totalQuantity || 0, 10),
      avgQuantity: parseFloat(stats.dataValues.avgQuantity || 0),
      maxQuantity: parseInt(stats.dataValues.maxQuantity || 0, 10),
      minQuantity: parseInt(stats.dataValues.minQuantity || 0, 10),
    };
  }

  /**
   * Find baskets with complex search criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Array of matching basket entities
   */
  async searchBaskets(criteria = {}) {
    const queryBuilder = createQueryBuilder(this.model);

    // Employee ID filter
    if (criteria.employeeId) {
      queryBuilder.where('employeeId', criteria.employeeId);
    }

    // Product ID filter (multiple)
    if (criteria.productIds && criteria.productIds.length > 0) {
      queryBuilder.whereIn('productId', criteria.productIds);
    }

    // Product code pattern search
    if (criteria.productCodePattern) {
      queryBuilder.like('productCode', criteria.productCodePattern);
    }

    // Quantity range
    if (criteria.minQty !== undefined && criteria.maxQty !== undefined) {
      queryBuilder.whereBetween('qty', criteria.minQty, criteria.maxQty);
    } else if (criteria.minQty !== undefined) {
      queryBuilder.where('qty', criteria.minQty, 'gte');
    } else if (criteria.maxQty !== undefined) {
      queryBuilder.where('qty', criteria.maxQty, 'lte');
    }

    // Date range filter
    if (criteria.createdAfter && criteria.createdBefore) {
      queryBuilder.whereDateBetween('createdAt', criteria.createdAfter, criteria.createdBefore);
    }

    // Sorting
    if (criteria.sortBy) {
      queryBuilder.orderBy(criteria.sortBy, criteria.sortDirection || 'ASC');
    } else {
      queryBuilder.orderBy('createdAt', 'DESC');
    }

    // Pagination
    if (criteria.page && criteria.pageSize) {
      queryBuilder.paginate(criteria.page, criteria.pageSize);
    } else if (criteria.limit) {
      queryBuilder.limit(criteria.limit);
    }

    const baskets = await queryBuilder.execute();
    return baskets.map((basket) => this.toDomainEntity(basket));
  }

  /**
   * Update basket quantity
   * @param {string} id - Basket ID
   * @param {number} newQty - New quantity
   * @returns {Promise<Object>} Updated basket entity
   */
  async updateQuantity(id, newQty) {
    return this.update(id, { qty: newQty });
  }

  /**
   * Bulk update quantities for multiple baskets
   * @param {Array} updates - Array of {id, qty} objects
   * @returns {Promise<Array>} Array of updated basket entities
   */
  async bulkUpdateQuantities(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return [];
    }

    const results = [];

    // Process updates in transaction
    for (const update of updates) {
      if (update.id && update.qty !== undefined) {
        const updated = await this.updateQuantity(update.id, update.qty);
        if (updated) {
          results.push(updated);
        }
      }
    }

    return results;
  }

  /**
   * Delete all baskets for an employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<number>} Number of deleted baskets
   */
  async deleteByEmployeeId(employeeId) {
    return this.bulkDelete({ employeeId });
  }

  /**
   * Delete baskets by product IDs
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise<number>} Number of deleted baskets
   */
  async deleteByProductIds(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return 0;
    }

    return this.bulkDelete({
      productId: { [Op.in]: productIds },
    });
  }
}

module.exports = BasketRepository;
