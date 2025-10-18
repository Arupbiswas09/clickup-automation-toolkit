#!/usr/bin/env node

/**
 * Advanced Usage Examples for ClickUp Automation Toolkit
 * 
 * This file demonstrates advanced usage patterns, custom configurations,
 * and complex automation scenarios.
 */

import { ClickUpAutomation } from '../src/clickup-automation.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

async function advancedUsageExamples() {
  console.log('🔧 ClickUp Automation Toolkit - Advanced Usage Examples\n');

  try {
    // Example 1: Custom Configuration
    console.log('⚙️ Example 1: Using custom configuration');
    
    const customConfig = {
      apiKey: process.env.CLICKUP_API_KEY,
      teamId: process.env.CLICKUP_TEAM_ID,
      defaultListId: process.env.CLICKUP_LIST_ID,
      defaultAssignee: process.env.CLICKUP_DEFAULT_ASSIGNEE,
      taskTemplates: {
        feature: {
          emoji: '🚀',
          priority: 1,
          color: '#00FF00',
          defaultDescription: 'New feature implementation with custom template'
        },
        hotfix: {
          emoji: '🔥',
          priority: 1,
          color: '#FF0000',
          defaultDescription: 'Critical hotfix that needs immediate attention'
        }
      }
    };

    const automation = new ClickUpAutomation(customConfig);
    console.log('✅ Initialized with custom configuration\n');

    // Example 2: Project Setup Automation
    console.log('🏗️ Example 2: Automated project setup');
    
    const projectTasks = [
      {
        name: 'Project Planning & Requirements',
        type: 'feature',
        priority: 1,
        description: 'Define project scope, requirements, and timeline'
      },
      {
        name: 'Setup Development Environment',
        type: 'feature',
        priority: 1,
        description: 'Configure development tools, CI/CD, and repositories'
      },
      {
        name: 'Database Design & Schema',
        type: 'api',
        priority: 2,
        description: 'Design database schema and create migration scripts'
      },
      {
        name: 'API Architecture Design',
        type: 'api',
        priority: 2,
        description: 'Design RESTful API endpoints and documentation'
      },
      {
        name: 'UI/UX Wireframes',
        type: 'design',
        priority: 2,
        description: 'Create wireframes and user flow diagrams'
      },
      {
        name: 'Frontend Component Library',
        type: 'feature',
        priority: 3,
        description: 'Build reusable UI components and design system'
      },
      {
        name: 'Authentication System',
        type: 'feature',
        priority: 1,
        description: 'Implement user authentication and authorization'
      },
      {
        name: 'Unit Test Suite',
        type: 'test',
        priority: 2,
        description: 'Create comprehensive unit tests for all modules'
      },
      {
        name: 'Integration Testing',
        type: 'test',
        priority: 3,
        description: 'Setup integration tests and API testing'
      },
      {
        name: 'Documentation & Guides',
        type: 'doc',
        priority: 4,
        description: 'Create user guides and technical documentation'
      }
    ];

    console.log('Creating project setup tasks...');
    const projectResults = await automation.createBatchTasks(projectTasks);
    
    const successful = projectResults.filter(r => r.success).length;
    const failed = projectResults.filter(r => !r.success).length;
    
    console.log(`✅ Successfully created ${successful} tasks`);
    if (failed > 0) {
      console.log(`❌ Failed to create ${failed} tasks`);
    }
    console.log();

    // Example 3: Sprint Planning Automation
    console.log('🏃‍♂️ Example 3: Sprint planning automation');
    
    const sprintTasks = await createSprintTasks(automation, 'Sprint 1', [
      { story: 'User Registration', points: 5 },
      { story: 'User Login', points: 3 },
      { story: 'Password Reset', points: 2 },
      { story: 'Profile Management', points: 8 },
      { story: 'Dashboard Overview', points: 5 }
    ]);

    console.log(`Created ${sprintTasks.length} sprint tasks\n`);

    // Example 4: Bug Triage Automation
    console.log('🐛 Example 4: Bug triage automation');
    
    const bugReports = [
      { title: 'Login form validation not working', severity: 'high', browser: 'Chrome' },
      { title: 'Dashboard loading slowly', severity: 'medium', browser: 'Firefox' },
      { title: 'Mobile menu not responsive', severity: 'low', browser: 'Safari' },
      { title: 'Payment processing fails', severity: 'critical', browser: 'All' }
    ];

    const triageResults = await triageBugs(automation, bugReports);
    console.log(`Triaged ${triageResults.length} bug reports\n`);

    // Example 5: Release Management
    console.log('🚀 Example 5: Release management automation');
    
    const releaseVersion = '1.2.0';
    const releaseTasks = await createReleaseTasks(automation, releaseVersion);
    console.log(`Created ${releaseTasks.length} release tasks for version ${releaseVersion}\n`);

    // Example 6: Custom Task Templates
    console.log('🎨 Example 6: Using custom task templates');
    
    // Create a hotfix task using custom template
    const hotfixTask = await automation.createTemplatedTask('hotfix', 'Fix critical security vulnerability', {
      priority: 1,
      assignees: [process.env.CLICKUP_DEFAULT_ASSIGNEE],
      tags: ['security', 'hotfix', 'urgent']
    });
    
    console.log(`🔥 Hotfix task created: ${hotfixTask.name} - ${hotfixTask.url}\n`);

    // Example 7: Task Dependencies and Relationships
    console.log('🔗 Example 7: Managing task dependencies');
    
    const dependencyTasks = await createDependentTasks(automation);
    console.log(`Created ${dependencyTasks.length} dependent tasks\n`);

    // Example 8: Automated Reporting
    console.log('📊 Example 8: Generating task reports');
    
    await generateTaskReport(automation);
    console.log('✅ Task report generated\n');

    // Example 9: Webhook Integration Simulation
    console.log('🔔 Example 9: Webhook integration simulation');
    
    await simulateWebhookIntegration(automation);
    console.log('✅ Webhook integration simulated\n');

    // Example 10: Bulk Task Updates
    console.log('📝 Example 10: Bulk task status updates');
    
    // This would typically be used with actual task IDs
    console.log('Simulating bulk status updates...');
    console.log('✅ Bulk updates completed\n');

    console.log('🎉 All advanced examples completed successfully!');
    console.log('\n📚 Additional Resources:');
    console.log('   - Check examples/integration-examples.js for API integrations');
    console.log('   - See docs/API.md for complete API reference');
    console.log('   - Visit docs/DEPLOYMENT.md for production deployment');

  } catch (error) {
    console.error('❌ Error running advanced examples:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to create sprint tasks
async function createSprintTasks(automation, sprintName, stories) {
  const tasks = [];
  
  for (const story of stories) {
    // Create main story task
    const storyTask = await automation.createFeature(`${story.story} (${story.points} pts)`, {
      description: `User story: ${story.story}\nStory points: ${story.points}\nSprint: ${sprintName}`,
      tags: ['sprint', sprintName.toLowerCase().replace(' ', '-'), `${story.points}pts`]
    });
    tasks.push(storyTask);

    // Create subtasks for the story
    const subtasks = [
      { name: `Design: ${story.story}`, type: 'design' },
      { name: `Develop: ${story.story}`, type: 'feature' },
      { name: `Test: ${story.story}`, type: 'test' },
      { name: `Review: ${story.story}`, type: 'general' }
    ];

    for (const subtask of subtasks) {
      const task = await automation.createTemplatedTask(subtask.type, subtask.name, {
        description: `Subtask for: ${story.story}`,
        tags: ['subtask', sprintName.toLowerCase().replace(' ', '-')]
      });
      tasks.push(task);
    }
  }
  
  return tasks;
}

// Helper function to triage bugs
async function triageBugs(automation, bugReports) {
  const results = [];
  
  for (const bug of bugReports) {
    const priority = getPriorityFromSeverity(bug.severity);
    const task = await automation.createBug(`${bug.title} [${bug.browser}]`, {
      description: `Severity: ${bug.severity}\nBrowser: ${bug.browser}\nStatus: Needs triage`,
      priority,
      tags: ['bug', bug.severity, bug.browser.toLowerCase()]
    });
    results.push(task);
  }
  
  return results;
}

// Helper function to create release tasks
async function createReleaseTasks(automation, version) {
  const releaseTasks = [
    { name: `Code freeze for v${version}`, type: 'general', priority: 1 },
    { name: `QA testing for v${version}`, type: 'test', priority: 1 },
    { name: `Update changelog for v${version}`, type: 'doc', priority: 2 },
    { name: `Create release notes for v${version}`, type: 'doc', priority: 2 },
    { name: `Deploy v${version} to staging`, type: 'general', priority: 1 },
    { name: `Deploy v${version} to production`, type: 'general', priority: 1 },
    { name: `Post-release monitoring v${version}`, type: 'general', priority: 2 }
  ];

  const tasks = [];
  for (const taskData of releaseTasks) {
    const task = await automation.createTemplatedTask(taskData.type, taskData.name, {
      priority: taskData.priority,
      tags: ['release', `v${version}`]
    });
    tasks.push(task);
  }
  
  return tasks;
}

// Helper function to create dependent tasks
async function createDependentTasks(automation) {
  const tasks = [];
  
  // Create parent task
  const parentTask = await automation.createFeature('User Authentication System', {
    description: 'Complete user authentication implementation',
    priority: 1
  });
  tasks.push(parentTask);

  // Create dependent tasks
  const dependentTasks = [
    'Setup authentication database tables',
    'Implement password hashing',
    'Create login API endpoint',
    'Create registration API endpoint',
    'Add JWT token management',
    'Implement password reset flow'
  ];

  for (const taskName of dependentTasks) {
    const task = await automation.createFeature(taskName, {
      description: `Depends on: ${parentTask.name}`,
      tags: ['auth', 'dependent']
    });
    tasks.push(task);
  }
  
  return tasks;
}

// Helper function to generate task report
async function generateTaskReport(automation) {
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTasks: 0,
      tasksByType: {},
      tasksByPriority: {}
    }
  };

  // In a real implementation, you would fetch actual task data
  console.log('📊 Task Report Generated:');
  console.log(`   Timestamp: ${reportData.timestamp}`);
  console.log('   Summary: Report would contain actual task statistics');
  
  // Save report to file
  try {
    await fs.writeFile(
      path.join(process.cwd(), 'reports', `task-report-${Date.now()}.json`),
      JSON.stringify(reportData, null, 2)
    );
    console.log('   Report saved to reports/ directory');
  } catch (error) {
    console.log('   Note: Create reports/ directory to save reports');
  }
}

// Helper function to simulate webhook integration
async function simulateWebhookIntegration(automation) {
  console.log('🔔 Simulating webhook events:');
  
  const webhookEvents = [
    { event: 'task.created', data: { taskId: '123', name: 'New task created' } },
    { event: 'task.updated', data: { taskId: '124', status: 'in progress' } },
    { event: 'task.completed', data: { taskId: '125', completedBy: 'user123' } }
  ];

  for (const event of webhookEvents) {
    console.log(`   Processing ${event.event}: ${JSON.stringify(event.data)}`);
    
    // In a real implementation, you would process the webhook
    // and potentially create follow-up tasks or notifications
    if (event.event === 'task.completed') {
      console.log('     → Would trigger completion notifications');
    }
  }
}

// Helper function to get priority from severity
function getPriorityFromSeverity(severity) {
  const severityMap = {
    'critical': 1,
    'high': 1,
    'medium': 2,
    'low': 3
  };
  return severityMap[severity] || 3;
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  advancedUsageExamples().catch(console.error);
}

export { advancedUsageExamples };