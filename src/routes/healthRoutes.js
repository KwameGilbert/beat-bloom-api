import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';

const router = Router();

/**
 * Health Check Routes
 * All routes are public (no authentication)
 */

/**
 * @route GET /health
 * @desc Basic health check
 * @access Public
 */
router.get('/', HealthController.check);

/**
 * @route GET /health/detailed
 * @desc Detailed health check with dependencies
 * @access Public (consider restricting in production)
 */
router.get('/detailed', HealthController.detailed);

/**
 * @route GET /health/ready
 * @desc Readiness check for Kubernetes
 * @access Public
 */
router.get('/ready', HealthController.ready);

/**
 * @route GET /health/live
 * @desc Liveness check for Kubernetes
 * @access Public
 */
router.get('/live', HealthController.live);

export default router;
