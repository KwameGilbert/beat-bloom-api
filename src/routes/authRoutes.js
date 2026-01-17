import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authSchemas } from '../validators/schemas.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimiter,
  validateBody(authSchemas.register),
  AuthController.register
);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  authRateLimiter,
  validateBody(authSchemas.login),
  AuthController.login
);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  validateBody(authSchemas.refreshToken),
  AuthController.refreshToken
);

/**
 * @route GET /auth/verify-email
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify-email', AuthController.verifyEmail);

/**
 * @route POST /auth/resend-verification
 * @desc Resend verification email
 * @access Public
 */
router.post(
  '/resend-verification',
  authRateLimiter,
  validateBody(authSchemas.forgotPassword), // Same schema (just email)
  AuthController.resendVerification
);

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, AuthController.getProfile);

/**
 * @route PATCH /auth/me
 * @desc Update current user profile
 * @access Private
 */
router.patch(
  '/me',
  authenticate,
  validateBody(authSchemas.updateProfile),
  AuthController.updateProfile
);

/**
 * @route POST /auth/change-password
 * @desc Change password
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  validateBody(authSchemas.changePassword),
  AuthController.changePassword
);

/**
 * @route POST /auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(authSchemas.forgotPassword),
  AuthController.forgotPassword
);

/**
 * @route POST /auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(authSchemas.resetPassword),
  AuthController.resetPassword
);

/**
 * @route POST /auth/logout
 * @desc Logout user (blacklist token)
 * @access Private
 */
router.post('/logout', authenticate, AuthController.logout);

export default router;
