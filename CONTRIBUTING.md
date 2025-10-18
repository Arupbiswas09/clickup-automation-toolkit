# Contributing to ClickUp Automation Toolkit

Thank you for your interest in contributing to the ClickUp Automation Toolkit! We welcome contributions from the community and are grateful for your help in making this project better.

## 🚀 Getting Started

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- A ClickUp account with API access
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/clickup-automation-toolkit.git
   cd clickup-automation-toolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your ClickUp credentials
   ```

4. **Test your setup**
   ```bash
   npm test
   npm run cli test
   ```

## 🎯 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information**:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Screenshots or error logs if applicable

### Suggesting Features

We love feature suggestions! Please:

1. **Check existing feature requests** first
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider the scope** - smaller, focused features are easier to implement

### Code Contributions

#### Types of Contributions

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🧪 **Tests**
- 🎨 **Code style improvements**
- ⚡ **Performance optimizations**

#### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Follow the coding standards (see below)
   - Write tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new task template feature"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cli): add batch task creation command
fix(api): handle rate limiting errors properly
docs(readme): update installation instructions
test(automation): add unit tests for task creation
```

## 📋 Coding Standards

### JavaScript/Node.js

- **ES Modules**: Use `import/export` syntax
- **Async/Await**: Prefer over Promises and callbacks
- **Error Handling**: Always handle errors appropriately
- **JSDoc**: Document public APIs
- **Naming**: Use camelCase for variables and functions, PascalCase for classes

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### File Structure

```
src/
├── clickup-automation.js    # Main automation class
├── utils/                   # Utility functions
├── templates/              # Task templates
└── types/                  # Type definitions

bin/
├── clickup-cli.js          # CLI interface
└── instant-task.js         # Instant task creator

tests/
├── unit/                   # Unit tests
├── integration/            # Integration tests
└── fixtures/               # Test data

docs/
├── api/                    # API documentation
└── guides/                 # User guides
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/automation.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test API interactions and workflows
- **Use descriptive test names**: `should create task with correct priority`
- **Mock external dependencies**: Use Jest mocks for API calls
- **Test edge cases**: Error conditions, invalid inputs, etc.

Example test:

```javascript
import { describe, it, expect, jest } from '@jest/globals';
import ClickUpAutomation from '../src/clickup-automation.js';

describe('ClickUpAutomation', () => {
    it('should create task with correct priority', async () => {
        const automation = new ClickUpAutomation();
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ id: '123', name: 'Test Task' })
        });
        
        global.fetch = mockFetch;
        
        const result = await automation.createTask('Test Task', 'Description', 1);
        
        expect(result.id).toBe('123');
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/task'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"priority":1')
            })
        );
    });
});
```

## 📚 Documentation

### Types of Documentation

- **README.md**: Overview and quick start
- **API Documentation**: Detailed API reference
- **User Guides**: Step-by-step tutorials
- **Code Comments**: Inline documentation

### Documentation Standards

- **Clear and concise**: Easy to understand
- **Examples**: Include code examples
- **Up-to-date**: Keep in sync with code changes
- **Accessible**: Consider different skill levels

### Updating Documentation

When making changes that affect:
- **Public API**: Update API documentation
- **CLI commands**: Update README and help text
- **Configuration**: Update setup guides
- **New features**: Add examples and guides

## 🔍 Code Review Process

### For Contributors

1. **Self-review** your code before submitting
2. **Write clear PR descriptions** explaining what and why
3. **Respond to feedback** promptly and constructively
4. **Update your PR** based on review comments

### Review Criteria

We look for:
- **Functionality**: Does it work as intended?
- **Code quality**: Is it readable and maintainable?
- **Tests**: Are there adequate tests?
- **Documentation**: Is it properly documented?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version is bumped appropriately
- [ ] Release notes are prepared

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- **Be respectful** and considerate
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Focus on constructive feedback**
- **Respect different perspectives**

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and reviews

## 🆘 Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** and discussions
3. **Ask in GitHub Discussions** for general questions
4. **Create an issue** for bugs or specific problems

## 🙏 Recognition

Contributors are recognized in:
- **README.md**: Contributors section
- **CHANGELOG.md**: Release notes
- **GitHub**: Contributor graphs and statistics

Thank you for contributing to the ClickUp Automation Toolkit! 🎉

---

**Questions?** Feel free to reach out in [GitHub Discussions](https://github.com/your-username/clickup-automation-toolkit/discussions) or create an [issue](https://github.com/your-username/clickup-automation-toolkit/issues).