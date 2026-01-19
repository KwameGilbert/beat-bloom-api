import express from 'express';
import { PlatformSettingsController } from '../controllers/PlatformSettingsController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = express.Router();

/**
 * Public routes
 */
// Get fees for checkout display
router.get('/fees', PlatformSettingsController.getFeeSettings);

// Calculate fees for an amount
router.post('/fees/calculate', PlatformSettingsController.calculateFees);

/**
 * Admin routes - require authentication and admin role
 */
// Get all settings
router.get('/', authenticate, requireRole('admin'), PlatformSettingsController.getAllSettings);

// Get settings by category
router.get(
  '/category/:category',
  authenticate,
  requireRole('admin'),
  PlatformSettingsController.getByCategory
);

// Update a setting
router.patch('/:key', authenticate, requireRole('admin'), PlatformSettingsController.updateSetting);

// Create a new setting
router.post('/', authenticate, requireRole('admin'), PlatformSettingsController.createSetting);

// Delete a setting
router.delete(
  '/:key',
  authenticate,
  requireRole('admin'),
  PlatformSettingsController.deleteSetting
);

export default router;
