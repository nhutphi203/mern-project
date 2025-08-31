// jest.config.js
export default {
    testEnvironment: 'node',

    // CRITICAL: Load environment setup before any tests
    globalSetup: '<rootDir>/test/jest.globalSetup.js',
    setupFilesAfterEnv: [
        '<rootDir>/test/setup.js'
    ],

    testMatch: [
        '**/test/**/*.test.js',
        '!**/node_modules/**'
    ],

    // Make sure ES modules work
    transform: {},
    extensionsToTreatAsEsm: ['.js'],

    collectCoverageFrom: [
        'controller/**/*.js',
        'models/**/*.js',
        'router/**/*.js',
        'middlewares/**/*.js',
        '!**/node_modules/**',
        '!**/test/**'
    ],

    coverageReporters: [
        'text',
        'lcov',
        'html'
    ],

    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,

    // Set environment variables for tests
    testEnvironmentOptions: {
        NODE_ENV: 'test'
    },

    // Don't clear mocks between tests
    clearMocks: false,
    resetMocks: false,
    restoreMocks: false,

    // Run tests serially to avoid database conflicts
    maxWorkers: 1
};