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

      // Associate files if provided
      if (data.files && data.files.length > 0) {
        const beatFiles = data.files.map((file) => ({
          beatId: beat.id,
          fileType: file.fileType,
          fileName: file.fileName,
          filePath: file.filePath,
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          storageProvider: file.storageProvider || 'local',
          isPublic: file.fileType === 'preview',
          createdAt: new Date(),
        }));
        await trx('beatFiles').insert(beatFiles);
      }

      return this.getBeat(beat.id);
    });
  },

  /**
   * Get producer catalog beats (with prices, downloads, plays, and revenue)
   */
  async getProducerCatalog(producerId) {
    const beats = await db('beats')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('beats.producerId', producerId)
      .whereNull('beats.deletedAt')
      .select('beats.*', 'genres.name as genreName', 'genres.slug as genreSlug')
      .orderBy('beats.createdAt', 'desc');

    const beatIds = beats.map((b) => b.id);
    let tiersByBeat = {};
    if (beatIds.length > 0) {
      const allTiers = await db('licenseTiers')
        .whereIn('beatId', beatIds)
        .where('isEnabled', true)
        .orderBy('price', 'asc');

      allTiers.forEach((tier) => {
        if (!tiersByBeat[tier.beatId]) {
          tiersByBeat[tier.beatId] = [];
        }
        tiersByBeat[tier.beatId].push(tier);
      });
    }

    const revenueByBeat = {};
    if (beatIds.length > 0) {
      const earnings = await db('producerEarnings')
        .where({ producerId })
        .whereIn('beatId', beatIds)
        .select('beatId')
        .sum('netAmount as net')
        .groupBy('beatId');

      earnings.forEach((e) => {
        revenueByBeat[e.beatId] = parseFloat(e.net || 0);
      });
    }

    const downloadsByBeat = {};
    if (beatIds.length > 0) {
      const downloads = await db('orderItems')
        .where({ producerId })
        .whereIn('beatId', beatIds)
        .select('beatId')
        .sum('downloadCount as count')
        .groupBy('beatId');

      downloads.forEach((d) => {
        downloadsByBeat[d.beatId] = parseInt(d.count || 0);
      });
    }

    return beats.map((b) => {
      const tiers = tiersByBeat[b.id] || [];
      const basePrice = tiers.length > 0 ? parseFloat(tiers[0].price) : 0;
      const exclusiveTier = tiers.find((t) => t.isExclusive);
      const exclusivePrice = exclusiveTier ? parseFloat(exclusiveTier.price) : 0;

      return {
        id: b.id,
        title: b.title,
        genre: b.genreName || 'Trap',
        bpm: b.bpm,
        key: b.musicalKey,
        plays: b.playsCount || 0,
        downloads: downloadsByBeat[b.id] || 0,
        revenue: revenueByBeat[b.id] || 0,
        status: b.status || 'Active',
        coverImage: b.coverImage,
        previewAudioUrl: b.previewAudioUrl,
        basePrice,
        exclusivePrice,
        isExclusiveSold: !!b.isExclusiveSold,
        createdAt: b.createdAt,
      };
    });
  },

  /**
   * Update beat details and its license tiers
   */
  async updateBeat(beatId, producerId, data) {
    const beat = await db('beats').where({ id: beatId, producerId }).first();

    if (!beat) {
      throw new NotFoundError('Beat not found or does not belong to this producer');
    }

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
      status,
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
      const updateData = {};
      if (title !== undefined) {
        updateData.title = title;
        updateData.slug = slugify(title);
      }
      if (description !== undefined) updateData.description = description;
      if (bpm !== undefined) updateData.bpm = bpm;
      if (musicalKey !== undefined) updateData.musicalKey = musicalKey;
      if (duration !== undefined) updateData.duration = duration;
      if (durationSeconds !== undefined) updateData.durationSeconds = durationSeconds;
      if (genreId !== undefined) updateData.genreId = genreId;
      if (coverImage !== undefined) updateData.coverImage = coverImage;
      if (previewAudioUrl !== undefined) updateData.previewAudioUrl = previewAudioUrl;
      if (tags !== undefined) updateData.tags = JSON.stringify(tags);
      if (status !== undefined) updateData.status = status;
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

      updateData.updatedAt = new Date();

      await trx('beats').where({ id: beatId }).update(updateData);

      // Update license tiers if provided
      if (data.licenseTiers) {
        await trx('licenseTiers').where({ beatId }).update({ isEnabled: false });

        for (let idx = 0; idx < data.licenseTiers.length; idx++) {
          const tier = data.licenseTiers[idx];
          const existingTier = await trx('licenseTiers')
            .where({ beatId, tierType: tier.tierType })
            .first();

          if (existingTier) {
            await trx('licenseTiers')
              .where({ id: existingTier.id })
              .update({
                name: tier.name,
                price: tier.price,
                description: tier.description,
                includedFiles: JSON.stringify(tier.includedFiles || []),
                isExclusive: tier.isExclusive || false,
                isEnabled: true,
                sortOrder: idx + 1,
              });
          } else {
            await trx('licenseTiers').insert({
              beatId,
              tierType: tier.tierType,
              name: tier.name,
              price: tier.price,
              description: tier.description,
              includedFiles: JSON.stringify(tier.includedFiles || []),
              isExclusive: tier.isExclusive || false,
              isEnabled: true,
              sortOrder: idx + 1,
            });
          }
        }
      }

      return this.getBeat(beatId);
    });
  },

  /**
   * Delete beat (soft-delete)
   */
  async deleteBeat(beatId, producerId) {
    const beat = await db('beats').where({ id: beatId, producerId }).first();

    if (!beat) {
      throw new NotFoundError('Beat not found or does not belong to this producer');
    }

    const deleted = await db('beats').where({ id: beatId }).update({ deletedAt: new Date() });

    return deleted > 0;
  },
};

export default BeatService;
