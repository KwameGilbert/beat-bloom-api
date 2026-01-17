import { env } from './env.js';

/**
 * Upload Configuration
 * Simple, centralized upload settings
 */

// Default file size limits (in bytes)
export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024,     // 50MB
  default: 5 * 1024 * 1024,    // 5MB
};

// Allowed MIME types
export const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  all: null, // null means allow all types
};

/**
 * Upload Groups Configuration
 * Add/modify groups as needed for your application
 */
export const uploadGroups = {
  // Default group
  general: {
    types: ALLOWED_TYPES.image,
    maxSize: MAX_FILE_SIZES.default,
  },
  
  // Add your groups here...
  // Example:
  // products: {
  //   types: ALLOWED_TYPES.image,
  //   maxSize: 10 * 1024 * 1024,
  // },
};

/**
 * Get group configuration (returns defaults if group not found)
 */
export const getGroupConfig = (group) => {
  return uploadGroups[group] || uploadGroups.general;
};

/**
 * Detect file category from MIME type
 */
export const detectFileType = (mimetype) => {
  if (ALLOWED_TYPES.image?.includes(mimetype)) return 'image';
  if (ALLOWED_TYPES.document?.includes(mimetype)) return 'document';
  if (ALLOWED_TYPES.video?.includes(mimetype)) return 'video';
  return 'unknown';
};

export default { uploadGroups, getGroupConfig, detectFileType, MAX_FILE_SIZES, ALLOWED_TYPES };
