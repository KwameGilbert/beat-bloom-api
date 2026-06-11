import express from 'express';
import { ProducerController } from '../controllers/ProducerController.js';
import { authenticate, requireProducer } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route GET /api/producers
 * @desc Get all producers
 */
router.get('/', ProducerController.list);

/**
 * @route GET /api/producers/dashboard/overview
 * @desc Get producer dashboard overview data (authenticated)
 */
router.get(
  '/dashboard/overview',
  authenticate,
  requireProducer,
  ProducerController.getDashboardOverview
);

/**
 * @route GET /api/producers/dashboard/sales
 * @desc Get producer detailed sales item log (authenticated)
 */
router.get('/dashboard/sales', authenticate, requireProducer, ProducerController.getSalesList);

/**
 * @route GET /api/producers/:username
 * @desc Get producer profile and their beats
 */
router.get('/:username', ProducerController.get);

export default router;
