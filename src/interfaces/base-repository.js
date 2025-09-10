/* eslint-disable no-unused-vars */
/**
 * Base Repository Interface
 * Defines standard CRUD operations that all repositories should implement
 */
class BaseRepositoryInterface {
  /**
   * Find a single entity by ID
   * @param {string|number} id - Entity ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Entity or null if not found
   * @abstract
   */
  async findById(id, options = {}) {
    throw new Error('findById method must be implemented');
  }

  /**
   * Find multiple entities with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (limit, offset, sort, etc.)
   * @returns {Promise<Array>} Array of entities
   * @abstract
   */
  async findAll(filter = {}, options = {}) {
    throw new Error('findAll method must be implemented');
  }

  /**
   * Find a single entity by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Entity or null if not found
   * @abstract
   */
  async findOne(criteria = {}, options = {}) {
    throw new Error('findOne method must be implemented');
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @param {Object} options - Creation options
   * @returns {Promise<Object>} Created entity
   * @abstract
   */
  async create(data, options = {}) {
    throw new Error('create method must be implemented');
  }

  /**
   * Update an entity by ID
   * @param {string|number} id - Entity ID
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated entity
   * @abstract
   */
  async update(id, data, options = {}) {
    throw new Error('update method must be implemented');
  }

  /**
   * Delete an entity by ID
   * @param {string|number} id - Entity ID
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} True if deleted successfully
   * @abstract
   */
  async delete(id, options = {}) {
    throw new Error('delete method must be implemented');
  }

  /**
   * Count entities matching criteria
   * @param {Object} criteria - Count criteria
   * @returns {Promise<number>} Count of matching entities
   * @abstract
   */
  async count(criteria = {}) {
    throw new Error('count method must be implemented');
  }

  /**
   * Check if entity exists by criteria
   * @param {Object} criteria - Existence criteria
   * @returns {Promise<boolean>} True if entity exists
   * @abstract
   */
  async exists(criteria = {}) {
    throw new Error('exists method must be implemented');
  }

  /**
   * Bulk create multiple entities
   * @param {Array} dataArray - Array of entity data
   * @param {Object} options - Bulk creation options
   * @returns {Promise<Array>} Array of created entities
   * @abstract
   */
  async bulkCreate(dataArray, options = {}) {
    throw new Error('bulkCreate method must be implemented');
  }

  /**
   * Bulk update multiple entities
   * @param {Object} criteria - Update criteria
   * @param {Object} data - Update data
   * @param {Object} options - Bulk update options
   * @returns {Promise<number>} Number of updated entities
   * @abstract
   */
  async bulkUpdate(criteria, data, options = {}) {
    throw new Error('bulkUpdate method must be implemented');
  }

  /**
   * Bulk delete multiple entities
   * @param {Object} criteria - Delete criteria
   * @param {Object} options - Bulk delete options
   * @returns {Promise<number>} Number of deleted entities
   * @abstract
   */
  async bulkDelete(criteria, options = {}) {
    throw new Error('bulkDelete method must be implemented');
  }
}
/* eslint-enable no-unused-vars */

module.exports = BaseRepositoryInterface;
