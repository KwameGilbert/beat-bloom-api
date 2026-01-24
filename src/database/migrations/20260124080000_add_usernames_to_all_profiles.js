/**
 * Add username to artists and admins tables
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Add to artists
  await knex.schema.alterTable('artists', (table) => {
    table.string('username', 50).unique();
    table.index('username');
  });

  // Add to admins
  await knex.schema.alterTable('admins', (table) => {
    table.string('username', 50).unique();
    table.index('username');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('admins', (table) => {
    table.dropColumn('username');
  });

  await knex.schema.alterTable('artists', (table) => {
    table.dropColumn('username');
  });
};
