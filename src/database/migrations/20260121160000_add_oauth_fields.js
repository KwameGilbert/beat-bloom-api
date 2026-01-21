/**
 * Add OAuth provider fields to users table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    // Google OAuth
    table.string('googleId', 255).unique();

    // Generic OAuth fields for future providers
    table.string('authProvider', 50).defaultTo('local'); // 'local', 'google', 'discord', etc.

    // Make password nullable for OAuth users (they don't have passwords)
    table.string('password', 255).nullable().alter();
  });

  // Add index for googleId lookups
  await knex.schema.alterTable('users', (table) => {
    table.index('googleId');
    table.index('authProvider');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('googleId');
    table.dropIndex('authProvider');
    table.dropColumn('googleId');
    table.dropColumn('authProvider');
    // Note: Can't easily revert password to notNullable
  });
};
