import express from 'express';
import { ActivityController } from '../controllers/ActivityController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Likes
 */
router.post('/likes/:id', authenticate, ActivityController.toggleLike);
router.get('/likes', authenticate, ActivityController.getLikedBeats);

/**
 * Play History
 */
router.post('/plays/:id', optionalAuth, ActivityController.recordPlay);
router.get('/plays', authenticate, ActivityController.getPlayHistory);

export default router;
