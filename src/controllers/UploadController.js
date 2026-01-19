import { uploadService } from '../services/UploadService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * Upload Controller
 */
export const UploadController = {
  /**
   * Upload single file
   */
  uploadSingle: asyncHandler(async (req, res) => {
    const { group } = req.query;
    const result = await uploadService.upload(req.file, group || 'general');
    return successResponse(res, result, 'File uploaded successfully');
  }),

  /**
   * Upload multiple files
   */
  uploadMany: asyncHandler(async (req, res) => {
    const { group } = req.query;
    const result = await uploadService.uploadMany(req.files, group || 'general');
    return successResponse(res, result, 'Files uploaded successfully');
  }),
};

export default UploadController;
