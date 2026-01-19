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
    // Base query for filtering
    const baseFilters = (query) => {
      query = query
        .where('beats.deletedAt', null)
        .where('beats.status', 'active')
        .where('beats.isExclusiveSold', false);

      // Apply filters
      if (options.filters) {
        if (options.filters.genre) {
          query = query.where('genres.slug', options.filters.genre);
        }
        if (options.filters.producer) {
          query = query.where('producers.username', options.filters.producer);
        }
        if (options.filters.producerId) {
          query = query.where('beats.producerId', options.filters.producerId);
        }

        // Advanced Filters
        if (options.filters.bpmMin) {
          query = query.where('beats.bpm', '>=', options.filters.bpmMin);
        }
        if (options.filters.bpmMax) {
          query = query.where('beats.bpm', '<=', options.filters.bpmMax);
        }
        if (options.filters.musicalKey) {
          query = query.where('beats.musicalKey', options.filters.musicalKey);
        }
        if (options.filters.priceMin || options.filters.priceMax) {
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
        }

        // Search
        if (options.filters.search) {
          const search = `%${options.filters.search}%`;
          query = query.where(function () {
            this.where('beats.title', 'ilike', search)
              .orWhere('beats.description', 'ilike', search)
              .orWhere('producers.displayName', 'ilike', search);
          });
        }
      }

      return query;
    };

    // Count query - simple, no unnecessary selects
    let countQuery = this.getConnection()('beats')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id');
    countQuery = baseFilters(countQuery);
    const [{ count }] = await countQuery.count('beats.id as count');

    // Data query with full selects
    let dataQuery = this.getConnection()('beats')
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'producers.avatar as producerAvatar',
        'producers.bio as producerBio',
        'producers.location as producerLocation',
        'producers.isVerified as producerIsVerified',
        'genres.name as genreName',
        'genres.slug as genreSlug'
      )
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id');
    dataQuery = baseFilters(dataQuery);

    const limit = parseInt(options.limit) || 20;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    const data = await dataQuery
      .orderBy(options.sortBy || 'beats.createdAt', options.sortOrder || 'desc')
      .limit(limit)
      .offset(offset);

    // Fetch license tiers for all beats and attach min price
    const beatIds = data.map((b) => b.id);
    if (beatIds.length > 0) {
      const allTiers = await this.getConnection()('licenseTiers')
        .whereIn('beatId', beatIds)
        .where('isEnabled', true)
        .orderBy('price', 'asc');

      // Group tiers by beatId and get min price
      const tiersByBeat = {};
      allTiers.forEach((tier) => {
        if (!tiersByBeat[tier.beatId]) {
          tiersByBeat[tier.beatId] = [];
        }
        tiersByBeat[tier.beatId].push(tier);
      });

      // Attach to beats
      data.forEach((beat) => {
        const tiers = tiersByBeat[beat.id] || [];
        beat.licenseTiers = tiers;
        beat.price = tiers.length > 0 ? tiers[0].price : null;
      });
    }

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
        'producers.bio as producerBio',
        'producers.location as producerLocation',
        'producers.isVerified as producerIsVerified',
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
    const data = await this.query()
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'producers.avatar as producerAvatar',
        'producers.bio as producerBio',
        'producers.location as producerLocation',
        'producers.isVerified as producerIsVerified',
        'genres.name as genreName'
      )
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('beats.status', 'active')
      .where('beats.isExclusiveSold', false)
      .whereNull('beats.deletedAt')
      .orderBy('playsCount', 'desc')
      .limit(limit);

    // Fetch license tiers for all beats and attach min price
    const beatIds = data.map((b) => b.id);
    if (beatIds.length > 0) {
      const allTiers = await this.getConnection()('licenseTiers')
        .whereIn('beatId', beatIds)
        .where('isEnabled', true)
        .orderBy('price', 'asc');

      // Group tiers by beatId and get min price
      const tiersByBeat = {};
      allTiers.forEach((tier) => {
        if (!tiersByBeat[tier.beatId]) {
          tiersByBeat[tier.beatId] = [];
        }
        tiersByBeat[tier.beatId].push(tier);
      });

      // Attach to beats
      data.forEach((beat) => {
        const tiers = tiersByBeat[beat.id] || [];
        beat.licenseTiers = tiers;
        beat.price = tiers.length > 0 ? tiers[0].price : null;
      });
    }

    return data;
  }
}

export const BeatModelInstance = new BeatModel();
export default BeatModelInstance;
