#!/usr/bin/env node

/**
 * Basic Usage Examples for ClickUp Automation Toolkit
 * 
 * This file demonstrates common usage patterns and examples
 * for the ClickUp Automation Toolkit.
 */

import { ClickUpAutomation } from '../src/clickup-automation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function basicUsageExamples() {
  console.log('🚀 ClickUp Automation Toolkit - Basic Usage Examples\n');

  try {
    // Initialize the automation toolkit
    console.log('1. Initializing ClickUp Automation...');
    const automation = new ClickUpAutomation();

    // Test connection
    console.log('2. Testing connection to ClickUp API...');
    const isConnected = await automation.testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to ClickUp API');
      console.log('Please check your API credentials in .env file');
      return;
    }
    
    console.log('✅ Successfully connected to ClickUp API\n');

    // Example 1: Create a simple task
    console.log('📝 Example 1: Creating a simple task');
    const simpleTask = await automation.createTask({
      name: 'Review quarterly reports',
      description: 'Review and analyze Q4 performance reports',
      priority: 2 // High priority
    });
    console.log(`✅ Created task: ${simpleTask.name}`);
    console.log(`   URL: ${simpleTask.url}\n`);

    // Example 2: Create templated tasks
    console.log('🎨 Example 2: Creating templated tasks');
    
    const featureTask = await automation.createFeature('Implement user dashboard');
    console.log(`✨ Feature task: ${featureTask.name} - ${featureTask.url}`);
    
    const bugTask = await automation.createBug('Fix login redirect issue');
    console.log(`🐛 Bug task: ${bugTask.name} - ${bugTask.url}`);
    
    const designTask = await automation.createDesign('Create mobile app wireframes');
    console.log(`🎨 Design task: ${designTask.name} - ${designTask.url}\n`);

    // Example 3: Create task with custom assignee
    console.log('👤 Example 3: Creating task with assignee');
    const assignedTask = await automation.createTask({
      name: 'Code review for authentication module',
      description: 'Review the new authentication implementation',
      priority: 1, // Urgent
      assignees: [process.env.CLICKUP_DEFAULT_ASSIGNEE || 'user_id_here']
    });
    console.log(`✅ Assigned task: ${assignedTask.name} - ${assignedTask.url}\n`);

    // Example 4: Batch task creation
    console.log('📦 Example 4: Creating multiple tasks in batch');
    const batchTasks = [
      { name: 'Setup project repository', type: 'feature' },
      { name: 'Create database schema', type: 'api' },
      { name: 'Design user interface mockups', type: 'design' },
      { name: 'Write unit tests', type: 'test' },
      { name: 'Update API documentation', type: 'doc' }
    ];

    const batchResults = await automation.createBatchTasks(batchTasks);
    
    console.log('Batch creation results:');
    batchResults.forEach((result, index) => {
      if (result.success) {
        console.log(`  ✅ ${batchTasks[index].name} - ${result.task.url}`);
      } else {
        console.log(`  ❌ ${batchTasks[index].name} - Error: ${result.error}`);
      }
    });
    console.log();

    // Example 5: Create task with custom template data
    console.log('⚙️ Example 5: Creating task with custom template data');
    const customTask = await automation.createTemplatedTask('api', 'User authentication endpoint', {
      priority: 1,
      assignees: [process.env.CLICKUP_DEFAULT_ASSIGNEE || 'user_id_here'],
      tags: ['backend', 'security', 'urgent']
    });
    console.log(`🔌 API task: ${customTask.name} - ${customTask.url}\n`);

    // Example 6: Generate task descriptions
    console.log('📄 Example 6: Generating task descriptions');
    const descriptions = [
      { type: 'feature', name: 'Dark mode toggle' },
      { type: 'bug', name: 'Memory leak in dashboard' },
      { type: 'design', name: 'Mobile responsive layout' }
    ];

    descriptions.forEach(({ type, name }) => {
      const description = automation.generateTaskDescription(type, name);
      console.log(`${type.toUpperCase()}: ${name}`);
      console.log(`Description: ${description}\n`);
    });

    console.log('🎉 All examples completed successfully!');
    console.log('\n📚 For more examples, check out:');
    console.log('   - examples/advanced-usage.js');
    console.log('   - examples/integration-examples.js');
    console.log('   - docs/API.md');

  } catch (error) {
    console.error('❌ Error running examples:', error.message);
    
    if (error.name === 'ConfigurationError') {
      console.log('\n💡 Configuration Help:');
      console.log('   1. Copy .env.example to .env');
      console.log('   2. Add your ClickUp API credentials');
      console.log('   3. Run: npm run setup');
    } else if (error.name === 'ClickUpAPIError') {
      console.log('\n💡 API Error Help:');
      console.log('   - Check your API key permissions');
      console.log('   - Verify team and list IDs are correct');
      console.log('   - Check ClickUp API status');
    }
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExamples().catch(console.error);
}

export { basicUsageExamples };