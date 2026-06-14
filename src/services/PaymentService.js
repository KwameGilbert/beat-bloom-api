import { env } from '../config/env.js';
import { HubtelService } from './HubtelService.js';
import { PaystackService } from './PaystackService.js';

/**
 * Payment Service
 * Serves as an abstraction layer to swap between Paystack and Hubtel at runtime
 */
export const PaymentService = {
  /**
   * Get the active payment provider configured in environment variables
   */
  getProvider() {
    return (env.PAYMENT_PROVIDER || 'paystack').toLowerCase();
  },

  /**
   * Initiate checkout payment details for the active provider
   */
  async initiatePayment(params) {
    const provider = this.getProvider();
    console.log(`[PaymentService] Initiating payment for provider: ${provider}`);
    
    if (provider === 'hubtel') {
      return HubtelService.initiatePayment(params);
    } else {
      return PaystackService.initiatePayment(params);
    }
  },

  /**
   * Verify transaction status with the active provider
   */
  async verifyPayment(reference) {
    const provider = this.getProvider();
    console.log(`[PaymentService] Verifying payment reference: ${reference} with provider: ${provider}`);

    if (provider === 'hubtel') {
      return HubtelService.checkTransactionStatus(reference);
    } else {
      return PaystackService.verifyPayment(reference);
    }
  }
};

export default PaymentService;
