import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authSchemas } from '../validators/schemas.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

/**
 * @route GET /auth/check-username
 * @desc Check username availability
 * @access Public
 */
router.get('/check-username', AuthController.checkUsername);

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
router.post('/login', authRateLimiter, validateBody(authSchemas.login), AuthController.login);

/**
 * @route POST /auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateBody(authSchemas.refreshToken), AuthController.refreshToken);

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
 * @desc Update current user profile (Supports multipart for avatar/cover)
 * @access Private
 */
router.patch(
  '/me',
  authenticate,
  upload('general').fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  AuthController.updateProfile
);

/**
 * @route PATCH /auth/settings
 * @desc Update user settings/preferences
 * @access Private
 */
router.patch(
  '/settings',
  authenticate,
  validateBody(authSchemas.updateSettings),
  AuthController.updateSettings
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
 * @route POST /auth/verify-otp
 * @desc Verify password reset OTP
 * @access Public
 */
router.post('/verify-otp', authRateLimiter, AuthController.verifyOTP);

/**
 * @route POST /auth/resend-otp
 * @desc Resend password reset OTP
 * @access Public
 */
router.post(
  '/resend-otp',
  authRateLimiter,
  validateBody(authSchemas.forgotPassword),
  AuthController.resendOTP
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
 * @desc Logout user (revoke token)
 * @access Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route DELETE /auth/me
 * @desc Delete current user account
 * @access Private
 */
router.delete('/me', authenticate, AuthController.deleteAccount);

/**
 * 2FA Routes
 */
router.get('/2fa/setup', authenticate, AuthController.setup2FA);
router.post('/2fa/verify', authenticate, AuthController.verify2FA);
router.post('/2fa/disable', authenticate, AuthController.disable2FA);

router.post('/upgrade', authenticate, AuthController.upgradeToProducer);

export default router;
