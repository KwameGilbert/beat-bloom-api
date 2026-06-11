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
   * Find producer by userId, creating the profile record if user has role producer
   */
  async findByUserIdOrCreate(userId) {
    let producer = await this.findByUserId(userId);
    if (!producer) {
      const { UserModel } = await import('./UserModel.js');
      const user = await UserModel.findById(userId);
      if (user && user.role === 'producer') {
        const baseUsername =
          user.email
            .split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '') + Math.floor(1000 + Math.random() * 9000);
        producer = await this.create({
          userId,
          username: baseUsername,
          displayName: user.name || 'Producer',
          isVerified: false,
          isActive: true,
        });
      }
    }
    return producer;
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
