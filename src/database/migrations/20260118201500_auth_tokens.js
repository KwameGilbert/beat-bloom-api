/**
 * Refresh Tokens and Session Management
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Refresh tokens for JWT authentication
  await knex.schema.createTable('refreshTokens', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.string('deviceInfo', 255); // Browser/device identifier
    table.string('ipAddress', 45);
    table.timestamp('expiresAt').notNullable();
    table.boolean('isRevoked').defaultTo(false);
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('token');
    table.index('expiresAt');
  });

  // Email verification and password reset tokens
  await knex.schema.createTable('authTokens', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.enum('type', ['emailVerification', 'passwordReset', 'mfaSetup']).notNullable();
    table.string('token', 255).notNullable();
    table.timestamp('expiresAt').notNullable();
    table.timestamp('usedAt').nullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index(['type', 'token']);
    table.index('userId');
    table.index('expiresAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('authTokens');
  await knex.schema.dropTableIfExists('refreshTokens');
};
