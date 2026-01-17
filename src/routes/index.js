import { Router } from 'express';
import { env } from '../config/env.js';
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
 * API v1 routes
 */
const v1Router = Router();

// Apply rate limiter to all API routes
v1Router.use(rateLimiter);

// API Documentation
v1Router.use('/docs', docsRoutes);

// Auth routes
v1Router.use('/auth', authRoutes);

// User management routes
v1Router.use('/users', userRoutes);

// Mount v1 routes
router.use(`/api/${env.API_VERSION}`, v1Router);

// Legacy support - also mount at /api
router.use('/api', v1Router);

export default router;
