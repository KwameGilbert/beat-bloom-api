import express from 'express';
import { UploadController } from '../controllers/UploadController.js';
import { upload } from '../middlewares/upload.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * All uploads require authentication
 */
router.use(authenticate);

/**
 * @route POST /api/upload/single
 */
router.post(
  '/single',
  (req, res, next) => {
    const group = req.query.group || 'general';
    return upload(group).single('file')(req, res, next);
  },
  UploadController.uploadSingle
);

/**
 * @route POST /api/upload/many
 */
router.post(
  '/many',
  (req, res, next) => {
    const group = req.query.group || 'general';
    return upload(group).array('files', 10)(req, res, next);
  },
  UploadController.uploadMany
);

export default router;
