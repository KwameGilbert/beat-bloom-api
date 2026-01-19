import { GenreModelInstance as GenreModel } from '../models/GenreModel.js';

/**
 * Genre Service
 */
export const GenreService = {
  /**
   * List all active genres
   */
  async listGenres() {
    return GenreModel.findActive();
  },

  /**
   * Get genre by slug
   */
  async getBySlug(slug) {
    return GenreModel.findBy('slug', slug);
  },
};

export default GenreService;
