# API Reference

This document provides detailed information about the ClickUp Automation Toolkit API.

## Table of Contents

- [ClickUpAutomation Class](#clickupautomation-class)
- [Configuration](#configuration)
- [Methods](#methods)
- [Task Templates](#task-templates)
- [Error Handling](#error-handling)
- [Examples](#examples)

## ClickUpAutomation Class

The main class for interacting with the ClickUp API.

### Constructor

```javascript
import { ClickUpAutomation } from './src/clickup-automation.js';

const automation = new ClickUpAutomation(config);
```

#### Parameters

- `config` (Object, optional): Configuration object
  - `apiKey` (string): ClickUp API key
  - `teamId` (string): ClickUp team ID
  - `defaultListId` (string): Default list ID for tasks
  - `defaultAssignee` (string, optional): Default assignee user ID

If no config is provided, the constructor will attempt to load configuration from:
1. Environment variables
2. `config/config.json` file
3. Default values

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLICKUP_API_KEY` | Yes | Your ClickUp API key |
| `CLICKUP_TEAM_ID` | Yes | Your ClickUp team ID |
| `CLICKUP_LIST_ID` | Yes | Default list ID for tasks |
| `CLICKUP_DEFAULT_ASSIGNEE` | No | Default assignee user ID |
| `NODE_ENV` | No | Environment (development/production/test) |
| `DEBUG` | No | Enable debug logging (true/false) |

### Configuration File

Create a `config/config.json` file:

```json
{
  "apiKey": "your_api_key",
  "teamId": "your_team_id",
  "defaultListId": "your_list_id",
  "defaultAssignee": "user_id",
  "taskTemplates": {
    "feature": {
      "emoji": "✨",
      "priority": 2,
      "color": "#7CE38B"
    }
  }
}
```

## Methods

### testConnection()

Tests the connection to ClickUp API.

```javascript
const isConnected = await automation.testConnection();
```

**Returns:** `Promise<boolean>` - True if connection is successful

**Example:**
```javascript
try {
  const connected = await automation.testConnection();
  if (connected) {
    console.log('✅ Connected to ClickUp');
  }
} catch (error) {
  console.error('❌ Connection failed:', error.message);
}
```

### createTask(taskData)

Creates a new task in ClickUp.

```javascript
const task = await automation.createTask({
  name: 'Task name',
  description: 'Task description',
  priority: 2,
  assignees: ['user_id']
});
```

#### Parameters

- `taskData` (Object): Task configuration
  - `name` (string, required): Task name
  - `description` (string, optional): Task description
  - `priority` (number, optional): Priority (1=urgent, 2=high, 3=normal, 4=low)
  - `assignees` (Array<string>, optional): Array of user IDs
  - `listId` (string, optional): List ID (uses default if not provided)
  - `tags` (Array<string>, optional): Array of tag names
  - `dueDate` (number, optional): Due date timestamp
  - `status` (string, optional): Task status

**Returns:** `Promise<Object>` - Created task object

### createTemplatedTask(type, name, customData)

Creates a task using predefined templates.

```javascript
const task = await automation.createTemplatedTask('feature', 'New login system', {
  assignees: ['user_id'],
  priority: 1
});
```

#### Parameters

- `type` (string, required): Template type ('feature', 'bug', 'design', 'api', 'test', 'doc', 'general')
- `name` (string, required): Task name
- `customData` (Object, optional): Additional task data to override template defaults

**Returns:** `Promise<Object>` - Created task object

### generateTaskDescription(type, name)

Generates a description for a task based on its type.

```javascript
const description = automation.generateTaskDescription('feature', 'User authentication');
```

#### Parameters

- `type` (string, required): Task type
- `name` (string, required): Task name

**Returns:** `string` - Generated description

### updateTaskStatus(taskId, status)

Updates the status of an existing task.

```javascript
await automation.updateTaskStatus('task_id', 'in progress');
```

#### Parameters

- `taskId` (string, required): Task ID
- `status` (string, required): New status

**Returns:** `Promise<Object>` - Updated task object

### createBatchTasks(tasksData)

Creates multiple tasks in batch.

```javascript
const results = await automation.createBatchTasks([
  { name: 'Task 1', type: 'feature' },
  { name: 'Task 2', type: 'bug' },
  { name: 'Task 3', type: 'design' }
]);
```

#### Parameters

- `tasksData` (Array<Object>, required): Array of task objects
  - Each object can contain any valid task data
  - `type` field will use templated creation if provided

**Returns:** `Promise<Array<Object>>` - Array of results with success/error status

### Quick Creation Methods

Convenience methods for common task types:

```javascript
// Feature task
const featureTask = await automation.createFeature('New user dashboard');

// Bug task
const bugTask = await automation.createBug('Login button not working');

// Design task
const designTask = await automation.createDesign('Mobile app wireframes');

// API task
const apiTask = await automation.createAPI('User authentication endpoint');

// Test task
const testTask = await automation.createTest('Unit tests for user service');

// Documentation task
const docTask = await automation.createDoc('API documentation update');
```

All quick creation methods accept:
- `name` (string, required): Task name
- `customData` (Object, optional): Additional task data

## Task Templates

### Available Templates

| Type | Emoji | Default Priority | Color | Description |
|------|-------|------------------|-------|-------------|
| feature | ✨ | 2 (High) | #7CE38B | New features and enhancements |
| bug | 🐛 | 1 (Urgent) | #FF6B6B | Bug fixes and issues |
| design | 🎨 | 3 (Normal) | #4ECDC4 | Design and UI/UX tasks |
| api | 🔌 | 2 (High) | #45B7D1 | API development and integration |
| test | 🧪 | 3 (Normal) | #96CEB4 | Testing and quality assurance |
| doc | 📚 | 4 (Low) | #FFEAA7 | Documentation and guides |
| general | 📋 | 3 (Normal) | #DDA0DD | General tasks and miscellaneous |

### Custom Templates

You can customize templates in your `config.json`:

```json
{
  "taskTemplates": {
    "feature": {
      "emoji": "🚀",
      "priority": 1,
      "color": "#00FF00",
      "defaultDescription": "Custom feature template"
    },
    "custom": {
      "emoji": "⭐",
      "priority": 2,
      "color": "#FF00FF",
      "defaultDescription": "Custom task type"
    }
  }
}
```

## Error Handling

The API uses custom error classes for different types of failures:

### ClickUpAPIError

Thrown when ClickUp API returns an error.

```javascript
try {
  await automation.createTask({ name: 'Test' });
} catch (error) {
  if (error.name === 'ClickUpAPIError') {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Response:', error.response);
  }
}
```

### ConfigurationError

Thrown when configuration is invalid or missing.

```javascript
try {
  const automation = new ClickUpAutomation();
} catch (error) {
  if (error.name === 'ConfigurationError') {
    console.error('Config Error:', error.message);
  }
}
```

### Common Error Scenarios

1. **Invalid API Key**
   ```javascript
   // Error: Invalid API key or insufficient permissions
   ```

2. **Missing Required Fields**
   ```javascript
   // Error: Task name is required
   ```

3. **Invalid List ID**
   ```javascript
   // Error: List not found or access denied
   ```

4. **Rate Limiting**
   ```javascript
   // Error: Rate limit exceeded, please try again later
   ```

## Examples

### Basic Usage

```javascript
import { ClickUpAutomation } from './src/clickup-automation.js';

// Initialize with environment variables
const automation = new ClickUpAutomation();

// Test connection
const connected = await automation.testConnection();
if (!connected) {
  throw new Error('Failed to connect to ClickUp');
}

// Create a simple task
const task = await automation.createTask({
  name: 'Review pull request #123',
  description: 'Review and merge the authentication feature',
  priority: 2,
  assignees: ['user_id_here']
});

console.log(`Created task: ${task.url}`);
```

### Using Templates

```javascript
// Create different types of tasks
const featureTask = await automation.createFeature('Implement dark mode');
const bugTask = await automation.createBug('Fix memory leak in dashboard');
const designTask = await automation.createDesign('Create mobile mockups');

// Create with custom data
const customTask = await automation.createTemplatedTask('api', 'User API endpoint', {
  priority: 1,
  assignees: ['dev_user_id'],
  tags: ['backend', 'urgent']
});
```

### Batch Operations

```javascript
// Create multiple tasks at once
const taskData = [
  { name: 'Setup project structure', type: 'feature' },
  { name: 'Create database schema', type: 'api' },
  { name: 'Design user interface', type: 'design' },
  { name: 'Write unit tests', type: 'test' }
];

const results = await automation.createBatchTasks(taskData);

// Check results
results.forEach((result, index) => {
  if (result.success) {
    console.log(`✅ Task ${index + 1}: ${result.task.url}`);
  } else {
    console.error(`❌ Task ${index + 1}: ${result.error}`);
  }
});
```

### Advanced Configuration

```javascript
// Custom configuration
const automation = new ClickUpAutomation({
  apiKey: 'your_api_key',
  teamId: 'your_team_id',
  defaultListId: 'your_list_id',
  defaultAssignee: 'your_user_id',
  taskTemplates: {
    feature: {
      emoji: '🚀',
      priority: 1,
      color: '#00FF00'
    }
  }
});

// Create task with custom template
const task = await automation.createTemplatedTask('feature', 'New feature');
```

### Error Handling

```javascript
try {
  const task = await automation.createTask({
    name: 'Test task',
    priority: 2
  });
  
  console.log('Task created successfully:', task.url);
} catch (error) {
  switch (error.name) {
    case 'ConfigurationError':
      console.error('Configuration issue:', error.message);
      break;
    case 'ClickUpAPIError':
      console.error('ClickUp API error:', error.message);
      console.error('Status code:', error.status);
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
}
```

## Rate Limiting

The ClickUp API has rate limits. The toolkit includes basic rate limiting handling:

- Automatic retry with exponential backoff
- Rate limit detection and waiting
- Configurable request delays

```javascript
// Configure rate limiting (optional)
const automation = new ClickUpAutomation({
  // ... other config
  rateLimitDelay: 1000, // 1 second between requests
  maxRetries: 3
});
```

## TypeScript Support

While the toolkit is written in JavaScript, TypeScript definitions are available:

```typescript
import { ClickUpAutomation, TaskData, TaskTemplate } from 'clickup-automation-toolkit';

const automation: ClickUpAutomation = new ClickUpAutomation();

const taskData: TaskData = {
  name: 'TypeScript task',
  priority: 2
};

const task = await automation.createTask(taskData);
```