import { BaseModel } from './BaseModel.js';
import { db } from '../config/database.js';

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
   * Find active genres with beat count
   */
  async findActive() {
    const genres = await this.query()
      .where('isActive', true)
      .orderBy('sortOrder', 'asc')
      .orderBy('name', 'asc');

    // Get beat counts for all genres
    const counts = await db('beats')
      .select('genreId')
      .count('id as beatCount')
      .where('status', 'active')
      .whereNull('deletedAt')
      .whereNotNull('genreId')
      .groupBy('genreId');

    // Create a map of genreId -> count
    const countMap = {};
    counts.forEach((row) => {
      countMap[row.genreId] = parseInt(row.beatCount) || 0;
    });

    // Attach counts to genres
    return genres.map((genre) => ({
      ...genre,
      beatCount: countMap[genre.id] || 0,
    }));
  }
}

export const GenreModelInstance = new GenreModel();
export default GenreModelInstance;
