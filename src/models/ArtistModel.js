import { BaseModel } from './BaseModel.js';

/**
 * Artist Model
 */
class ArtistModel extends BaseModel {
  constructor() {
    super('artists', {
      searchableFields: ['displayName', 'bio', 'location'],
      sortableFields: ['createdAt', 'updatedAt', 'displayName'],
    });
  }

  /**
   * Find artist by userId
   */
  async findByUserId(userId) {
    return this.findBy('userId', userId);
  }
}

export const ArtistModelInstance = new ArtistModel();
export default ArtistModelInstance;
