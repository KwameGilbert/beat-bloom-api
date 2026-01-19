import { BeatService } from '../services/BeatService.js';
import { ProducerService } from '../services/ProducerService.js';
import { ProducerModelInstance as ProducerModel } from '../models/ProducerModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Producer Controller
 */
export const ProducerController = {
  /**
   * List producers
   */
  list: asyncHandler(async (req, res) => {
    const { page, limit, search, verified } = req.query;

    const result = await ProducerModel.findAll({
      page,
      limit,
      search,
      filters: {
        isVerified: verified === 'true' ? true : undefined,
        isActive: true,
      },
    });

    return successResponse(res, result.data, 'Producers retrieved successfully', {
      pagination: result.pagination,
    });
  }),

  /**
   * Get producer profile by username
   */
  get: asyncHandler(async (req, res) => {
    const { username } = req.params;
    const producer = await ProducerModel.findByUsername(username);

    if (!producer) {
      throw new NotFoundError('Producer not found');
    }

    // Get producer's beats
    const beatsResult = await BeatService.listBeats({
      filters: { producerId: producer.id },
      limit: 10,
    });

    return successResponse(
      res,
      {
        ...producer,
        beats: beatsResult.data,
      },
      'Producer profile retrieved successfully'
    );
  }),

  /**
   * Get producer earnings and stats
   */
  getStats: asyncHandler(async (req, res) => {
    const producerId = req.user.id;
    const stats = await ProducerService.getDashboardStats(producerId);
    return successResponse(res, stats, 'Producer stats retrieved successfully');
  }),

  /**
   * Get payout methods
   */
  getPayoutMethods: asyncHandler(async (req, res) => {
    const producerId = req.user.id;
    const methods = await ProducerService.getPayoutMethods(producerId);
    return successResponse(res, methods, 'Payout methods retrieved successfully');
  }),

  /**
   * Add payout method
   */
  addPayoutMethod: asyncHandler(async (req, res) => {
    const producerId = req.user.id;
    const method = await ProducerService.addPayoutMethod(producerId, req.body);
    return successResponse(res, method, 'Payout method added successfully', {}, 201);
  }),

  /**
   * Delete payout method
   */
  deletePayoutMethod: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const producerId = req.user.id;
    await ProducerService.deletePayoutMethod(producerId, id);
    return successResponse(res, null, 'Payout method deleted successfully');
  }),
};

export default ProducerController;
