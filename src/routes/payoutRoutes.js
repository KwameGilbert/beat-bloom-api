import express from 'express';
import { ProducerController } from '../controllers/ProducerController.js';
import { authenticate, requireProducer } from '../middlewares/auth.js';

const router = express.Router();

// Apply auth to all payout routes
router.use(authenticate);
router.use(requireProducer);

/**
 * @route GET /api/payouts/history
 * @desc Get payout transaction history
 */
router.get('/history', ProducerController.getPayoutHistory);

/**
 * @route POST /api/payouts/request
 * @desc Request a manual payout
 */
router.post('/request', ProducerController.requestWithdrawal);

/**
 * @route GET /api/payouts/methods
 * @desc Get payout methods
 */
router.get('/methods', ProducerController.getPayoutMethods);

/**
 * @route POST /api/payouts/methods
 * @desc Add payout method
 */
router.post('/methods', ProducerController.addPayoutMethod);

/**
 * @route DELETE /api/payouts/methods/:id
 * @desc Delete payout method
 */
router.delete('/methods/:id', ProducerController.deletePayoutMethod);

export default router;
