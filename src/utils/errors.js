import { StatusCodes, ReasonPhrases } from 'http-status-codes';

/**
 * Base API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = ReasonPhrases.BAD_REQUEST, errors = null) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message = ReasonPhrases.UNAUTHORIZED) {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message = ReasonPhrases.FORBIDDEN) {
    super(StatusCodes.FORBIDDEN, message);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = ReasonPhrases.NOT_FOUND) {
    super(StatusCodes.NOT_FOUND, message);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = ReasonPhrases.CONFLICT) {
    super(StatusCodes.CONFLICT, message);
  }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = null) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, errors);
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = ReasonPhrases.TOO_MANY_REQUESTS) {
    super(StatusCodes.TOO_MANY_REQUESTS, message);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends ApiError {
  constructor(message = ReasonPhrases.INTERNAL_SERVER_ERROR) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, null, false);
  }
}

export default {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalError,
};
