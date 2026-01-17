import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * Authentication Controller
 */
export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);

    return ApiResponse.created(res, result, result.message || 'User registered successfully');
  });

  /**
   * Login user
   * POST /auth/login
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    return ApiResponse.success(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);

    return ApiResponse.success(res, tokens, 'Token refreshed successfully');
  });

  /**
   * Get current user profile
   * GET /auth/me
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.getProfile(req.user.id);

    return ApiResponse.success(res, user);
  });

  /**
   * Update current user profile
   * PATCH /auth/me
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.updateProfile(req.user.id, req.body);

    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * Change password
   * POST /auth/change-password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    return ApiResponse.success(res, null, 'Password changed successfully');
  });

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await AuthService.requestPasswordReset(email);

    return ApiResponse.success(
      res,
      null,
      'If an account exists with this email, you will receive a password reset link'
    );
  });

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);

    return ApiResponse.success(res, null, 'Password reset successfully');
  });

  /**
   * Verify email with token
   * GET /auth/verify-email
   */
  static verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
      return ApiResponse.badRequest(res, 'Verification token is required');
    }

    const user = await AuthService.verifyEmail(token);

    return ApiResponse.success(res, { verified: true }, 'Email verified successfully');
  });

  /**
   * Resend verification email
   * POST /auth/resend-verification
   */
  static resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await AuthService.resendVerification(email);

    return ApiResponse.success(
      res,
      null,
      'If your email is registered and not verified, you will receive a verification link'
    );
  });

  /**
   * Logout - blacklist the token
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req, res) => {
    // Get the token from header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(' ')[1];
    const { refreshToken } = req.body || {};

    if (accessToken) {
      await AuthService.logout(accessToken, refreshToken);
    }

    return ApiResponse.success(res, null, 'Logged out successfully');
  });
}

export default AuthController;
