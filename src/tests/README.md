# WellTegra E2E Tests

End-to-end tests for the WellTegra application demo workflow using Playwright.

## Prerequisites

- Node.js installed
- Dependencies installed: `npm install`

## Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run tests with browser UI visible
```bash
npm run test:headed
```

### Run tests in debug mode (step through)
```bash
npm run test:debug
```

### Run tests with Playwright UI (interactive)
```bash
npm run test:ui
```

### View test report
```bash
npm run test:report
```

## Test Structure

### Demo Workflow Tests (`e2e/demo-workflow.spec.js`)

Tests the complete 5-act demo narrative:

1. **Act 1: Dashboard** - Verify well overview and status display
2. **Act 2: Well Planner** - Navigate and select intervention
3. **Act 3: Equipment Catalog** - Browse equipment and build tool strings
4. **Act 4: Return to Planner** - Verify tool string integration
5. **Act 5: Execution** - Review and prepare for operation

### Critical User Interactions

- Toast notifications
- Authentication persistence
- Search functionality
- Well schematic accessibility

### Data Integration

- Well data loading
- Equipment catalog loading
- Document link validation

## Test Coverage

The E2E tests validate:

- **Navigation flow** between all major views (Dashboard, Planner, Equipment)
- **Equipment catalog** search, filtering, and tool string builder
- **Tool string integration** from Equipment back to Planner
- **Risk assessment** display and calculation
- **Document links** to operational reports and procedures
- **Well schematics** (SVG files) are accessible
- **Authentication** state management
- **User feedback** via toast notifications

## Writing New Tests

Add new test files to the `tests/e2e/` directory following this pattern:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-v23-fresh.html');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Your test code
  });
});
```

## Continuous Integration

Tests are configured to run in CI with:
- Automatic retries (2x on failure)
- Screenshot capture on failure
- Video recording on failure
- JSON and HTML reports

## Debugging Failed Tests

1. Check the HTML report: `npm run test:report`
2. View screenshots in `test-results/`
3. Run in debug mode: `npm run test:debug`
4. Use headed mode to see the browser: `npm run test:headed`

## Test Data

Tests use:
- Mock authentication tokens (set in `beforeEach`)
- Real equipment catalog data (`equipment-catalog.json`)
- Real well data (`comprehensive-well-data.json`)
- Document files in `documents/` directory

## Known Limitations

- Tests assume local server running on port 8000
- Some tests are flexible to handle UI variations (multiple selectors)
- Toast notifications may require specific triggers
- Execution flow may require confirmation dialogs

## Next Steps

To expand test coverage, consider adding:

1. **Component-level tests** for individual modules
2. **API tests** for backend integration (when available)
3. **Performance tests** using Playwright's performance APIs
4. **Accessibility tests** using axe-core
5. **Visual regression tests** using Playwright screenshots
