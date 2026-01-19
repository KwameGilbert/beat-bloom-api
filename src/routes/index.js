import { Router } from 'express';
import { rateLimiter } from '../middlewares/rateLimiter.js';

// Import route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import healthRoutes from './healthRoutes.js';
import docsRoutes from './docsRoutes.js';
import beatRoutes from './beatRoutes.js';
import producerRoutes from './producerRoutes.js';
import genreRoutes from './genreRoutes.js';
import activityRoutes from './activityRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import orderRoutes from './orderRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

/**
 * Health routes
 */
router.use('/health', healthRoutes);

/**
 * API routes
 */
const apiRouter = Router();

// Apply rate limiter to all API routes
apiRouter.use(rateLimiter);

// API Documentation
apiRouter.use('/docs', docsRoutes);

// Auth routes
apiRouter.use('/auth', authRoutes);

// User management routes
apiRouter.use('/users', userRoutes);

// Beat routes
apiRouter.use('/beats', beatRoutes);

// Producer routes
apiRouter.use('/producers', producerRoutes);

// Genre routes
apiRouter.use('/genres', genreRoutes);

// Activity routes (Likes, Plays)
apiRouter.use('/activity', activityRoutes);

// Playlist routes
apiRouter.use('/playlists', playlistRoutes);

// Order routes
apiRouter.use('/orders', orderRoutes);

// Upload routes
apiRouter.use('/upload', uploadRoutes);

// Mount API routes
router.use('/api', apiRouter);

export default router;
