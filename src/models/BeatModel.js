import { BaseModel } from './BaseModel.js';

/**
 * Beat Model
 */
class BeatModel extends BaseModel {
  constructor() {
    super('beats', {
      searchableFields: ['title', 'description', 'musicalKey'],
      sortableFields: [
        'createdAt',
        'updatedAt',
        'publishedAt',
        'playsCount',
        'likesCount',
        'bpm',
        'title',
      ],
      softDeletes: true,
    });
  }

  /**
   * Find beats with full details (producer, genre)
   */
  async findAllDetailed(options = {}) {
    let query = this.query()
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'genres.name as genreName',
        'genres.slug as genreSlug'
      )
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('beats.status', 'active');

    // Apply filters
    if (options.filters) {
      if (options.filters.genre) {
        query = query.where('genres.slug', options.filters.genre);
        delete options.filters.genre;
      }
      if (options.filters.producer) {
        query = query.where('producers.username', options.filters.producer);
        delete options.filters.producer;
      }

      // Advanced Filters
      if (options.filters.bpmMin) {
        query = query.where('beats.bpm', '>=', options.filters.bpmMin);
        delete options.filters.bpmMin;
      }
      if (options.filters.bpmMax) {
        query = query.where('beats.bpm', '<=', options.filters.bpmMax);
        delete options.filters.bpmMax;
      }
      if (options.filters.musicalKey) {
        query = query.where('beats.musicalKey', options.filters.musicalKey);
        delete options.filters.musicalKey;
      }
      if (options.filters.priceMin || options.filters.priceMax) {
        // Price is in licenseTiers, so we need a subquery or join with filters
        query = query.whereExists(function () {
          this.select('*')
            .from('licenseTiers')
            .whereRaw('licenseTiers.beatId = beats.id')
            .where(function () {
              if (options.filters.priceMin) {
                this.where('licenseTiers.price', '>=', options.filters.priceMin);
              }
              if (options.filters.priceMax) {
                this.where('licenseTiers.price', '<=', options.filters.priceMax);
              }
            });
        });
        delete options.filters.priceMin;
        delete options.filters.priceMax;
      }

      query = this.applyFilters(query, options.filters);
    }

    // Reuse BaseModel's logic for pagination and sorting
    // But since we have a custom query, we do it manually or wrap it
    const limit = parseInt(options.limit) || 20;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('beats.id as count');

    const data = await query
      .orderBy(options.sortBy || 'beats.createdAt', options.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: data.map((record) => this.hideFields(record)),
      pagination: {
        total: parseInt(count),
        page,
        limit,
      },
    };
  }

  /**
   * Find a single beat with detailed info
   */
  async findDetailById(id) {
    return this.query()
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'producers.avatar as producerAvatar',
        'genres.name as genreName'
      )
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('beats.id', id)
      .first();
  }

  /**
   * Increment plays count
   */
  async incrementPlays(id) {
    return this.getConnection()(this.tableName)
      .where(this.primaryKey, id)
      .increment('playsCount', 1);
  }

  /**
   * Find trending beats
   */
  async findTrending(limit = 10) {
    return this.query()
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername'
      )
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .where('beats.status', 'active')
      .orderBy('playsCount', 'desc')
      .limit(limit);
  }
}

export const BeatModelInstance = new BeatModel();
export default BeatModelInstance;
