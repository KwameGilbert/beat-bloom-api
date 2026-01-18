/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('producers', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('username', 50).notNullable().unique();
    table.string('displayName', 100).notNullable();
    table.string('avatar', 500);
    table.string('coverImage', 500);
    table.text('bio');
    table.string('location', 100);
    table.string('website', 255);
    table.boolean('isVerified').defaultTo(false);
    table.decimal('commissionRate', 5, 2).defaultTo(85.0); // 85% to producer
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('isVerified');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('producers');
};
