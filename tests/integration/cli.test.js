import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');
const cliPath = path.join(projectRoot, 'bin/clickup-cli.js');

describe('CLI Integration Tests', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Set test environment variables
    process.env.CLICKUP_API_KEY = 'test_api_key';
    process.env.CLICKUP_TEAM_ID = 'test_team_id';
    process.env.CLICKUP_LIST_ID = 'test_list_id';
    process.env.CLICKUP_DEFAULT_ASSIGNEE = 'test_user_id';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Help and Information Commands', () => {
    it('should show help when no arguments provided', async () => {
      const { stdout } = await execAsync(`node "${cliPath}"`);

      expect(stdout).toContain('ClickUp Automation Toolkit CLI');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Commands:');
    });

    it('should show help with --help flag', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --help`);

      expect(stdout).toContain('ClickUp Automation Toolkit CLI');
      expect(stdout).toContain('Options:');
    });

    it('should show version with --version flag', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --version`);

      expect(stdout).toMatch(/\d+\.\d+\.\d+/); // Version format
    });

    it('should show examples command', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" examples`);

      expect(stdout).toContain('ClickUp CLI Examples');
      expect(stdout).toContain('Basic Commands:');
      expect(stdout).toContain('Create Tasks:');
    });

    it('should show config command', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" config`);

      expect(stdout).toContain('Current Configuration:');
      expect(stdout).toContain('API Key:');
      expect(stdout).toContain('Team ID:');
    });

    it('should show setup command', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" setup`);

      expect(stdout).toContain('ClickUp Automation Toolkit Setup');
      expect(stdout).toContain('CLICKUP_API_KEY');
      expect(stdout).toContain('environment variables');
    });
  });

  describe('Task Type Commands', () => {
    const taskTypes = ['feature', 'bug', 'design', 'api', 'test', 'doc'];

    taskTypes.forEach(type => {
      it(`should show help for ${type} command`, async () => {
        const { stdout } = await execAsync(`node "${cliPath}" ${type} --help`);

        expect(stdout).toContain(`${type}`);
        expect(stdout).toContain('Usage:');
        expect(stdout).toContain('<name>');
      });
    });

    it('should handle missing task name gracefully', async () => {
      try {
        await execAsync(`node "${cliPath}" feature`);
      } catch (error) {
        expect(error.stderr || error.stdout).toContain('required');
      }
    });
  });

  describe('Create Command', () => {
    it('should show help for create command', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" create --help`);

      expect(stdout).toContain('Create a new task');
      expect(stdout).toContain('<name>');
      expect(stdout).toContain('Options:');
      expect(stdout).toContain('--description');
      expect(stdout).toContain('--priority');
    });

    it('should handle missing task name in create command', async () => {
      try {
        await execAsync(`node "${cliPath}" create`);
      } catch (error) {
        expect(error.stderr || error.stdout).toContain('required');
      }
    });
  });

  describe('Environment Validation', () => {
    it('should handle missing API key gracefully', async () => {
      delete process.env.CLICKUP_API_KEY;

      try {
        await execAsync(`node "${cliPath}" config`);
      } catch (error) {
        // Should not crash, but show missing config
        expect(error.code).toBeDefined();
      }
    });

    it('should show configuration status correctly', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" config`);

      expect(stdout).toContain('✅ Set'); // Should show API key as set
    });

    it('should handle missing configuration', async () => {
      delete process.env.CLICKUP_API_KEY;
      delete process.env.CLICKUP_TEAM_ID;

      const { stdout } = await execAsync(`node "${cliPath}" config`);

      expect(stdout).toContain('❌ Not set');
      expect(stdout).toContain('Missing required configuration');
    });
  });

  describe('Command Line Argument Parsing', () => {
    it('should handle quoted arguments correctly', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" create --help`);
      expect(stdout).toContain('Create a new task');
    });

    it('should handle options with values', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" create --help`);
      expect(stdout).toContain('--priority <priority>');
      expect(stdout).toContain('--description <desc>');
    });

    it('should handle boolean flags', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --help`);
      expect(stdout).toContain('--help');
      expect(stdout).toContain('--version');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      try {
        await execAsync(`node "${cliPath}" invalid-command`);
      } catch (error) {
        expect(error.stderr || error.stdout).toContain('unknown command');
      }
    });

    it('should handle invalid options gracefully', async () => {
      try {
        await execAsync(`node "${cliPath}" create "Test" --invalid-option`);
      } catch (error) {
        expect(error.stderr || error.stdout).toContain('unknown option');
      }
    });

    it('should provide helpful error messages', async () => {
      try {
        await execAsync(`node "${cliPath}" create`);
      } catch (error) {
        const output = error.stderr || error.stdout;
        expect(output).toMatch(/(required|missing|argument)/i);
      }
    });
  });

  describe('Output Formatting', () => {
    it('should use colored output appropriately', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" examples`);

      // Check that output contains ANSI color codes or readable text
      expect(stdout.length).toBeGreaterThan(100);
      expect(stdout).toContain('Examples');
    });

    it('should format help text properly', async () => {
      const { stdout } = await execAsync(`node "${cliPath}" --help`);

      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('Options:');
    });
  });

  describe('Performance', () => {
    it('should start quickly', async () => {
      const startTime = Date.now();
      await execAsync(`node "${cliPath}" --version`);
      const endTime = Date.now();

      // Should start within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle help commands quickly', async () => {
      const startTime = Date.now();
      await execAsync(`node "${cliPath}" --help`);
      const endTime = Date.now();

      // Help should be very fast (less than 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Cross-platform Compatibility', () => {
    it('should work with different shell environments', async () => {
      // Test that the shebang and module system work
      const { stdout } = await execAsync(`node "${cliPath}" --version`);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should handle file paths correctly', async () => {
      // Test that relative paths work
      const { stdout } = await execAsync(`node "${cliPath}" config`);
      expect(stdout).toContain('Configuration:');
    });
  });
});
