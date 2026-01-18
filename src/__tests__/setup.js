/**
 * Test Setup and Utilities for Integration Tests
 *
 * This file provides:
 * - Test database setup/teardown
 * - Helper functions for creating test users
 * - Authentication helpers for protected routes
 */

import { db } from '../database/connection.js';
import { UserModel } from '../models/UserModel.js';
import { generateTokens } from '../middlewares/auth.js';

/**
 * Clear all test data from the database
 */
export const clearDatabase = async () => {
  // Disable foreign key checks temporarily
  try {
    // Delete in order to respect foreign keys
    await db('notifications').del();
    await db('authTokens').del();
    await db('refreshTokens').del();
    await db('cartItems').del();
    await db('payouts').del();
    await db('producerEarnings').del();
    await db('payoutMethods').del();
    await db('playHistory').del();
    await db('follows').del();
    await db('likes').del();
    await db('playlistBeats').del();
    await db('playlists').del();
    await db('userPurchases').del();
    await db('orderItems').del();
    await db('orders').del();
    await db('beatFiles').del();
    await db('licenseTiers').del();
    await db('beats').del();
    await db('producers').del();
    await db('genres').del();
    await db('users').del();
  } catch (error) {
    // Some tables might not exist yet, ignore errors
    console.error('Error clearing database:', error.message);
  }
};

/**
 * Create a test user
 */
export const createTestUser = async (overrides = {}) => {
  const defaultData = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'artist',
    status: 'active',
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    theme: 'dark',
  };

  const userData = { ...defaultData, ...overrides };
  const user = await UserModel.create(userData);

  return {
    user,
    password: userData.password,
  };
};

/**
 * Create a test user and get auth tokens
 */
export const createAuthenticatedUser = async (overrides = {}) => {
  const { user, password } = await createTestUser(overrides);

  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    password,
    ...tokens,
  };
};

/**
 * Create an admin user with auth tokens
 */
export const createAdminUser = async () => {
  return createAuthenticatedUser({
    email: `admin-${Date.now()}@beatbloom.com`,
    name: 'Admin User',
    role: 'admin',
  });
};

/**
 * Create a producer user with auth tokens
 */
export const createProducerUser = async () => {
  return createAuthenticatedUser({
    email: `producer-${Date.now()}@beatbloom.com`,
    name: 'Producer User',
    role: 'producer',
  });
};

/**
 * Wait for a specified number of milliseconds
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get auth header for requests
 */
export const getAuthHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
});

/**
 * Setup before all tests
 */
export const setupTests = async () => {
  // Run migrations if needed
  try {
    await db.migrate.latest();
  } catch (error) {
    console.error('Migration error:', error.message);
  }
};

/**
 * Teardown after all tests
 */
export const teardownTests = async () => {
  await clearDatabase();
  await db.destroy();
};

export default {
  clearDatabase,
  createTestUser,
  createAuthenticatedUser,
  createAdminUser,
  createProducerUser,
  wait,
  getAuthHeader,
  setupTests,
  teardownTests,
};
