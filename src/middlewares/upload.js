import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getGroupConfig } from '../config/upload.js';

// Temp directory
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

/**
 * Create upload middleware for a group
 * @param {string} group - Upload group name
 * @returns {multer} Multer instance
 *
 * @example
 * router.post('/upload', upload('products').single('file'), handler);
 */
export const upload = (group = 'general') => {
  const config = getGroupConfig(group);

  return multer({
    storage,
    limits: { fileSize: config.maxSize },
    fileFilter: (req, file, cb) => {
      // If types is null, allow all
      if (!config.types) return cb(null, true);

      if (config.types.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'), false);
      }
    },
  });
};

export default upload;
