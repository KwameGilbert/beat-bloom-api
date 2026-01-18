/**
 * Notifications table for user notifications
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .enum('type', [
        'newSale', // Someone bought your beat
        'newFollower', // Someone followed you
        'beatLiked', // Someone liked your beat
        'payoutCompleted', // Payout was processed
        'newMessage', // New message (future feature)
        'systemAlert', // System notifications
      ])
      .notNullable();
    table.string('title', 255).notNullable();
    table.text('message');
    table.jsonb('data').defaultTo('{}'); // Extra data (beatId, orderId, etc.)
    table.boolean('isRead').defaultTo(false);
    table.timestamp('readAt');
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('isRead');
    table.index('type');
    table.index('createdAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('notifications');
};
