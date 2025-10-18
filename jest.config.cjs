module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Transform configuration for CommonJS
  transform: {},
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.js',
    'bin/**/*.js',
    'scripts/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // Test configuration
  verbose: true,
  
  // Mock configuration
  clearMocks: true,
  
  // Restore mocks
  restoreMocks: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Handle detection
  detectOpenHandles: true,
  
  // Force exit
  forceExit: true,
  
  // Performance
  maxWorkers: '50%',
  
  // Cache
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Reporters
  reporters: [
    'default'
  ],
  
  // Globals
  globals: {
    NODE_ENV: 'test'
  }
};