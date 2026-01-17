/**
 * Create audit_logs table for tracking changes
 * @param { import("knex").Knex } knex
 */
export const up = async (knex) => {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 50).notNullable(); // create, update, delete, login, logout, etc.
    table.string('entity_type', 100).notNullable(); // user, etc.
    table.uuid('entity_id');
    table.jsonb('old_values');
    table.jsonb('new_values');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('action');
    table.index('entity_type');
    table.index('entity_id');
    table.index('created_at');
  });
};

/**
 * Drop audit_logs table
 * @param { import("knex").Knex } knex
 */
export const down = async (knex) => {
  await knex.schema.dropTableIfExists('audit_logs');
};
