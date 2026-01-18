import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  pagination: z.object({
    page: z
      .string()
      .optional()
      .transform((v) => parseInt(v) || 1),
    limit: z
      .string()
      .optional()
      .transform((v) => parseInt(v) || 20),
  }),
};

/**
 * Auth validation schemas
 */
export const authSchemas = {
  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
    role: z.enum(['producer', 'artist']).optional().default('artist'),
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
    name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    avatar: z.string().url().optional().nullable(),
    coverImage: z.string().url().optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    website: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
  }),

  updateSettings: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    publicProfile: z.boolean().optional(),
    theme: z.enum(['dark', 'light']).optional(),
  }),

  logout: z.object({
    refreshToken: z.string().optional(),
  }),
};

/**
 * User validation schemas (admin)
 */
export const userSchemas = {
  create: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
    role: z.enum(['producer', 'artist', 'admin']).optional().default('artist'),
    status: z.enum(['active', 'inactive', 'suspended']).optional().default('active'),
  }),

  update: z.object({
    email: z.string().email().optional(),
    name: z.string().min(1).max(100).optional(),
    avatar: z.string().url().optional().nullable(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
  }),

  updateRole: z.object({
    role: z.enum(['producer', 'artist', 'admin']),
  }),

  params: z.object({
    id: z.string().transform((v) => parseInt(v) || v), // Handle both int and uuid
  }),

  listQuery: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
    role: z.enum(['producer', 'artist', 'admin']).optional(),
  }),
};

/**
 * Producer validation schemas
 */
export const producerSchemas = {
  create: z.object({
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    displayName: z.string().min(1).max(100),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional().nullable(),
  }),

  update: z.object({
    displayName: z.string().min(1).max(100).optional(),
    avatar: z.string().url().optional().nullable(),
    coverImage: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional().nullable(),
  }),

  params: z.object({
    id: z.string(),
    username: z.string().optional(),
  }),
};

/**
 * Beat validation schemas
 */
export const beatSchemas = {
  create: z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    bpm: z.number().int().min(40).max(300),
    musicalKey: z.string().max(10),
    genreId: z.number().int().optional(),
    tags: z.array(z.string()).optional().default([]),
    licenseTiers: z
      .array(
        z.object({
          tierType: z.enum(['mp3', 'wav', 'stems', 'exclusive']),
          name: z.string(),
          price: z.number().positive(),
          description: z.string().optional(),
          includedFiles: z.array(z.string()).optional(),
          isExclusive: z.boolean().optional().default(false),
        })
      )
      .optional(),
  }),

  update: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    bpm: z.number().int().min(40).max(300).optional(),
    musicalKey: z.string().max(10).optional(),
    genreId: z.number().int().optional().nullable(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
  }),

  params: z.object({
    id: z.string(),
  }),

  listQuery: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    genreId: z.string().optional(),
    producerId: z.string().optional(),
    minBpm: z.string().optional(),
    maxBpm: z.string().optional(),
    key: z.string().optional(),
    status: z.enum(['draft', 'active', 'archived']).optional(),
    sort: z.enum(['newest', 'popular', 'priceAsc', 'priceDesc']).optional(),
  }),
};

/**
 * Order validation schemas
 */
export const orderSchemas = {
  create: z.object({
    items: z
      .array(
        z.object({
          beatId: z.number().int(),
          licenseTierId: z.number().int(),
        })
      )
      .min(1),
    email: z.string().email(),
  }),

  params: z.object({
    id: z.string(),
  }),
};

/**
 * Playlist validation schemas
 */
export const playlistSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    color: z.string().max(50).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional().default(false),
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().max(50).optional(),
    description: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),

  addBeat: z.object({
    beatId: z.number().int(),
    position: z.number().int().optional(),
  }),

  params: z.object({
    id: z.string(),
  }),
};

export default {
  commonSchemas,
  authSchemas,
  userSchemas,
  producerSchemas,
  beatSchemas,
  orderSchemas,
  playlistSchemas,
};
