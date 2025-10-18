#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import ClickUpAutomation from '../src/clickup-automation.js';
import InstantTaskCreator from './instant-task.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('clickup-cli')
  .description('ClickUp Automation Toolkit CLI')
  .version('1.0.0');

// Test connection command
program
  .command('test')
  .description('Test ClickUp API connection')
  .action(async () => {
    try {
      console.log(chalk.blue('🔍 Testing ClickUp connection...'));
      const automation = new ClickUpAutomation();
      const result = await automation.testConnection();

      if (result.success) {
        console.log(chalk.green('✅ Connection successful!'));
        console.log(chalk.cyan(`Team: ${result.team.name}`));
        console.log(chalk.yellow(`Members: ${result.team.members.length}`));
      } else {
        console.log(chalk.red('❌ Connection failed'));
      }
    } catch (error) {
      console.error(chalk.red('💥 Error:'), error.message);
    }
  });

// Create task command
program
  .command('create')
  .description('Create a new task')
  .argument('<name>', 'Task name')
  .option('-d, --description <desc>', 'Task description')
  .option('-p, --priority <priority>', 'Priority (1-4)', '2')
  .option('-t, --type <type>', 'Task type (feature, bug, design, etc.)', 'general')
  .option('-a, --assignee <id>', 'Assignee user ID')
  .action(async (name, options) => {
    try {
      console.log(chalk.blue('🚀 Creating task...'));
      const creator = new InstantTaskCreator();
      await creator.createTask(
        name,
        options.description || '',
        parseInt(options.priority),
        options.type,
        options.assignee
      );
    } catch (error) {
      console.error(chalk.red('💥 Error:'), error.message);
      process.exit(1);
    }
  });

// Quick task creation commands
const taskTypes = [
  { name: 'feature', emoji: '🚀', desc: 'Create a feature task' },
  { name: 'bug', emoji: '🐛', desc: 'Create a bug report' },
  { name: 'design', emoji: '🎨', desc: 'Create a design task' },
  { name: 'api', emoji: '⚡', desc: 'Create an API task' },
  { name: 'test', emoji: '🧪', desc: 'Create a test task' },
  { name: 'doc', emoji: '📚', desc: 'Create a documentation task' }
];

taskTypes.forEach(type => {
  program
    .command(type.name)
    .description(`${type.emoji} ${type.desc}`)
    .argument('<name>', 'Task name')
    .option('-d, --description <desc>', 'Task description')
    .option('-a, --assignee <id>', 'Assignee user ID')
    .action(async (name, options) => {
      try {
        console.log(chalk.blue(`${type.emoji} Creating ${type.name} task...`));
        const creator = new InstantTaskCreator();
        await creator.createTask(
          name,
          options.description || '',
          null,
          type.name,
          options.assignee
        );
      } catch (error) {
        console.error(chalk.red('💥 Error:'), error.message);
        process.exit(1);
      }
    });
});

// List tasks command
program
  .command('list')
  .description('List tasks from ClickUp')
  .option('-s, --status <status>', 'Filter by status')
  .option('-l, --limit <limit>', 'Limit number of results', '10')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📋 Fetching tasks...'));
      const automation = new ClickUpAutomation();

      // This would need to be implemented in the ClickUpAutomation class
      console.log(chalk.yellow('📝 List functionality coming soon...'));
      console.log(chalk.gray('Use the ClickUp web interface to view tasks for now.'));
    } catch (error) {
      console.error(chalk.red('💥 Error:'), error.message);
    }
  });

// Setup command
program
  .command('setup')
  .description('Interactive setup for ClickUp configuration')
  .action(async () => {
    console.log(chalk.cyan(`
🚀 ClickUp Automation Toolkit Setup

To get started, you need to configure your environment variables.
Create a .env file in your project root with the following:

${chalk.yellow('CLICKUP_API_KEY')}=your_api_key_here
${chalk.yellow('CLICKUP_TEAM_ID')}=your_team_id_here  
${chalk.yellow('CLICKUP_LIST_ID')}=your_default_list_id_here
${chalk.yellow('CLICKUP_DEFAULT_ASSIGNEE')}=default_user_id_here (optional)

📖 How to get these values:

1. ${chalk.green('API Key')}: Go to ClickUp Settings > Apps > Generate API Key
2. ${chalk.green('Team ID')}: Found in your ClickUp URL or via API
3. ${chalk.green('List ID')}: Found in list URL or via API  
4. ${chalk.green('User ID')}: Found in user profile or via API

🔗 For detailed setup instructions, visit:
   https://github.com/clickup-automation/toolkit#setup

After creating your .env file, run:
   ${chalk.blue('clickup-cli test')} - to verify your connection
        `));
  });

// Config command
program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log(chalk.cyan('⚙️  Current Configuration:'));
    console.log(chalk.yellow('API Key:'), process.env.CLICKUP_API_KEY ? '✅ Set' : '❌ Not set');
    console.log(chalk.yellow('Team ID:'), process.env.CLICKUP_TEAM_ID ? '✅ Set' : '❌ Not set');
    console.log(chalk.yellow('List ID:'), process.env.CLICKUP_LIST_ID ? '✅ Set' : '❌ Not set');
    console.log(chalk.yellow('Default Assignee:'), process.env.CLICKUP_DEFAULT_ASSIGNEE ? '✅ Set' : '❌ Not set');

    if (!process.env.CLICKUP_API_KEY || !process.env.CLICKUP_TEAM_ID || !process.env.CLICKUP_LIST_ID) {
      console.log(chalk.red('\n⚠️  Missing required configuration. Run "clickup-cli setup" for help.'));
    } else {
      console.log(chalk.green('\n✅ Configuration looks good! Run "clickup-cli test" to verify connection.'));
    }
  });

// Help command with examples
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(chalk.cyan(`
🚀 ClickUp CLI Examples

${chalk.yellow('Basic Commands:')}
  clickup-cli test                                    # Test connection
  clickup-cli config                                  # Show configuration
  clickup-cli setup                                   # Setup guide

${chalk.yellow('Create Tasks:')}
  clickup-cli create "Fix login bug"                  # Basic task
  clickup-cli create "New feature" -d "Description"   # With description
  clickup-cli create "Task" -p 1 -t bug              # With priority & type

${chalk.yellow('Quick Task Creation:')}
  clickup-cli feature "User Dashboard"                # Feature task
  clickup-cli bug "Login not working"                 # Bug report
  clickup-cli design "Homepage redesign"              # Design task
  clickup-cli api "User endpoints"                    # API task
  clickup-cli test "Unit tests"                       # Test task
  clickup-cli doc "API documentation"                 # Documentation

${chalk.yellow('With Options:')}
  clickup-cli feature "New feature" -d "Detailed description"
  clickup-cli bug "Critical bug" -a "user_id_123"
  
${chalk.yellow('Priority Levels:')}
  1 = Urgent    2 = High    3 = Normal    4 = Low
        `));
  });

program.parse();
