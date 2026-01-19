import { db } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { PlatformSettingsService } from './PlatformSettingsService.js';
import { env } from '../config/env.js';
import emailService from './EmailService.js';

/**
 * Order Service
 */
export const OrderService = {
  /**
   * Create a new order from cart
   */
  async createOrder(userId, data) {
    const { items, paymentMethod, email } = data;

    if (!items || items.length === 0) {
      throw new BadRequestError('Order items are required');
    }

    // Get platform fee settings
    const feeSettings = await PlatformSettingsService.getFeeSettings();
    const platformCommissionRate = feeSettings.platformCommissionRate;

    // Use transaction for consistency
    return db.transaction(async (trx) => {
      // 1. Create Order Header
      const orderNumber = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Calculate subtotal
      let subtotal = 0;
      const preparedItems = [];

      for (const item of items) {
        const beat = await trx('beats').where('id', item.beatId).first();
        const tier = await trx('licenseTiers').where('id', item.licenseTierId).first();

        if (!beat || !tier) {
          throw new NotFoundError(`Beat or license tier not found for ID ${item.beatId}`);
        }

        const price = parseFloat(tier.price);
        subtotal += price;

        const platformFee = (price * platformCommissionRate) / 100;
        const producerEarnings = price - platformFee;

        preparedItems.push({
          beatId: beat.id,
          licenseTierId: tier.id,
          producerId: beat.producerId,
          beatTitle: beat.title,
          licenseName: tier.name,
          price,
          platformFee,
          producerEarnings,
          isExclusive: tier.isExclusive,
        });
      }

      // Calculate final totals
      const processingFee =
        Math.round(
          ((subtotal * feeSettings.processingFeePercentage) / 100 +
            feeSettings.processingFeeFixed) *
            100
        ) / 100;
      const total = Math.round((subtotal + processingFee) * 100) / 100;

      const [order] = await trx('orders')
        .insert({
          userId,
          orderNumber,
          email: email || (await trx('users').where('id', userId).first()).email,
          status: 'pending',
          paymentProvider: paymentMethod,
          paymentReference: data.paymentReference || `REF-${Date.now()}`,
          subtotal,
          processingFee,
          total,
        })
        .returning('*');

      // 2. Process Items
      for (const item of preparedItems) {
        await trx('orderItems').insert({
          ...item,
          orderId: order.id,
        });
      }

      return order;
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
        'beats.slug',
        'beats.coverImage',
        'beats.previewAudioUrl',
        'beats.bpm',
        'beats.musicalKey',
        'producers.displayName as producerName',
        'producers.username as producerUsername',
        'orderItems.price'
      )
      .join('beats', 'userPurchases.beatId', 'beats.id')
      .leftJoin('producers', 'beats.producerId', 'producers.id')
      .leftJoin('orderItems', 'userPurchases.orderItemId', 'orderItems.id')
      .where('userPurchases.userId', userId)
      .orderBy('userPurchases.purchasedAt', 'desc');
  },

  /**
   * Mark an order as paid
   */
  async markOrderAsPaid(paymentReference, paymentData = {}) {
    const order = await db('orders').where('paymentReference', paymentReference).first();

    if (!order) {
      console.warn(`Order not found for reference: ${paymentReference}`);
      return null;
    }

    if (order.status === 'completed') {
      return order;
    }

    return db.transaction(async (trx) => {
      // 1. Update order status
      const [updatedOrder] = await trx('orders')
        .where('id', order.id)
        .update({
          status: 'completed',
          paidAt: new Date(),
          paymentMetadata: JSON.stringify(paymentData),
          updatedAt: new Date(),
        })
        .returning('*');

      // 2. Fulfill the order (Process each item)
      const items = await trx('orderItems').where('orderId', order.id);

      for (const item of items) {
        const tier = await trx('licenseTiers').where('id', item.licenseTierId).first();

        // Create User Purchase Record
        await trx('userPurchases').insert({
          userId: order.userId,
          beatId: item.beatId,
          orderItemId: item.id,
          licenseTierId: item.licenseTierId,
          licenseType: tier?.tierType || 'mp3',
          purchasedAt: new Date(),
        });

        // Record Producer Earnings
        await trx('producerEarnings').insert({
          producerId: item.producerId,
          orderId: order.id,
          orderItemId: item.id,
          beatId: item.beatId,
          grossAmount: item.price,
          platformFee: item.platformFee,
          netAmount: item.producerEarnings,
          status: 'available',
        });

        // If exclusive, mark beat as sold
        if (item.isExclusive) {
          await trx('beats').where('id', item.beatId).update({
            isExclusiveSold: true,
            status: 'sold',
          });
        }
      }

      // 3. Clear user's cart
      await trx('cartItems').where('userId', order.userId).del();

      // 4. Send fulfillment email
      const buyer = await trx('users').where('id', order.userId).first();
      try {
        await emailService.sendPurchaseConfirmation(order.email, buyer?.name || 'Customer', {
          ...updatedOrder,
          items,
        });
      } catch (emailError) {
        console.error('Failed to send fulfillment email:', emailError);
        // Don't fail the transaction if email fails
      }

      return updatedOrder;
    });
  },

  /**
   * Verify a Paystack payment
   */
  async verifyPaystackPayment(reference) {
    const secret = env.PAYSTACK_SECRET_KEY;

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        // Mark as paid in our DB
        await this.markOrderAsPaid(reference, data.data);
        return { verified: true, data: data.data };
      }

      return { verified: false, message: data.message || 'Verification failed' };
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  },
};

export default OrderService;
