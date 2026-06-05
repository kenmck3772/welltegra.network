# Contributing to WellTegra Network

Thank you for your interest in contributing to WellTegra Network! This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (for running tests)
- Python 3.9+ (for ML API and data processing)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/welltegra.network.git
   cd welltegra.network
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/kenmck3772/welltegra.network.git
   ```

## Development Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install Python dependencies (optional):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Run tests to verify setup:
   ```bash
   npm test
   ```

## How to Contribute

### Types of Contributions

We welcome the following types of contributions:

1. **Bug Reports**: Found a bug? Please report it!
2. **Feature Requests**: Have an idea? We'd love to hear it!
3. **Code Contributions**: Fix bugs, implement features, improve documentation
4. **Documentation**: Improve README, add inline documentation
5. **Testing**: Write or improve test cases
6. **Data**: Add or improve equipment data, well data, or SOPs

### Areas Needing Help

- **Test Coverage**: Expand E2E tests for all 113 pages
- **Mobile Responsiveness**: Improve mobile experience
- **Performance**: Optimize asset loading and JavaScript
- **Accessibility**: Improve ARIA labels and keyboard navigation
- **Documentation**: Add API documentation for ML endpoints

## Code Style Guidelines

### HTML/CSS/JavaScript

- Use semantic HTML5 elements
- Follow BEM methodology for CSS class names
- Use modern JavaScript (ES6+) features
- Maintain consistent indentation (2 spaces)
- Include comments for complex logic

### Example Code Structure

```html
<div class="well-card" data-well-id="W-123">
  <h3 class="well-card__title">Well W-123</h3>
  <div class="well-card__status well-card__status--active">Active</div>
</div>
```

```javascript
// Function to calculate ROI
function calculateROI(initialInvestment, returns) {
  // Validate inputs
  if (!initialInvestment || !returns) {
    throw new Error('Invalid input parameters');
  }

  const roi = ((returns - initialInvestment) / initialInvestment) * 100;
  return Math.round(roi * 100) / 100; // Round to 2 decimal places
}
```

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run specific test file
npx playwright tests/equipment-catalog.spec.js

# Run tests with UI mode
npm run test:ui
```

### Writing Tests

1. Test user workflows, not just implementation details
2. Use descriptive test names
3. Include assertions for visual consistency
4. Test on multiple viewport sizes

### Test Example

```javascript
test('Equipment catalog shows clash detection warning', async ({ page }) => {
  await page.goto('/equipment.html');

  // Select incompatible tools
  await page.selectOption('#tool1', 'Drill String');
  await page.selectOption('#tool2', 'Incompatible Tool');

  // Verify warning appears
  await expect(page.locator('.clash-warning')).toBeVisible();
  await expect(page.locator('.clash-warning')).toContainText('Equipment clash detected');
});
```

## Submitting Pull Requests

### PR Process

1. Create a new branch from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes:
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. Commit your changes:
   ```bash
   git commit -m "feat: Add equipment clash detection feature"
   ```

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request:
   - Use clear title and description
   - Link related issues
   - Include screenshots for UI changes
   - Ensure CI passes

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### PR Checklist

Before submitting your PR, ensure:

- [ ] Code follows project guidelines
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Responsive design works
- [ ] Accessibility considerations addressed

## Issue Reporting

### Bug Reports

When filing bug reports, please include:

1. Clear description of the issue
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (browser, OS)
5. Screenshots if applicable
6. Console errors (if any)

### Feature Requests

For feature requests:

1. Clear description of the feature
2. Use case or problem it solves
3. Any implementation ideas
4. Example usage scenarios

## Getting Help

If you need help:

- Check existing issues and discussions
- Read the documentation
- Ask questions in GitHub Discussions
- Contact the maintainers

## Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to join our contributor team

Thank you for contributing to WellTegra Network!