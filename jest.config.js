/**
 * Jest Configuration for Unit Tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/unit/**/*.spec.js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'assets/js/**/*.js',
    'api/**/*.js',
    '!assets/js/vendor/**',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage thresholds (start conservative, increase over time)
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 50,
      functions: 50,
      lines: 50
    }
  },

  // Setup files
  setupFiles: [
    'jest-localstorage-mock',
    './tests/unit/jest.setup.js'
  ],

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Verbose output
  verbose: true
};
