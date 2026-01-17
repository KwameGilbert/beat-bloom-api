import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  pagination: z.object({
    page: z.string().optional().transform((v) => parseInt(v) || 1),
    limit: z.string().optional().transform((v) => parseInt(v) || 20),
  }),
};

/**
 * Auth validation schemas
 */
export const authSchemas = {
  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    role: z.enum(['user', 'admin']).optional().default('user'),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  updateProfile: z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    avatar: z.string().url().optional().nullable(),
  }),
};

/**
 * User validation schemas
 */
export const userSchemas = {
  create: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    role: z.enum(['user', 'admin', 'super_admin']).optional().default('user'),
    status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  }),

  update: z.object({
    email: z.string().email().optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    avatar: z.string().url().optional().nullable(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),

  updateRole: z.object({
    role: z.enum(['user', 'admin', 'super_admin']),
  }),

  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),

  listQuery: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    role: z.enum(['user', 'admin', 'super_admin']).optional(),
  }),
};

export default {
  commonSchemas,
  authSchemas,
  userSchemas,
};
