import { OAuthService } from '../services/OAuthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import oauthConfig from '../config/oauth.js';

/**
 * OAuth Controller
 * Handles OAuth authentication endpoints
 */
export const OAuthController = {
  /**
   * Redirect to Google OAuth
   * GET /auth/google
   */
  googleRedirect: asyncHandler(async (req, res) => {
    const authUrl = OAuthService.getGoogleAuthUrl();
    res.redirect(authUrl);
  }),

  /**
   * Handle Google OAuth callback
   * GET /auth/google/callback
   */
  googleCallback: asyncHandler(async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      // User denied access or other error
      return res.redirect(`${oauthConfig.oauth.frontendUrl}/login?error=oauth_denied`);
    }

    if (!code) {
      return res.redirect(`${oauthConfig.oauth.frontendUrl}/login?error=no_code`);
    }

    try {
      const result = await OAuthService.handleGoogleCallback(code);

      // Redirect to frontend with tokens in URL (frontend will extract and store them)
      const params = new URLSearchParams({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.user.id.toString(),
      });

      res.redirect(`${oauthConfig.oauth.frontendUrl}/oauth/callback?${params.toString()}`);
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.redirect(`${oauthConfig.oauth.frontendUrl}/login?error=oauth_failed`);
    }
  }),
};

export default OAuthController;
