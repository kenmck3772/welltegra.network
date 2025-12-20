# WellTegra Portfolio Test Suite

Comprehensive Playwright test suite covering all major portfolio features.

## Test Files

- **portfolio-comprehensive.spec.js** - Main test suite (31 tests covering all features)
- **video-course-flow.spec.js** - P&A course video learning flow tests
- **pa-course.spec.js** - P&A course specific tests

## Quick Start

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Run Tests

**Run all comprehensive tests:**
```bash
npm test tests/portfolio-comprehensive.spec.js
```

**Run with local server:**
```bash
# Terminal 1: Start local server
python3 -m http.server 8000

# Terminal 2: Run tests
PLAYWRIGHT_BASE_URL=http://localhost:8000 npx playwright test tests/portfolio-comprehensive.spec.js
```

**Run specific test suites:**
```bash
# Homepage tests only
npx playwright test tests/portfolio-comprehensive.spec.js -g "Homepage"

# Operations Planner tests only
npx playwright test tests/portfolio-comprehensive.spec.js -g "Operations Planner"

# Equipment Catalog tests only
npx playwright test tests/portfolio-comprehensive.spec.js -g "Equipment Catalog"
```

**Run in headed mode (see browser):**
```bash
npx playwright test tests/portfolio-comprehensive.spec.js --headed
```

**Run with UI mode (interactive):**
```bash
npx playwright test tests/portfolio-comprehensive.spec.js --ui
```

## Test Coverage

### ✅ Homepage (3 tests)
- Portfolio banner visibility
- Navigation links functionality
- Footer disclaimers

### ✅ Operations Planner (5 tests)
- Page loading and key sections
- Risk Priority Matrix with Chart.js
- Equipment/Personnel separation
- Equipment catalog modal
- Well data cards display

### ✅ Equipment Catalog (4 tests)
- Page loading
- Data loading from JSON
- Category display
- Search/filter functionality

### ✅ Historical Runs (4 tests)
- Page loading
- Historical data loading
- Statistics dashboard
- Run cards and detail modals

### ✅ Case Studies & P&A Course (3 tests)
- Case studies page
- P&A course with video player
- Course modules structure

### ✅ Data Integrity (3 tests)
- Wells data validation
- Equipment data validation
- Historical JSON files

### ✅ Responsive Design (3 tests)
- Mobile navigation
- Tablet layout
- Desktop layout

### ✅ Navigation & Cross-linking (2 tests)
- Cross-page navigation
- Consistent portfolio branding

### ✅ Accessibility (2 tests)
- Page titles
- Console error monitoring

### ✅ Performance (2 tests)
- Homepage load time
- Chart.js library loading

## Test Results

**Latest run:** 26/31 passing (84%)

**Known Issues:**
1. Chart.js CDN loading timeout (intermittent)
2. YouTube iframe lazy loading on P&A course
3. Mobile hamburger menu click interception
4. Text matching on portfolio banner (too strict)

## Screenshots

Tests automatically generate screenshots in `screenshots/`:
- homepage-loaded.png
- planner-loaded.png
- equipment-catalog.png
- historical-runs.png
- case-studies.png
- mobile-navigation.png
- tablet-planner.png
- desktop-homepage.png

## Debugging

**View test reports:**
```bash
npx playwright show-report
```

**Debug specific test:**
```bash
npx playwright test tests/portfolio-comprehensive.spec.js -g "should load homepage" --debug
```

**Trace viewer:**
```bash
npx playwright test tests/portfolio-comprehensive.spec.js --trace on
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests are configured to run in GitHub Actions via `.github/workflows/`.

**Run tests in CI mode:**
```bash
CI=true npx playwright test
```

## Configuration

Test configuration in `playwright.config.js`:
- Base URL: `https://welltegra.network` (or use `PLAYWRIGHT_BASE_URL` env var)
- Browser: Chromium
- Timeout: 30 seconds per test
- Screenshots: On failure
- Video: On failure

## Tips

1. **Run tests locally** before pushing to ensure compatibility
2. **Use headed mode** for debugging test failures
3. **Check screenshots** in test-results/ for visual debugging
4. **Update selectors** if UI changes significantly
5. **Run against local server** for faster iteration

## Common Issues

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill
```

**Tests timing out:**
- Increase timeout in playwright.config.js
- Check network connectivity
- Ensure local server is running

**Elements not found:**
- Check if selectors changed in HTML
- Wait for dynamic content to load
- Verify page structure matches test expectations
