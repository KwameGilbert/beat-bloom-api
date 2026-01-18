/**
 * Orders and Order Items for beat purchases
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Orders table (header)
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('userId').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.string('orderNumber', 50).unique().notNullable();
    table.string('email', 255).notNullable(); // Buyer email
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('processingFee', 10, 2).defaultTo(0);
    table.decimal('total', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table
      .enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])
      .defaultTo('pending');
    table.string('paymentProvider', 50); // 'paystack', 'stripe'
    table.string('paymentReference', 255); // Transaction ref from provider
    table.jsonb('paymentMetadata').defaultTo('{}');
    table.timestamp('paidAt');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('userId');
    table.index('orderNumber');
    table.index('status');
    table.index('paymentReference');
  });

  // Order Items table (line items)
  await knex.schema.createTable('orderItems', (table) => {
    table.increments('id').primary();
    table
      .integer('orderId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table
      .integer('beatId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('beats')
      .onDelete('RESTRICT');
    table
      .integer('licenseTierId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('licenseTiers');
    table.integer('producerId').unsigned().notNullable().references('id').inTable('producers');
    table.string('beatTitle', 255).notNullable(); // Snapshot at time of purchase
    table.string('licenseName', 100).notNullable(); // Snapshot
    table.decimal('price', 10, 2).notNullable();
    table.decimal('producerEarnings', 10, 2).notNullable(); // After platform cut
    table.decimal('platformFee', 10, 2).notNullable();
    table.boolean('isExclusive').defaultTo(false);
    table.timestamp('downloadExpiresAt'); // Optional download expiry
    table.integer('downloadCount').defaultTo(0);
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('orderId');
    table.index('beatId');
    table.index('producerId');
  });

  // User Purchases - quick lookup for user's purchased beats
  await knex.schema.createTable('userPurchases', (table) => {
    table.increments('id').primary();
    table
      .integer('userId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('beatId').unsigned().notNullable().references('id').inTable('beats');
    table.integer('orderItemId').unsigned().notNullable().references('id').inTable('orderItems');
    table
      .integer('licenseTierId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('licenseTiers');
    table.string('licenseType', 20).notNullable(); // mp3, wav, stems, exclusive
    table.timestamp('purchasedAt').defaultTo(knex.fn.now());

    // Indexes
    table.unique(['userId', 'beatId', 'licenseTierId']); // Prevent duplicate purchases of same tier
    table.index('userId');
    table.index('beatId');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('userPurchases');
  await knex.schema.dropTableIfExists('orderItems');
  await knex.schema.dropTableIfExists('orders');
};
