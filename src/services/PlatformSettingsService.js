import { db } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

// Cache for settings to avoid repeated DB queries
let settingsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Platform Settings Service
 */
export const PlatformSettingsService = {
  /**
   * Get all settings (with caching)
   */
  async getAllSettings() {
    const now = Date.now();

    // Return cached if still valid
    if (settingsCache && now - cacheTimestamp < CACHE_TTL) {
      return settingsCache;
    }

    const settings = await db('platformSettings').select('*');

    // Convert to object with parsed values
    const result = {};
    settings.forEach((setting) => {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    });

    // Update cache
    settingsCache = result;
    cacheTimestamp = now;

    return result;
  },

  /**
   * Get settings by category
   */
  async getByCategory(category) {
    const settings = await db('platformSettings').where('category', category).select('*');

    const result = {};
    settings.forEach((setting) => {
      result[setting.key] = this.parseValue(setting.value, setting.type);
    });

    return result;
  },

  /**
   * Get a single setting value
   */
  async get(key, defaultValue = null) {
    // Try cache first
    if (settingsCache && settingsCache[key] !== undefined) {
      return settingsCache[key];
    }

    const setting = await db('platformSettings').where('key', key).first();

    if (!setting) {
      return defaultValue;
    }

    return this.parseValue(setting.value, setting.type);
  },

  /**
   * Update a setting
   */
  async set(key, value) {
    const existing = await db('platformSettings').where('key', key).first();

    if (!existing) {
      throw new NotFoundError(`Setting '${key}' not found`);
    }

    await db('platformSettings')
      .where('key', key)
      .update({
        value: String(value),
        updatedAt: new Date(),
      });

    // Invalidate cache
    this.invalidateCache();

    return { key, value };
  },

  /**
   * Create a new setting
   */
  async create(key, value, type = 'string', category = 'general', description = '') {
    await db('platformSettings').insert({
      key,
      value: String(value),
      type,
      category,
      description,
    });

    // Invalidate cache
    this.invalidateCache();

    return { key, value, type, category, description };
  },

  /**
   * Delete a setting
   */
  async delete(key) {
    const deleted = await db('platformSettings').where('key', key).del();

    if (deleted > 0) {
      this.invalidateCache();
    }

    return deleted > 0;
  },

  /**
   * Get fee settings (convenience method)
   */
  async getFeeSettings() {
    const settings = await this.getAllSettings();

    return {
      platformCommissionRate: settings.platformCommissionRate || 15,
      processingFeePercentage: settings.processingFeePercentage || 2.9,
      processingFeeFixed: settings.processingFeeFixed || 0.3,
    };
  },

  /**
   * Get payout settings (convenience method)
   */
  async getPayoutSettings() {
    const settings = await this.getAllSettings();

    return {
      minimumPayoutAmount: settings.minimumPayoutAmount || 50,
      payoutFrequency: settings.payoutFrequency || 'weekly',
    };
  },

  /**
   * Calculate fees for a transaction
   */
  async calculateFees(subtotal) {
    const fees = await this.getFeeSettings();

    const processingFee = (subtotal * fees.processingFeePercentage) / 100 + fees.processingFeeFixed;
    const platformFee = (subtotal * fees.platformCommissionRate) / 100;
    const producerEarnings = subtotal - platformFee;

    return {
      subtotal,
      processingFee: Math.round(processingFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      producerEarnings: Math.round(producerEarnings * 100) / 100,
      total: Math.round((subtotal + processingFee) * 100) / 100,
      platformCommissionRate: fees.platformCommissionRate,
    };
  },

  /**
   * Parse value based on type
   */
  parseValue(value, type) {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  },

  /**
   * Invalidate the settings cache
   */
  invalidateCache() {
    settingsCache = null;
    cacheTimestamp = 0;
  },
};

export default PlatformSettingsService;
