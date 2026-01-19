import { UserModel } from '../models/UserModel.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import { tokenService } from './TokenService.js';
import { emailService } from './EmailService.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors.js';
import { uploadService } from './UploadService.js';

/**
 * Authentication Service for BeatBloom
 * Handles user authentication, registration, and account management
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data) {
    const { email, password, name, role = 'artist' } = data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user (unverified by default)
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password,
      name,
      role, // 'producer', 'artist', or 'admin'
      status: 'active',
      emailVerifiedAt: null,
      emailNotifications: true,
      pushNotifications: false,
      publicProfile: true,
      theme: 'dark',
    });

    // Generate verification token and send email
    const { token: verificationToken } = await tokenService.createVerificationToken(user.id);

    // Send verification email (non-blocking)
    emailService
      .sendVerificationEmail(user.email, user.name, verificationToken)
      .catch((err) => console.error('Failed to send verification email:', err.message));

    // Generate auth tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    // Store refresh token
    if (tokens.refreshToken) {
      await tokenService.storeRefreshToken(user.id, tokens.refreshToken);
    }

    // Remove password from response
    const { password: _pw, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login a user
   */
  static async login(email, password) {
    // Find user with password
    const user = await UserModel.findByEmailWithPassword(email.toLowerCase());

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Your account is not active');
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await UserModel.update(user.id, {
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    // Store refresh token
    if (tokens.refreshToken) {
      await tokenService.storeRefreshToken(user.id, tokens.refreshToken);
    }

    // Remove password from response
    const { password: _pw, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Logout user - invalidate the token
   */
  static async logout(accessToken, refreshToken = null) {
    // Blacklist refresh token if provided
    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    return true;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    // Check if token is valid
    const isValid = await tokenService.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      throw new UnauthorizedError('Token has been invalidated');
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      const tokenPayload = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      const tokens = generateTokens(tokenPayload);

      // Revoke old refresh token and store new one
      await tokenService.revokeRefreshToken(refreshToken);
      if (tokens.refreshToken) {
        await tokenService.storeRefreshToken(tokenPayload.id, tokens.refreshToken);
      }

      return tokens;
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token) {
    const tokenRecord = await tokenService.verifyVerificationToken(token);

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    // Update user
    const user = await UserModel.update(tokenRecord.userId, {
      emailVerifiedAt: new Date(),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Send welcome email
    emailService
      .sendWelcomeEmail(user.email, user.name)
      .catch((err) => console.error('Failed to send welcome email:', err.message));

    return user;
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestError('Email is already verified');
    }

    // Invalidate old tokens
    await tokenService.invalidateUserTokens(user.id, 'emailVerification');

    // Generate new token
    const { token: verificationToken } = await tokenService.createVerificationToken(user.id);

    // Send email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return true;
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const isValid = await UserModel.verifyPassword(userId, currentPassword);

    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const user = await UserModel.findById(userId);

    await UserModel.update(userId, {
      password: newPassword,
    });

    // Revoke all refresh tokens (logout everywhere)
    await tokenService.revokeAllUserRefreshTokens(userId);

    // Send notification email
    if (user) {
      emailService
        .sendPasswordChangedEmail(user.email, user.name)
        .catch((err) => console.error('Failed to send password changed email:', err.message));
    }

    return true;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    // Create reset token using TokenService
    const { token: resetToken } = await tokenService.createPasswordResetToken(user.id);

    // Send email
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return true;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, newPassword) {
    const tokenRecord = await tokenService.verifyPasswordResetToken(token);

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await UserModel.findById(tokenRecord.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserModel.update(user.id, {
      password: newPassword,
    });

    // Revoke all refresh tokens
    await tokenService.revokeAllUserRefreshTokens(user.id);

    // Send notification
    emailService
      .sendPasswordChangedEmail(user.email, user.name)
      .catch((err) => console.error('Failed to send password changed email:', err.message));

    return true;
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get producer profile if exists
    const producerProfile = await UserModel.getProducerProfile(userId);

    return {
      ...user,
      producer: producerProfile || null,
    };
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userId, data) {
    const {
      password: _password,
      role: _role,
      status: _status,
      emailVerifiedAt: _emailVerifiedAt,
      mfaEnabled: _mfaEnabled,
      mfaSecret: _mfaSecret,
      avatarFile,
      coverImageFile,
      ...safeData
    } = data;

    // Handle avatar upload if provided
    if (avatarFile) {
      const uploadResult = await uploadService.upload(avatarFile, 'avatar');
      safeData.avatar = uploadResult.url;
    }

    // Handle cover image upload if provided
    if (coverImageFile) {
      const uploadResult = await uploadService.upload(coverImageFile, 'cover');
      safeData.coverImage = uploadResult.url;
    }

    const user = await UserModel.update(userId, safeData);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user settings/preferences
   */
  static async updateSettings(userId, settings) {
    return UserModel.updateSettings(userId, settings);
  }

  /**
   * Delete current user account
   */
  static async deleteAccount(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return UserModel.getConnection().transaction(async (trx) => {
      // Delete user (BaseModel handles soft delete if configured, but we want hard delete or controlled soft delete)
      await trx('users').where('id', userId).del();

      // Revoke all tokens
      await trx('refreshTokens').where('userId', userId).del();

      // Trigger goodbye email (non-blocking)
      emailService
        .sendEmail(
          user.email,
          'Account Deleted',
          `Goodbye ${user.name}, your account has been deleted.`
        )
        .catch((err) => console.error('Failed to send goodbye email:', err.message));

      return true;
    });
  }
}

export default AuthService;
