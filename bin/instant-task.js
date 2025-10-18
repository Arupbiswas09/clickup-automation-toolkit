#!/usr/bin/env node

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

class InstantTaskCreator {
  constructor() {
    this.apiKey = process.env.CLICKUP_API_KEY;
    this.teamId = process.env.CLICKUP_TEAM_ID;
    this.listId = process.env.CLICKUP_LIST_ID;
    this.defaultAssignee = process.env.CLICKUP_DEFAULT_ASSIGNEE; // Optional
    this.baseUrl = 'https://api.clickup.com/api/v2';

    this.validateConfig();
  }

  validateConfig() {
    if (!this.apiKey) {
      console.error(chalk.red('❌ CLICKUP_API_KEY is required. Please set it in your .env file.'));
      process.exit(1);
    }
    if (!this.teamId) {
      console.error(chalk.red('❌ CLICKUP_TEAM_ID is required. Please set it in your .env file.'));
      process.exit(1);
    }
    if (!this.listId) {
      console.error(chalk.red('❌ CLICKUP_LIST_ID is required. Please set it in your .env file.'));
      process.exit(1);
    }
  }

  async createTask(name, description = '', priority = 2, type = 'general', assigneeId = null) {
    try {
      const templates = {
        feature: { emoji: '🚀', color: '#4CAF50', priority: 2 },
        bug: { emoji: '🐛', color: '#F44336', priority: 1 },
        design: { emoji: '🎨', color: '#9C27B0', priority: 2 },
        api: { emoji: '⚡', color: '#FF9800', priority: 2 },
        test: { emoji: '🧪', color: '#2196F3', priority: 3 },
        doc: { emoji: '📚', color: '#795548', priority: 3 },
        general: { emoji: '📋', color: '#607D8B', priority: 2 }
      };

      const template = templates[type] || templates.general;
      const taskName = `${template.emoji} ${name}`;

      const taskDescription = description || `## ${template.emoji} ${type.toUpperCase()} Task

${description}

## Acceptance Criteria
- [ ] Define requirements
- [ ] Implement solution  
- [ ] Test functionality
- [ ] Review and approve

## Notes
Created via ClickUp Automation Toolkit`;

      const taskData = {
        name: taskName,
        description: taskDescription,
        priority: priority || template.priority,
        status: 'idea / intake'
      };

      // Add assignee if provided
      if (assigneeId || this.defaultAssignee) {
        taskData.assignees = [assigneeId || this.defaultAssignee];
      }

      const response = await fetch(`${this.baseUrl}/list/${this.listId}/task`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      console.log(chalk.green('✅ Task created instantly!'));
      console.log(chalk.blue(`📋 Name: ${result.name}`));
      console.log(chalk.yellow(`🆔 ID: ${result.id}`));
      console.log(chalk.cyan(`🔗 URL: ${result.url}`));

      if (result.assignees && result.assignees.length > 0) {
        console.log(chalk.magenta(`👤 Assigned to: ${result.assignees[0].username}`));
      }

      console.log(chalk.gray(`📊 Status: ${result.status.status}`));
      console.log(chalk.white(`⚡ Priority: ${this.getPriorityName(priority || template.priority)}`));

      return result;
    } catch (error) {
      console.error(chalk.red('❌ Instant task creation failed:'), error.message);
      throw error;
    }
  }

  getPriorityName(priority) {
    const priorities = {
      1: 'Urgent',
      2: 'High',
      3: 'Normal',
      4: 'Low'
    };
    return priorities[priority] || 'Normal';
  }

  async quickFeature(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 2, 'feature', assigneeId);
  }

  async quickBug(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 1, 'bug', assigneeId);
  }

  async quickDesign(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 2, 'design', assigneeId);
  }

  async quickAPI(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 2, 'api', assigneeId);
  }

  async quickTest(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 3, 'test', assigneeId);
  }

  async quickDoc(name, description = '', assigneeId = null) {
    return await this.createTask(name, description, 3, 'doc', assigneeId);
  }

  showHelp() {
    console.log(chalk.cyan(`
🚀 ClickUp Instant Task Creator

Usage:
  instant-task <type> "<name>" "<description>" [assignee-id]

Task Types:
  feature  - 🚀 Feature development (High priority)
  bug      - 🐛 Bug fix (Urgent priority)  
  design   - 🎨 Design task (High priority)
  api      - ⚡ API development (High priority)
  test     - 🧪 Testing task (Normal priority)
  doc      - 📚 Documentation (Normal priority)
  general  - 📋 General task (High priority)

Examples:
  instant-task feature "User Authentication" "Implement login/logout functionality"
  instant-task bug "Login Button Not Working" "Button doesn't respond to clicks"
  instant-task design "Dashboard Layout" "Create responsive dashboard design"

Environment Variables Required:
  CLICKUP_API_KEY          - Your ClickUp API key
  CLICKUP_TEAM_ID          - Your ClickUp team ID
  CLICKUP_LIST_ID          - Target list ID for tasks
  CLICKUP_DEFAULT_ASSIGNEE - Default assignee ID (optional)

For more information, visit: https://github.com/clickup-automation/toolkit
        `));
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const creator = new InstantTaskCreator();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    creator.showHelp();
    process.exit(0);
  }

  const [type, name, description, assigneeId] = args;

  if (!name) {
    console.error(chalk.red('❌ Task name is required'));
    creator.showHelp();
    process.exit(1);
  }

  creator.createTask(name, description || '', null, type || 'general', assigneeId)
    .then(() => {
      console.log(chalk.green('\n🎉 Task created successfully!'));
    })
    .catch(error => {
      console.error(chalk.red('\n💥 Failed to create task:'), error.message);
      process.exit(1);
    });
}

export default InstantTaskCreator;
