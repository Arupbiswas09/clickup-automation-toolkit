// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
});

// Global test cleanup
afterAll(() => {
  // Clean up any global state
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Mock fetch globally for all tests
global.fetch = jest.fn();

// Mock process.exit to prevent tests from actually exiting
const originalExit = process.exit;
process.exit = jest.fn();

// Restore process.exit after all tests
afterAll(() => {
  process.exit = originalExit;
});

// Global test utilities
global.testUtils = {
  // Create mock ClickUp API response
  createMockResponse: (data, ok = true, status = 200) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data))
  }),

  // Create mock environment
  mockEnv: (env = {}) => {
    const originalEnv = { ...process.env };
    Object.assign(process.env, {
      CLICKUP_API_KEY: 'test_api_key',
      CLICKUP_TEAM_ID: 'test_team_id',
      CLICKUP_LIST_ID: 'test_list_id',
      CLICKUP_DEFAULT_ASSIGNEE: 'test_user_id',
      ...env
    });
    return () => {
      process.env = originalEnv;
    };
  },

  // Wait for async operations
  wait: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create test task data
  createTestTask: (overrides = {}) => ({
    id: '123456',
    name: 'Test Task',
    description: 'Test description',
    status: { status: 'idea / intake' },
    priority: { priority: '2' },
    url: 'https://app.clickup.com/t/123456',
    assignees: [{ id: 'test_user_id', username: 'testuser' }],
    ...overrides
  }),

  // Create test team data
  createTestTeam: (overrides = {}) => ({
    id: 'test_team_id',
    name: 'Test Team',
    members: [
      { id: 'user1', username: 'user1' },
      { id: 'user2', username: 'user2' }
    ],
    ...overrides
  })
};

// Increase timeout for integration tests
jest.setTimeout(30000);

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions in tests
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});