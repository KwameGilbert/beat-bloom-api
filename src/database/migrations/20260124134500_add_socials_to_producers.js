/**
 * Add social links to producers table to match artists table
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('producers', (table) => {
    table.string('twitter', 255);
    table.string('instagram', 255);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('producers', (table) => {
    table.dropColumn('instagram');
    table.dropColumn('twitter');
  });
};
