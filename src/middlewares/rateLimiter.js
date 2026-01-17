import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { env } from '../config/env.js';
import { TooManyRequestsError } from '../utils/errors.js';

/**
 * Get rate limit key - uses ipKeyGenerator for proper IPv6 handling
 */
const getKeyGenerator = (req, res) => {
  // Add user context if authenticated
  if (req.user) {
    return `user:${req.user.id}`;
  }

  // Use the built-in ipKeyGenerator for proper IPv6 handling
  return ipKeyGenerator(req, res);
};

/**
 * Create rate limiter with custom options
 */
export const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    message: { success: false, message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKeyGenerator,
    handler: (req, res, next) => {
      next(new TooManyRequestsError());
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Default rate limiter for general API routes
 */
export const rateLimiter = createRateLimiter();

/**
 * Strict rate limiter for auth routes
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

/**
 * Relaxed rate limiter for read-heavy routes
 */
export const relaxedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
});

/**
 * Speed limiter - slows down requests instead of blocking
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window
  delayMs: (hits) => hits * 100, // Add 100ms delay per request above limit
  maxDelayMs: 2000, // Max 2 second delay
  keyGenerator: getKeyGenerator,
});

export default {
  createRateLimiter,
  rateLimiter,
  authRateLimiter,
  relaxedRateLimiter,
  speedLimiter,
};
