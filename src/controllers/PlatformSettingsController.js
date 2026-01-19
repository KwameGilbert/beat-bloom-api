import { PlatformSettingsService } from '../services/PlatformSettingsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Platform Settings Controller
 */
export const PlatformSettingsController = {
  /**
   * Get all settings (admin only)
   */
  getAllSettings: asyncHandler(async (req, res) => {
    const settings = await PlatformSettingsService.getAllSettings();
    return successResponse(res, settings, 'Settings retrieved successfully');
  }),

  /**
   * Get settings by category
   */
  getByCategory: asyncHandler(async (req, res) => {
    const { category } = req.params;
    const settings = await PlatformSettingsService.getByCategory(category);
    return successResponse(res, settings, 'Settings retrieved successfully');
  }),

  /**
   * Get public fee settings (for checkout display)
   */
  getFeeSettings: asyncHandler(async (req, res) => {
    const settings = await PlatformSettingsService.getFeeSettings();
    return successResponse(res, settings, 'Fee settings retrieved');
  }),

  /**
   * Calculate fees for a given amount
   */
  calculateFees: asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const fees = await PlatformSettingsService.calculateFees(parseFloat(amount) || 0);
    return successResponse(res, fees, 'Fees calculated');
  }),

  /**
   * Update a setting (admin only)
   */
  updateSetting: asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    const result = await PlatformSettingsService.set(key, value);
    return successResponse(res, result, 'Setting updated successfully');
  }),

  /**
   * Create a new setting (admin only)
   */
  createSetting: asyncHandler(async (req, res) => {
    const { key, value, type, category, description } = req.body;
    const result = await PlatformSettingsService.create(key, value, type, category, description);
    return successResponse(res, result, 'Setting created successfully', {}, 201);
  }),

  /**
   * Delete a setting (admin only)
   */
  deleteSetting: asyncHandler(async (req, res) => {
    const { key } = req.params;
    await PlatformSettingsService.delete(key);
    return successResponse(res, null, 'Setting deleted successfully');
  }),
};

export default PlatformSettingsController;
