/**
 * Create users table
 * @param { import("knex").Knex } knex
 */
export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('phone', 20);
    table.string('avatar', 500);
    table.enum('role', ['user', 'admin', 'super_admin']).defaultTo('user');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.jsonb('metadata').defaultTo('{}');
    table.string('password_reset_token', 255);
    table.timestamp('password_reset_expires');
    table.timestamp('email_verified_at');
    table.timestamp('last_login_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');

    // Indexes
    table.index('role');
    table.index('status');
    table.index('deleted_at');
  });
};

/**
 * Drop users table
 * @param { import("knex").Knex } knex
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
};
