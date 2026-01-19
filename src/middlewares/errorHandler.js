import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../utils/response.js';
import { logger } from '../config/logger.js';
import { isProduction } from '../config/env.js';

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  return ApiResponse.error(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    StatusCodes.NOT_FOUND
  );
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, _next) => {
  // Default error values
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Log the error
  const logContext = {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
  };

  if (req.user) {
    logContext.userId = req.user.id;
  }

  // Log based on error type
  if (statusCode >= 500) {
    logger.error(logContext, 'Server error occurred');
  } else if (statusCode >= 400) {
    logger.warn(logContext, 'Client error occurred');
  }

  // Handle specific error types
  if (err.name === 'ZodError') {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired';
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    statusCode = StatusCodes.CONFLICT;
    message = 'Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Referenced resource does not exist';
  }

  // Handle non-operational errors in production
  if (!err.isOperational && isProduction) {
    message = 'Something went wrong';
    errors = null;
  }

  // Send error response
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default {
  notFoundHandler,
  errorHandler,
};
