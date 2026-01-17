/**
 * Create tenants table
 * @param { import("knex").Knex } knex
 */
export const up = async (knex) => {
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('slug', 100).unique().notNullable();
    table.string('subdomain', 100).unique();
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.jsonb('settings').defaultTo('{}');
    table.jsonb('features').defaultTo('[]');
    table.string('plan', 50).defaultTo('free');
    table.timestamp('trial_ends_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at');

    // Indexes
    table.index('slug');
    table.index('subdomain');
    table.index('status');
    table.index('deleted_at');
  });
};

/**
 * Drop tenants table
 * @param { import("knex").Knex } knex
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('tenants');
};
