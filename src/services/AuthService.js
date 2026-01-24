import { UserModel } from '../models/UserModel.js';
import { ProducerModelInstance as ProducerModel } from '../models/ProducerModel.js';
import { ArtistModelInstance as ArtistModel } from '../models/ArtistModel.js';
import { AdminModelInstance as AdminModel } from '../models/AdminModel.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import { tokenService } from './TokenService.js';
import { emailService } from './EmailService.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { uploadService } from './UploadService.js';
import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';
import crypto from 'crypto';

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

    // Generate unique username
    const baseUsername =
      email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '') + Math.floor(Math.random() * 1000);

    // Create profile record based on role
    if (role === 'producer') {
      await ProducerModel.create({
        userId: user.id,
        username: baseUsername,
        displayName: name,
      });
    } else if (role === 'admin') {
      await AdminModel.create({
        userId: user.id,
        username: baseUsername,
        displayName: name,
      });
    } else {
      // Default to artist
      await ArtistModel.create({
        userId: user.id,
        username: baseUsername,
        displayName: name,
      });
    }

    // Get full profile including merged data
    const fullUser = await this.getProfile(user.id);

    return {
      user: fullUser,
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
    if (!user.password) {
      throw new UnauthorizedError(
        'This account does not have a password. Please sign in with your social provider.'
      );
    }

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

    // Get full profile including merged data
    const fullUser = await this.getProfile(user.id);

    return {
      user: fullUser,
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
   * Request password reset with OTP
   */
  static async requestPasswordResetOTP(email) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    // Create OTP using TokenService
    const { otp } = await tokenService.createPasswordResetOTP(user.id);

    // Send OTP email
    await emailService.sendForgotPasswordOTPEmail(user.email, user.name, otp);

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
   * Verify password reset OTP
   */
  static async verifyPasswordResetOTP(email, otp) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tokenRecord = await tokenService.checkPasswordResetOTP(user.id, otp);

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    return true;
  }

  /**
   * Resend password reset OTP
   */
  static async resendForgotPasswordOTP(email) {
    // This is essentially same as requestPasswordResetOTP but explicitly named for clarity
    return this.requestPasswordResetOTP(email);
  }

  /**
   * Reset password with OTP
   */
  static async resetPasswordWithOTP(email, otp, newPassword) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const tokenRecord = await tokenService.verifyPasswordResetOTP(user.id, otp);

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired verification code');
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

    const modelMap = {
      producer: ProducerModel,
      artist: ArtistModel,
      admin: AdminModel,
    };

    const Model = modelMap[user.role] || ArtistModel;
    const profile = await Model.findByUserId(userId);

    const mergedUser = { ...user };

    if (profile) {
      mergedUser.avatar = profile.avatar;
      mergedUser.coverImage = profile.coverImage;
      mergedUser.bio = profile.bio;
      mergedUser.location = profile.location;
      mergedUser.website = profile.website;
      mergedUser.username = profile.username;
      mergedUser.displayName = profile.displayName || user.name;
      mergedUser.twitter = profile.twitter || null;
      mergedUser.instagram = profile.instagram || null;

      // Keep profile object for easier access
      mergedUser.profile = profile;
    }

    return mergedUser;
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

    // Handle profile images
    if (avatarFile) {
      const uploadResult = await uploadService.upload(avatarFile, 'avatar');
      safeData.avatar = uploadResult.url;
    }

    if (coverImageFile) {
      const uploadResult = await uploadService.upload(coverImageFile, 'cover');
      safeData.coverImage = uploadResult.url;
    }

    // Split data between User and Profile
    const userData = {};
    if (safeData.name) {
      userData.name = safeData.name;
    }
    if (safeData.email) {
      userData.email = safeData.email.toLowerCase();
    }

    const profileData = { ...safeData };
    if (safeData.name) {
      profileData.displayName = safeData.name;
    }
    delete profileData.name;
    delete profileData.email;

    const user = await UserModel.findByIdOrFail(userId);

    // Update User table if needed
    if (Object.keys(userData).length > 0) {
      await UserModel.update(userId, userData);
    }

    // Update Role-specific Profile table
    const modelMap = {
      producer: ProducerModel,
      artist: ArtistModel,
      admin: AdminModel,
    };

    const Model = modelMap[user.role] || ArtistModel;
    const profile = await Model.findByUserId(userId);

    if (profile) {
      await Model.update(profile.id, profileData);
    } else {
      // Create if doesn't exist (safety)
      const newProfileData = {
        userId: userId,
        displayName: user.name,
        ...profileData,
      };

      // Generate username if missing for any role
      if (!newProfileData.username) {
        newProfileData.username =
          user.email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '') + Math.floor(Math.random() * 1000);
      }

      await Model.create(newProfileData);
    }

    return this.getProfile(userId);
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

  /**
   * Setup 2FA - generate secret and QR code
   */
  static async setup2FA(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const secret = authenticator.generateSecret();

    // Store secret temporarily (unverified)
    await UserModel.update(userId, { mfaSecret: secret });

    const otpauth = authenticator.keyuri(user.email, 'BeatBloom', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    return { secret, qrCode };
  }

  /**
   * Verify and enable 2FA
   */
  static async verify2FA(userId, code) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.mfaSecret) {
      throw new BadRequestError('2FA setup not initiated');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid verification code');
    }

    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await UserModel.enable2FA(userId, user.mfaSecret, backupCodes);

    return { backupCodes };
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(userId) {
    await UserModel.disable2FA(userId);
    return true;
  }
  /**
   * Check if a username is available
   */
  static async checkUsernameAvailability(username) {
    const producer = await ProducerModel.findByUsername(username);
    return {
      available: !producer,
      username,
    };
  }

  /**
   * Upgrade user to producer
   */
  static async upgradeToProducer(userId) {
    const user = await UserModel.findByIdOrFail(userId);

    if (user.role === 'producer') {
      return this.getProfile(userId);
    }

    return UserModel.getConnection().transaction(async (trx) => {
      // 1. Get current artist profile to copy data from
      const artistProfile = await trx('artists').where('userId', userId).first();

      // 2. Update user role
      await trx('users').where('id', userId).update({
        role: 'producer',
        updatedAt: new Date(),
      });

      // 3. Prepare producer data from artist profile or user defaults
      const producerData = {
        username:
          artistProfile?.username ||
          user.email.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000),
        displayName: artistProfile?.displayName || user.name,
        bio: artistProfile?.bio || null,
        location: artistProfile?.location || null,
        website: artistProfile?.website || null,
        avatar: artistProfile?.avatar || null,
        coverImage: artistProfile?.coverImage || null,
        twitter: artistProfile?.twitter || null,
        instagram: artistProfile?.instagram || null,
        updatedAt: new Date(),
      };

      // 4. Create or update producer profile
      const existingProducer = await trx('producers').where('userId', userId).first();

      if (existingProducer) {
        await trx('producers').where('id', existingProducer.id).update(producerData);
      } else {
        await trx('producers').insert({
          ...producerData,
          userId,
          createdAt: new Date(),
          isVerified: false,
          isActive: true,
        });
      }

      // 5. Delete old artist profile
      if (artistProfile) {
        await trx('artists').where('userId', userId).del();
      }

      return this.getProfile(userId);
    });
  }
}

export default AuthService;
