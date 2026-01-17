import { db } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { generateUUID, parsePagination, parseSort } from '../utils/helpers.js';

/**
 * Base Model
 * All models should extend this class
 */
export class BaseModel {
  /**
   * @param {string} tableName - Database table name
   * @param {Object} options - Model options
   */
  constructor(tableName, options = {}) {
    this.tableName = tableName;
    this.primaryKey = options.primaryKey || 'id';
    this.timestamps = options.timestamps !== false;
    this.softDeletes = options.softDeletes || false;
    this.searchableFields = options.searchableFields || [];
    this.sortableFields = options.sortableFields || ['created_at', 'updated_at'];
    this.hidden = options.hidden || [];
  }

  /**
   * Get main database connection
   */
  getConnection() {
    return db;
  }

  /**
   * Get base query
   */
  query() {
    let query = this.getConnection()(this.tableName);

    // Exclude soft-deleted records by default
    if (this.softDeletes) {
      query = query.whereNull(`${this.tableName}.deleted_at`);
    }

    return query;
  }

  /**
   * Find all records with optional filtering, pagination, and sorting
   */
  async findAll(options = {}) {
    const { page, limit, offset } = parsePagination(options);
    const { field: sortField, order: sortOrder } = parseSort(
      options,
      this.sortableFields
    );

    let query = this.query();

    // Apply search if provided
    if (options.search && this.searchableFields.length > 0) {
      query = query.where((builder) => {
        this.searchableFields.forEach((field, index) => {
          if (index === 0) {
            builder.whereILike(field, `%${options.search}%`);
          } else {
            builder.orWhereILike(field, `%${options.search}%`);
          }
        });
      });
    }

    // Apply additional filters
    if (options.filters) {
      query = this.applyFilters(query, options.filters);
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count(`${this.primaryKey} as count`);
    const total = parseInt(count);

    // Apply sorting and pagination
    const data = await query
      .orderBy(sortField, sortOrder)
      .limit(limit)
      .offset(offset)
      .select(`${this.tableName}.*`);

    return {
      data: data.map((record) => this.hideFields(record)),
      pagination: { page, limit, total },
    };
  }

  /**
   * Find a single record by ID
   */
  async findById(id) {
    const record = await this.query()
      .where(`${this.tableName}.${this.primaryKey}`, id)
      .first();

    return record ? this.hideFields(record) : null;
  }

  /**
   * Find a single record by ID or throw error
   */
  async findByIdOrFail(id) {
    const record = await this.findById(id);

    if (!record) {
      throw new NotFoundError(`${this.tableName} not found`);
    }

    return record;
  }

  /**
   * Find a single record by field value
   */
  async findBy(field, value) {
    const record = await this.query()
      .where(`${this.tableName}.${field}`, value)
      .first();

    return record ? this.hideFields(record) : null;
  }

  /**
   * Find records by field value
   */
  async findAllBy(field, value) {
    const records = await this.query()
      .where(`${this.tableName}.${field}`, value);

    return records.map((record) => this.hideFields(record));
  }

  /**
   * Find first record matching conditions
   */
  async findFirst(conditions = {}) {
    let query = this.query();

    for (const [key, value] of Object.entries(conditions)) {
      query = query.where(`${this.tableName}.${key}`, value);
    }

    const record = await query.first();
    return record ? this.hideFields(record) : null;
  }

  /**
   * Create a new record
   */
  async create(data) {
    const record = this.prepareForInsert(data);

    const [created] = await this.getConnection()(this.tableName)
      .insert(record)
      .returning('*');

    return this.hideFields(created);
  }

  /**
   * Create multiple records
   */
  async createMany(dataArray) {
    const records = dataArray.map((data) => this.prepareForInsert(data));

    const created = await this.getConnection()(this.tableName)
      .insert(records)
      .returning('*');

    return created.map((record) => this.hideFields(record));
  }

  /**
   * Update a record by ID
   */
  async update(id, data) {
    const record = this.prepareForUpdate(data);

    const [updated] = await this.query()
      .where(`${this.tableName}.${this.primaryKey}`, id)
      .update(record)
      .returning('*');

    return updated ? this.hideFields(updated) : null;
  }

  /**
   * Update a record by ID or throw error
   */
  async updateOrFail(id, data) {
    const updated = await this.update(id, data);

    if (!updated) {
      throw new NotFoundError(`${this.tableName} not found`);
    }

    return updated;
  }

  /**
   * Update records matching conditions
   */
  async updateWhere(conditions, data) {
    let query = this.query();

    for (const [key, value] of Object.entries(conditions)) {
      query = query.where(`${this.tableName}.${key}`, value);
    }

    const record = this.prepareForUpdate(data);
    const updated = await query.update(record).returning('*');

    return updated.map((r) => this.hideFields(r));
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    if (this.softDeletes) {
      return this.softDelete(id);
    }

    const deleted = await this.query()
      .where(`${this.tableName}.${this.primaryKey}`, id)
      .del()
      .returning('*');

    return deleted.length > 0;
  }

  /**
   * Soft delete a record
   */
  async softDelete(id) {
    const [updated] = await this.query()
      .where(`${this.tableName}.${this.primaryKey}`, id)
      .update({ deleted_at: new Date() })
      .returning('*');

    return !!updated;
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id) {
    const query = this.getConnection()(this.tableName)
      .where(`${this.tableName}.${this.primaryKey}`, id);

    const [updated] = await query
      .update({ deleted_at: null, updated_at: new Date() })
      .returning('*');

    return updated ? this.hideFields(updated) : null;
  }

  /**
   * Check if a record exists
   */
  async exists(conditions) {
    let query = this.query();

    for (const [key, value] of Object.entries(conditions)) {
      query = query.where(`${this.tableName}.${key}`, value);
    }

    const result = await query.first();
    return !!result;
  }

  /**
   * Count records
   */
  async count(conditions = {}) {
    let query = this.query();

    for (const [key, value] of Object.entries(conditions)) {
      query = query.where(`${this.tableName}.${key}`, value);
    }

    const [{ count }] = await query.count(`${this.primaryKey} as count`);
    return parseInt(count);
  }

  /**
   * Prepare data for insert
   */
  prepareForInsert(data) {
    const record = { ...data };

    // Generate UUID if not provided
    if (!record[this.primaryKey]) {
      record[this.primaryKey] = generateUUID();
    }

    // Add timestamps
    if (this.timestamps) {
      const now = new Date();
      record.created_at = record.created_at || now;
      record.updated_at = record.updated_at || now;
    }

    return record;
  }

  /**
   * Prepare data for update
   */
  prepareForUpdate(data) {
    const record = { ...data };

    // Remove immutable fields
    delete record[this.primaryKey];
    delete record.created_at;

    // Update timestamp
    if (this.timestamps) {
      record.updated_at = new Date();
    }

    return record;
  }

  /**
   * Remove hidden fields from record
   */
  hideFields(record) {
    if (!record || this.hidden.length === 0) {
      return record;
    }

    const result = { ...record };
    this.hidden.forEach((field) => delete result[field]);
    return result;
  }

  /**
   * Apply filters to query
   */
  applyFilters(query, filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      // Handle operators
      if (typeof value === 'object' && !Array.isArray(value)) {
        const { op, val } = value;
        switch (op) {
          case 'gt':
            query = query.where(`${this.tableName}.${key}`, '>', val);
            break;
          case 'gte':
            query = query.where(`${this.tableName}.${key}`, '>=', val);
            break;
          case 'lt':
            query = query.where(`${this.tableName}.${key}`, '<', val);
            break;
          case 'lte':
            query = query.where(`${this.tableName}.${key}`, '<=', val);
            break;
          case 'ne':
            query = query.whereNot(`${this.tableName}.${key}`, val);
            break;
          case 'in':
            query = query.whereIn(`${this.tableName}.${key}`, val);
            break;
          case 'nin':
            query = query.whereNotIn(`${this.tableName}.${key}`, val);
            break;
          case 'like':
            query = query.whereILike(`${this.tableName}.${key}`, `%${val}%`);
            break;
          default:
            query = query.where(`${this.tableName}.${key}`, val);
        }
      } else if (Array.isArray(value)) {
        query = query.whereIn(`${this.tableName}.${key}`, value);
      } else {
        query = query.where(`${this.tableName}.${key}`, value);
      }
    }

    return query;
  }
}

export default BaseModel;
