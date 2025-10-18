import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import ClickUpAutomation from '../../src/clickup-automation.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('ClickUpAutomation', () => {
  let automation;
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set test environment variables
    process.env.CLICKUP_API_KEY = 'test_api_key';
    process.env.CLICKUP_TEAM_ID = 'test_team_id';
    process.env.CLICKUP_LIST_ID = 'test_list_id';
    process.env.CLICKUP_DEFAULT_ASSIGNEE = 'test_user_id';

    automation = new ClickUpAutomation();

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(automation.apiKey).toBe('test_api_key');
      expect(automation.teamId).toBe('test_team_id');
      expect(automation.defaultListId).toBe('test_list_id');
      expect(automation.defaultAssignee).toBe('test_user_id');
    });

    it('should throw error when API key is missing', () => {
      delete process.env.CLICKUP_API_KEY;
      expect(() => new ClickUpAutomation()).toThrow('CLICKUP_API_KEY is required');
    });

    it('should throw error when team ID is missing', () => {
      delete process.env.CLICKUP_TEAM_ID;
      expect(() => new ClickUpAutomation()).toThrow('CLICKUP_TEAM_ID is required');
    });

    it('should throw error when list ID is missing', () => {
      delete process.env.CLICKUP_LIST_ID;
      expect(() => new ClickUpAutomation()).toThrow('CLICKUP_LIST_ID is required');
    });
  });

  describe('createTask', () => {
    it('should create a basic task successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '123',
          name: 'Test Task',
          url: 'https://app.clickup.com/t/123'
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.createTask('Test Task', 'Test description', 2);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.clickup.com/api/v2/list/test_list_id/task',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'test_api_key',
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('"name":"Test Task"')
        })
      );

      expect(result.id).toBe('123');
      expect(result.name).toBe('Test Task');
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request')
      };

      fetch.mockResolvedValue(mockResponse);

      await expect(automation.createTask('Test Task')).rejects.toThrow('HTTP 400: Bad Request');
    });

    it('should include assignee when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: '123', name: 'Test Task' })
      };

      fetch.mockResolvedValue(mockResponse);

      await automation.createTask('Test Task', 'Description', 2, 'custom_user_id');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"assignees":["custom_user_id"]')
        })
      );
    });

    it('should use default assignee when no assignee provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: '123', name: 'Test Task' })
      };

      fetch.mockResolvedValue(mockResponse);

      await automation.createTask('Test Task', 'Description', 2);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"assignees":["test_user_id"]')
        })
      );
    });
  });

  describe('createTemplatedTask', () => {
    it('should create a feature task with correct template', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '123',
          name: '🚀 New Feature',
          priority: { priority: '2' }
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.createTemplatedTask('feature', {
        name: 'New Feature',
        description: 'Feature description'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"name":"🚀 New Feature"')
        })
      );

      expect(result.name).toBe('🚀 New Feature');
    });

    it('should create a bug task with urgent priority', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '123',
          name: '🐛 Bug Fix',
          priority: { priority: '1' }
        })
      };

      fetch.mockResolvedValue(mockResponse);

      await automation.createTemplatedTask('bug', {
        name: 'Bug Fix',
        description: 'Bug description'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"priority":1')
        })
      );
    });

    it('should handle unknown task types gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '123',
          name: '📋 Unknown Task'
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.createTemplatedTask('unknown', {
        name: 'Unknown Task'
      });

      expect(result.name).toBe('📋 Unknown Task');
    });
  });

  describe('testConnection', () => {
    it('should return success for valid connection', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          teams: [{
            id: 'test_team_id',
            name: 'Test Team',
            members: [{ id: '1' }, { id: '2' }]
          }]
        })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.testConnection();

      expect(result.success).toBe(true);
      expect(result.team.name).toBe('Test Team');
      expect(result.team.members).toHaveLength(2);
    });

    it('should return failure for invalid connection', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized')
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 401');
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const result = await automation.testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('generateTaskDescription', () => {
    it('should generate description for feature tasks', () => {
      const description = automation.generateTaskDescription('feature', 'Custom description');

      expect(description).toContain('🚀 FEATURE Task');
      expect(description).toContain('Custom description');
      expect(description).toContain('Acceptance Criteria');
    });

    it('should generate description for bug tasks', () => {
      const description = automation.generateTaskDescription('bug', 'Bug details');

      expect(description).toContain('🐛 BUG Report');
      expect(description).toContain('Bug details');
      expect(description).toContain('Steps to Reproduce');
    });

    it('should handle empty descriptions', () => {
      const description = automation.generateTaskDescription('feature', '');

      expect(description).toContain('🚀 FEATURE Task');
      expect(description).toContain('Acceptance Criteria');
    });
  });

  describe('createBatchTasks', () => {
    it('should create multiple tasks successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn()
          .mockResolvedValueOnce({ id: '1', name: 'Task 1' })
          .mockResolvedValueOnce({ id: '2', name: 'Task 2' })
      };

      fetch.mockResolvedValue(mockResponse);

      const tasks = [
        { name: 'Task 1', description: 'Description 1' },
        { name: 'Task 2', description: 'Description 2' }
      ];

      const results = await automation.createBatchTasks(tasks);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1');
      expect(results[1].id).toBe('2');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in batch creation', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: '1', name: 'Task 1' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('Bad Request')
        });

      const tasks = [
        { name: 'Task 1', description: 'Description 1' },
        { name: 'Task 2', description: 'Description 2' }
      ];

      const results = await automation.createBatchTasks(tasks);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('HTTP 400');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long task names', async () => {
      const longName = 'A'.repeat(1000);
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: '123', name: longName })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.createTask(longName);
      expect(result.id).toBe('123');
    });

    it('should handle special characters in task names', async () => {
      const specialName = 'Task with émojis 🚀 and spëcial chars!@#$%';
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: '123', name: specialName })
      };

      fetch.mockResolvedValue(mockResponse);

      const result = await automation.createTask(specialName);
      expect(result.id).toBe('123');
    });

    it('should handle null and undefined values gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: '123', name: 'Test' })
      };

      fetch.mockResolvedValue(mockResponse);

      // Should not throw errors
      await automation.createTask('Test', null);
      await automation.createTask('Test', undefined);
      await automation.createTask('Test', '', null);
    });
  });
});
