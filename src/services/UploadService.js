import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { getGroupConfig, detectFileType } from '../config/upload.js';

/**
 * Upload Service
 * Handles file uploads to local storage or Cloudinary
 */
class UploadService {
  constructor() {
    this.isCloudinary = env.UPLOAD_STRATEGY === 'cloudinary';
    this.baseDir = path.join(process.cwd(), env.UPLOAD_LOCAL_PATH || 'uploads');

    if (this.isCloudinary) {
      cloudinary.v2.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
    }

    this.ensureDir(this.baseDir);
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  generateFilename(originalName) {
    const ext = path.extname(originalName);
    return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  }

  cleanup(filePath) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
  }

  /**
   * Upload a file
   * @param {object} file - Multer file object
   * @param {string} group - Upload group (creates folder: uploads/group/)
   * @param {object} options - Optional settings
   * @returns {Promise<object>} Upload result
   *
   * @example
   * const result = await uploadService.upload(req.file, 'products');
   */
  async upload(file, group = 'general', options = {}) {
    if (!file) throw new Error('No file provided');

    const config = getGroupConfig(group);
    const fileType = detectFileType(file.mimetype);

    // Validate type
    if (config.types && !config.types.includes(file.mimetype)) {
      this.cleanup(file.path);
      throw new Error('File type not allowed');
    }

    // Validate size
    if (file.size > config.maxSize) {
      this.cleanup(file.path);
      throw new Error(`File too large. Max: ${(config.maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    try {
      if (this.isCloudinary) {
        return await this.uploadToCloudinary(file, group, options);
      }
      return await this.uploadToLocal(file, group);
    } catch (error) {
      this.cleanup(file.path);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMany(files, group = 'general', options = {}) {
    return Promise.all(files.map((f) => this.upload(f, group, options)));
  }

  async uploadToLocal(file, group) {
    const groupDir = path.join(this.baseDir, group);
    this.ensureDir(groupDir);

    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(groupDir, filename);

    fs.renameSync(file.path, filePath);

    return {
      success: true,
      url: `/${env.UPLOAD_LOCAL_PATH || 'uploads'}/${group}/${filename}`,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      type: detectFileType(file.mimetype),
      group,
      storage: 'local',
    };
  }

  async uploadToCloudinary(file, group, options = {}) {
    const folder = `${env.CLOUDINARY_FOLDER || 'uploads'}/${group}`;

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
      ...options,
    });

    this.cleanup(file.path);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      filename: result.public_id.split('/').pop(),
      originalName: file.originalname,
      size: result.bytes,
      mimetype: file.mimetype,
      type: detectFileType(file.mimetype),
      group,
      storage: 'cloudinary',
    };
  }

  /**
   * Delete a file
   */
  async delete(identifier, group = null) {
    if (this.isCloudinary) {
      const result = await cloudinary.v2.uploader.destroy(identifier);
      return { success: result.result === 'ok' };
    }

    const filePath = identifier.startsWith('/')
      ? path.join(process.cwd(), identifier.slice(1))
      : path.join(this.baseDir, group || '', identifier);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, message: 'File not found' };
  }
}

// Export singleton
export const uploadService = new UploadService();

// Shorthand exports
export const upload = (file, group, opts) => uploadService.upload(file, group, opts);
export const uploadMany = (files, group, opts) => uploadService.uploadMany(files, group, opts);
export const deleteFile = (id, group) => uploadService.delete(id, group);

export default uploadService;
