// Test setup file
// This runs before all tests

// Suppress console output during tests unless there's an error
if (process.env.NODE_ENV !== 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Increase timeout for tests that might take longer
jest.setTimeout(10000);
