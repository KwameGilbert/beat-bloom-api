/**
 * Payout system - Methods, Earnings, and Payouts
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Payout Methods - producer's bank accounts, PayPal, etc.
  await knex.schema.createTable('payoutMethods', (table) => {
    table.increments('id').primary();
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table.enum('type', ['paypal', 'bankTransfer', 'mobileMoney']).notNullable();
    table.string('accountName', 255);
    table.string('accountIdentifier', 255).notNullable(); // Email, account number, etc.
    table.string('bankName', 255);
    table.string('bankCode', 50);
    table.string('routingNumber', 50);
    table.string('currency', 3).defaultTo('USD');
    table.boolean('isDefault').defaultTo(false);
    table.boolean('isVerified').defaultTo(false);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('producerId');
  });

  // Producer Earnings - tracks earnings per sale
  await knex.schema.createTable('producerEarnings', (table) => {
    table.increments('id').primary();
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table.integer('orderItemId').unsigned().notNullable().references('id').inTable('orderItems');
    table.integer('beatId').unsigned().references('id').inTable('beats');
    table.decimal('grossAmount', 10, 2).notNullable();
    table.decimal('platformFee', 10, 2).notNullable();
    table.decimal('netAmount', 10, 2).notNullable();
    table.enum('status', ['pending', 'available', 'paid', 'refunded']).defaultTo('pending');
    table.timestamp('availableAt'); // When funds become available for payout
    table.timestamp('paidAt');
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('producerId');
    table.index('status');
  });

  // Payouts - withdrawal requests
  await knex.schema.createTable('payouts', (table) => {
    table.increments('id').primary();
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table.integer('payoutMethodId').unsigned().references('id').inTable('payoutMethods');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table
      .enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])
      .defaultTo('pending');
    table.string('transactionReference', 255);
    table.text('notes');
    table.text('failureReason');
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('requestedAt').defaultTo(knex.fn.now());
    table.timestamp('processedAt');
    table.timestamp('completedAt');

    // Indexes
    table.index('producerId');
    table.index('status');
    table.index('requestedAt');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('payouts');
  await knex.schema.dropTableIfExists('producerEarnings');
  await knex.schema.dropTableIfExists('payoutMethods');
};
