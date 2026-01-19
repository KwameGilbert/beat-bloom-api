import { db } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Cart Service - Server-side cart management
 */
export const CartService = {
  /**
   * Get user's cart items
   */
  async getCart(userId, sessionId = null) {
    const query = db('cartItems')
      .select(
        'cartItems.*',
        'beats.id as beatId',
        'beats.title',
        'beats.coverImage',
        'beats.duration',
        'beats.bpm',
        'beats.musicalKey',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'genres.name as genreName',
        'licenseTiers.name as tierName',
        'licenseTiers.price',
        'licenseTiers.tierType',
        'licenseTiers.includedFiles'
      )
      .join('beats', 'cartItems.beatId', 'beats.id')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .leftJoin('licenseTiers', 'cartItems.licenseTierId', 'licenseTiers.id');

    if (userId) {
      query.where('cartItems.userId', userId);
    } else if (sessionId) {
      query.where('cartItems.sessionId', sessionId);
    } else {
      return [];
    }

    const items = await query.orderBy('cartItems.createdAt', 'desc');

    // Calculate total
    const total = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

    return {
      items,
      total,
      count: items.length,
    };
  },

  /**
   * Add item to cart
   */
  async addToCart(userId, sessionId, beatId, licenseTierId = null) {
    // Check if beat exists
    const beat = await db('beats').where('id', beatId).first();
    if (!beat) {
      throw new NotFoundError('Beat not found');
    }

    // If no tier specified, get the cheapest tier for this beat
    if (!licenseTierId) {
      const cheapestTier = await db('licenseTiers')
        .where('beatId', beatId)
        .where('isEnabled', true)
        .orderBy('price', 'asc')
        .first();

      if (cheapestTier) {
        licenseTierId = cheapestTier.id;
      }
    }

    // Check if already in cart
    const existing = await db('cartItems')
      .where((builder) => {
        if (userId) {
          builder.where('userId', userId);
        } else {
          builder.where('sessionId', sessionId);
        }
      })
      .where('beatId', beatId)
      .first();

    if (existing) {
      // Update license tier if different
      if (licenseTierId && existing.licenseTierId !== licenseTierId) {
        await db('cartItems').where('id', existing.id).update({
          licenseTierId,
          updatedAt: new Date(),
        });
      }
      return this.getCart(userId, sessionId);
    }

    // Insert new cart item
    await db('cartItems').insert({
      userId: userId || null,
      sessionId: userId ? null : sessionId,
      beatId,
      licenseTierId,
    });

    return this.getCart(userId, sessionId);
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, sessionId, beatId) {
    const query = db('cartItems').where('beatId', beatId);

    if (userId) {
      query.where('userId', userId);
    } else if (sessionId) {
      query.where('sessionId', sessionId);
    }

    await query.del();

    return this.getCart(userId, sessionId);
  },

  /**
   * Clear cart
   */
  async clearCart(userId, sessionId) {
    const query = db('cartItems');

    if (userId) {
      query.where('userId', userId);
    } else if (sessionId) {
      query.where('sessionId', sessionId);
    }

    await query.del();

    return { items: [], total: 0, count: 0 };
  },

  /**
   * Merge guest cart into user cart (after login)
   */
  async mergeCart(userId, sessionId) {
    if (!sessionId) {
      return;
    }

    // Get guest cart items
    const guestItems = await db('cartItems').where('sessionId', sessionId);

    for (const item of guestItems) {
      // Check if user already has this beat in cart
      const existing = await db('cartItems')
        .where('userId', userId)
        .where('beatId', item.beatId)
        .first();

      if (!existing) {
        // Move item to user cart
        await db('cartItems').where('id', item.id).update({
          userId,
          sessionId: null,
          updatedAt: new Date(),
        });
      } else {
        // Delete duplicate guest item
        await db('cartItems').where('id', item.id).del();
      }
    }

    return this.getCart(userId, null);
  },

  /**
   * Update license tier for cart item
   */
  async updateCartItemTier(userId, sessionId, beatId, licenseTierId) {
    const query = db('cartItems').where('beatId', beatId);

    if (userId) {
      query.where('userId', userId);
    } else if (sessionId) {
      query.where('sessionId', sessionId);
    }

    await query.update({
      licenseTierId,
      updatedAt: new Date(),
    });

    return this.getCart(userId, sessionId);
  },
};

export default CartService;
