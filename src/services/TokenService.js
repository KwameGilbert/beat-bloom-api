import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import crypto from 'crypto';

/**
 * Token Service
 * Handles token generation, verification, and blacklisting
 * Uses database for persistence (works without Redis)
 */
class TokenService {
  constructor() {
    this.tableName = 'tokens';
    this.blacklistTable = 'token_blacklist';
  }

  // ============ TOKEN GENERATION ============

  /**
   * Generate a random token
   * @param {number} length - Token length in bytes (default 32)
   * @returns {string} Hex-encoded token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a token with expiration
   * @param {string} type - Token type (verification, reset, etc.)
   * @param {string} userId - User ID
   * @param {number} expiresInMinutes - Expiration time in minutes
   * @returns {Promise<object>} Token data
   */
  async createToken(type, userId, expiresInMinutes = 60) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await db(this.tableName).insert({
      id: crypto.randomUUID(),
      user_id: userId,
      type,
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    logger.debug({ type, userId }, 'Token created');

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Verify and consume a token
   * @param {string} type - Token type
   * @param {string} token - Token string
   * @returns {Promise<object|null>} Token data if valid
   */
  async verifyToken(type, token) {
    const record = await db(this.tableName)
      .where({ type, token })
      .where('expires_at', '>', new Date())
      .whereNull('used_at')
      .first();

    if (!record) {
      return null;
    }

    // Mark token as used
    await db(this.tableName)
      .where({ id: record.id })
      .update({ used_at: new Date() });

    logger.debug({ type, userId: record.user_id }, 'Token verified and consumed');

    return record;
  }

  /**
   * Invalidate all tokens of a type for a user
   */
  async invalidateUserTokens(userId, type = null) {
    let query = db(this.tableName).where({ user_id: userId });
    
    if (type) {
      query = query.where({ type });
    }

    await query.update({ used_at: new Date() });
    
    logger.debug({ userId, type }, 'User tokens invalidated');
  }

  // ============ JWT BLACKLIST ============

  /**
   * Add a JWT to the blacklist
   * @param {string} jti - JWT ID (or token hash)
   * @param {Date} expiresAt - When to remove from blacklist
   */
  async blacklistToken(token, expiresAt) {
    const tokenHash = this.hashToken(token);

    try {
      await db(this.blacklistTable).insert({
        id: crypto.randomUUID(),
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date(),
      });

      logger.debug('JWT added to blacklist');
    } catch (error) {
      // Ignore duplicate errors
      if (!error.message.includes('duplicate')) {
        throw error;
      }
    }
  }

  /**
   * Check if a JWT is blacklisted
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isBlacklisted(token) {
    const tokenHash = this.hashToken(token);

    const record = await db(this.blacklistTable)
      .where({ token_hash: tokenHash })
      .first();

    return !!record;
  }

  /**
   * Hash a token for storage
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Clean up expired tokens and blacklist entries
   * Call this from a cron job
   */
  async cleanup() {
    const now = new Date();

    // Delete expired tokens
    const deletedTokens = await db(this.tableName)
      .where('expires_at', '<', now)
      .del();

    // Delete expired blacklist entries
    const deletedBlacklist = await db(this.blacklistTable)
      .where('expires_at', '<', now)
      .del();

    if (deletedTokens > 0 || deletedBlacklist > 0) {
      logger.info({ 
        deletedTokens, 
        deletedBlacklist,
      }, 'Cleaned up expired tokens');
    }

    return { deletedTokens, deletedBlacklist };
  }

  // ============ SPECIFIC TOKEN TYPES ============

  /**
   * Create email verification token
   */
  async createVerificationToken(userId) {
    return this.createToken('email_verification', userId, 24 * 60); // 24 hours
  }

  /**
   * Verify email verification token
   */
  async verifyVerificationToken(token) {
    return this.verifyToken('email_verification', token);
  }

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId) {
    // Invalidate existing reset tokens
    await this.invalidateUserTokens(userId, 'password_reset');
    
    return this.createToken('password_reset', userId, 60); // 1 hour
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token) {
    return this.verifyToken('password_reset', token);
  }
}

// Export singleton
export const tokenService = new TokenService();
export default tokenService;
