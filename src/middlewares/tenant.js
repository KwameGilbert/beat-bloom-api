import { env, isMultiTenant } from '../config/env.js';
import { db, getTenantConnection, setTenantSchema } from '../config/database.js';
import { getTenantIdentifier, TenantStrategy } from '../config/tenant.js';
import { TenantNotFoundError, TenantRequiredError, TenantInactiveError } from '../utils/errors.js';
import { logger } from '../config/logger.js';

/**
 * Tenant resolution middleware
 * Resolves tenant from header, subdomain, or JWT and attaches to request
 */
export const resolveTenant = async (req, res, next) => {
  // Skip if multi-tenancy is disabled
  if (!isMultiTenant) {
    req.tenant = null;
    req.db = db;
    return next();
  }

  try {
    const tenantIdentifier = getTenantIdentifier(req);

    if (!tenantIdentifier) {
      throw new TenantRequiredError();
    }

    // Look up tenant in database
    const tenant = await db('tenants')
      .where(function () {
        this.where('id', tenantIdentifier)
          .orWhere('slug', tenantIdentifier)
          .orWhere('subdomain', tenantIdentifier);
      })
      .first();

    if (!tenant) {
      throw new TenantNotFoundError(tenantIdentifier);
    }

    if (tenant.status !== 'active') {
      throw new TenantInactiveError(tenant.id);
    }

    // Attach tenant to request
    req.tenant = tenant;

    // Set up database connection based on strategy
    switch (env.TENANT_STRATEGY) {
      case TenantStrategy.DATABASE:
        req.db = getTenantConnection(tenant.id);
        break;

      case TenantStrategy.SCHEMA:
        req.db = db;
        await setTenantSchema(req.db, tenant.id);
        break;

      case TenantStrategy.ROW:
      default:
        req.db = db;
        break;
    }

    logger.debug({ tenantId: tenant.id, strategy: env.TENANT_STRATEGY }, 'Tenant resolved');

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional tenant resolution - doesn't fail if no tenant
 */
export const optionalTenant = async (req, res, next) => {
  if (!isMultiTenant) {
    req.tenant = null;
    req.db = db;
    return next();
  }

  try {
    const tenantIdentifier = getTenantIdentifier(req);

    if (tenantIdentifier) {
      const tenant = await db('tenants')
        .where(function () {
          this.where('id', tenantIdentifier)
            .orWhere('slug', tenantIdentifier)
            .orWhere('subdomain', tenantIdentifier);
        })
        .first();

      if (tenant && tenant.status === 'active') {
        req.tenant = tenant;

        switch (env.TENANT_STRATEGY) {
          case TenantStrategy.DATABASE:
            req.db = getTenantConnection(tenant.id);
            break;
          case TenantStrategy.SCHEMA:
            req.db = db;
            await setTenantSchema(req.db, tenant.id);
            break;
          default:
            req.db = db;
        }
      } else {
        req.tenant = null;
        req.db = db;
      }
    } else {
      req.tenant = null;
      req.db = db;
    }

    next();
  } catch (error) {
    // Silently continue without tenant context
    req.tenant = null;
    req.db = db;
    next();
  }
};

/**
 * Require tenant to be resolved
 */
export const requireTenant = (req, res, next) => {
  if (!isMultiTenant) {
    return next();
  }

  if (!req.tenant) {
    return next(new TenantRequiredError());
  }

  next();
};

/**
 * Restrict to specific tenant features/plans
 */
export const requireTenantFeature = (feature) => {
  return (req, res, next) => {
    if (!isMultiTenant) {
      return next();
    }

    if (!req.tenant) {
      return next(new TenantRequiredError());
    }

    const tenantFeatures = req.tenant.features || [];

    if (!tenantFeatures.includes(feature)) {
      return next(new ForbiddenError(`Feature '${feature}' is not available for this tenant`));
    }

    next();
  };
};

export default {
  resolveTenant,
  optionalTenant,
  requireTenant,
  requireTenantFeature,
};
