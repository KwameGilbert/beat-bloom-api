import { BaseModel } from './BaseModel.js';

/**
 * Genre Model
 */
export class GenreModel extends BaseModel {
  constructor() {
    super('genres', {
      searchableFields: ['name', 'slug'],
      sortableFields: ['name', 'sortOrder', 'createdAt'],
    });
  }

  /**
   * Find active genres
   */
  async findActive() {
    return this.query().where('isActive', true).orderBy('sortOrder', 'asc').orderBy('name', 'asc');
  }
}

export const GenreModelInstance = new GenreModel();
export default GenreModelInstance;
