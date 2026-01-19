import { BeatService } from '../services/BeatService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Beat Controller
 */
export const BeatController = {
  /**
   * List all beats
   */
  list: asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      sort,
      order,
      search,
      genre,
      producer,
      bpmMin,
      bpmMax,
      musicalKey,
      priceMin,
      priceMax,
    } = req.query;

    const result = await BeatService.listBeats({
      page,
      limit,
      sortBy: sort,
      sortOrder: order,
      search,
      filters: { genre, producer, bpmMin, bpmMax, musicalKey, priceMin, priceMax },
    });

    return successResponse(res, result.data, 'Beats retrieved successfully', {
      pagination: result.pagination,
    });
  }),

  /**
   * Get trending beats
   */
  trending: asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const beats = await BeatService.getTrending(limit);
    return successResponse(res, beats, 'Trending beats retrieved successfully');
  }),

  /**
   * Get single beat
   */
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id; // Optional - may be unauthenticated
    const beat = await BeatService.getBeat(id, userId);
    return successResponse(res, beat, 'Beat retrieved successfully');
  }),

  /**
   * Record play
   */
  recordPlay: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await BeatService.recordPlay(id);
    return successResponse(res, null, 'Play recorded successfully');
  }),

  /**
   * Create new beat
   */
  create: asyncHandler(async (req, res) => {
    const producerId = req.user.id; // Assuming userId is producerId or linked
    // We might need to find the producer record if producerId != userId
    const beat = await BeatService.createBeat(producerId, req.body);
    return successResponse(res, beat, 'Beat created successfully', {}, 201);
  }),
};

export default BeatController;
