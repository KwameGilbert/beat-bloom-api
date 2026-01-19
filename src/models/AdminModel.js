import { BaseModel } from './BaseModel.js';

/**
 * Admin Model
 */
class AdminModel extends BaseModel {
  constructor() {
    super('admins', {
      searchableFields: ['displayName', 'bio'],
      sortableFields: ['createdAt', 'updatedAt', 'displayName'],
    });
  }

  /**
   * Find admin by userId
   */
  async findByUserId(userId) {
    return this.findBy('userId', userId);
  }
}

export const AdminModelInstance = new AdminModel();
export default AdminModelInstance;
