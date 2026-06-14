import { env } from '../config/env.js';

/**
 * Paystack Service
 * Handles interactions with Paystack payment gateway API
 */
export const PaystackService = {
  /**
   * Initiate a Paystack transaction
   * Note: Paystack Checkout is initiated on the client-side.
   * This backend method only acts as a pass-through to return the order reference.
   */
  async initiatePayment(params) {
    const { clientReference } = params;
    return {
      status: 'Success',
      responseCode: '0000',
      data: {
        checkoutUrl: null, // Instructs frontend to open inline Paystack modal
        clientReference
      }
    };
  },

  /**
   * Verify a Paystack payment reference using the Paystack Verification API
   */
  async verifyPayment(reference) {
    const secret = env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error('Paystack secret key (PAYSTACK_SECRET_KEY) is not configured.');
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status && data.data.status === 'success') {
        return { verified: true, data: data.data };
      }

      return { verified: false, message: data.message || 'Verification failed' };
    } catch (error) {
      console.error('Paystack verification API error:', error);
      throw error;
    }
  }
};

export default PaystackService;
