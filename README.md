# 🚀 ClickUp Automation Toolkit

**Created by:** [Arup Biswas](https://github.com/Arupbiswas09)  
**Repository:** https://github.com/Arupbiswas09/clickup-automation-toolkit.git

> A comprehensive ClickUp automation toolkit for seamless task management, project setup, and workflow automation. Create, manage, and organize ClickUp tasks instantly with CLI tools, batch operations, and AI integration.

**Purpose:** This toolkit was designed to streamline ClickUp task management and improve productivity for development teams worldwide. It provides developers, project managers, and teams with powerful automation capabilities to manage their ClickUp workspaces efficiently.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/clickup-automation-toolkit.svg)](https://www.npmjs.com/package/clickup-automation-toolkit)
[![GitHub stars](https://img.shields.io/github/stars/Arupbiswas09/clickup-automation-toolkit.svg)](https://github.com/Arupbiswas09/clickup-automation-toolkit/stargazers)

## ✨ Features

- 🚀 **Instant Task Creation** - Create tasks in seconds with predefined templates
- 🎯 **Smart Templates** - Pre-configured templates for features, bugs, design, API, tests, and documentation
- 🔧 **CLI Interface** - Powerful command-line tools for task management
- 🎨 **Rich Formatting** - Beautiful task descriptions with emojis and structured content
- ⚡ **Fast & Reliable** - Direct API integration with error handling and validation
- 🔒 **Secure** - Environment-based configuration with no hardcoded credentials
- 📦 **Easy Setup** - One-command installation and configuration

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/clickup-automation-toolkit.git
cd clickup-automation-toolkit

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit your configuration
nano .env
```

### Configuration

1. **Get your ClickUp API Key**:
   - Go to [ClickUp Settings > Apps](https://app.clickup.com/settings/apps)
   - Click "Generate" to create a new API key

2. **Find your Team ID and List ID**:
   - Team ID: Found in your ClickUp URL or via API
   - List ID: Found in the list URL or via API

3. **Configure your `.env` file**:
```env
CLICKUP_API_KEY=your_api_key_here
CLICKUP_TEAM_ID=your_team_id_here
CLICKUP_LIST_ID=your_default_list_id_here
CLICKUP_DEFAULT_ASSIGNEE=your_user_id_here
```

### Test Your Setup

```bash
# Test your connection
npm run cli test

# Or using the CLI directly
./bin/clickup-cli.js test
```

## 📖 Usage

### CLI Commands

#### Basic Commands
```bash
# Test connection
clickup-cli test

# Show configuration
clickup-cli config

# Setup guide
clickup-cli setup

# Show examples
clickup-cli examples
```

#### Create Tasks
```bash
# Basic task creation
clickup-cli create "Fix login bug"

# With description and priority
clickup-cli create "New feature" -d "Detailed description" -p 1

# With assignee
clickup-cli create "Task name" -a "user_id_123"
```

#### Quick Task Types
```bash
# Feature development
clickup-cli feature "User Dashboard" -d "Create responsive user dashboard"

# Bug reports
clickup-cli bug "Login not working" -d "Users can't log in with valid credentials"

# Design tasks
clickup-cli design "Homepage redesign" -d "Modern, responsive homepage design"

# API development
clickup-cli api "User endpoints" -d "Create CRUD endpoints for user management"

# Testing tasks
clickup-cli test "Unit tests" -d "Write comprehensive unit tests"

# Documentation
clickup-cli doc "API documentation" -d "Document all API endpoints"
```

### NPM Scripts

```bash
# Quick task creation
npm run instant feature "Task Name" "Description"
npm run instant:bug "Bug Name" "Bug Description"
npm run instant:design "Design Task" "Design Requirements"
npm run instant:api "API Task" "API Requirements"
npm run instant:test "Test Task" "Test Requirements"
npm run instant:doc "Doc Task" "Documentation Requirements"

# CLI access
npm run cli -- test
npm run cli -- create "Task Name"
```

### Programmatic Usage

```javascript
import ClickUpAutomation from './src/clickup-automation.js';
import InstantTaskCreator from './bin/instant-task.js';

// Using the main automation class
const automation = new ClickUpAutomation();
await automation.createTask('Task Name', 'Description', 2);

// Using the instant task creator
const creator = new InstantTaskCreator();
await creator.quickFeature('New Feature', 'Feature description');
await creator.quickBug('Bug Report', 'Bug description');
```

## 🎯 Task Templates

The toolkit includes pre-configured templates for different task types:

| Type | Emoji | Priority | Description |
|------|-------|----------|-------------|
| **Feature** | 🚀 | High | Feature development with acceptance criteria |
| **Bug** | 🐛 | Urgent | Bug reports with reproduction steps |
| **Design** | 🎨 | High | Design tasks with deliverables checklist |
| **API** | ⚡ | High | API development with endpoint planning |
| **Test** | 🧪 | Normal | Testing tasks with coverage goals |
| **Doc** | 📚 | Normal | Documentation with structured content |
| **General** | 📋 | High | General tasks with basic structure |

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLICKUP_API_KEY` | ✅ | Your ClickUp API key |
| `CLICKUP_TEAM_ID` | ✅ | Your ClickUp team ID |
| `CLICKUP_LIST_ID` | ✅ | Default list ID for tasks |
| `CLICKUP_DEFAULT_ASSIGNEE` | ❌ | Default assignee user ID |

### Custom Configuration

Create a `config/config.json` file (copy from `config/config.example.json`) to customize:

- Task templates and descriptions
- Default priorities and statuses
- Notification settings
- Integration configurations

## 🚀 Advanced Usage

### Batch Task Creation

```javascript
const automation = new ClickUpAutomation();

const tasks = [
    { name: 'Feature 1', description: 'Description 1', type: 'feature' },
    { name: 'Bug Fix 1', description: 'Description 2', type: 'bug' },
    { name: 'Design Task', description: 'Description 3', type: 'design' }
];

await automation.createBatchTasks(tasks);
```

### Custom Task Templates

```javascript
const customTask = await automation.createTemplatedTask('feature', {
    name: 'Custom Feature',
    description: 'Custom description',
    priority: 1,
    assignee: 'user_id_123'
});
```

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t clickup-automation .

# Run with environment file
docker run --env-file .env clickup-automation clickup-cli test

# Run interactive container
docker run -it --env-file .env clickup-automation bash
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📚 API Reference

### ClickUpAutomation Class

#### Methods

- `createTask(name, description, priority, assignee)` - Create a basic task
- `createTemplatedTask(type, options)` - Create task with template
- `createBatchTasks(tasks)` - Create multiple tasks
- `updateTaskStatus(taskId, status)` - Update task status
- `testConnection()` - Test API connection

### InstantTaskCreator Class

#### Methods

- `createTask(name, description, priority, type, assignee)` - Create instant task
- `quickFeature(name, description, assignee)` - Create feature task
- `quickBug(name, description, assignee)` - Create bug task
- `quickDesign(name, description, assignee)` - Create design task
- `quickAPI(name, description, assignee)` - Create API task
- `quickTest(name, description, assignee)` - Create test task
- `quickDoc(name, description, assignee)` - Create documentation task

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone and install
git clone https://github.com/your-username/clickup-automation-toolkit.git
cd clickup-automation-toolkit
npm install

# Set up development environment
cp .env.example .env
# Edit .env with your credentials

# Run tests
npm test

# Start development
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/Arupbiswas09/clickup-automation-toolkit/wiki)
- 🐛 [Issue Tracker](https://github.com/Arupbiswas09/clickup-automation-toolkit/issues)
- 💬 [Discussions](https://github.com/Arupbiswas09/clickup-automation-toolkit/discussions)
- 📧 [Contact Creator](https://github.com/Arupbiswas09)

## 🙏 Acknowledgments

- **Creator:** [Arup Biswas](https://github.com/Arupbiswas09) - Original author and maintainer
- [ClickUp API](https://clickup.com/api) for the excellent API
- [Commander.js](https://github.com/tj/commander.js) for CLI framework
- [Chalk](https://github.com/chalk/chalk) for terminal styling
- All contributors who helped make this project better

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/Arupbiswas09/clickup-automation-toolkit?style=social)
![GitHub forks](https://img.shields.io/github/forks/Arupbiswas09/clickup-automation-toolkit?style=social)
![GitHub issues](https://img.shields.io/github/issues/Arupbiswas09/clickup-automation-toolkit)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Arupbiswas09/clickup-automation-toolkit)

---

**Created with ❤️ by [Arup Biswas](https://github.com/Arupbiswas09)**  
*Empowering teams worldwide with efficient ClickUp automation*

*Transform your task management workflow with the power of automation!*