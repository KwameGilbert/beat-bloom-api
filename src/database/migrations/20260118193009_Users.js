/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enum('role', ['producer', 'artist', 'admin']).defaultTo('artist').notNullable();
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');

    // Auth & Security
    table.timestamp('emailVerifiedAt');
    table.boolean('mfaEnabled').defaultTo(false);
    table.string('mfaSecret', 255);
    table.jsonb('mfaBackupCodes').defaultTo('[]'); // Backup codes for 2FA
    table.string('passwordResetToken', 255);
    table.timestamp('passwordResetExpires').nullable();
    table.timestamp('lastLoginAt').nullable();

    // User Preferences (from Settings page)
    table.boolean('emailNotifications').defaultTo(true);
    table.boolean('pushNotifications').defaultTo(false);
    table.boolean('publicProfile').defaultTo(true);
    table.string('theme', 20).defaultTo('dark'); // dark/light theme preference

    // Metadata
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.timestamp('deletedAt').nullable(); // Soft delete

    // Indexes
    table.index('email');
    table.index('status');
    table.index('role');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
};
