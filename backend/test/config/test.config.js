/**
 * Complete Test Configuration for Healthcare Management System
 * Ensures 100% workflow coverage with proper test environment setup
 */

module.exports = {
  // Test Environment Configuration
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup/globalSetup.js'],
  testTimeout: 60000, // 60 seconds for E2E tests

  // Test Pattern Matching
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],

  // Module Resolution
  moduleFileExtensions: ['js', 'json'],
  transform: {},

  // Coverage Configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/test/coverage',
  collectCoverageFrom: [
    'controller/**/*.js',
    'models/**/*.js',
    'router/**/*.js',
    'middlewares/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/coverage/**'
  ],

  // Coverage Thresholds - Target 95%+ for all metrics
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './controller/': {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98
    },
    './models/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  // Test Result Reporting
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test/reports',
      filename: 'test-report.html',
      expand: true
    }],
    ['jest-junit', {
      outputDirectory: './test/reports',
      outputName: 'junit.xml'
    }]
  ],

  // Test Categories Organization
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/test/unit/**/*.test.js'],
      testEnvironment: 'node'
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/test/integration/**/*.test.js'],
      testEnvironment: 'node'
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/test/e2e/**/*.test.js'],
      testEnvironment: 'node',
      testTimeout: 120000 // 2 minutes for E2E
    },
    {
      displayName: 'Performance Tests',
      testMatch: ['<rootDir>/test/performance/**/*.test.js'],
      testEnvironment: 'node',
      testTimeout: 300000 // 5 minutes for performance tests
    }
  ],

  // Test Execution Options
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  restoreMocks: true,

  // Global Test Variables
  globals: {
    TEST_DATABASE_URL: 'mongodb://localhost:27017/hospital_test_db',
    TEST_JWT_SECRET: 'test_jwt_secret_key_for_testing_only',
    TEST_TIMEOUT: 60000
  }
};
