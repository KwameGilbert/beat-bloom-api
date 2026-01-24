import { BaseModel } from './BaseModel.js';
import { passwordHasher } from '../utils/passwordHasher.js';

/**
 * User Model for BeatBloom
 * Handles user accounts with authentication
 */
class UserModelClass extends BaseModel {
  constructor() {
    super('users', {
      timestamps: true,
      timestampFields: {
        created: 'createdAt',
        updated: 'updatedAt',
      },
      softDeletes: true,
      softDeleteField: 'deletedAt',
      searchableFields: ['email', 'name'],
      sortableFields: ['createdAt', 'updatedAt', 'email', 'name'],
      hidden: ['password'],
    });
  }

  /**
   * Create user with hashed password
   */
  async create(data) {
    const userData = { ...data };

    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    return super.create(userData);
  }

  /**
   * Update user with optional password hashing
   */
  async update(id, data) {
    const userData = { ...data };

    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }

    return super.update(id, userData);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return this.findBy('email', email.toLowerCase());
  }

  /**
   * Find user by email including password
   */
  async findByEmailWithPassword(email) {
    const record = await this.query().where('email', email.toLowerCase()).first();
    return record;
  }

  /**
   * Hash a password using configured algorithm
   */
  async hashPassword(password) {
    return passwordHasher.hash(password);
  }

  /**
   * Compare password with hash using auto-detected algorithm
   */
  async comparePassword(password, hash) {
    return passwordHasher.verify(password, hash);
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId, password) {
    const user = await this.query().where(this.primaryKey, userId).first();

    if (!user || !user.password) {
      return false;
    }

    return this.comparePassword(password, user.password);
  }

  /**
   * Get user's producer profile if exists
   */
  async getProducerProfile(userId) {
    return this.getConnection()('producers').where('userId', userId).first();
  }

  /**
   * Check if user is a producer
   */
  async isProducer(userId) {
    const producer = await this.getProducerProfile(userId);
    return !!producer;
  }

  /**
   * Update user settings (preferences)
   */
  async updateSettings(userId, settings) {
    const allowedSettings = ['emailNotifications', 'pushNotifications', 'publicProfile', 'theme'];

    const safeSettings = {};
    for (const key of allowedSettings) {
      if (settings[key] !== undefined) {
        safeSettings[key] = settings[key];
      }
    }

    return this.update(userId, safeSettings);
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId, secret, backupCodes) {
    return this.update(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
      mfaBackupCodes: JSON.stringify(backupCodes),
    });
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId) {
    return this.update(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: '[]',
    });
  }
}

export const UserModel = new UserModelClass();
export default UserModel;
