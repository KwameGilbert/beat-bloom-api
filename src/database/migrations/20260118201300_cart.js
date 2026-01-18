/**
 * Cart Items - Server-side cart for users (optional - can use client-side)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('cartItems', (table) => {
    table.increments('id').primary();
    table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('sessionId', 100); // For guest carts
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table.integer('licenseTierId').unsigned().references('id').inTable('licenseTiers');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('sessionId');
    table.unique(['userId', 'beatId', 'licenseTierId']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('cartItems');
};
