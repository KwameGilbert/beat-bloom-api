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
router.post('/single', upload('general').single('file'), UploadController.uploadSingle);

/**
 * @route POST /api/upload/many
 */
router.post('/many', upload('general').array('files', 10), UploadController.uploadMany);

export default router;
