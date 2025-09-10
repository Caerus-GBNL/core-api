const BaseRepositoryInterface = require('../interfaces/base-repository');
const { withTransactionRetry } = require('../utils/db-transaction');
const logger = require('../config/logger');

/**
 * Generic Base Repository Implementation
 * Provides common database operations with transaction support
 */
class BaseRepository extends BaseRepositoryInterface {
  constructor({ model, entityBuilder = null }) {
    super();
    if (!model) {
      throw new Error('Model is required for repository');
    }
    this.model = model;
    this.entityBuilder = entityBuilder;
    this.modelName = model.name || 'Unknown';
  }

  /**
   * Convert database result to domain entity if builder exists
   * @param {Object} dbResult - Database query result
   * @returns {Object} Domain entity or raw result
   */
  toDomainEntity(dbResult) {
    if (!dbResult) return null;
    if (this.entityBuilder && typeof this.entityBuilder.fromDatabase === 'function') {
      return this.entityBuilder.fromDatabase(dbResult);
    }
    return dbResult.toJSON ? dbResult.toJSON() : dbResult;
  }

  /**
   * Convert domain entity to database format
   * @param {Object} entity - Domain entity
   * @returns {Object} Database-formatted object
   */
  fromDomainEntity(entity) {
    if (this.entityBuilder && typeof this.entityBuilder.toDatabase === 'function') {
      return this.entityBuilder.toDatabase(entity);
    }
    return entity;
  }

  async findById(id, options = {}) {
    try {
      logger.debug(`Finding ${this.modelName} by ID`, { id, options });

      const result = await this.model.findByPk(id, {
        ...options,
        logging: (sql, timing) => logger.debug(`${this.modelName} Query`, { sql, timing }),
      });

      return this.toDomainEntity(result);
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID`, { id, error: error.message });
      throw error;
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const {
        limit = 50, offset = 0, order = [], ...findOptions
      } = options;

      logger.debug(`Finding all ${this.modelName}`, { filter, options });

      const results = await this.model.findAll({
        where: filter,
        limit: Math.min(limit, 1000), // Cap limit to prevent large queries
        offset,
        order,
        ...findOptions,
        logging: (sql, timing) => logger.debug(`${this.modelName} Query`, { sql, timing }),
      });

      return results.map((result) => this.toDomainEntity(result));
    } catch (error) {
      logger.error(`Error finding all ${this.modelName}`, { filter, error: error.message });
      throw error;
    }
  }

  async findOne(criteria = {}, options = {}) {
    try {
      logger.debug(`Finding one ${this.modelName}`, { criteria, options });

      const result = await this.model.findOne({
        where: criteria,
        ...options,
        logging: (sql, timing) => logger.debug(`${this.modelName} Query`, { sql, timing }),
      });

      return this.toDomainEntity(result);
    } catch (error) {
      logger.error(`Error finding one ${this.modelName}`, { criteria, error: error.message });
      throw error;
    }
  }

  async create(data, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Creating ${this.modelName}`, { data });

        const dbData = this.fromDomainEntity(data);
        const result = await this.model.create(dbData, {
          ...options,
          transaction,
          logging: (sql, timing) => logger.debug(`${this.modelName} Create`, { sql, timing }),
        });

        logger.info(`${this.modelName} created successfully`, { id: result.id });
        return this.toDomainEntity(result);
      } catch (error) {
        logger.error(`Error creating ${this.modelName}`, { data, error: error.message });
        throw error;
      }
    });
  }

  async update(id, data, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Updating ${this.modelName}`, { id, data });

        const dbData = this.fromDomainEntity(data);
        const [affectedCount] = await this.model.update(dbData, {
          where: { id },
          ...options,
          transaction,
          logging: (sql, timing) => logger.debug(`${this.modelName} Update`, { sql, timing }),
        });

        if (affectedCount === 0) {
          logger.warn(`${this.modelName} not found for update`, { id });
          return null;
        }

        // Fetch and return updated entity
        const updated = await this.findById(id, { transaction });
        logger.info(`${this.modelName} updated successfully`, { id });
        return updated;
      } catch (error) {
        logger.error(`Error updating ${this.modelName}`, { id, data, error: error.message });
        throw error;
      }
    });
  }

  async delete(id, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Deleting ${this.modelName}`, { id });

        const affectedCount = await this.model.destroy({
          where: { id },
          ...options,
          transaction,
          logging: (sql, timing) => logger.debug(`${this.modelName} Delete`, { sql, timing }),
        });

        const deleted = affectedCount > 0;
        if (deleted) {
          logger.info(`${this.modelName} deleted successfully`, { id });
        } else {
          logger.warn(`${this.modelName} not found for deletion`, { id });
        }

        return deleted;
      } catch (error) {
        logger.error(`Error deleting ${this.modelName}`, { id, error: error.message });
        throw error;
      }
    });
  }

  async count(criteria = {}) {
    try {
      logger.debug(`Counting ${this.modelName}`, { criteria });

      const count = await this.model.count({
        where: criteria,
        logging: (sql, timing) => logger.debug(`${this.modelName} Count`, { sql, timing }),
      });

      logger.debug(`${this.modelName} count result`, { count, criteria });
      return count;
    } catch (error) {
      logger.error(`Error counting ${this.modelName}`, { criteria, error: error.message });
      throw error;
    }
  }

  async exists(criteria = {}) {
    try {
      const count = await this.count(criteria);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking ${this.modelName} existence`, { criteria, error: error.message });
      throw error;
    }
  }

  async bulkCreate(dataArray, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Bulk creating ${this.modelName}`, { count: dataArray.length });

        const dbDataArray = dataArray.map((data) => this.fromDomainEntity(data));
        const results = await this.model.bulkCreate(dbDataArray, {
          ...options,
          transaction,
          returning: true,
          logging: (sql, timing) => logger.debug(`${this.modelName} BulkCreate`, { sql, timing }),
        });

        logger.info(`${this.modelName} bulk created successfully`, { count: results.length });
        return results.map((result) => this.toDomainEntity(result));
      } catch (error) {
        logger.error(`Error bulk creating ${this.modelName}`, { count: dataArray.length, error: error.message });
        throw error;
      }
    });
  }

  async bulkUpdate(criteria, data, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Bulk updating ${this.modelName}`, { criteria, data });

        const dbData = this.fromDomainEntity(data);
        const [affectedCount] = await this.model.update(dbData, {
          where: criteria,
          ...options,
          transaction,
          logging: (sql, timing) => logger.debug(`${this.modelName} BulkUpdate`, { sql, timing }),
        });

        logger.info(`${this.modelName} bulk updated successfully`, { affectedCount });
        return affectedCount;
      } catch (error) {
        logger.error(`Error bulk updating ${this.modelName}`, { criteria, error: error.message });
        throw error;
      }
    });
  }

  async bulkDelete(criteria, options = {}) {
    return withTransactionRetry(async (transaction) => {
      try {
        logger.debug(`Bulk deleting ${this.modelName}`, { criteria });

        const affectedCount = await this.model.destroy({
          where: criteria,
          ...options,
          transaction,
          logging: (sql, timing) => logger.debug(`${this.modelName} BulkDelete`, { sql, timing }),
        });

        logger.info(`${this.modelName} bulk deleted successfully`, { affectedCount });
        return affectedCount;
      } catch (error) {
        logger.error(`Error bulk deleting ${this.modelName}`, { criteria, error: error.message });
        throw error;
      }
    });
  }
}

module.exports = BaseRepository;
