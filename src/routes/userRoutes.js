import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { userSchemas } from '../validators/schemas.js';
import { validate, validateBody, validateParams, validateQuery } from '../middlewares/validate.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = Router();

/**
 * User Management Routes (Admin only)
 * Base path: /api/v1/users
 *
 * These routes are for admin management of users.
 * Regular users manage their own profile via /auth/me
 */

/**
 * @route GET /users
 * @desc List users with pagination
 * @access Admin only
 */
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validateQuery(userSchemas.listQuery),
  UserController.list
);

/**
 * @route POST /users
 * @desc Create a new user (admin creation)
 * @access Admin only
 */
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validateBody(userSchemas.create),
  UserController.create
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Admin only
 */
router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.getById
);

/**
 * @route PATCH /users/:id
 * @desc Update user
 * @access Admin only
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate({ params: userSchemas.params, body: userSchemas.update }),
  UserController.update
);

/**
 * @route DELETE /users/:id
 * @desc Delete user (soft delete)
 * @access Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.delete
);

/**
 * @route POST /users/:id/restore
 * @desc Restore deleted user
 * @access Admin only
 */
router.post(
  '/:id/restore',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.restore
);

/**
 * @route PATCH /users/:id/role
 * @desc Update user role
 * @access Admin only
 */
router.patch(
  '/:id/role',
  authenticate,
  requireRole('admin'),
  validate({ params: userSchemas.params, body: userSchemas.updateRole }),
  UserController.updateRole
);

/**
 * @route POST /users/:id/activate
 * @desc Activate user
 * @access Admin only
 */
router.post(
  '/:id/activate',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.activate
);

/**
 * @route POST /users/:id/deactivate
 * @desc Deactivate user
 * @access Admin only
 */
router.post(
  '/:id/deactivate',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.deactivate
);

/**
 * @route POST /users/:id/suspend
 * @desc Suspend user
 * @access Admin only
 */
router.post(
  '/:id/suspend',
  authenticate,
  requireRole('admin'),
  validateParams(userSchemas.params),
  UserController.suspend
);

export default router;
