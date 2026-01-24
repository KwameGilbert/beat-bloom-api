/**
 * Fix incorrect default timestamps from previous migration edits
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  // Fix authTokens usedAt
  await knex.schema.alterTable('authTokens', (table) => {
    table.timestamp('usedAt').nullable().defaultTo(null).alter();
  });

  // Fix users
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('deletedAt').nullable().defaultTo(null).alter();
    table.timestamp('lastLoginAt').nullable().defaultTo(null).alter();
    table.timestamp('passwordResetExpires').nullable().defaultTo(null).alter();
  });

  // Fix beats
  await knex.schema.alterTable('beats', (table) => {
    table.timestamp('deletedAt').nullable().defaultTo(null).alter();
  });

  // Fix producerEarnings
  await knex.schema.alterTable('producerEarnings', (table) => {
    table.timestamp('paidAt').nullable().defaultTo(null).alter();
  });

  // Fix payouts
  await knex.schema.alterTable('payouts', (table) => {
    table.timestamp('processedAt').nullable().defaultTo(null).alter();
    table.timestamp('completedAt').nullable().defaultTo(null).alter();
  });

  // Data cleanup: Reset any fields that were incorrectly auto-populated
  await knex('authTokens').update({ usedAt: null });
  await knex('users').update({ deletedAt: null });
  await knex('beats').update({ deletedAt: null });
  await knex('producerEarnings').update({ paidAt: null });
  await knex('payouts').update({ processedAt: null, completedAt: null });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  // No rollback needed for data cleanup
};
