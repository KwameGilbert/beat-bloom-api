import { Router } from 'express';
import { PageController } from '../controllers/PageController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { validateParams } from '../middlewares/validate.js';
import { beatSchemas } from '../validators/schemas.js';

const router = Router();

/**
 * Page Aggregation Routes
 * Base path: /api/pages
 */

/**
 * @route GET /pages/home
 * @desc Get all data for home page
 * @access Public
 */
router.get('/home', PageController.getHomePage);

/**
 * @route GET /pages/beat-detail/:id
 * @desc Get all data for beat detail page
 * @access Public (optionalAuth to check exclusive ownership)
 */
router.get(
  '/beat-detail/:id',
  optionalAuth,
  validateParams(beatSchemas.params),
  PageController.getBeatDetailPage
);

/**
 * @route GET /pages/profile
 * @desc Get all data for current user's profile
 * @access Private
 */
router.get('/profile', authenticate, PageController.getProfilePage);

export default router;
