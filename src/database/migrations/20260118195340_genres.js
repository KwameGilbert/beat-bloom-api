/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('genres', (table) => {
    table.increments('id').primary();
    table.string('name', 50).unique().notNullable();
    table.string('slug', 50).unique().notNullable();
    table.string('color', 50); // e.g., 'bg-orange-700/80'
    table.string('scene', 500); 
    table.integer('sortOrder').defaultTo(0);
    table.boolean('isActive').defaultTo(true);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('genres');
};
