# Testing Guide for Well-Tegra

## Overview

This guide covers testing strategies, frameworks, and best practices for the Well-Tegra application.

## Testing Stack

- **Playwright** - E2E and integration tests
- **Jest** (optional) - Unit tests for pure functions
- **Testing Library** (future) - Component testing

## Test Structure

```
tests/
├── unit/                  # Unit tests
│   ├── security-utils.spec.js
│   ├── crypto-utils.spec.js
│   ├── fetch-utils.spec.js
│   └── performance-utils.spec.js
├── integration/           # Integration tests
│   ├── navigation.spec.js
│   ├── planner.spec.js
│   └── mobile-communicator.spec.js
├── e2e/                   # End-to-end tests
│   ├── smoke.spec.js     # Critical paths
│   ├── user-flows.spec.js
│   └── blueprint.spec.js
└── support/               # Test utilities
    └── planner-fixture.js
```

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test File

```bash
npm test tests/unit/security-utils.spec.js
```

### Watch Mode

```bash
npm test -- --watch
```

### With UI

```bash
npx playwright test --ui
```

### Headed Mode (see browser)

```bash
npx playwright test --headed
```

## Writing Unit Tests

Unit tests should be fast, isolated, and test a single function or method.

### Example: Testing Pure Functions

```javascript
const { test, expect } = require('@playwright/test');

test.describe('escapeHTML', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000/index.html');
    });

    test('should escape special characters', async ({ page }) => {
        const result = await page.evaluate(() => {
            return escapeHTML('<script>alert("XSS")</script>');
        });

        expect(result).toContain('&lt;script&gt;');
    });

    test('should handle edge cases', async ({ page }) => {
        const results = await page.evaluate(() => {
            return {
                empty: escapeHTML(''),
                null: escapeHTML(null),
                undefined: escapeHTML(undefined)
            };
        });

        expect(results.empty).toBe('');
        expect(results.null).toBe('');
        expect(results.undefined).toBe('');
    });
});
```

### Example: Testing Async Functions

```javascript
test.describe('Crypto Utilities', () => {
    test('should encrypt and decrypt', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const encrypted = await encryptData('secret', 'password');
            const decrypted = await decryptData(encrypted, 'password');
            return decrypted === 'secret';
        });

        expect(result).toBe(true);
    });
});
```

## Writing Integration Tests

Integration tests verify that multiple components work together correctly.

