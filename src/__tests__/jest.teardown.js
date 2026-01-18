/**
 * Jest Teardown - runs after all test files complete
 */

import { db } from '../database/connection.js';

export default async () => {
  try {
    // Close database connection
    await db.destroy();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error.message);
  }
};
