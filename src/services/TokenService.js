import crypto from 'crypto';
import { db } from '../config/database.js';

/**
 * Token Service
 * Manages auth tokens, verification tokens, and token blacklisting
 */
class TokenServiceClass {
  /**
   * Create email verification token
   */
  async createVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db('authTokens').insert({
      userId,
      type: 'emailVerification',
      token,
      expiresAt,
    });

    return { token, expiresAt };
  }

  /**
   * Verify email verification token
   */
  async verifyVerificationToken(token) {
    const record = await db('authTokens')
      .where('token', token)
      .where('type', 'emailVerification')
      .whereNull('usedAt')
      .where('expiresAt', '>', new Date())
      .first();

    if (record) {
      // Mark as used
      await db('authTokens').where('id', record.id).update({ usedAt: new Date() });
    }

    return record;
  }

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId) {
    // Invalidate old tokens first
    await this.invalidateUserTokens(userId, 'passwordReset');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db('authTokens').insert({
      userId,
      type: 'passwordReset',
      token,
      expiresAt,
    });

    return { token, expiresAt };
  }

  /**
   * Create password reset OTP (6 digits)
   */
  async createPasswordResetOTP(userId) {
    // Invalidate old tokens first
    await this.invalidateUserTokens(userId, 'passwordResetOTP');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes is better for OTP

    await db('authTokens').insert({
      userId,
      type: 'passwordResetOTP',
      token: otp,
      expiresAt,
    });

    return { otp, expiresAt };
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token) {
    const record = await db('authTokens')
      .where('token', token)
      .where('type', 'passwordReset')
      .whereNull('usedAt')
      .where('expiresAt', '>', new Date())
      .first();

    if (record) {
      // Mark as used
      await db('authTokens').where('id', record.id).update({ usedAt: new Date() });
    }

    return record;
  }

  /**
   * Verify password reset OTP
   */
  async verifyPasswordResetOTP(userId, otp) {
    const record = await db('authTokens')
      .where('userId', userId)
      .where('token', otp)
      .where('type', 'passwordResetOTP')
      .whereNull('usedAt')
      .where('expiresAt', '>', new Date())
      .first();

    if (record) {
      // Mark as used
      await db('authTokens').where('id', record.id).update({ usedAt: new Date() });
    }

    return record;
  }

  /**
   * Invalidate all tokens of a specific type for a user
   */
  async invalidateUserTokens(userId, type) {
    await db('authTokens')
      .where('userId', userId)
      .where('type', type)
      .whereNull('usedAt')
      .update({ usedAt: new Date() });
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId, token, deviceInfo = null, ipAddress = null) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db('refreshTokens').insert({
      userId,
      token,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return { expiresAt };
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token) {
    await db('refreshTokens').where('token', token).update({ isRevoked: true });
  }

  /**
   * Check if refresh token is valid
   */
  async isRefreshTokenValid(token) {
    const record = await db('refreshTokens')
      .where('token', token)
      .where('isRevoked', false)
      .where('expiresAt', '>', new Date())
      .first();

    return !!record;
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserRefreshTokens(userId) {
    await db('refreshTokens').where('userId', userId).update({ isRevoked: true });
  }

  /**
   * Add token to blacklist (for logout)
   * Using refreshTokens table with isRevoked = true
   */
  async blacklistToken(token, _expiresAt) {
    // For simple blacklisting, we can just mark the token as revoked
    // This works for refresh tokens; for access tokens, we verify expiry
    try {
      await db('refreshTokens').where('token', token).update({ isRevoked: true });
    } catch (_e) {
      // Token might not exist in refreshTokens (could be access token)
      // For access tokens, we don't need to blacklist - just let them expire
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isBlacklisted(token) {
    const record = await db('refreshTokens').where('token', token).where('isRevoked', true).first();

    return !!record;
  }

  /**
   * Cleanup expired tokens (should run periodically)
   */
  async cleanupExpiredTokens() {
    const now = new Date();

    // Delete expired auth tokens
    const authDeleted = await db('authTokens').where('expiresAt', '<', now).delete();

    // Delete expired refresh tokens
    const refreshDeleted = await db('refreshTokens').where('expiresAt', '<', now).delete();

    return { authDeleted, refreshDeleted };
  }
}

export const tokenService = new TokenServiceClass();
export default tokenService;
