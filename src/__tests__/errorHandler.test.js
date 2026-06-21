import { jest } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../middlewares/errorHandler.js';

describe('Global Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;
  let originalEnv;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should include stack trace and keep original message in development mode', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Database failed');
    err.stack = 'MockStack: database failed at some line';

    errorHandler(err, mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Database failed',
        stack: 'MockStack: database failed at some line',
      })
    );
  });

  it('should mask error message and exclude stack trace in production mode', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Sensitive DB details here');
    err.stack = 'MockStack: db details';

    errorHandler(err, mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Something went wrong',
      })
    );
    expect(mockRes.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );
  });

  it('should preserve and not mask validation errors (ZodError) in production mode', () => {
    process.env.NODE_ENV = 'production';
    const zodError = new Error('ZodError');
    zodError.name = 'ZodError';
    zodError.issues = [{ path: ['email'], message: 'Invalid email' }];

    errorHandler(zodError, mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email' }],
      })
    );
    expect(mockRes.json.mock.calls[0][0].stack).toBeUndefined();
  });

  it('should map database unique constraints and keep user-friendly message in production mode', () => {
    process.env.NODE_ENV = 'production';
    const pgError = new Error('unique constraint');
    pgError.code = '23505';

    errorHandler(pgError, mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Resource already exists',
      })
    );
    expect(mockRes.json.mock.calls[0][0].stack).toBeUndefined();
  });
});
