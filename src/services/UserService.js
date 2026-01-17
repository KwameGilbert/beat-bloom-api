import { UserModel } from '../models/UserModel.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';

/**
 * User Management Service
 */
export class UserService {
  /**
   * List users with pagination and filtering
   */
  static async list(options = {}) {
    return UserModel.findAll(options);
  }

  /**
   * Get user by ID
   */
  static async getById(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Create a new user
   */
  static async create(data) {
    const { email } = data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    return UserModel.create({
      ...data,
      email: email.toLowerCase(),
      status: data.status || 'active',
    });
  }

  /**
   * Update user
   */
  static async update(userId, data) {
    // Check if email is being changed
    if (data.email) {
      const existingUser = await UserModel.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('User with this email already exists');
      }
      data.email = data.email.toLowerCase();
    }

    const user = await UserModel.update(userId, data);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(requestingUser, userId) {
    // Prevent self-deletion
    if (requestingUser && requestingUser.id === userId) {
      throw new ForbiddenError('Cannot delete your own account');
    }

    const deleted = await UserModel.delete(userId);

    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    return true;
  }

  /**
   * Restore deleted user
   */
  static async restore(userId) {
    const user = await UserModel.restore(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update user role
   */
  static async updateRole(userId, role) {
    return this.update(userId, { role });
  }

  /**
   * Activate user
   */
  static async activate(userId) {
    return this.update(userId, { status: 'active' });
  }

  /**
   * Deactivate user
   */
  static async deactivate(userId) {
    return this.update(userId, { status: 'inactive' });
  }

  /**
   * Suspend user
   */
  static async suspend(userId) {
    return this.update(userId, { status: 'suspended' });
  }
}

export default UserService;
