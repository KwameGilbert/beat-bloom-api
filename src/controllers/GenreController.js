import { GenreService } from '../services/GenreService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Genre Controller
 */
export const GenreController = {
  /**
   * List all genres
   */
  list: asyncHandler(async (req, res) => {
    const genres = await GenreService.listGenres();
    return successResponse(res, genres, 'Genres retrieved successfully');
  }),

  /**
   * Get genre by slug
   */
  get: asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const genre = await GenreService.getBySlug(slug);

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found',
      });
    }

    return successResponse(res, genre, 'Genre retrieved successfully');
  }),
};

export default GenreController;
