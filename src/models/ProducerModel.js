import { BaseModel } from './BaseModel.js';

/**
 * Producer Model
 */
class ProducerModel extends BaseModel {
  constructor() {
    super('producers', {
      searchableFields: ['username', 'displayName', 'bio', 'location'],
      sortableFields: ['createdAt', 'updatedAt', 'displayName', 'isVerified'],
    });
  }

  /**
   * Find producer by username
   */
  async findByUsername(username) {
    return this.findBy('username', username.toLowerCase());
  }

  /**
   * Find producer by userId
   */
  async findByUserId(userId) {
    return this.findBy('userId', userId);
  }

  /**
   * Get producer profile with user info
   */
  async getProfileWithUser(id) {
    return this.query()
      .select('producers.*', 'users.email', 'users.name as userName', 'users.avatar as userAvatar')
      .join('users', 'producers.userId', 'users.id')
      .where('producers.id', id)
      .first();
  }
}

export const ProducerModelInstance = new ProducerModel();
export default ProducerModelInstance;
