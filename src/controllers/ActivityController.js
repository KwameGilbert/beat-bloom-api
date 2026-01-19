import { ActivityService } from '../services/ActivityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Activity Controller
 */
export const ActivityController = {
  /**
   * Toggle like on a beat
   */
  toggleLike: asyncHandler(async (req, res) => {
    const { id: beatId } = req.params;
    const userId = req.user.id;

    const result = await ActivityService.toggleLike(userId, beatId);
    return successResponse(res, result, result.liked ? 'Beat liked' : 'Beat unliked');
  }),

  /**
   * Get user's liked beats
   */
  getLikedBeats: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await ActivityService.getLikedBeats(userId, req.query);
    return successResponse(res, result, 'Liked beats retrieved successfully');
  }),

  /**
   * Record a play
   */
  recordPlay: asyncHandler(async (req, res) => {
    const { id: beatId } = req.params;
    const userId = req.user?.id || null;
    const { duration, sessionId } = req.body;

    const result = await ActivityService.recordPlay(userId, beatId, { duration, sessionId });
    return successResponse(res, result, 'Play recorded successfully');
  }),

  /**
   * Get play history
   */
  getPlayHistory: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await ActivityService.getPlayHistory(userId, req.query);
    return successResponse(res, result, 'Play history retrieved successfully');
  }),
};

export default ActivityController;
