import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parsePagination } from '../utils/helpers.js';

/**
 * User Controller
 */
export class UserController {
  /**
   * List users
   * GET /users
   */
  static list = asyncHandler(async (req, res) => {
    const pagination = parsePagination(req.query);
    const result = await UserService.list({
      ...pagination,
      search: req.query.search,
      filters: {
        status: req.query.status,
        role: req.query.role,
      },
    });

    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * Get user by ID
   * GET /users/:id
   */
  static getById = asyncHandler(async (req, res) => {
    const user = await UserService.getById(req.params.id);

    return ApiResponse.success(res, user);
  });

  /**
   * Create a new user
   * POST /users
   */
  static create = asyncHandler(async (req, res) => {
    const user = await UserService.create(req.body);

    return ApiResponse.created(res, user, 'User created successfully');
  });

  /**
   * Update user
   * PATCH /users/:id
   */
  static update = asyncHandler(async (req, res) => {
    const user = await UserService.update(req.params.id, req.body);

    return ApiResponse.success(res, user, 'User updated successfully');
  });

  /**
   * Delete user
   * DELETE /users/:id
   */
  static delete = asyncHandler(async (req, res) => {
    await UserService.delete(req.user, req.params.id);

    return ApiResponse.success(res, null, 'User deleted successfully');
  });

  /**
   * Restore user
   * POST /users/:id/restore
   */
  static restore = asyncHandler(async (req, res) => {
    const user = await UserService.restore(req.params.id);

    return ApiResponse.success(res, user, 'User restored successfully');
  });

  /**
   * Update user role
   * PATCH /users/:id/role
   */
  static updateRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await UserService.updateRole(req.params.id, role);

    return ApiResponse.success(res, user, 'User role updated successfully');
  });

  /**
   * Activate user
   * POST /users/:id/activate
   */
  static activate = asyncHandler(async (req, res) => {
    const user = await UserService.activate(req.params.id);

    return ApiResponse.success(res, user, 'User activated successfully');
  });

  /**
   * Deactivate user
   * POST /users/:id/deactivate
   */
  static deactivate = asyncHandler(async (req, res) => {
    const user = await UserService.deactivate(req.params.id);

    return ApiResponse.success(res, user, 'User deactivated successfully');
  });

  /**
   * Suspend user
   * POST /users/:id/suspend
   */
  static suspend = asyncHandler(async (req, res) => {
    const user = await UserService.suspend(req.params.id);

    return ApiResponse.success(res, user, 'User suspended successfully');
  });
}

export default UserController;
