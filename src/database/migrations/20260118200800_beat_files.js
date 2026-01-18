/**
 * Beat Files - stores uploaded audio files (preview, master, stems)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('beatFiles', (table) => {
    table.increments('id').primary();
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('CASCADE');
    table
      .enum('fileType', ['preview', 'masterMp3', 'masterWav', 'stems', 'projectFiles'])
      .notNullable();
    table.string('fileName', 255).notNullable();
    table.string('filePath', 500).notNullable();
    table.string('mimeType', 100);
    table.bigInteger('fileSize'); // bytes
    table.string('storageProvider', 50).defaultTo('local'); // 's3', 'cloudinary', etc.
    table.boolean('isPublic').defaultTo(false); // Only preview is public
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('beatId');
    table.index('fileType');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('beatFiles');
};
