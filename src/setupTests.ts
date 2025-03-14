/**
 * Setup file for Jest tests
 */

// Mock Sonner toast functions
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  }
}));

// Mock import.meta.env if not already mocked in specific tests
if (typeof import.meta.env === 'undefined') {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_RAILWAY_DB_CONNECTION_STRING: 'postgresql://postgres:password@host:5432/railway',
      VITE_RAILWAY_DB_PASSWORD: 'testpassword',
      VITE_RAILWAY_DB_HOST: 'test-host',
      VITE_RAILWAY_DB_PORT: '5432',
      VITE_RAILWAY_DB_NAME: 'railway',
      VITE_RAILWAY_DB_USER: 'postgres',
    }
  });
}

// To ensure the console.error outputs are not shown during tests
global.console = {
  ...console,
  // Keep native behavior for other methods, override only error
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
