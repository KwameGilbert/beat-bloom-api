import knex from 'knex';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Get default port based on database client
 */
const getDefaultPort = (client) => {
  switch (client) {
    case 'mysql':
    case 'mysql2':
      return 3306;
    case 'pg':
    default:
      return 5432;
  }
};

/**
 * Get database configuration
 * Supports PostgreSQL (pg) and MySQL (mysql/mysql2)
 */
const getConfig = () => {
  const client = env.DB_CLIENT || 'pg';
  const port = env.DB_PORT || getDefaultPort(client);

  // Build base connection config
  const baseConnection = {
    host: env.DB_HOST,
    port,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  };

  // Add MySQL-specific options
  const connection = (client === 'mysql' || client === 'mysql2')
    ? {
        ...baseConnection,
        charset: 'utf8mb4',
        timezone: 'Z',
      }
    : baseConnection;

  return {
    client,
    connection: env.DATABASE_URL || connection,
    pool: {
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
    acquireConnectionTimeout: 10000,
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  };
};

/**
 * Create database connection
 */
export const db = knex(getConfig());

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info({
      client: env.DB_CLIENT,
      host: env.DB_HOST,
      database: env.DB_NAME,
    }, 'Database connection established successfully');
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to connect to database');
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeConnections = async () => {
  await db.destroy();
  logger.info('Database connection closed');
};

export default db;
