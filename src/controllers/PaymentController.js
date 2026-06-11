import crypto from 'crypto';
import { env } from '../config/env.js';
import { OrderService } from '../services/OrderService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Payment Controller
 * Handles Paystack and Hubtel webhooks and manual verification dynamically
 */
export const PaymentController = {
  /**
   * Handle Webhook notifications from Paystack or Hubtel based on env configuration
   * POST /payments/webhook
   */
  webhook: asyncHandler(async (req, res) => {
    const provider = (env.PAYMENT_PROVIDER || 'paystack').toLowerCase();
    console.log(`[PaymentController] Webhook triggered for active provider: ${provider}`);

    if (provider === 'paystack') {
      const secret = env.PAYSTACK_SECRET_KEY;
      if (!secret) {
        throw new Error('Paystack secret key is not configured.');
      }

      // Verify Paystack HMAC signature
      const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
      if (hash !== req.headers['x-paystack-signature']) {
        throw new BadRequestError('Invalid signature');
      }

      const event = req.body;
      if (event.event === 'charge.success') {
        const { reference } = event.data;
        console.log(`[PaymentController] Paystack charge.success for reference: ${reference}`);
        await OrderService.markOrderAsPaid(reference, event.data);
      }
    } else if (provider === 'hubtel') {
      const event = req.body;

      // Hubtel callback uses ResponseCode check
      if (event && event.ResponseCode === '0000' && event.Status === 'Success' && event.Data) {
        const reference = event.Data.ClientReference;

        if (event.Data.Status === 'Success') {
          console.log(`[PaymentController] Hubtel webhook success received for: ${reference}`);

          // Securely check transaction status against Hubtel API to verify authenticity
          await OrderService.verifyPayment(reference);
        }
      }
    } else {
      throw new BadRequestError(`Unsupported payment provider webhook configuration: ${provider}`);
    }

    return successResponse(res, null, 'Webhook processed successfully');
  }),

  /**
   * Verify Payment Reference
   * GET /payments/verify/:reference
   */
  verify: asyncHandler(async (req, res) => {
    const { reference } = req.params;
    const result = await OrderService.verifyPayment(reference);
    return successResponse(res, result, 'Payment verified successfully');
  }),
};

export default PaymentController;
