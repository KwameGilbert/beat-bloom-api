# Database Configuration Guide

This Express backend template supports **multiple database systems** that can be easily switched via environment variables.

## Supported Databases

| Database           | Client Option | Default Port | Driver Package                |
| ------------------ | ------------- | ------------ | ----------------------------- |
| **PostgreSQL**     | `pg`          | 5432         | `pg` (included) ✅            |
| **MySQL**          | `mysql2`      | 3306         | `mysql2` (install separately) |
| **MySQL** (legacy) | `mysql`       | 3306         | `mysql` (install separately)  |

## Quick Start

### PostgreSQL (Default)

```env
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10
```

### MySQL

First, install the MySQL driver:

```bash
pnpm add mysql2
```

Then configure:

```env
DB_CLIENT=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_NAME=app_db
DB_USER=root
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## Environment Variables

### Required Variables

| Variable      | Description       | Default (PostgreSQL) | Default (MySQL) |
| ------------- | ----------------- | -------------------- | --------------- |
| `DB_CLIENT`   | Database client   | `pg`                 | `mysql2`        |
| `DB_HOST`     | Database host     | `localhost`          | `localhost`     |
| `DB_NAME`     | Database name     | `app_db`             | `app_db`        |
| `DB_USER`     | Database user     | `postgres`           | `root`          |
| `DB_PASSWORD` | Database password | `''`                 | `''`            |

### Optional Variables

| Variable       | Description                                            | Default                            |
| -------------- | ------------------------------------------------------ | ---------------------------------- |
| `DB_PORT`      | Database port                                          | Auto (5432 for pg, 3306 for mysql) |
| `DATABASE_URL` | Full connection string (overrides individual settings) | -                                  |
| `DB_POOL_MIN`  | Minimum connections in pool                            | `2`                                |
| `DB_POOL_MAX`  | Maximum connections in pool                            | `10`                               |

## Connection String (DATABASE_URL)

You can use a full connection string instead of individual variables:

### PostgreSQL

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### MySQL

```env
DATABASE_URL=mysql://user:password@host:3306/database
```

**Note:** If `DATABASE_URL` is set, it takes precedence over individual DB\_\* variables.

## Setup Instructions

### Using Docker (Recommended)

#### PostgreSQL

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  -d postgres:16
```

#### MySQL

```bash
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=app_db \
  -p 3306:3306 \
  -d mysql:8
```

#### Using docker-compose

Your project includes a `docker-compose.yml`:

```bash
# Start PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Local Installation

#### PostgreSQL (Windows)

1. Download from: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Install and remember your password
3. Start service:
   ```bash
   net start postgresql-x64-16
   ```

#### MySQL (Windows)

1. Download from: [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
2. Install and remember your root password
3. Start service:
   ```bash
   net start MySQL80
   ```

## Running Migrations

### Apply Migrations

```bash
# Run all pending migrations
pnpm run migrate

# Create a new migration
pnpm run migrate:make create_your_table_name

# Rollback last migration
pnpm run migrate:rollback
```

### Seeding Database

```bash
# Run all seeds
pnpm run seed

# Create a new seed file
pnpm run seed:make your_seed_name

# Reset database (rollback, migrate, seed)
pnpm run db:reset
```

## Switching Databases

### PostgreSQL → MySQL

1. **Install MySQL driver**:

   ```bash
   pnpm add mysql2
   ```

2. **Update `.env`**:

   ```env
   DB_CLIENT=mysql2
   DB_PORT=3306
   DB_USER=root
   ```

3. **Run migrations**:
   ```bash
   pnpm run migrate
   ```

### MySQL → PostgreSQL

1. **Update `.env`**:

   ```env
   DB_CLIENT=pg
   DB_PORT=5432
   DB_USER=postgres
   ```

2. **Run migrations**:
   ```bash
   pnpm run migrate
   ```

## Database-Specific Features

### MySQL-Specific Configuration

When using MySQL, the following options are automatically applied:

```javascript
{
  charset: 'utf8mb4',  // Full Unicode support (including emojis)
  timezone: 'Z',       // UTC timezone
}
```

### PostgreSQL-Specific Features

PostgreSQL has native support for:

- JSON/JSONB columns
- Arrays
- UUID type
- Full-text search
- More advanced indexing

## Connection Pooling

The template uses connection pooling for better performance:

```env
DB_POOL_MIN=2   # Minimum connections kept alive
DB_POOL_MAX=10  # Maximum connections allowed
```

**Recommendations:**

- **Development**: Min: 2, Max: 10
- **Production**: Min: 5, Max: 20-50 (depending on load)

## Testing Connection

Test your database connection:

```javascript
import { testConnection } from './src/config/database.js';

await testConnection();
// ✅ Database connection established successfully
```

Or start the server (it tests connection automatically):

```bash
pnpm run dev
```

## Troubleshooting

### PostgreSQL

| Error                              | Solution                                      |
| ---------------------------------- | --------------------------------------------- |
| `ECONNREFUSED`                     | PostgreSQL is not running. Start the service. |
| `password authentication failed`   | Check `DB_PASSWORD` in `.env`                 |
| `database "app_db" does not exist` | Create database: `createdb app_db`            |

### MySQL

| Error                                    | Solution                            |
| ---------------------------------------- | ----------------------------------- |
| `ER_ACCESS_DENIED_ERROR`                 | Check `DB_USER` and `DB_PASSWORD`   |
| `ER_BAD_DB_ERROR`                        | Create database manually            |
| `Client does not support authentication` | Update MySQL or use `mysql2` driver |

### General

| Issue                  | Solution                                   |
| ---------------------- | ------------------------------------------ |
| Migrations not running | Check `DB_CLIENT` matches installed driver |
| Connection timeout     | Verify `DB_HOST` and `DB_PORT`             |
| Pool errors            | Adjust `DB_POOL_MIN` and `DB_POOL_MAX`     |

## Best Practices

1. **Use connection pooling** - Already configured ✅
2. **Environment-specific configs** - Use different `.env` files for dev/prod
3. **Secure credentials** - Never commit `.env` to version control
4. **Connection string for production** - Use `DATABASE_URL` in production
5. **Test connections on startup** - Already implemented ✅

## Production Deployment

### Using DATABASE_URL (Recommended)

Most cloud providers (Heroku, Railway, Render) provide a `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
```

The template automatically uses this if provided.

### Using Individual Variables

```env
DB_CLIENT=pg
DB_HOST=your-db-host.example.com
DB_PORT=5432
DB_NAME=production_db
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_POOL_MIN=5
DB_POOL_MAX=20
```

## Migration Best Practices

1. **Always use migrations** - Never modify database manually
2. **Test rollbacks** - Ensure migrations can rollback safely
3. **Version control** - Commit migration files to git
4. **One change per migration** - Keep migrations focused
5. **Descriptive names** - Use clear migration names

Example:

```bash
pnpm run migrate:make create_users_table
pnpm run migrate:make add_email_to_users
pnpm run migrate:make create_posts_table
```

## Further Reading

- [Knex.js Documentation](https://knexjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
