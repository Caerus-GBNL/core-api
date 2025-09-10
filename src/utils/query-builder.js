const { Op } = require('sequelize');
const logger = require('../config/logger');

/**
 * Query Builder Utility for building complex Sequelize queries
 */
class QueryBuilder {
  constructor(model) {
    this.model = model;
    this.query = {
      where: {},
      include: [],
      attributes: null,
      order: [],
      limit: null,
      offset: null,
      group: null,
      having: null,
    };
  }

  /**
   * Add WHERE conditions
   * @param {Object|string} field - Field name or conditions object
   * @param {*} value - Field value (if field is string)
   * @param {string} operator - Comparison operator
   * @returns {QueryBuilder} this instance for chaining
   */
  where(field, value = undefined, operator = 'eq') {
    if (typeof field === 'object') {
      this.query.where = { ...this.query.where, ...field };
    } else if (value !== undefined) {
      const condition = this._buildCondition(value, operator);
      this.query.where[field] = condition;
    }
    return this;
  }

  /**
   * Add OR conditions
   * @param {Array} conditions - Array of condition objects
   * @returns {QueryBuilder} this instance for chaining
   */
  orWhere(conditions) {
    if (conditions.length > 0) {
      this.query.where[Op.or] = conditions;
    }
    return this;
  }

  /**
   * Add AND conditions
   * @param {Array} conditions - Array of condition objects
   * @returns {QueryBuilder} this instance for chaining
   */
  andWhere(conditions) {
    if (conditions.length > 0) {
      this.query.where[Op.and] = conditions;
    }
    return this;
  }

  /**
   * Add LIKE condition for text search
   * @param {string} field - Field name
   * @param {string} pattern - Search pattern
   * @param {boolean} caseSensitive - Case sensitive search
   * @returns {QueryBuilder} this instance for chaining
   */
  like(field, pattern, caseSensitive = false) {
    const operator = caseSensitive ? Op.like : Op.iLike;
    this.query.where[field] = { [operator]: `%${pattern}%` };
    return this;
  }

  /**
   * Add IN condition
   * @param {string} field - Field name
   * @param {Array} values - Array of values
   * @returns {QueryBuilder} this instance for chaining
   */
  whereIn(field, values) {
    if (Array.isArray(values) && values.length > 0) {
      this.query.where[field] = { [Op.in]: values };
    }
    return this;
  }

  /**
   * Add NOT IN condition
   * @param {string} field - Field name
   * @param {Array} values - Array of values
   * @returns {QueryBuilder} this instance for chaining
   */
  whereNotIn(field, values) {
    if (Array.isArray(values) && values.length > 0) {
      this.query.where[field] = { [Op.notIn]: values };
    }
    return this;
  }

  /**
   * Add range condition (BETWEEN)
   * @param {string} field - Field name
   * @param {*} min - Minimum value
   * @param {*} max - Maximum value
   * @returns {QueryBuilder} this instance for chaining
   */
  whereBetween(field, min, max) {
    this.query.where[field] = { [Op.between]: [min, max] };
    return this;
  }

  /**
   * Add NULL check
   * @param {string} field - Field name
   * @param {boolean} isNull - True for IS NULL, false for IS NOT NULL
   * @returns {QueryBuilder} this instance for chaining
   */
  whereNull(field, isNull = true) {
    this.query.where[field] = isNull ? { [Op.is]: null } : { [Op.not]: null };
    return this;
  }

  /**
   * Add date range condition
   * @param {string} field - Field name
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {QueryBuilder} this instance for chaining
   */
  whereDateBetween(field, startDate, endDate) {
    this.query.where[field] = {
      [Op.gte]: new Date(startDate),
      [Op.lte]: new Date(endDate),
    };
    return this;
  }

  /**
   * Select specific attributes
   * @param {Array|string} attributes - Attributes to select
   * @returns {QueryBuilder} this instance for chaining
   */
  select(attributes) {
    this.query.attributes = Array.isArray(attributes) ? attributes : [attributes];
    return this;
  }

  /**
   * Exclude specific attributes
   * @param {Array|string} attributes - Attributes to exclude
   * @returns {QueryBuilder} this instance for chaining
   */
  exclude(attributes) {
    const excludeList = Array.isArray(attributes) ? attributes : [attributes];
    this.query.attributes = { exclude: excludeList };
    return this;
  }

  /**
   * Add JOIN (include)
   * @param {Object} association - Association configuration
   * @returns {QueryBuilder} this instance for chaining
   */
  join(association) {
    this.query.include.push(association);
    return this;
  }

