import express from 'express';
import { GenreController } from '../controllers/GenreController.js';

const router = express.Router();

/**
 * @route GET /api/genres
 * @desc Get all active genres
 */
router.get('/', GenreController.list);

/**
 * @route GET /api/genres/:slug
 * @desc Get genre by slug
 */
router.get('/:slug', GenreController.get);

export default router;
