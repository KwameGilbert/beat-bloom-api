/**
 * License Tiers for beats (MP3 Lease, WAV Lease, Stems, Exclusive)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('licenseTiers', (table) => {
    table.increments('id').primary();
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table.enum('tierType', ['mp3', 'wav', 'stems', 'exclusive']).notNullable();
    table.string('name', 100).notNullable(); // e.g., 'MP3 Lease', 'WAV Lease', 'Trackout'
    table.decimal('price', 10, 2).notNullable();
    table.text('description');
    table.jsonb('includedFiles').defaultTo('[]'); // ['Tagged MP3 File', 'High-Quality WAV']
    table.boolean('isExclusive').defaultTo(false); // Beat removed after sale
    table.boolean('isEnabled').defaultTo(true);
    table.integer('sortOrder').defaultTo(0);
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('beatId');
    table.unique(['beatId', 'tierType']); // One tier type per beat
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('licenseTiers');
};
