import { StatusCodes } from 'http-status-codes';

/**
 * Standard API response formatter
 */
export class ApiResponse {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = StatusCodes.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, StatusCodes.CREATED);
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasMore: pagination.page * pagination.limit < pagination.total,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error response
   */
  static error(res, message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }
}

export default ApiResponse;
