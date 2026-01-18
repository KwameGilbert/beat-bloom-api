/**
 * Jest Setup - runs before each test file
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Suppress console.log during tests (optional, uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

// Custom matchers (optional)
expect.extend({
  toBeValidJWT(received) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const pass = jwtRegex.test(received);

    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid JWT`,
      pass,
    };
  },
});
