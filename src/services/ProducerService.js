import { db } from '../config/database.js';

/**
 * Helper to format relative time for transaction list
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHrs = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHrs / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Producer Service - Handles producer specific logic like earnings and payouts
 */
export const ProducerService = {
  /**
   * Get producer dashboard stats (aggregations)
   */
  async getDashboardStats(producerId) {
    const earnings = await db('producerEarnings')
      .where('producerId', producerId)
      .sum('grossAmount as gross')
      .sum('netAmount as net')
      .first();

    const pending = await db('producerEarnings')
      .where({ producerId, status: 'pending' })
      .sum('netAmount as amount')
      .first();

    const available = await db('producerEarnings')
      .where({ producerId, status: 'available' })
      .sum('netAmount as amount')
      .first();

    const totalSales = await db('orderItems')
      .where('producerId', producerId)
      .count('id as count')
      .first();

    const totalPlaysResult = await db('beats')
      .where('producerId', producerId)
      .whereNull('deletedAt')
      .sum('playsCount as total')
      .first();

    return {
      totalGross: parseFloat(earnings?.gross || 0),
      totalNet: parseFloat(earnings?.net || 0),
      pendingBalance: parseFloat(pending?.amount || 0),
      availableBalance: parseFloat(available?.amount || 0),
      totalSales: parseInt(totalSales?.count || 0),
      totalPlays: parseInt(totalPlaysResult?.total || 0),
    };
  },

  /**
   * Get complete dashboard overview dataset
   */
  async getDashboardOverview(producerId) {
    const stats = await this.getDashboardStats(producerId);

    // Fetch recent sales (limit 5)
    const recentSales = await db('orderItems')
      .join('orders', 'orderItems.orderId', 'orders.id')
      .leftJoin('users', 'orders.userId', 'users.id')
      .where('orderItems.producerId', producerId)
      .where('orders.status', 'completed')
      .select(
        'orderItems.id',
        'orders.orderNumber',
        'orders.createdAt as date',
        'orderItems.beatTitle',
        'orders.email as buyerEmail',
        'users.name as buyerName',
        'orderItems.licenseName as licenseType',
        'orderItems.price as gross',
        'orderItems.producerEarnings as net'
      )
      .orderBy('orders.createdAt', 'desc')
      .limit(5);

    // Fetch top performing beats (limit 5)
    const topBeatsRaw = await db('orderItems')
      .join('beats', 'orderItems.beatId', 'beats.id')
      .leftJoin('genres', 'beats.genreId', 'genres.id')
      .where('orderItems.producerId', producerId)
      .select(
        'beats.id',
        'beats.title',
        'beats.coverImage as cover',
        'beats.bpm',
        'beats.musicalKey as key',
        'beats.playsCount as plays',
        'genres.name as genre'
      )
      .sum('orderItems.price as revenue')
      .count('orderItems.id as sales')
      .groupBy(
        'beats.id',
        'beats.title',
        'beats.coverImage',
        'beats.bpm',
        'beats.musicalKey',
        'beats.playsCount',
        'genres.name'
      )
      .orderBy('revenue', 'desc')
      .limit(5);

    const topBeats = topBeatsRaw.map((b) => ({
      id: b.id,
      title: b.title,
      genre: b.genre || 'Trap',
      bpm: b.bpm,
      key: b.key,
      plays: b.plays,
      sales: parseInt(b.sales || 0),
      revenue: parseFloat(b.revenue || 0),
      cover: b.cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=80',
      trend: `+${parseInt(b.sales || 0)}`,
    }));

    // If top beats list is empty/short, backfill with general producer beats
    if (topBeats.length < 3) {
      const myBeats = await db('beats')
        .leftJoin('genres', 'beats.genreId', 'genres.id')
        .where('beats.producerId', producerId)
        .whereNull('beats.deletedAt')
        .select(
          'beats.id',
          'beats.title',
          'beats.coverImage as cover',
          'beats.bpm',
          'beats.musicalKey as key',
          'beats.playsCount as plays',
          'genres.name as genre'
        )
        .limit(3 - topBeats.length);

      myBeats.forEach((b) => {
        if (!topBeats.some((tb) => tb.id === b.id)) {
          topBeats.push({
            id: b.id,
            title: b.title,
            genre: b.genre || 'Trap',
            bpm: b.bpm,
            key: b.key,
            plays: b.plays || 0,
            sales: 0,
            revenue: 0,
            cover: b.cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=80',
            trend: '+0%',
          });
        }
      });
    }

    // Chart Data points for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEarnings = await db('producerEarnings')
      .where('producerId', producerId)
      .where('createdAt', '>=', thirtyDaysAgo)
      .select('createdAt', 'netAmount');

    const dailyPlays = await db('playHistory')
      .join('beats', 'playHistory.beatId', 'beats.id')
      .where('beats.producerId', producerId)
      .where('playHistory.playedAt', '>=', thirtyDaysAgo)
      .select('playHistory.playedAt');

    const chartPointsRevenue = [];
    const chartPointsPlays = [];

    const formatDateLabel = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const revenueMap = {};
    const playsMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = formatDateLabel(d);
      revenueMap[label] = 0;
      playsMap[label] = 0;
    }

    dailyEarnings.forEach((e) => {
      const label = formatDateLabel(new Date(e.createdAt));
      if (revenueMap[label] !== undefined) {
        revenueMap[label] += parseFloat(e.netAmount || 0);
      }
    });

    dailyPlays.forEach((p) => {
      const label = formatDateLabel(new Date(p.playedAt));
      if (playsMap[label] !== undefined) {
        playsMap[label] += 1;
      }
    });

    Object.entries(revenueMap).forEach(([label, value]) => {
      chartPointsRevenue.push({ label, value: parseFloat(parseFloat(value).toFixed(2)) });
    });

    Object.entries(playsMap).forEach(([label, value]) => {
      chartPointsPlays.push({ label, value });
    });

    // Active listeners count (unique userIds/sessionIds)
    const activeListenersResult = await db('playHistory')
      .join('beats', 'playHistory.beatId', 'beats.id')
      .where('beats.producerId', producerId)
      .where('playHistory.playedAt', '>=', thirtyDaysAgo)
      .countDistinct('playHistory.userId as userCount')
      .countDistinct('playHistory.sessionId as sessionCount')
      .first();

    const activeListeners =
      parseInt(activeListenersResult?.userCount || 0) +
      parseInt(activeListenersResult?.sessionCount || 0);

    return {
      stats: {
        ...stats,
        activeListeners: activeListeners || 0,
      },
      recentSales: recentSales.map((s) => ({
        ...s,
        gross: parseFloat(s.gross || 0),
        net: parseFloat(s.net || 0),
        time: formatRelativeTime(new Date(s.date)),
      })),
      topBeats,
      chartPointsRevenue,
      chartPointsPlays,
    };
  },

  /**
   * Get payout methods
   */
  async getPayoutMethods(producerId) {
    return db('payoutMethods').where('producerId', producerId).orderBy('isDefault', 'desc');
  },

  /**
   * Add payout method (fields saved into details JSONB)
   */
  async addPayoutMethod(producerId, data) {
    // If setting as default, unset others
    if (data.isDefault) {
      await db('payoutMethods').where('producerId', producerId).update({ isDefault: false });
    }

    const details = data.details || {};
    const keysToMap = [
      'email',
      'phone',
      'operator',
      'bankName',
      'accountNumber',
      'routingNumber',
      'accountIdentifier',
      'holderName',
      'paypalEmail',
    ];
    keysToMap.forEach((k) => {
      if (data[k] !== undefined) {
        details[k] = data[k];
      }
    });

    const [method] = await db('payoutMethods')
      .insert({
        producerId,
        type: data.type,
        details: JSON.stringify(details),
        currency: data.currency || 'USD',
        country: data.country || null,
        isDefault: data.isDefault || false,
        isVerified: data.isVerified || false,
      })
      .returning('*');

    return method;
  },

  /**
   * Delete payout method
   */
  async deletePayoutMethod(producerId, methodId) {
    const deleted = await db('payoutMethods').where({ id: methodId, producerId }).del();
    return deleted > 0;
  },

  /**
   * Get payout transaction history
   */
  async getPayoutHistory(producerId) {
    return db('payouts')
      .leftJoin('payoutMethods', 'payouts.payoutMethodId', 'payoutMethods.id')
      .where('payouts.producerId', producerId)
      .select(
        'payouts.*',
        'payoutMethods.type as methodType',
        'payoutMethods.details as methodDetails'
      )
      .orderBy('payouts.requestedAt', 'desc');
  },

  /**
   * Initiate manual payout request
   */
  async requestPayout(producerId, data) {
    const { payoutMethodId, amount } = data;
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      throw new Error('Invalid payout amount');
    }

    // 1. Verify available balance
    const availableResult = await db('producerEarnings')
      .where({ producerId, status: 'available' })
      .sum('netAmount as amount')
      .first();
    const availableBalance = parseFloat(availableResult?.amount || 0);

    if (availableBalance < withdrawAmount) {
      throw new Error('Insufficient available balance');
    }

    // 2. Fetch minimum payout settings
    const minPayoutSetting = await db('platformSettings').where('key', 'minimumPayoutAmount').first();
    const minPayout = parseFloat(minPayoutSetting?.value || 50);

    if (withdrawAmount < minPayout) {
      throw new Error(`Minimum payout amount is $${minPayout}`);
    }

    // 3. Verify payout method belongs to producer
    const payoutMethod = await db('payoutMethods')
      .where({ id: payoutMethodId, producerId })
      .first();

    if (!payoutMethod) {
      throw new Error('Payout method not found or does not belong to this producer');
    }

    // Generate payout number: BB-PO-YYYY-RANDOM
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const payoutNumber = `BB-PO-${year}-${random}`;

    return db.transaction(async (trx) => {
      // 4. Insert payout record
      const [payout] = await trx('payouts')
        .insert({
          producerId,
          payoutMethodId,
          payoutNumber,
          amount: withdrawAmount,
          currency: 'USD',
          status: 'pending',
          processingFee: 0,
          netAmount: withdrawAmount,
          requestedAt: new Date(),
        })
        .returning('*');

      // 5. Update producer earnings status to processing and associate with payoutId
      const earningsToPay = await trx('producerEarnings')
        .where({ producerId, status: 'available' })
        .orderBy('createdAt', 'asc');

      let accumulated = 0;
      const earningsIdsToUpdate = [];

      for (const e of earningsToPay) {
        if (accumulated >= withdrawAmount) break;
        earningsIdsToUpdate.push(e.id);
        accumulated += parseFloat(e.netAmount);
      }

      if (earningsIdsToUpdate.length > 0) {
        await trx('producerEarnings')
          .whereIn('id', earningsIdsToUpdate)
          .update({
            status: 'processing',
            payoutId: payout.id,
          });
      }

      return payout;
    });
  },

  /**
   * Get detailed sales item list (Sales page ledger)
   */
  async getSalesList(producerId, options = {}) {
    let query = db('orderItems')
      .join('orders', 'orderItems.orderId', 'orders.id')
      .leftJoin('users', 'orders.userId', 'users.id')
      .where('orderItems.producerId', producerId)
      .where('orders.status', 'completed');

    if (options.search) {
      const search = `%${options.search}%`;
      query = query.where(function () {
        this.where('orderItems.beatTitle', 'ilike', search)
          .orWhere('orders.email', 'ilike', search)
          .orWhere('users.name', 'ilike', search)
          .orWhere('orders.orderNumber', 'ilike', search);
      });
    }

    const data = await query
      .select(
        'orderItems.id',
        'orders.orderNumber',
        'orders.createdAt as date',
        'orderItems.beatTitle',
        'orders.email as buyerEmail',
        'users.name as buyerName',
        'orderItems.licenseName as licenseType',
        'orderItems.price as gross',
        'orderItems.producerEarnings as net'
      )
      .orderBy('orders.createdAt', 'desc');

    return data.map((s) => ({
      ...s,
      gross: parseFloat(s.gross || 0),
      net: parseFloat(s.net || 0),
    }));
  },
};

export default ProducerService;

