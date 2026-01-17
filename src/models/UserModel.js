import { BaseModel } from './BaseModel.js';
import { passwordHasher } from '../utils/passwordHasher.js';

/**
 * User Model
 */
class UserModelClass extends BaseModel {
  constructor() {
    super('users', {
      timestamps: true,
      softDeletes: true,
      searchableFields: ['email', 'first_name', 'last_name'],
      sortableFields: ['created_at', 'updated_at', 'email', 'first_name', 'last_name'],
      hidden: ['password_hash'],
    });
  }

  /**
   * Create user with hashed password
   */
  async create(data) {
    const userData = { ...data };

    if (userData.password) {
      userData.password_hash = await this.hashPassword(userData.password);
      delete userData.password;
    }

    return super.create(userData);
  }

  /**
   * Update user with optional password hashing
   */
  async update(id, data) {
    const userData = { ...data };

    if (userData.password) {
      userData.password_hash = await this.hashPassword(userData.password);
      delete userData.password;
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
   * Find user by email including password hash
   */
  async findByEmailWithPassword(email) {
    const record = await this.query()
      .where('email', email.toLowerCase())
      .first();
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
    const user = await this.query()
      .where(this.primaryKey, userId)
      .first();

    if (!user || !user.password_hash) {
      return false;
    }

    return this.comparePassword(password, user.password_hash);
  }
}

export const UserModel = new UserModelClass();
export default UserModel;
