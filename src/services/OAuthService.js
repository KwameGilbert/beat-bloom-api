import { UserModel } from '../models/UserModel.js';
import { ArtistModelInstance as ArtistModel } from '../models/ArtistModel.js';
import { generateTokens } from '../middlewares/auth.js';
import { tokenService } from './TokenService.js';
import { BadRequestError } from '../utils/errors.js';
import oauthConfig from '../config/oauth.js';

/**
 * OAuth Service
 * Handles OAuth authentication flows for Google, Discord, etc.
 */
export class OAuthService {
  /**
   * Generate Google OAuth URL for user to authorize
   */
  static getGoogleAuthUrl() {
    const params = new URLSearchParams({
      client_id: oauthConfig.oauth.google.clientId,
      redirect_uri: oauthConfig.oauth.google.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange Google authorization code for tokens and user info
   */
  static async handleGoogleCallback(code) {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: oauthConfig.oauth.google.clientId,
        client_secret: oauthConfig.oauth.google.clientSecret,
        redirect_uri: oauthConfig.oauth.google.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new BadRequestError(
        `Google token exchange failed: ${error.error_description || error.error}`
      );
    }

    const tokens = await tokenResponse.json();

    // 2. Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new BadRequestError('Failed to get user info from Google');
    }

    const googleUser = await userInfoResponse.json();

    // 3. Find or create user in our database
    return this.findOrCreateGoogleUser(googleUser);
  }

  /**
   * Find existing user by Google ID or email, or create new user
   */
  static async findOrCreateGoogleUser(googleUser) {
    const { id: googleId, email, name, picture } = googleUser;

    // First, try to find by Google ID (returning user)
    let user = await UserModel.findBy('googleId', googleId);

    if (!user) {
      // Check if user exists with this email (link accounts)
      user = await UserModel.findByEmail(email);

      if (user) {
        // Link Google account to existing user
        await UserModel.update(user.id, {
          googleId,
          authProvider: user.authProvider === 'local' ? 'local' : 'google',
        });
        user.googleId = googleId;
      } else {
        // Create new user
        user = await UserModel.getConnection()('users')
          .insert({
            email: email.toLowerCase(),
            name,
            googleId,
            authProvider: 'google',
            password: null, // OAuth users don't have passwords
            role: 'artist', // Default role
            status: 'active',
            emailVerifiedAt: new Date(), // Google already verified email
            emailNotifications: true,
            pushNotifications: false,
            publicProfile: true,
            theme: 'dark',
          })
          .returning('*');

        user = user[0];

        // Create artist profile by default
        await ArtistModel.create({
          userId: user.id,
          displayName: name,
          avatar: picture || null,
        });
      }
    }

    // Generate JWT tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtTokens = generateTokens(tokenPayload);

    // Store refresh token
    if (jwtTokens.refreshToken) {
      await tokenService.storeRefreshToken(user.id, jwtTokens.refreshToken);
    }

    // Update last login
    await UserModel.update(user.id, { lastLoginAt: new Date() });

    // Remove sensitive fields
    const { password: _pw, mfaSecret: _mfa, ...safeUser } = user;

    return {
      user: safeUser,
      ...jwtTokens,
    };
  }
}

export default OAuthService;
