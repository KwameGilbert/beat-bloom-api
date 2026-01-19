import { BeatModelInstance as BeatModel } from '../models/BeatModel.js';
import { GenreModelInstance as GenreModel } from '../models/GenreModel.js';
import { ProducerModelInstance as ProducerModel } from '../models/ProducerModel.js';
import { OrderService } from '../services/OrderService.js';
import { db } from '../config/database.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Page Controller
 * Aggregates data for specific frontend pages to reduce network requests
 */
export const PageController = {
  /**
   * Get all data for the Home/Index page
   */
  getHomePage: asyncHandler(async (req, res) => {
    // 1. Trending Beats
    const trending = await BeatModel.findTrending(12);

    // 2. Genres
    const genres = await GenreModel.findAll({ limit: 12, sortBy: 'name', sortOrder: 'asc' });

    // 3. Featured Producers (Verified ones or top sellers)
    const featuredProducers = await ProducerModel.findAll({
      limit: 6,
      sortBy: 'isVerified',
      sortOrder: 'desc',
    });

    return successResponse(
      res,
      {
        trendingBeats: trending,
        genres: genres.data,
        featuredProducers: featuredProducers.data,
      },
      'Home page data retrieved'
    );
  }),

  /**
   * Get all data for the Beat Detail page
   */
  getBeatDetailPage: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id; // Optional - may be unauthenticated

    // 1. Core Beat Data with Producer basic info
    const beat = await BeatModel.findDetailById(id);

    if (!beat) {
      throw new NotFoundError('Beat not found');
    }

    // 2. Check if beat is exclusively sold - only owner can view
    if (beat.isExclusiveSold) {
      // Check if current user is the exclusive owner
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
        throw new NotFoundError('This beat is has been sold exclusive and no longer available');
      }
    }

    // 3. License Tiers
    const licenseTiers = await db('licenseTiers')
      .where('beatId', id)
      .where('isEnabled', true)
      .orderBy('price', 'asc');

    // 4. Full Producer Profile
    const producer = await ProducerModel.findById(beat.producerId);

    // 5. More from this Producer
    const moreFromProducer = await BeatModel.findAllDetailed({
      filters: { producerId: beat.producerId },
      limit: 6,
    });

    return successResponse(
      res,
      {
        beat: {
          ...beat,
          licenseTiers, // Attach tiers to the beat object for easier frontend consumption
        },
        producer,
        relatedBeats: moreFromProducer.data.filter((b) => b.id.toString() !== id.toString()),
      },
      'Beat detail page data retrieved'
    );
  }),

  /**
   * Get all data for the User Profile page
   */
  getProfilePage: asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Get user with basic info
    const userBase = await db('users').where('id', userId).first();

    if (!userBase) {
      throw new NotFoundError('User not found');
    }

    // 2. Determine profile table based on role
    const profileTables = {
      producer: 'producers',
      artist: 'artists',
      admin: 'admins',
    };

    const profileTable = profileTables[userBase.role] || 'artists';

    // 3. User Info (Join with correct profile table)
    const user = await db('users')
      .leftJoin(profileTable, 'users.id', `${profileTable}.userId`)
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'users.createdAt',
        `${profileTable}.avatar`,
        `${profileTable}.coverImage`,
        `${profileTable}.bio`,
        `${profileTable}.location`,
        `${profileTable}.website`
      )
      .where('users.id', userId)
      .first();

    // Add extra field for producer role
    if (userBase.role === 'producer') {
      const producer = await db('producers').where('userId', userId).select('username').first();
      user.producerUsername = producer?.username;
    }

    // 2. Purchased Beats
    const purchases = await OrderService.getUserPurchases(userId);

    // 3. Liked Beats (Detailed)
    const likes = await db('likes')
      .join('beats', 'likes.beatId', 'beats.id')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .where('likes.userId', userId)
      .select(
        'beats.*',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'producers.avatar as producerAvatar'
      )
      .limit(20)
      .orderBy('likes.createdAt', 'desc');

    // Fetch tiers for liked beats to get min price
    const beatIds = likes.map((b) => b.id);
    if (beatIds.length > 0) {
      const tiers = await db('licenseTiers')
        .whereIn('beatId', beatIds)
        .where('isEnabled', true)
        .orderBy('price', 'asc');

      likes.forEach((beat) => {
        const beatTiers = tiers.filter((t) => t.beatId === beat.id);
        beat.price = beatTiers.length > 0 ? beatTiers[0].price : null;
      });
    }

    // 4. Stats
    const stats = {
      purchasesCount: purchases.length,
      likesCount: likes.length,
    };

    return successResponse(
      res,
      {
        user,
        purchases,
        likes,
        stats,
      },
      'Profile page data retrieved'
    );
  }),
};

export default PageController;
