/**
 * Social Features - Likes, Follows, Play History
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Likes table - users liking beats
  await knex.schema.createTable('likes', (table) => {
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    table.primary(['userId', 'beatId']);
    table.index('beatId');
  });

  // Follows table - users following producers
  await knex.schema.createTable('follows', (table) => {
    table
      .integer('followerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    table.primary(['followerId', 'producerId']);
    table.index('producerId');
  });

  // Play History - tracks what users have played recently
  await knex.schema.createTable('playHistory', (table) => {
    table.increments('id').primary();
    table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE'); // Nullable for guests
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table.string('sessionId', 100); // For guest tracking
    table.timestamp('playedAt').defaultTo(knex.fn.now());
    table.integer('playDurationSeconds'); // How long they listened

    // Indexes
    table.index('userId');
    table.index('beatId');
    table.index('playedAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('playHistory');
  await knex.schema.dropTableIfExists('follows');
  await knex.schema.dropTableIfExists('likes');
};
