import { db } from '../config/database.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';

/**
 * Health Controller
 */
export class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  static check = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Detailed health check with dependencies
   * GET /health/detailed
   */
  static detailed = asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: env.API_VERSION,
      checks: {},
    };

    // Check database
    try {
      await db.raw('SELECT 1');
      health.checks.database = {
        status: 'healthy',
        responseTime: null,
      };
    } catch (error) {
      health.status = 'unhealthy';
      health.checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
    }

    // Check memory
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      status: 'healthy',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health,
    });
  });

  /**
   * Readiness check (for Kubernetes)
   * GET /health/ready
   */
  static ready = asyncHandler(async (req, res) => {
    try {
      await db.raw('SELECT 1');
      return ApiResponse.success(res, { ready: true });
    } catch (_error) {
      return res.status(503).json({
        success: false,
        data: { ready: false },
        message: 'Service not ready',
      });
    }
  });

  /**
   * Liveness check (for Kubernetes)
   * GET /health/live
   */
  static live = asyncHandler(async (req, res) => {
    return ApiResponse.success(res, { live: true });
  });
}

export default HealthController;
