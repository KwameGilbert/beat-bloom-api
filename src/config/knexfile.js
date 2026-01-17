import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (2 levels up from src/config)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

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
 * Get connection configuration based on database client
 */
const getConnectionConfig = () => {
  const client = process.env.DB_CLIENT || 'pg';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : getDefaultPort(client);

  // If DATABASE_URL is provided, use it
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Build connection object
  const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port,
    user: process.env.DB_USER || (client === 'pg' ? 'postgres' : 'root'),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'app_db',
  };

  // Add MySQL-specific options
  if (client === 'mysql' || client === 'mysql2') {
    return {
      ...baseConfig,
      charset: 'utf8mb4',
      timezone: 'Z',
    };
  }

  return baseConfig;
};

/**
 * Knex configuration file
 * Supports PostgreSQL (pg) and MySQL (mysql/mysql2)
 */
const config = {
  client: process.env.DB_CLIENT || 'pg',
  connection: getConnectionConfig(),
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
  },
  migrations: {
    directory: './../database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './../database/seeds',
  },
};

export default config;
