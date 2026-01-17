import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { userSchemas } from '../validators/schemas.js';
import { validate, validateBody, validateParams, validateQuery } from '../middlewares/validate.js';
import { authenticate, requireRole } from '../middlewares/auth.js';

const router = Router();

/**
 * User Management Routes
 * All routes require authentication and admin role
 */

/**
 * @route GET /users
 * @desc List users
 * @access Admin
 */
router.get(
  '/',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateQuery(userSchemas.listQuery),
  UserController.list
);

/**
 * @route POST /users
 * @desc Create a new user
 * @access Admin
 */
router.post(
  '/',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateBody(userSchemas.create),
  UserController.create
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Admin
 */
router.get(
  '/:id',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.getById
);

/**
 * @route PATCH /users/:id
 * @desc Update user
 * @access Admin
 */
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'super_admin'),
  validate({ params: userSchemas.params, body: userSchemas.update }),
  UserController.update
);

/**
 * @route DELETE /users/:id
 * @desc Delete user
 * @access Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.delete
);

/**
 * @route POST /users/:id/restore
 * @desc Restore deleted user
 * @access Admin
 */
router.post(
  '/:id/restore',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.restore
);

/**
 * @route PATCH /users/:id/role
 * @desc Update user role
 * @access Super Admin only
 */
router.patch(
  '/:id/role',
  authenticate,
  requireRole('super_admin'),
  validate({ params: userSchemas.params, body: userSchemas.updateRole }),
  UserController.updateRole
);

/**
 * @route POST /users/:id/activate
 * @desc Activate user
 * @access Admin
 */
router.post(
  '/:id/activate',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.activate
);

/**
 * @route POST /users/:id/deactivate
 * @desc Deactivate user
 * @access Admin
 */
router.post(
  '/:id/deactivate',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.deactivate
);

/**
 * @route POST /users/:id/suspend
 * @desc Suspend user
 * @access Admin
 */
router.post(
  '/:id/suspend',
  authenticate,
  requireRole('admin', 'super_admin'),
  validateParams(userSchemas.params),
  UserController.suspend
);

export default router;
