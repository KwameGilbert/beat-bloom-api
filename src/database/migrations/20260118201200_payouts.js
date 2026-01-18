/**
 * Payout system - Methods, Earnings, and Payouts
 *
 * All aggregate statistics (total earnings, available balance, etc.)
 * are calculated real-time from this data, not cached.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // ==========================================
  // PAYOUT METHODS
  // ==========================================
  // Producer's connected accounts for receiving payments
  await knex.schema.createTable('payoutMethods', (table) => {
    table.increments('id').primary();
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');

    // Method type
    table
      .enum('type', [
        'paypal',
        'bank', // Bank transfer
        'mobileMoney', // M-Pesa, MTN, etc.
        'payoneer',
      ])
      .notNullable();

    // Account details (should be encrypted in production)
    table.jsonb('details').defaultTo('{}'); // { email, bankName, accountNumber, etc. }
    table.string('currency', 3).defaultTo('USD');
    table.string('country', 2); // ISO country code

    // Status
    table.boolean('isDefault').defaultTo(false);
    table.boolean('isVerified').defaultTo(false);
    table.timestamp('verifiedAt');

    // Timestamps
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    // Indexes
    table.index('producerId');
    table.index(['producerId', 'isDefault']);
  });

  // ==========================================
  // PRODUCER EARNINGS
  // ==========================================
  // Individual earnings per sale - SOURCE OF TRUTH for all earnings calculations
  //
  // To get producer's current balance, query:
  //   SELECT SUM(netAmount) FROM producerEarnings WHERE producerId = ? AND status = 'available'
  //
  await knex.schema.createTable('producerEarnings', (table) => {
    table.increments('id').primary();

    // Links
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');
    table
      .integer('orderId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orders')
      .onDelete('CASCADE');
    table
      .integer('orderItemId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('orderItems')
      .onDelete('CASCADE');
    table.integer('beatId').unsigned().references('id').inTable('beats').onDelete('SET NULL');

    // Financial data
    table.decimal('grossAmount', 10, 2).notNullable(); // Original sale price
    table.decimal('platformFee', 10, 2).notNullable(); // Platform cut
    table.decimal('netAmount', 10, 2).notNullable(); // Producer receives
    table.string('currency', 3).defaultTo('USD');

    // Earnings status lifecycle
    table
      .enum('status', [
        'pending', // Sale completed, in holding period (e.g., 7 days)
        'available', // Cleared, can be withdrawn
        'processing', // Payout in progress
        'paid', // Successfully withdrawn
        'refunded', // Order was refunded
      ])
      .defaultTo('pending');

    // Payout reference (set when withdrawn)
    table.integer('payoutId').unsigned();

    // Timing
    table.timestamp('availableAt'); // When funds become available for withdrawal
    table.timestamp('paidAt'); // When actually paid out
    table.timestamp('createdAt').defaultTo(knex.fn.now());

    // Indexes for efficient queries
    table.index('producerId');
    table.index('orderId');
    table.index('status');
    table.index(['producerId', 'status']); // For balance calculations
    table.index('createdAt'); // For date range queries
  });

  // ==========================================
  // PAYOUTS (WITHDRAWALS)
  // ==========================================
  // Withdrawal requests from producers
  await knex.schema.createTable('payouts', (table) => {
    table.increments('id').primary();

    // Producer making the withdrawal
    table
      .integer('producerId')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('producers')
      .onDelete('CASCADE');

    // Where to send the money
    table
      .integer('payoutMethodId')
      .unsigned()
      .references('id')
      .inTable('payoutMethods')
      .onDelete('SET NULL');

    // Payout details
    table.string('payoutNumber', 50).unique(); // BB-PO-2026-0001
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');

    // Status
    table
      .enum('status', [
        'pending', // Requested, awaiting processing
        'processing', // Being processed
        'completed', // Successfully sent
        'failed', // Transfer failed
        'cancelled', // Cancelled by producer or admin
      ])
      .defaultTo('pending');

    // Transaction details
    table.string('transactionReference', 255);
    table.string('paymentProvider', 50);
    table.jsonb('providerResponse').defaultTo('{}');

    // Fees
    table.decimal('processingFee', 10, 2).defaultTo(0);
    table.decimal('netAmount', 10, 2); // amount - processingFee

    // Notes
    table.text('notes');
    table.text('failureReason');

    // Audit
    table.integer('processedBy').unsigned().references('id').inTable('users');

    // Timestamps
    table.timestamp('requestedAt').defaultTo(knex.fn.now());
    table.timestamp('processedAt');
    table.timestamp('completedAt');

    // Indexes
    table.index('producerId');
    table.index('status');
    table.index('requestedAt');
    table.index('payoutNumber');
  });

  // Add foreign key for payoutId after payouts table is created
  await knex.schema.alterTable('producerEarnings', (table) => {
    table.foreign('payoutId').references('id').inTable('payouts').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // Remove FK first
  await knex.schema.alterTable('producerEarnings', (table) => {
    table.dropForeign('payoutId');
  });

  await knex.schema.dropTableIfExists('payouts');
  await knex.schema.dropTableIfExists('producerEarnings');
  await knex.schema.dropTableIfExists('payoutMethods');
};
