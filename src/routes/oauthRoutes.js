import { Router } from 'express';
import { OAuthController } from '../controllers/OAuthController.js';

const router = Router();

/**
 * @route GET /auth/google
 * @desc Redirect to Google OAuth
 * @access Public
 */
router.get('/google', OAuthController.googleRedirect);

/**
 * @route GET /auth/google/callback
 * @desc Handle Google OAuth callback
 * @access Public
 */
router.get('/google/callback', OAuthController.googleCallback);

export default router;