# WellTegra Network - Playwright Test Suite

Comprehensive end-to-end testing suite for the WellTegra Network website using Playwright.

## 📋 Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Setup

### Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn
- Python 3 (for local server)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. (Optional) Install system dependencies for browsers:
```bash
npx playwright install-deps
```

## 🏃 Running Tests

### Local Testing

Run all tests against local server:
```bash
npm test
```

Or use the test runner script:
```bash
./tests/run-tests.sh
```

### Production Testing

Run tests against production:
```bash
./tests/run-tests.sh --prod
```

### Different Test Modes

- **UI Mode** (interactive test runner):
  ```bash
  ./tests/run-tests.sh --ui
  ```

- **Debug Mode** (step through tests):
  ```bash
  ./tests/run-tests.sh --debug
  ```

- **Headed Mode** (visible browser):
  ```bash
  ./tests/run-tests.sh --headed
  ```

- **Update Snapshots**:
  ```bash
  ./tests/run-tests.sh --update-snapshots
  ```

### Individual Test Files

Run specific test files:
```bash
npx playwright test tests/site-wide.spec.js
npx playwright test tests/accessibility.spec.js
npx playwright test tests/performance.spec.js
```

### Running Tests by Tag

Run tests for specific browsers:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run mobile tests:
```bash
npx playwright test --project="Mobile Chrome"
```

## 📁 Test Structure

```
tests/
├── site-wide.spec.js      # Main site-wide functionality tests
├── accessibility.spec.js  # Accessibility compliance tests
├── performance.spec.js    # Performance and optimization tests
├── global-setup.js        # Global test setup
├── global-teardown.js     # Global test cleanup
├── run-tests.sh          # Test runner script
└── README.md             # This file
```

## 📊 Test Coverage

### Homepage (`index.html`)
- ✅ Page load and title
- ✅ Navigation menu functionality
- ✅ Mobile navigation toggle
- ✅ ROI Calculator calculations
- ✅ Experience timeline display
- ✅ Data sources section
- ✅ API documentation section
- ✅ Footer links and privacy notice

### Operations Dashboard (`operations-dashboard.html`)
- ✅ Initial state display
- ✅ Risk analysis form submission
- ✅ Chart rendering (risk breakdown, cost-benefit)
- ✅ Dropdown behavior improvements

### Equipment Catalog (`equipment.html`)
- ✅ Equipment loading and display
- ✅ Tab switching (Drilling, Intervention, Completion, P&A)
- ✅ Search functionality
- ✅ Dynamic filtering (type, OD, manufacturer)
- ✅ Equipment selection
- ✅ Equipment detail modal

### SOP Library (`sop-library.html`)
- ✅ SOP loading and display
- ✅ Search functionality
- ✅ Quick filter buttons
- ✅ Clear search
- ✅ SOP detail view

### Planner Page (`planner.html`)
- ✅ Planner interface loading
- ✅ Form inputs
- ✅ AI recommendations feature

### Changelog Page (`changelog.html`)
- ✅ Version history display
- ✅ Version categories (New, Improved, Fixed)

### Cross-Site Functionality
- ✅ Navigation consistency
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Error handling (404 pages)
- ✅ Performance metrics
- ✅ Broken link detection

### Security Tests
- ✅ No sensitive data in client-side code
- ✅ HTTPS enforcement (production)
- ✅ XSS protection

### Accessibility Tests
- ✅ Page titles and headings
- ✅ Image alt text
- ✅ Form labels
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Focus management
- ✅ Screen reader compatibility

### Performance Tests
- ✅ Core Web Vitals
- ✅ Bundle size analysis
- ✅ Image optimization
- ✅ API response times
- ✅ Memory usage
- ✅ Caching headers

## 🔄 CI/CD Integration

### GitHub Actions

The tests are configured to run automatically on:

1. **Pull Requests**: Run tests on changed files
2. **Main Branch Push**: Run full test suite
3. **Scheduled**: Daily performance tests

### GitHub Actions Workflow

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: ${{ failure() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 🛠 Troubleshooting

### Common Issues

1. **Tests fail with "Page crashed"**
   - Increase timeout in `playwright.config.js`
   - Check for memory leaks in test code

2. **Tests fail on CI but pass locally**
   - Ensure all dependencies are installed
   - Check for timing issues (add `await page.waitForTimeout()`)
   - Use `process.env.CI` conditionals

3. **Flaky tests**
   - Add retries in config
   - Use explicit waits instead of timeouts
   - Check for race conditions

4. **Browser not found**
   - Run `npx playwright install`
   - Check system dependencies

### Debugging Tips

1. **Use the VS Code extension**: Install Playwright extension for VS Code
2. **Generate code**: Use `npx playwright codegen` to record actions
3. **Trace viewer**: Run tests with trace enabled
   ```bash
   npx playwright test --trace on
   npx playwright show-trace trace.zip
   ```
4. **Screenshots**: Failed tests automatically capture screenshots
5. **Network**: Monitor network requests in test

### Best Practices

1. **Use locators**: Prefer Playwright locators over CSS selectors
2. **Avoid waits**: Use built-in waiting mechanisms
3. **Test isolation**: Each test should be independent
4. **Descriptive tests**: Use clear test names and descriptions
5. **Page Objects**: Consider using page object pattern for complex pages

## 📈 Adding New Tests

1. Create a new `.spec.js` file in the `tests/` directory
2. Import necessary functions:
   ```javascript
   import { test, expect } from '@playwright/test';
   ```
3. Use the test structure:
   ```javascript
   test.describe('Feature Name', () => {
     test('should do something', async ({ page }) => {
       await page.goto('/page.html');
       // Your test code here
     });
   });
   ```
4. Run the tests to verify they work

## 📝 Notes

- Tests run against local server by default on port 8080
- Use `--prod` flag to test against production
- All tests run in parallel by default (except on CI)
- Videos and traces are captured on failure
- HTML reports are generated automatically

## 🤝 Contributing

When adding new features, please add corresponding tests:

1. Happy path tests
2. Error handling tests
3. Edge case tests
4. Accessibility tests
5. Mobile responsive tests

Remember to update this README when adding new test files or coverage areas.
