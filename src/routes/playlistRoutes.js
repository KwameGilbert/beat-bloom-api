import express from 'express';
import { PlaylistController } from '../controllers/PlaylistController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Public/Private Playlist Access
 */
router.get('/', authenticate, PlaylistController.list);
router.get('/:id', optionalAuth, PlaylistController.get);
router.post('/', authenticate, PlaylistController.create);
router.patch('/:id', authenticate, PlaylistController.update);
router.delete('/:id', authenticate, PlaylistController.delete);

/**
 * Playlist Beat Management
 */
router.post('/:id/beats', authenticate, PlaylistController.addBeat);
router.delete('/:id/beats/:beatId', authenticate, PlaylistController.removeBeat);

export default router;
