import { UserModel } from '../models/UserModel.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import { tokenService } from './TokenService.js';
import { emailService } from './EmailService.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { env } from '../config/env.js';

/**
 * Authentication Service
 * Handles user authentication, registration, and account management
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data) {
    const { email, password, first_name, last_name, role = 'user' } = data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user (unverified by default)
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password,
      first_name,
      last_name,
      role,
      status: 'active',
      email_verified_at: null,
    });

    // Generate verification token and send email
    const { token: verificationToken } = await tokenService.createVerificationToken(user.id);
    
    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(user.email, user.first_name, verificationToken)
      .catch(err => console.error('Failed to send verification email:', err.message));

    // Generate auth tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user,
      ...tokens,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login a user
   */
  static async login(email, password) {
    // Find user with password hash
    const user = await UserModel.findByEmailWithPassword(email.toLowerCase());

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Your account is not active');
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await UserModel.update(user.id, {
      last_login_at: new Date(),
    });

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Logout user - invalidate the token
   */
  static async logout(accessToken, refreshToken = null) {
    // Calculate token expiration (decode without verifying)
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const expiresAt = new Date(payload.exp * 1000);
        
        // Blacklist access token
        await tokenService.blacklistToken(accessToken, expiresAt);
        
        // Blacklist refresh token if provided
        if (refreshToken) {
          await tokenService.blacklistToken(refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        }
      } catch (e) {
        // Ignore decode errors
      }
    }

    return true;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    // Check if token is blacklisted
    const isBlacklisted = await tokenService.isBlacklisted(refreshToken);
    if (isBlacklisted) {
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

      return tokens;
    } catch (error) {
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
    const user = await UserModel.update(tokenRecord.user_id, {
      email_verified_at: new Date(),
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Send welcome email
    emailService.sendWelcomeEmail(user.email, user.first_name)
      .catch(err => console.error('Failed to send welcome email:', err.message));

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

    if (user.email_verified_at) {
      throw new BadRequestError('Email is already verified');
    }

    // Invalidate old tokens
    await tokenService.invalidateUserTokens(user.id, 'email_verification');

    // Generate new token
    const { token: verificationToken } = await tokenService.createVerificationToken(user.id);

    // Send email
    await emailService.sendVerificationEmail(user.email, user.first_name, verificationToken);

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

    // Send notification email
    if (user) {
      emailService.sendPasswordChangedEmail(user.email, user.first_name)
        .catch(err => console.error('Failed to send password changed email:', err.message));
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
    await emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken);

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

    const user = await UserModel.findById(tokenRecord.user_id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await UserModel.update(user.id, {
      password: newPassword,
    });

    // Send notification
    emailService.sendPasswordChangedEmail(user.email, user.first_name)
      .catch(err => console.error('Failed to send password changed email:', err.message));

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

    return user;
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userId, data) {
    // Prevent updating sensitive fields
    const { password, role, status, email_verified_at, ...safeData } = data;

    const user = await UserModel.update(userId, safeData);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export default AuthService;