  /**
   * Add LEFT JOIN with conditions
   * @param {Object} model - Associated model
   * @param {Object} conditions - Join conditions
   * @param {Array} attributes - Attributes to select from joined table
   * @returns {QueryBuilder} this instance for chaining
   */
  leftJoin(model, conditions = {}, attributes = null) {
    this.query.include.push({
      model,
      where: conditions,
      attributes,
      required: false,
    });
    return this;
  }

  /**
   * Add INNER JOIN with conditions
   * @param {Object} model - Associated model
   * @param {Object} conditions - Join conditions
   * @param {Array} attributes - Attributes to select from joined table
   * @returns {QueryBuilder} this instance for chaining
   */
  innerJoin(model, conditions = {}, attributes = null) {
    this.query.include.push({
      model,
      where: conditions,
      attributes,
      required: true,
    });
    return this;
  }

  /**
   * Add ORDER BY clause
   * @param {string} field - Field to order by
   * @param {string} direction - 'ASC' or 'DESC'
   * @returns {QueryBuilder} this instance for chaining
   */
  orderBy(field, direction = 'ASC') {
    this.query.order.push([field, direction.toUpperCase()]);
    return this;
  }

  /**
   * Add multiple ORDER BY clauses
   * @param {Array} orders - Array of [field, direction] pairs
   * @returns {QueryBuilder} this instance for chaining
   */
  orderByMultiple(orders) {
    this.query.order = [...this.query.order, ...orders];
    return this;
  }

  /**
   * Add LIMIT clause
   * @param {number} limit - Maximum number of results
   * @returns {QueryBuilder} this instance for chaining
   */
  limit(limit) {
    this.query.limit = Math.max(0, parseInt(limit, 10));
    return this;
  }

  /**
   * Add OFFSET clause
   * @param {number} offset - Number of results to skip
   * @returns {QueryBuilder} this instance for chaining
   */
  offset(offset) {
    this.query.offset = Math.max(0, parseInt(offset, 10));
    return this;
  }

  /**
   * Add pagination
   * @param {number} page - Page number (1-based)
   * @param {number} pageSize - Items per page
   * @returns {QueryBuilder} this instance for chaining
   */
  paginate(page, pageSize = 20) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const size = Math.min(1000, Math.max(1, parseInt(pageSize, 10))); // Cap page size

    this.query.limit = size;
    this.query.offset = (pageNum - 1) * size;
    return this;
  }

  /**
   * Add GROUP BY clause
   * @param {string|Array} fields - Field(s) to group by
   * @returns {QueryBuilder} this instance for chaining
   */
  groupBy(fields) {
    this.query.group = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  /**
   * Add HAVING clause
   * @param {Object} conditions - Having conditions
   * @returns {QueryBuilder} this instance for chaining
   */
  having(conditions) {
    this.query.having = conditions;
    return this;
  }

  /**
   * Build condition based on operator
   * @param {*} value - Value to compare
   * @param {string} operator - Comparison operator
   * @returns {*} Sequelize condition
   * @private
   */
  _buildCondition(value, operator) {
    const operators = {
      eq: Op.eq,
      ne: Op.ne,
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      like: Op.like,
      ilike: Op.iLike,
      in: Op.in,
      notIn: Op.notIn,
      between: Op.between,
      notBetween: Op.notBetween,
    };

    const sequelizeOp = operators[operator];
    if (!sequelizeOp) {
      logger.warn('Unknown query operator', { operator, value });
      return value; // Fallback to direct value
    }

    return { [sequelizeOp]: value };
  }

  /**
   * Execute the query and return results
   * @param {string} method - Sequelize method ('findAll', 'findOne', 'count', etc.)
   * @returns {Promise} Query results
   */
  async execute(method = 'findAll') {
    try {
      logger.debug('Executing query', {
        model: this.model.name,
        method,
        query: this.query,
      });

      const result = await this.model[method](this.query);

      logger.debug('Query executed successfully', {
        model: this.model.name,
        method,
        resultCount: Array.isArray(result) ? result.length : 1,
      });

      return result;
    } catch (error) {
      logger.error('Query execution failed', {
        model: this.model.name,
        method,
        query: this.query,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get the built query object
   * @returns {Object} Built query object
   */
  build() {
    return { ...this.query };
  }

  /**
   * Reset the query builder
   * @returns {QueryBuilder} this instance for chaining
   */
  reset() {
    this.query = {
      where: {},
      include: [],
      attributes: null,
      order: [],
      limit: null,
      offset: null,
      group: null,
      having: null,
    };
    return this;
  }
}

/**
 * Factory function to create a new QueryBuilder instance
 * @param {Object} model - Sequelize model
 * @returns {QueryBuilder} New QueryBuilder instance
 */
const createQueryBuilder = (model) => new QueryBuilder(model);

module.exports = {
  QueryBuilder,
  createQueryBuilder,
};
