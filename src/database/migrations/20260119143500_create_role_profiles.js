/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Artists Table
  await knex.schema.createTable('artists', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('displayName', 100).notNullable();
    table.string('avatar', 500);
    table.string('coverImage', 500);
    table.text('bio');
    table.string('location', 100);
    table.string('website', 255);
    table.string('twitter', 255);
    table.string('instagram', 255);

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.index('userId');
  });

  // Admins Table
  await knex.schema.createTable('admins', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('displayName', 100).notNullable();
    table.string('avatar', 500);
    table.text('bio');

    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.index('userId');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('admins');
  await knex.schema.dropTableIfExists('artists');
};
