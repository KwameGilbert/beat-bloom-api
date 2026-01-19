import { db } from '../config/database.js';

/**
 * Producer Service - Handles producer specific logic like earnings and payouts
 */
export const ProducerService = {
  /**
   * Get producer dashboard stats
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

    return {
      totalGross: parseFloat(earnings.gross || 0),
      totalNet: parseFloat(earnings.net || 0),
      pendingBalance: parseFloat(pending.amount || 0),
      availableBalance: parseFloat(available.amount || 0),
      totalSales: parseInt(totalSales.count || 0),
    };
  },

  /**
   * Get payout methods
   */
  async getPayoutMethods(producerId) {
    return db('payoutMethods').where('producerId', producerId).orderBy('isDefault', 'desc');
  },

  /**
   * Add payout method
   */
  async addPayoutMethod(producerId, data) {
    // If setting as default, unset others
    if (data.isDefault) {
      await db('payoutMethods').where('producerId', producerId).update({ isDefault: false });
    }

    const [method] = await db('payoutMethods')
      .insert({
        producerId,
        type: data.type,
        accountIdentifier: data.accountIdentifier,
        accountDetails: JSON.stringify(data.accountDetails || {}),
        isDefault: data.isDefault || false,
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
};

export default ProducerService;
