/**
 * Platform Settings - Global configuration for the platform
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable('platformSettings', (table) => {
    table.string('key', 100).primary();
    table.text('value').notNullable();
    table.string('type', 20).defaultTo('string'); // string, number, boolean, json
    table.string('category', 50); // fees, payout, general, etc.
    table.text('description');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());

    table.index('category');
  });

  // Insert default settings
  await knex('platformSettings').insert([
    // Fee Settings
    {
      key: 'platformCommissionRate',
      value: '15',
      type: 'number',
      category: 'fees',
      description:
        'Platform commission percentage (e.g., 15 means platform takes 15%, producer gets 85%)',
    },
    {
      key: 'processingFeePercentage',
      value: '2.9',
      type: 'number',
      category: 'fees',
      description: 'Payment processing fee percentage (e.g., Stripe/Paystack fee)',
    },
    {
      key: 'processingFeeFixed',
      value: '0.30',
      type: 'number',
      category: 'fees',
      description: 'Fixed processing fee per transaction in USD',
    },
    // Payout Settings
    {
      key: 'minimumPayoutAmount',
      value: '50',
      type: 'number',
      category: 'payout',
      description: 'Minimum balance required for payout in USD',
    },
    {
      key: 'payoutFrequency',
      value: 'weekly',
      type: 'string',
      category: 'payout',
      description: 'Payout frequency: daily, weekly, biweekly, monthly',
    },
    // General Settings
    {
      key: 'maxBeatsPerUpload',
      value: '10',
      type: 'number',
      category: 'general',
      description: 'Maximum number of beats per bulk upload',
    },
    {
      key: 'maxFileSizeMB',
      value: '100',
      type: 'number',
      category: 'general',
      description: 'Maximum file size for uploads in MB',
    },
    {
      key: 'maintenanceMode',
      value: 'false',
      type: 'boolean',
      category: 'general',
      description: 'Enable maintenance mode',
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTableIfExists('platformSettings');
};
