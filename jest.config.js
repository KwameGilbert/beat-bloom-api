export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/migrations/**',
    '!src/database/seeds/**',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000, // 30 seconds for DB operations
  transform: {},

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.js'],

  // Global teardown
  globalTeardown: '<rootDir>/src/__tests__/jest.teardown.js',

  // Run tests in order (not parallel) to avoid DB conflicts
  maxWorkers: 1,

  // Environment variables for testing
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
};
