/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('beats', (table) => {
    table.increments('id').primary();
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table.integer('genreId').unsigned().references('id').inTable('genres').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.text('description');
    table.integer('bpm').notNullable();
    table.string('musicalKey', 10).notNullable(); // e.g., 'Am', 'Cm', 'Gm'
    table.string('duration', 10); // e.g., '3:45'
    table.integer('durationSeconds');
    table.string('coverImage', 500);
    table.string('previewAudioUrl', 500); // Public tagged MP3
    table.jsonb('tags').defaultTo('[]'); // Array of tag strings e.g., ["Trap", "Dark", "Melodic"]
    table.integer('playsCount').defaultTo(0);
    table.integer('likesCount').defaultTo(0);
    table.boolean('isExclusiveSold').defaultTo(false); // Removed after exclusive sale
    table.enum('status', ['draft', 'active', 'archived', 'soldExclusive']).defaultTo('draft');
    table.boolean('isFeatured').defaultTo(false);
    table.jsonb('metadata').defaultTo('{}'); // Extra data
    table.timestamp('publishedAt');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.timestamp('deletedAt'); // Soft delete

    // Indexes
    table.unique(['producerId', 'slug']);
    table.index('producerId');
    table.index('genreId');
    table.index('status');
    table.index('isFeatured');
    table.index('playsCount');
    table.index('publishedAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('beats');
};
