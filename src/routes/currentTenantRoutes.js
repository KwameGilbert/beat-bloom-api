import { Router } from 'express';
import { TenantController } from '../controllers/TenantController.js';
import { tenantSchemas } from '../validators/schemas.js';
import { validateBody } from '../middlewares/validate.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { requireTenant } from '../middlewares/tenant.js';
import { isMultiTenant } from '../config/env.js';
import { BadRequestError } from '../utils/errors.js';

const router = Router();

/**
 * Middleware to check if multi-tenancy is enabled
 */
const requireMultiTenant = (req, res, next) => {
  if (!isMultiTenant) {
    return next(new BadRequestError('Multi-tenancy is not enabled'));
  }
  next();
};

// All current tenant routes require multi-tenancy to be enabled
router.use(requireMultiTenant);

/**
 * Current Tenant Routes - For tenant admins to manage their own tenant
 * Base path: /api/v1/tenant
 */

/**
 * @route GET /tenant
 * @desc Get current tenant info
 * @access Tenant Admin
 */
router.get(
  '/',
  authenticate,
  requireTenant,
  requireRole('admin', 'super_admin'),
  TenantController.getCurrentTenant
);

/**
 * @route PATCH /tenant
 * @desc Update current tenant
 * @access Tenant Admin
 */
router.patch(
  '/',
  authenticate,
  requireTenant,
  requireRole('admin', 'super_admin'),
  validateBody(tenantSchemas.update),
  TenantController.updateCurrentTenant
);

export default router;
