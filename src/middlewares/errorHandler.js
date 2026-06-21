import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../utils/response.js';
import { logger } from '../config/logger.js';

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
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = (err.errors || err.issues || []).map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    err.isOperational = true;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
    err.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired';
    err.isOperational = true;
  }

  // Database unique constraint / duplicate entry errors (PostgreSQL / MySQL)
  if (err.code === '23505' || err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
    statusCode = StatusCodes.CONFLICT;
    message = 'Resource already exists';
    err.isOperational = true;
  }

  // Database foreign key constraint errors (PostgreSQL / MySQL)
  if (err.code === '23503' || err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Referenced resource does not exist';
    err.isOperational = true;
  }

  // Include stack trace only in development
  const isDev = process.env.NODE_ENV === 'development';

  // Handle non-operational errors or server errors in non-development environments
  if ((!err.isOperational || statusCode >= 500) && !isDev) {
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

  // Include stack trace only in development
  if (isDev && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default {
  notFoundHandler,
  errorHandler,
};
