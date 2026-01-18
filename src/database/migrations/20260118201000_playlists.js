/**
 * Playlists and Playlist Beats
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Playlists table
  await knex.schema.createTable('playlists', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('color', 50).defaultTo('bg-orange-500'); // CSS class
    table.string('coverImage', 500);
    table.text('description');
    table.boolean('isPublic').defaultTo(false);
    table.integer('beatsCount').defaultTo(0);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
  });

  // Playlist Beats junction table
  await knex.schema.createTable('playlistBeats', (table) => {
    table
      .integer('playlistId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('playlists')
      .onDelete('CASCADE');
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table.integer('position').defaultTo(0);
    table.timestamp('addedAt').defaultTo(knex.fn.now());

    table.primary(['playlistId', 'beatId']);
    table.index('position');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('playlistBeats');
  await knex.schema.dropTableIfExists('playlists');
};
