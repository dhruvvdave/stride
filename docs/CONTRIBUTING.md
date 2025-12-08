# Contributing to Stride

First off, thank you for considering contributing to Stride! It's people like you that make Stride such a great tool for the driving community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers at [@dhruvvdave](https://github.com/dhruvvdave). All complaints will be reviewed and investigated promptly and fairly.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template**:
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - Device: [e.g. iPhone 14 Pro, Samsung Galaxy S23]
 - OS: [e.g. iOS 17.2, Android 14]
 - App Version: [e.g. 1.0.0]
 - Backend Version: [if applicable]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

**Feature Request Template**:
```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Which tier should this feature be in?**
- [ ] Free tier
- [ ] Premium tier
- [ ] Both

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Commit your changes (see commit guidelines)
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm** or **yarn**
- **PostgreSQL**: 15+ with PostGIS extension
- **Redis**: 4+
- **Git**

For mobile development:
- **React Native CLI**
- **Xcode** (for iOS, macOS only)
- **Android Studio** (for Android)

### Backend Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stride.git
cd stride

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Set up database
createdb stride_dev
psql stride_dev -c "CREATE EXTENSION postgis;"

# Run migrations
npm run migrate

# Seed test data (optional)
npm run seed

# Start development server
npm run dev
```

The backend should now be running at `http://localhost:3000`

### Mobile Setup

```bash
# From project root
cd mobile
npm install

# iOS (macOS only)
cd ios
pod install
cd ..
npm run ios

# Android
npm run android
```

### Web Setup

```bash
# From project root
cd web
npm install
npm run dev
```

The web app should now be running at `http://localhost:5173`

### Running Tests

```bash
# Backend
cd backend
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage

# Mobile
cd mobile
npm test

# Web
cd web
npm test
```

### Database Migrations

```bash
# Create a new migration
cd backend
npm run migration:create -- add_new_feature

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

## Pull Request Process

### Before Submitting

1. **Update documentation** if you've changed APIs or added features
2. **Add tests** for new functionality
3. **Ensure all tests pass** locally
4. **Run linter** and fix any issues
5. **Update CHANGELOG.md** if applicable
6. **Test manually** on device/browser

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issue
Closes #[issue number]

## How Has This Been Tested?
Describe the tests you ran and their results.

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. At least one maintainer must review and approve
2. All CI checks must pass
3. No merge conflicts
4. Code follows project standards
5. Documentation is updated

### After Merge

- Delete your feature branch
- Update your fork's main branch
- Close related issues if not auto-closed

## Coding Standards

### General Principles

- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)
- **Write self-documenting code**
- **Favor composition over inheritance**

### JavaScript/Node.js

```javascript
// Use ES6+ features
const myFunction = async (param) => {
  // Code here
};

// Use destructuring
const { name, email } = user;

// Use template literals
const message = `Hello, ${name}!`;

// Proper error handling
try {
  await someAsyncFunction();
} catch (error) {
  logger.error('Error in someAsyncFunction:', error);
  throw error;
}

// Use meaningful variable names
const userCount = 10; // Good
const x = 10; // Bad
```

### React/React Native

```jsx
// Functional components with hooks
const MyComponent = ({ title, onPress }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

// PropTypes or TypeScript for type checking
MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
};
```

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.js`)
- **Utilities**: camelCase (e.g., `dateFormatter.js`)
- **Constants**: UPPER_SNAKE_CASE file (e.g., `API_CONSTANTS.js`)
- **Tests**: Same as file being tested with `.test.js` or `.spec.js`

### Formatting

We use **ESLint** and **Prettier** for code formatting:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format with Prettier
npm run format
```

### Comments

```javascript
// Good: Explain WHY, not WHAT
// Using exponential backoff to avoid overwhelming the API
await retryWithBackoff(apiCall);

// Bad: Explaining obvious code
// Increment i by 1
i++;

// Documentation comments for functions
/**
 * Calculate the optimal route avoiding obstacles
 * @param {Object} start - Starting coordinates {lat, lon}
 * @param {Object} end - Ending coordinates {lat, lon}
 * @param {Object} options - Route preferences
 * @returns {Promise<Object>} Route object with geometry and metadata
 */
async function calculateRoute(start, end, options) {
  // Implementation
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD changes

### Examples

```bash
feat(navigation): add alternative route suggestions

Implemented algorithm to suggest up to 3 alternative routes based on
different optimization criteria (fastest, smoothest, shortest).

Closes #123

fix(obstacles): correct severity calculation for potholes

The severity was being calculated incorrectly for potholes larger than
30cm. Updated the formula to properly scale severity from 1-5.

docs(api): update authentication endpoint documentation

Added examples for refresh token flow and clarified token expiration
times.

perf(map): optimize obstacle marker rendering

Reduced initial render time by 40% by implementing marker clustering
and viewport-based loading.
```

## Issue Guidelines

### Labels

We use labels to categorize issues:

- **bug**: Something isn't working
- **enhancement**: New feature or request
- **documentation**: Improvements or additions to documentation
- **good first issue**: Good for newcomers
- **help wanted**: Extra attention is needed
- **priority: high/medium/low**: Priority level
- **status: in progress**: Currently being worked on
- **status: blocked**: Blocked by other issues or decisions

### Milestones

Issues are organized into milestones representing releases or project phases:
- Phase 1: MVP
- Phase 2: Community & Growth
- Phase 3: AI & Scale

## Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Aim for >80% code coverage
- Test edge cases and error conditions

```javascript
describe('calculateDistance', () => {
  test('calculates distance between two points', () => {
    const pointA = { lat: 43.6532, lon: -79.3832 };
    const pointB = { lat: 43.7184, lon: -79.5181 };
    const distance = calculateDistance(pointA, pointB);
    expect(distance).toBeCloseTo(15420, -2);
  });

  test('returns 0 for same point', () => {
    const point = { lat: 43.6532, lon: -79.3832 };
    const distance = calculateDistance(point, point);
    expect(distance).toBe(0);
  });
});
```

### Integration Tests

- Test API endpoints
- Test database interactions
- Use test database
- Clean up after tests

```javascript
describe('POST /api/v1/obstacles', () => {
  test('creates new obstacle', async () => {
    const response = await request(app)
      .post('/api/v1/obstacles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'pothole',
        location: { lat: 43.6532, lon: -79.3832 },
        severity: 4
      });

    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('pothole');
  });
});
```

### E2E Tests

- Test complete user flows
- Run on staging environment
- Test critical paths (auth, navigation, reporting)

## Documentation

- Update README.md for user-facing changes
- Update API_DOCUMENTATION.md for API changes
- Add JSDoc comments for functions
- Update CHANGELOG.md for releases
- Write clear commit messages

## Community

- **GitHub Discussions**: Ask questions, share ideas
- **Issues**: Report bugs, request features
- **Pull Requests**: Contribute code
- **Discord** (coming soon): Real-time chat

## Recognition

Contributors will be:
- Listed in README.md contributors section
- Credited in release notes
- Eligible for swag (coming soon)
- Featured on website (with permission)

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion on GitHub Discussions
- Reach out to [@dhruvvdave](https://github.com/dhruvvdave)

Thank you for contributing to Stride! 🚗💨
