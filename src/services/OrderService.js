import { db } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

/**
 * Order Service
 */
export const OrderService = {
  /**
   * Create a new order from cart
   */
  async createOrder(userId, data) {
    const { items, paymentMethod, paymentReference, email } = data;

    if (!items || items.length === 0) {
      throw new BadRequestError('Order items are required');
    }

    // Calculate totals
    let subtotal = 0;

    // Use transaction for consistency
    return db.transaction(async (trx) => {
      // 1. Create Order Header
      const orderNumber = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const [order] = await trx('orders')
        .insert({
          userId,
          orderNumber,
          email: email || (await trx('users').where('id', userId).first()).email,
          status: 'completed', // For now, assume successful
          paymentProvider: paymentMethod,
          paymentReference: paymentReference || `REF-${Date.now()}`,
          subtotal: 0, // Update later
          total: 0,
          paidAt: new Date(),
        })
        .returning('*');

      // 2. Process Items
      for (const item of items) {
        const beat = await trx('beats').where('id', item.beatId).first();
        const tier = await trx('licenseTiers').where('id', item.licenseTierId).first();

        if (!beat || !tier) {
          throw new NotFoundError(`Beat or license tier not found for ID ${item.beatId}`);
        }

        const price = parseFloat(tier.price);
        subtotal += price;

        // Calculate commission
        const producer = await trx('producers').where('id', beat.producerId).first();
        const commissionRate = producer.commissionRate || 15; // default 15%
        const platformFee = (price * commissionRate) / 100;
        const producerEarnings = price - platformFee;

        const [orderItem] = await trx('orderItems')
          .insert({
            orderId: order.id,
            beatId: beat.id,
            licenseTierId: tier.id,
            producerId: beat.producerId,
            beatTitle: beat.title,
            licenseName: tier.name,
            price,
            platformFee,
            producerEarnings,
            isExclusive: tier.isExclusive,
          })
          .returning('*');

        // 3. Create User Purchase Record
        await trx('userPurchases').insert({
          userId,
          beatId: beat.id,
          orderItemId: orderItem.id,
          licenseTierId: tier.id,
          licenseType: tier.tierType,
          purchasedAt: new Date(),
        });

        // 4. Record Producer Earnings
        await trx('producerEarnings').insert({
          producerId: beat.producerId,
          orderId: order.id,
          orderItemId: orderItem.id,
          beatId: beat.id,
          grossAmount: price,
          platformFee,
          netAmount: producerEarnings,
          status: 'available',
        });

        // 5. If exclusive, mark beat as sold
        if (tier.isExclusive) {
          await trx('beats').where('id', beat.id).update({
            isExclusiveSold: true,
            status: 'sold',
          });
        }
      }

      // Update order totals
      const [finalOrder] = await trx('orders')
        .where('id', order.id)
        .update({
          subtotal,
          total: subtotal,
        })
        .returning('*');

      return finalOrder;
    });
  },

  /**
   * Get user's order history
   */
  async getUserOrders(userId) {
    return db('orders').where('userId', userId).orderBy('createdAt', 'desc');
  },

  /**
   * Get order details
   */
  async getOrderDetail(orderId, userId) {
    const order = await db('orders').where({ id: orderId, userId }).first();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const items = await db('orderItems')
      .select('orderItems.*', 'beats.coverImage', 'producers.displayName as producerName')
      .leftJoin('beats', 'orderItems.beatId', 'beats.id')
      .leftJoin('producers', 'orderItems.producerId', 'producers.id')
      .where('orderId', orderId);

    return { ...order, items };
  },

  /**
   * Get user's purchased beats
   */
  async getUserPurchases(userId) {
    return db('userPurchases')
      .select(
        'userPurchases.*',
        'beats.title',
        'beats.coverImage',
        'beats.previewAudioUrl',
        'producers.displayName as producerName',
        'producers.username as producerUsername'
      )
      .join('beats', 'userPurchases.beatId', 'beats.id')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .where('userPurchases.userId', userId)
      .orderBy('userPurchases.purchasedAt', 'desc');
  },
};

export default OrderService;
