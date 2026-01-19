import { Router } from 'express';
import { rateLimiter } from '../middlewares/rateLimiter.js';

// Import route modules
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import healthRoutes from './healthRoutes.js';
import docsRoutes from './docsRoutes.js';

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

// Mount API routes
router.use('/api', apiRouter);

export default router;
