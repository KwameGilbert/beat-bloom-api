/**
 * Producers - Profile information only
 *
 * Statistics (earnings, sales, plays, likes, followers) are calculated
 * real-time from their source tables:
 * - Earnings → producerEarnings table
 * - Sales → orderItems table
 * - Plays → beats.plays + playHistory
 * - Likes → likes table
 * - Followers → follows table
 *
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

    // Profile information
    table.string('username', 50).notNullable().unique(); // URL slug
    table.string('displayName', 100).notNullable();
    table.string('avatar', 500);
    table.string('coverImage', 500);
    table.text('bio');
    table.string('location', 100);
    table.string('website', 255);

    // Status & settings
    table.boolean('isVerified').defaultTo(false);
    table.boolean('isActive').defaultTo(true);
    
    // Commission - producer's percentage of each sale (platform takes the rest)
    table.decimal('commissionRate', 5, 2).defaultTo(85.0); // 85% to producer

    // Minimum payout threshold
    table.decimal('minimumPayout', 10, 2).defaultTo(50.0);

    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('username');
    table.index('isVerified');
    table.index('isActive');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('producers');
};