### Example: Navigation Integration

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
    });

    test('should navigate between views', async ({ page }) => {
        // Click planner link
        await page.click('#planner-nav-link');

        // Verify URL updated
        await expect(page).toHaveURL(/#planner-view$/);

        // Verify view is visible
        const plannerView = await page.locator('#planner-view');
        await expect(plannerView).toBeVisible();

        // Verify tab is active
        const activeTab = await page.locator('.nav-link.active');
        await expect(activeTab).toHaveAttribute('href', '#planner-view');
    });

    test('should support browser back/forward', async ({ page }) => {
        // Navigate to planner
        await page.click('#planner-nav-link');
        await page.waitForURL(/#planner-view$/);

        // Navigate to logistics
        await page.click('#logistics-nav-link');
        await page.waitForURL(/#logistics-view$/);

        // Go back
        await page.goBack();
        await expect(page).toHaveURL(/#planner-view$/);

        // Go forward
        await page.goForward();
        await expect(page).toHaveURL(/#logistics-view$/);
    });
});
```

### Example: Form Validation

```javascript
test.describe('Mobile Communicator', () => {
    test('should validate email and PIN', async ({ page }) => {
        await page.goto('http://localhost:8000');

        // Open mobile communicator
        await page.click('#mobile-communicator-toggle');

        // Try to approve without valid credentials
        await page.fill('#communicator-email', 'invalid-email');
        await page.fill('#communicator-pin', '123'); // Too short

        await page.click('button[data-decision="approve"]');

        // Should show error
        const feedback = await page.locator('#communicator-feedback');
        await expect(feedback).toContainText('failed');
    });
});
```

## Writing E2E Tests

E2E tests simulate real user workflows from start to finish.

### Example: Complete User Flow

```javascript
test.describe('Well Planning Flow', () => {
    test('should create and review a plan', async ({ page }) => {
        await page.goto('http://localhost:8000');

        // Step 1: Navigate to planner
        await page.click('#planner-nav-link');

        // Step 2: Select a well
        await page.selectOption('#well-select', 'W666');

        // Wait for well to load
        await page.waitForSelector('#well-details');

        // Step 3: Select objective
        await page.click('input[value="scale-removal"]');

        // Step 4: Generate plan
        await page.click('#generate-plan-btn');

        // Wait for plan generation
        await page.waitForSelector('#generated-plan', { timeout: 10000 });

        // Step 5: Verify plan contains expected elements
        const planText = await page.locator('#generated-plan').textContent();
        expect(planText).toContain('Intervention');
        expect(planText).toContain('Step');

        // Step 6: Navigate to analytics
        await page.click('#analytics-nav-link');

        // Step 7: Verify analytics are populated
        const costSavings = await page.locator('#cost-savings');
        await expect(costSavings).toBeVisible();
    });
});
```

## Test Fixtures

Use fixtures to share test data and setup code.

### Example: Planner Fixture

```javascript
// tests/support/planner-fixture.js
const { test as base } = require('@playwright/test');

exports.test = base.extend({
    plannerPage: async ({ page }, use) => {
        await page.goto('http://localhost:8000');
        await page.click('#planner-nav-link');
        await page.waitForSelector('#planner-view');

        // Provide page with planner loaded
        await use(page);
    },

    wellWithPlan: async ({ page }, use) => {
        await page.goto('http://localhost:8000');
        await page.click('#planner-nav-link');
        await page.selectOption('#well-select', 'W666');
        await page.click('input[value="scale-removal"]');
        await page.click('#generate-plan-btn');
        await page.waitForSelector('#generated-plan');

        await use(page);
    }
});

// Usage
const { test } = require('./support/planner-fixture');

test('analytics requires a plan', async ({ wellWithPlan }) => {
    await wellWithPlan.click('#analytics-nav-link');
    const chart = await wellWithPlan.locator('#cost-chart');
    await expect(chart).toBeVisible();
});
```

## Mocking External APIs

### Example: Mock Fetch Responses

```javascript
test.describe('Data Export', () => {
    test('should handle failed CSV fetch', async ({ page }) => {
        // Intercept and mock API calls
        await page.route('**/data-well-666.csv', route => {
            route.abort('failed');
        });

        await page.goto('http://localhost:8000');
        await page.click('#data-nav-link');

        // Verify error handling
        const errorMsg = await page.locator('.error-message');
        await expect(errorMsg).toBeVisible();
    });

    test('should load CSV successfully', async ({ page }) => {
        // Mock successful response
        await page.route('**/data-well-666.csv', route => {
            route.fulfill({
                status: 200,
                contentType: 'text/csv',
                body: 'id,name,value\n1,test,100'
            });
        });

        await page.goto('http://localhost:8000');
        await page.click('#data-nav-link');

        const recordCount = await page.locator('#record-count');
        await expect(recordCount).toContainText('1');
    });
});
```

## Visual Regression Testing

```javascript
test.describe('Visual Tests', () => {
    test('should match homepage screenshot', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await expect(page).toHaveScreenshot('homepage.png');
    });

    test('should match planner view', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.click('#planner-nav-link');
        await expect(page).toHaveScreenshot('planner.png');
    });
});
```

## Performance Testing

```javascript
test.describe('Performance', () => {
    test('should load in under 3 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000);
    });

    test('should lazy load hero video', async ({ page }) => {
        await page.goto('http://localhost:8000');

        const video = await page.locator('#hero-video');
        const preload = await video.getAttribute('preload');

        expect(preload).toBe('none');
    });
});
```

## Accessibility Testing

```javascript
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accessibility', () => {
    test('should have no a11y violations', async ({ page }) => {
        await page.goto('http://localhost:8000');
        await injectAxe(page);
        await checkA11y(page);
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('http://localhost:8000');

        // Tab through navigation
        await page.keyboard.press('Tab'); // Skip to content link
        await page.keyboard.press('Tab'); // First nav link

        const focused = await page.evaluate(() => document.activeElement.id);
        expect(focused).toBe('home-nav-link');
    });
});
```

## Code Coverage

Run tests with coverage:

```bash
npx playwright test --coverage
```

View coverage report:

```bash
npx nyc report --reporter=html
open coverage/index.html
```

## Test Organization Best Practices

### 1. Use Descriptive Test Names

```javascript
// ✅ Good
test('should validate email and show error for invalid format', ...);

// ❌ Bad
test('email test', ...);
```

### 2. Follow AAA Pattern

```javascript
test('should update state on well selection', async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:8000');
    await page.click('#planner-nav-link');

    // Act
    await page.selectOption('#well-select', 'W666');

    // Assert
    const wellName = await page.locator('#selected-well-name');
    await expect(wellName).toContainText('W666');
});
```

### 3. Keep Tests Independent

```javascript
// ✅ Good - Each test starts fresh
test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
});

// ❌ Bad - Tests depend on each other
test('first test', ...);
test('second test that depends on first', ...);
```

### 4. Use Page Objects for Complex Flows

```javascript
class PlannerPage {
    constructor(page) {
        this.page = page;
        this.wellSelect = page.locator('#well-select');
        this.generateBtn = page.locator('#generate-plan-btn');
    }

    async selectWell(wellId) {
        await this.wellSelect.selectOption(wellId);
    }

    async generatePlan() {
        await this.generateBtn.click();
        await this.page.waitForSelector('#generated-plan');
    }
}

test('should generate plan', async ({ page }) => {
    const planner = new PlannerPage(page);
    await planner.selectWell('W666');
    await planner.generatePlan();
    // assertions...
});
```

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Test Coverage Goals

- **Unit Tests**: 80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Happy paths + error scenarios

### Priority Test Areas

1. **Security** - Input sanitization, XSS prevention
2. **Data Validation** - Email, PIN, form inputs
3. **State Management** - App state updates
4. **Navigation** - View routing, browser history
5. **Data Export** - CSV downloads, fingerprints
6. **Mobile Communicator** - Approval workflow
7. **Plan Generation** - Well selection, objectives

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [AAA Pattern](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)
