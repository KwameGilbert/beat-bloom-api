import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';
import { authSchemas, userSchemas } from '../validators/schemas.js';
import { postDoc, getDoc, patchDoc, generateDocs } from '../utils/routeDoc.js';

/**
 * Auto-generated Route Definitions
 * Define your routes here and documentation is generated automatically
 */
const autoRoutes = [
  // Authentication Routes
  postDoc('/auth/register', {
    summary: 'Register a new user',
    description: 'Create a new user account with email and password',
    tags: ['Authentication'],
    bodySchema: authSchemas.register,
    auth: false,
  }),

  postDoc('/auth/login', {
    summary: 'Login user',
    description: 'Authenticate user and receive JWT tokens',
    tags: ['Authentication'],
    bodySchema: authSchemas.login,
    auth: false,
  }),

  postDoc('/auth/refresh', {
    summary: 'Refresh access token',
    description: 'Get a new access token using refresh token',
    tags: ['Authentication'],
    bodySchema: authSchemas.refreshToken,
    auth: false,
  }),

  getDoc('/auth/me', {
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile information',
    tags: ['Authentication'],
    auth: true,
  }),

  patchDoc('/auth/me', {
    summary: 'Update current user profile',
    description: 'Update the authenticated user profile',
    tags: ['Authentication'],
    bodySchema: authSchemas.updateProfile,
    auth: true,
  }),

  postDoc('/auth/change-password', {
    summary: 'Change password',
    description: 'Change the current user password',
    tags: ['Authentication'],
    bodySchema: authSchemas.changePassword,
    auth: true,
  }),

  postDoc('/auth/forgot-password', {
    summary: 'Request password reset',
    description: 'Send password reset email to user',
    tags: ['Authentication'],
    bodySchema: authSchemas.forgotPassword,
    auth: false,
  }),

  postDoc('/auth/reset-password', {
    summary: 'Reset password with token',
    description: 'Reset password using the reset token from email',
    tags: ['Authentication'],
    bodySchema: authSchemas.resetPassword,
    auth: false,
  }),

  postDoc('/auth/logout', {
    summary: 'Logout user',
    description: 'Invalidate current user session and blacklist token',
    tags: ['Authentication'],
    auth: true,
  }),

  getDoc('/auth/verify-email', {
    summary: 'Verify email address',
    description: 'Verify email using the token sent via email',
    tags: ['Authentication'],
    auth: false,
  }),

  postDoc('/auth/resend-verification', {
    summary: 'Resend verification email',
    description: 'Resend email verification link to user',
    tags: ['Authentication'],
    bodySchema: authSchemas.forgotPassword,
    auth: false,
  }),

  // User Routes
  getDoc('/users', {
    summary: 'List all users',
    description: 'Get a paginated list of all users',
    tags: ['Users'],
    querySchema: userSchemas.listQuery,
    auth: true,
  }),

  postDoc('/users', {
    summary: 'Create new user',
    description: 'Create a new user (admin only)',
    tags: ['Users'],
    bodySchema: userSchemas.create,
    auth: true,
  }),

  getDoc('/users/{id}', {
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by ID',
    tags: ['Users'],
    paramsSchema: userSchemas.params,
    auth: true,
  }),

  patchDoc('/users/{id}', {
    summary: 'Update user',
    description: 'Update a user information',
    tags: ['Users'],
    paramsSchema: userSchemas.params,
    bodySchema: userSchemas.update,
    auth: true,
  }),

  patchDoc('/users/{id}/role', {
    summary: 'Update user role',
    description: 'Change a user role (admin only)',
    tags: ['Users'],
    paramsSchema: userSchemas.params,
    bodySchema: userSchemas.updateRole,
    auth: true,
  }),
];

/**
 * Swagger/OpenAPI Configuration
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: env.APP_NAME || 'Express Backend API',
      version: env.API_VERSION || '1.0.0',
      description: 'Production-ready Express.js backend API with auto-generated documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development server',
      },
      {
        url: `/api/${env.API_VERSION}`,
        description: 'Current environment',
      },
    ],
    // Auto-generated paths from route definitions
    paths: generateDocs(autoRoutes),
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'object',
              nullable: true,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            first_name: {
              type: 'string',
            },
            last_name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['super_admin', 'admin', 'user'],
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
            },
            email_verified_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check and system status endpoints',
      },
    ],
  },
  // Still scan for @swagger comments as fallback
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;
