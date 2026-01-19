import { BeatModelInstance as BeatModel } from '../models/BeatModel.js';
import { ProducerModelInstance as ProducerModel } from '../models/ProducerModel.js';
import { db } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Beat Service
 */
export const BeatService = {
  /**
   * List beats with filtering
   */
  async listBeats(options = {}) {
    return BeatModel.findAllDetailed(options);
  },

  /**
   * Get beat detail by ID
   * @param {number|string} id - Beat ID
   * @param {number|null} userId - Optional user ID to check exclusive ownership
   */
  async getBeat(id, userId = null) {
    const beat = await BeatModel.findDetailById(id);
    if (!beat) {
      throw new NotFoundError('Beat not found');
    }

    // Check if beat is exclusively sold - only owner can view
    if (beat.isExclusiveSold) {
      let isExclusiveOwner = false;

      if (userId) {
        const exclusivePurchase = await db('userPurchases')
          .join('licenseTiers', 'userPurchases.licenseTierId', 'licenseTiers.id')
          .where('userPurchases.userId', userId)
          .where('userPurchases.beatId', id)
          .where('licenseTiers.isExclusive', true)
          .first();

        isExclusiveOwner = !!exclusivePurchase;
      }

      if (!isExclusiveOwner) {
        throw new NotFoundError('This beat is no longer available');
      }
    }

    // Fetch license tiers for this beat
    const tiers = await db('licenseTiers')
      .where('beatId', id)
      .where('isEnabled', true)
      .orderBy('sortOrder', 'asc');

    return {
      ...beat,
      licenseTiers: tiers,
    };
  },

  /**
   * Get trending beats
   */
  async getTrending(limit = 10) {
    return BeatModel.findTrending(limit);
  },

  /**
   * Increment plays
   */
  async recordPlay(id) {
    return BeatModel.incrementPlays(id);
  },

  /**
   * Get beats by producer
   */
  async getProducerBeats(producerUsername, options = {}) {
    const producer = await ProducerModel.findByUsername(producerUsername);
    if (!producer) {
      throw new NotFoundError('Producer not found');
    }

    return BeatModel.findAllDetailed({
      ...options,
      filters: {
        ...options.filters,
        producerId: producer.id,
      },
    });
  },

  /**
   * Create a new beat
   */
  async createBeat(producerId, data) {
    const {
      title,
      description,
      bpm,
      musicalKey,
      duration,
      durationSeconds,
      genreId,
      coverImage,
      previewAudioUrl,
      tags,
      isFeatured,
    } = data;

    const slugify = (str) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    return db.transaction(async (trx) => {
      const [beat] = await trx('beats')
        .insert({
          producerId,
          genreId,
          title,
          slug: slugify(title),
          description,
          bpm,
          musicalKey,
          duration,
          durationSeconds,
          coverImage,
          previewAudioUrl,
          tags: JSON.stringify(tags || []),
          status: 'active',
          isFeatured: isFeatured || false,
          publishedAt: new Date(),
        })
        .returning('*');

      // Create internal default tiers if provided
      if (data.licenseTiers) {
        const tiers = data.licenseTiers.map((tier, idx) => ({
          beatId: beat.id,
          tierType: tier.tierType,
          name: tier.name,
          price: tier.price,
          description: tier.description,
          includedFiles: JSON.stringify(tier.includedFiles || []),
          isExclusive: tier.isExclusive || false,
          isEnabled: true,
          sortOrder: idx + 1,
        }));
        await trx('licenseTiers').insert(tiers);
      }

      return this.getBeat(beat.id);
    });
  },
};

export default BeatService;
