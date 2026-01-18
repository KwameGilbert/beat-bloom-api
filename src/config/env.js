import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration schema with Zod validation
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DB_CLIENT: z.enum(['pg', 'mysql', 'mysql2']).default('pg'),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .transform((val) => {
      // Default ports based on client
      if (!val) return undefined;
      return Number(val);
    })
    .optional(),
  DB_NAME: z.string().default('app_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_POOL_MIN: z.string().default('2').transform(Number),
  DB_POOL_MAX: z.string().default('10').transform(Number),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Security
  HASH_ALGORITHM: z.enum(['bcrypt', 'scrypt', 'pbkdf2', 'argon2']).default('bcrypt'),
  BCRYPT_ROUNDS: z.string().default('12').transform(Number),
  HASH_KEY_LENGTH: z.string().default('64').transform(Number), // For scrypt and pbkdf2
  HASH_SALT_LENGTH: z.string().default('16').transform(Number), // For scrypt and pbkdf2
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // Upload
  UPLOAD_STRATEGY: z.enum(['local', 'cloudinary']).default('local'),
  UPLOAD_LOCAL_PATH: z.string().default('uploads'),
  UPLOAD_MAX_FILE_SIZE: z.string().default('5242880').transform(Number), // 5MB
  UPLOAD_MAX_IMAGE_SIZE: z.string().default('5242880').transform(Number), // 5MB
  UPLOAD_MAX_DOCUMENT_SIZE: z.string().default('10485760').transform(Number), // 10MB
  UPLOAD_MAX_VIDEO_SIZE: z.string().default('52428800').transform(Number), // 50MB

  // Cloudinary (optional, only needed if using cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('uploads'),

  // Email (SMTP)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_SECURE: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // App
  APP_NAME: z.string().default('Express Backend'),
  APP_URL: z.string().optional(),
  API_VERSION: z.string().default('v1'),
});

/**
 * Parse and validate environment variables
 */
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export default env;
