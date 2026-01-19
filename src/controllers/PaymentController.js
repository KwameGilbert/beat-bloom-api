import crypto from 'crypto';
import { env } from '../config/env.js';
import { OrderService } from '../services/OrderService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Payment Controller
 * Handles Paystack webhooks and payment verification
 */
export const PaymentController = {
  /**
   * Handle Paystack Webhook
   * POST /payments/webhook/paystack
   */
  webhook: asyncHandler(async (req, res) => {
    const secret = env.PAYSTACK_SECRET_KEY;

    // Verify signature
    const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      throw new BadRequestError('Invalid signature');
    }

    const event = req.body;

    // Process event
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      console.log(`Payment successful for reference: ${reference}`);

      // Mark order as paid in database
      await OrderService.markOrderAsPaid(reference, event.data);
    }

    return successResponse(res, null, 'Webhook processed successfully');
  }),

  /**
   * Verify Payment Manually
   * GET /payments/verify/paystack/:reference
   */
  verify: asyncHandler(async (req, res) => {
    const { reference } = req.params;

    const result = await OrderService.verifyPaystackPayment(reference);

    return successResponse(res, result, 'Payment verified successfully');
  }),
};

export default PaymentController;
