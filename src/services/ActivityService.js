import { db } from '../config/database.js';
import { BeatModelInstance as BeatModel } from '../models/BeatModel.js';

/**
 * Activity Service - Handles Likes, Play History, and Follows
 */
export const ActivityService = {
  /**
   * Like or unlike a beat
   */
  async toggleLike(userId, beatId) {
    const existing = await db('likes').where({ userId, beatId }).first();

    if (existing) {
      await db('likes').where({ userId, beatId }).del();
      await db('beats').where('id', beatId).decrement('likesCount', 1);
      return { liked: false };
    } else {
      await db('likes').insert({ userId, beatId });
      await db('beats').where('id', beatId).increment('likesCount', 1);
      return { liked: true };
    }
  },

  /**
   * Get user's liked beats
   */
  async getLikedBeats(userId, options = {}) {
    const query = db('beats')
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'genres.name as genreName'
      )
      .join('likes', 'beats.id', 'likes.beatId')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('likes.userId', userId)
      .orderBy('likes.createdAt', 'desc');

    const limit = parseInt(options.limit) || 20;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    const countQuery = query.clone().clearSelect().clearOrder();
    const countResult = await countQuery.count('beats.id as count').first();
    const total = parseInt(countResult.count);

    const data = await query.limit(limit).offset(offset);

    return {
      data,
      pagination: { total, page, limit },
    };
  },

  /**
   * Record a play in history
   */
  async recordPlay(userId, beatId, details = {}) {
    const entry = {
      beatId,
      playDurationSeconds: details.duration || 0,
      playedAt: new Date(),
      sessionId: details.sessionId || null,
    };

    // Only include userId if it exists (authenticated user)
    if (userId) {
      entry.userId = userId;
    }

    await db('playHistory').insert(entry);
    await BeatModel.incrementPlays(beatId);

    return entry;
  },

  /**
   * Get user's play history
   */
  async getPlayHistory(userId, options = {}) {
    const query = db('playHistory')
      .select(
        'playHistory.*',
        'beats.title as beatTitle',
        'beats.coverImage',
        'producers.displayName as producerName',
        'producers.username as producerUsername'
      )
      .join('beats', 'playHistory.beatId', 'beats.id')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .where('playHistory.userId', userId)
      .orderBy('playHistory.playedAt', 'desc');

    const limit = parseInt(options.limit) || 20;
    const page = parseInt(options.page) || 1;
    const offset = (page - 1) * limit;

    const countQuery = query.clone().clearSelect().clearOrder();
    const countResult = await countQuery.count('playHistory.id as count').first();
    const total = parseInt(countResult.count);

    const data = await query.limit(limit).offset(offset);

    return {
      data,
      pagination: { total, page, limit },
    };
  },
};

export default ActivityService;
