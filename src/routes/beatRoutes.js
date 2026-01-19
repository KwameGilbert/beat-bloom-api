import express from 'express';
import { BeatController } from '../controllers/BeatController.js';
import { authenticate, requireProducer } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route GET /api/beats
 * @desc Get all beats with filtering and pagination
 */
router.get('/', BeatController.list);

/**
 * @route GET /api/beats/trending
 * @desc Get trending beats
 */
router.get('/trending', BeatController.trending);

/**
 * @route GET /api/beats/:id
 * @desc Get beat details
 */
router.get('/:id', BeatController.get);

/**
 * @route POST /api/beats/:id/play
 * @desc Record a play for a beat
 */
router.post('/:id/play', BeatController.recordPlay);

/**
 * @route POST /api/beats
 * @desc Create a new beat (Producer only)
 */
router.post('/', authenticate, requireProducer, BeatController.create);

export default router;
