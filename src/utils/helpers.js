import crypto from 'crypto';

/**
 * Generate a random string
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a UUID v4
 */
export const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

/**
 * Pick specified keys from an object
 */
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specified keys from an object
 */
export const omit = (obj, keys) => {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Deep merge objects
 */
export const deepMerge = (target, source) => {
  const output = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
};

/**
 * Slugify a string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Parse boolean from string
 */
export const parseBoolean = (value) => {
  if (typeof value === 'boolean') {return value;}
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }
  return Boolean(value);
};

/**
 * Parse pagination parameters
 */
export const parsePagination = (query, defaults = { page: 1, limit: 20 }) => {
  const page = Math.max(1, parseInt(query.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaults.limit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Parse sort parameters
 */
export const parseSort = (
  query,
  allowedFields = [],
  defaults = { field: 'createdAt', order: 'desc' }
) => {
  let field = query.sort_by || query.sortBy || defaults.field;
  let order = (query.sort_order || query.sortOrder || defaults.order).toLowerCase();

  // Validate field
  if (allowedFields.length > 0 && !allowedFields.includes(field)) {
    field = defaults.field;
  }

  // Validate order
  if (!['asc', 'desc'].includes(order)) {
    order = defaults.order;
  }

  return { field, order };
};

/**
 * Mask sensitive data in object
 */
export const maskSensitiveData = (
  obj,
  sensitiveKeys = ['password', 'token', 'secret', 'apiKey']
) => {
  const masked = { ...obj };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key], sensitiveKeys);
    }
  }

  return masked;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {return true;}
  if (typeof value === 'string' && value.trim() === '') {return true;}
  if (Array.isArray(value) && value.length === 0) {return true;}
  if (typeof value === 'object' && Object.keys(value).length === 0) {return true;}
  return false;
};

export default {
  generateRandomString,
  generateUUID,
  sleep,
  retry,
  pick,
  omit,
  deepMerge,
  slugify,
  parseBoolean,
  parsePagination,
  parseSort,
  maskSensitiveData,
  isEmpty,
};
