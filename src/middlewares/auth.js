import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Verify JWT token and attach user to request
 * Checks token blacklist for invalidated tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError(error.message));
    } else {
      next(error);
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET);

      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (_error) {
    // Silently continue without user context
    next();
  }
};

/**
 * Require specific roles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError(`Role '${userRole}' is not authorized for this action`));
    }

    next();
  };
};

/**
 * Require user to be a producer
 */
export const requireProducer = async (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'producer' && req.user.role !== 'admin') {
    return next(new ForbiddenError('Only producers can perform this action'));
  }

  next();
};

/**
 * Require user to own the resource or have admin role
 */
export const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);

      if (ownerId !== req.user.id) {
        return next(new ForbiddenError('You do not have permission to access this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require email to be verified
 */
export const requireVerifiedEmail = async (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Import UserModel lazily to avoid circular deps
  const { UserModel } = await import('../models/UserModel.js');
  const user = await UserModel.findById(req.user.id);

  if (!user || !user.emailVerifiedAt) {
    return next(new ForbiddenError('Please verify your email address first'));
  }

  next();
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    subject: String(payload.id),
  });

  let refreshToken = null;
  if (env.JWT_REFRESH_SECRET) {
    refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      subject: String(payload.id),
    });
  }

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new UnauthorizedError('Refresh tokens are not configured');
  }

  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export default {
  authenticate,
  optionalAuth,
  requireRole,
  requireProducer,
  requireOwnership,
  requireVerifiedEmail,
  generateTokens,
  verifyRefreshToken,
};
