import { BeatService } from '../services/BeatService.js';
import { ProducerModelInstance as ProducerModel } from '../models/ProducerModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

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
    const producer = await ProducerModel.findByUserId(req.user.id);
    if (!producer) {
      throw new NotFoundError('Producer profile not found');
    }
    const beat = await BeatService.createBeat(producer.id, req.body);
    return successResponse(res, beat, 'Beat created successfully', {}, 201);
  }),

  /**
   * Get authenticated producer's beat catalog
   */
  getMyBeats: asyncHandler(async (req, res) => {
    const producer = await ProducerModel.findByUserId(req.user.id);
    if (!producer) {
      throw new NotFoundError('Producer profile not found');
    }
    const beats = await BeatService.getProducerCatalog(producer.id);
    return successResponse(res, beats, 'Producer beats retrieved successfully');
  }),

  /**
   * Update beat details (Producer only)
   */
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const producer = await ProducerModel.findByUserId(req.user.id);
    if (!producer) {
      throw new NotFoundError('Producer profile not found');
    }
    const beat = await BeatService.updateBeat(id, producer.id, req.body);
    return successResponse(res, beat, 'Beat updated successfully');
  }),

  /**
   * Soft delete a beat (Producer only)
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const producer = await ProducerModel.findByUserId(req.user.id);
    if (!producer) {
      throw new NotFoundError('Producer profile not found');
    }
    await BeatService.deleteBeat(id, producer.id);
    return successResponse(res, null, 'Beat deleted successfully');
  }),
};

export default BeatController;
