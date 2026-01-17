/**
 * Create tokens and token_blacklist tables
 * @param { import("knex").Knex } knex
 */
export const up = async (knex) => {
  // Tokens table for verification, password reset, etc.
  await knex.schema.createTable('tokens', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable(); // email_verification, password_reset, etc.
    table.string('token', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['type', 'token']);
    table.index(['user_id', 'type']);
    table.index('expires_at');
  });

  // JWT blacklist table
  await knex.schema.createTable('token_blacklist', (table) => {
    table.uuid('id').primary();
    table.string('token_hash', 64).notNullable().unique(); // SHA256 hash
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('token_hash');
    table.index('expires_at');
  });

  console.log('✅ Created tokens and token_blacklist tables');
};

/**
 * @param { import("knex").Knex } knex
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('token_blacklist');
  await knex.schema.dropTableIfExists('tokens');
  
  console.log('✅ Dropped tokens and token_blacklist tables');
};
