import express from 'express';
import { BeatController } from '../controllers/BeatController.js';
import { authenticate, requireProducer, optionalAuth } from '../middlewares/auth.js';

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
 * @route GET /api/beats/my-beats
 * @desc Get authenticated producer's beats
 */
router.get('/my-beats', authenticate, requireProducer, BeatController.getMyBeats);

/**
 * @route GET /api/beats/:id
 * @desc Get beat details (optionalAuth to check exclusive ownership)
 */
router.get('/:id', optionalAuth, BeatController.get);

/**
 * @route PUT /api/beats/:id
 * @desc Update a beat details (Producer only)
 */
router.put('/:id', authenticate, requireProducer, BeatController.update);

/**
 * @route DELETE /api/beats/:id
 * @desc Soft delete a beat (Producer only)
 */
router.delete('/:id', authenticate, requireProducer, BeatController.delete);

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
