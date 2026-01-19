import express from 'express';
import { ProducerController } from '../controllers/ProducerController.js';

const router = express.Router();

/**
 * @route GET /api/producers
 * @desc Get all producers
 */
router.get('/', ProducerController.list);

/**
 * @route GET /api/producers/:username
 * @desc Get producer profile and their beats
 */
router.get('/:username', ProducerController.get);

export default router;
