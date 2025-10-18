#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ClickUpAutomation {
  constructor(configPath = null) {
    this.config = this.loadConfig(configPath);
    this.apiKey = process.env.CLICKUP_API_KEY;
    this.teamId = process.env.CLICKUP_TEAM_ID;
    this.defaultListId = process.env.CLICKUP_LIST_ID || this.config.clickup.default_list_id;
    this.baseUrl = 'https://api.clickup.com/api/v2';

    // Validate required configuration
    this.validateConfig();
  }

  validateConfig() {
    if (!this.apiKey) {
      throw new Error('❌ CLICKUP_API_KEY is required. Please set it in your .env file.');
    }
    if (!this.teamId) {
      throw new Error('❌ CLICKUP_TEAM_ID is required. Please set it in your .env file.');
    }
    if (!this.defaultListId) {
      throw new Error('❌ CLICKUP_LIST_ID is required. Please set it in your .env file or config.json.');
    }
  }

  loadConfig(configPath = null) {
    try {
      const defaultConfigPath = path.join(__dirname, '..', 'config', 'config.json');
      const finalConfigPath = configPath || defaultConfigPath;

      if (!fs.existsSync(finalConfigPath)) {
        console.warn('⚠️  Config file not found. Using default configuration.');
        return this.getDefaultConfig();
      }

      return JSON.parse(fs.readFileSync(finalConfigPath, 'utf8'));
    } catch (error) {
      console.error('❌ Error loading config.json:', error.message);
      console.log('📋 Using default configuration...');
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      clickup: {
        team_id: process.env.CLICKUP_TEAM_ID,
        default_list_id: process.env.CLICKUP_LIST_ID,
        spaces: {},
        lists: {},
        statuses: {
          'idea': 'idea / intake',
          'todo': 'to do',
          'progress': 'in progress',
          'review': 'review',
          'done': 'complete'
        },
        priorities: {
          'urgent': 1,
          'high': 2,
          'normal': 3,
          'low': 4
        }
      },
      task_templates: {
        feature: {
          name_prefix: '🚀',
          priority: 2,
          status: 'idea',
          description_template: '## 🚀 FEATURE\n\n{description}\n\n## Acceptance Criteria\n- [ ] Define requirements\n- [ ] Implement solution\n- [ ] Test functionality\n- [ ] Review and approve'
        },
        bug: {
          name_prefix: '🐛',
          priority: 1,
          status: 'idea',
          description_template: '## 🐛 BUG FIX\n\n{description}\n\n## Steps to Reproduce\n1. \n\n## Expected Behavior\n\n## Actual Behavior\n\n## Acceptance Criteria\n- [ ] Identify root cause\n- [ ] Implement fix\n- [ ] Test fix\n- [ ] Verify resolution'
        },
        design: {
          name_prefix: '🎨',
          priority: 2,
          status: 'idea',
          description_template: '## 🎨 DESIGN TASK\n\n{description}\n\n## Design Requirements\n- [ ] Create wireframes\n- [ ] Design mockups\n- [ ] Review with team\n- [ ] Finalize design'
        }
      }
    };
  }

  async makeRequest(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(`API Error: ${result.err || result.message || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error('❌ API Request failed:', error.message);
      throw error;
    }
  }

  generateTaskDescription(template, variables = {}) {
    let description = template.description_template || template;

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      description = description.replace(new RegExp(placeholder, 'g'), variables[key]);
    });

    return description;
  }

  async createTask(taskData) {
    try {
      const endpoint = `/list/${this.defaultListId}/task`;
      const result = await this.makeRequest('POST', endpoint, taskData);

      console.log(`✅ Task created: ${result.name} (ID: ${result.id})`);
      return result;
    } catch (error) {
      console.error('❌ Failed to create task:', error.message);
      throw error;
    }
  }

  async createTaskWithTemplate(type, name, description = '', options = {}) {
    const template = this.config.task_templates[type];
    if (!template) {
      throw new Error(`❌ Unknown task type: ${type}`);
    }

    const taskName = `${template.name_prefix} ${name}`;
    const taskDescription = this.generateTaskDescription(template, {
      description: description || `${type.toUpperCase()} task: ${name}`
    });

    const taskData = {
      name: taskName,
      description: taskDescription,
      priority: options.priority || template.priority,
      status: this.config.clickup.statuses[template.status] || template.status,
      ...options
    };

    return await this.createTask(taskData);
  }

  async updateTaskStatus(taskId, statusKey) {
    try {
      const status = this.config.clickup.statuses[statusKey] || statusKey;
      const result = await this.makeRequest('PUT', `/task/${taskId}`, { status });
      console.log(`✅ Task ${taskId} moved to: ${status}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to update task status:', error.message);
      throw error;
    }
  }

  async batchCreateTasks(tasks) {
    const results = [];
    console.log(`🚀 Creating ${tasks.length} tasks...`);

    for (const task of tasks) {
      try {
        const result = await this.createTask(task);
        results.push({ success: true, task: result });
      } catch (error) {
        console.error(`❌ Failed to create task: ${task.name}`, error.message);
        results.push({ success: false, error: error.message, taskName: task.name });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(`✅ Created ${successful}/${tasks.length} tasks successfully`);
    return results;
  }

  async getTasksByStatus(listId, statusKey) {
    const status = this.config.clickup.statuses[statusKey] || statusKey;
    return await this.makeRequest('GET', `/list/${listId}/task?statuses[]=${encodeURIComponent(status)}`);
  }

  async moveTasksToStatus(taskIds, statusKey) {
    const results = [];
    for (const taskId of taskIds) {
      try {
        const result = await this.updateTaskStatus(taskId, statusKey);
        results.push({ success: true, taskId, result });
      } catch (error) {
        results.push({ success: false, taskId, error: error.message });
      }
    }
    return results;
  }

  // Quick creation methods
  async quickCreateFeature(name, description = '', options = {}) {
    return await this.createTaskWithTemplate('feature', name, description, options);
  }

  async quickCreateBug(name, description = '', options = {}) {
    return await this.createTaskWithTemplate('bug', name, description, options);
  }

  async quickCreateDesign(name, description = '', options = {}) {
    return await this.createTaskWithTemplate('design', name, description, options);
  }

  // Project management utilities
  async setupProjectTasks(projectName, tasks) {
    console.log(`🚀 Setting up project: ${projectName}`);
    const projectTasks = tasks.map(task => ({
      ...task,
      name: `[${projectName}] ${task.name}`,
      tags: [...(task.tags || []), projectName.toLowerCase()]
    }));

    return await this.batchCreateTasks(projectTasks);
  }

  async moveToSprint(taskIds) {
    return await this.moveTasksToStatus(taskIds, 'todo');
  }

  async startSprint(taskIds) {
    return await this.moveTasksToStatus(taskIds, 'progress');
  }

  // Utility methods
  printResults(results) {
    console.log('\n📊 Results Summary:');
    console.log('==================');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    if (successful.length > 0) {
      console.log('\n✅ Successful Tasks:');
      successful.forEach(r => {
        const task = r.task || r.result;
        console.log(`  • ${task.name || task.id} ${task.url ? `(${task.url})` : ''}`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Tasks:');
      failed.forEach(r => {
        console.log(`  • ${r.taskName || r.taskId}: ${r.error}`);
      });
    }
  }

  // Test connection
  async testConnection() {
    try {
      console.log('🔍 Testing ClickUp connection...');
      const team = await this.makeRequest('GET', `/team/${this.teamId}`);
      console.log(`✅ Connected to team: ${team.team.name}`);

      const lists = await this.makeRequest('GET', `/team/${this.teamId}/space`);
      console.log(`✅ Found ${lists.spaces.length} spaces`);

      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }
}

export default ClickUpAutomation;
