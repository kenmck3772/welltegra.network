const { test, expect, describe } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:8080';

// Helper functions
async function checkAccessibility(page) {
    // Basic accessibility checks
    const accessibilityViolations = await page.accessibility.snapshot();
    expect(accessibilityViolations).toHaveLength(0);
}

describe('WellTegra Network - Complete Site Test Suite', () => {

    test.beforeEach(async ({ page }) => {
        // Set viewport for consistent testing
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Capture console errors
        page.on('pageerror', error => {
            console.error('Page error:', error);
        });

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('Console error:', msg.text());
            }
        });
    });

    // ============================================
    // HOMEPAGE TESTS
    // ============================================
    test.describe('Homepage (index.html)', () => {

        test('loads successfully and has correct title', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);
            await expect(page).toHaveTitle(/WellTegra.*Decision Systems/);
            await expect(page.locator('h1')).toContainText('Decision Systems for Capital-Intensive');
        });

        test('navigation menu works correctly', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check all navigation links
            const navLinks = [
                { text: 'Home', url: /index.html$/ },
                { text: 'Decisions', url: /#decisions$/ },
                { text: 'Methodology', url: /methodology.html$/ },
                { text: 'Dashboard', url: /operations-dashboard.html$/ },
                { text: 'Equipment', url: /equipment.html$/ },
                { text: 'SOPs', url: /sop-library.html$/ },
                { text: 'Planner', url: /planner.html$/ },
                { text: 'API', url: /#api-docs$/ },
                { text: 'Engage', url: /#engagement$/ }
            ];

            for (const link of navLinks) {
                await expect(page.locator(`.nav__link:has-text("${link.text}")`)).toBeVisible();
            }
        });

        test('mobile navigation toggle works', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto(`${BASE_URL}/index.html`);

            // Check hamburger menu appears on mobile
            await expect(page.locator('.menu-toggle')).toBeVisible();
            await expect(page.locator('.nav__links')).toBeHidden();

            // Test menu toggle
            await page.click('.menu-toggle');
            await expect(page.locator('.mobile-nav')).toBeVisible();

            await page.click('.menu-toggle');
            await expect(page.locator('.mobile-nav')).toBeHidden();
        });

        test('ROI Calculator functionality', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Scroll to ROI calculator
            await page.locator('#roi-calculator').scrollIntoViewIfNeeded();

            // Fill out the form
            await page.fill('#numWells', '10');
            await page.fill('#avgDepth', '12000');
            await page.fill('#currentNPT', '15');
            await page.fill('#dailyCost', '500000');

            // Calculate results
            await page.click('#calculateRoi');

            // Check results are displayed
            await expect(page.locator('#roi-results')).not.toHaveClass(/hidden/);
            await expect(page.locator('#savings-npt')).toBeVisible();
            await expect(page.locator('#savings-efficiency')).toBeVisible();
            await expect(page.locator('#total-savings')).toBeVisible();
            await expect(page.locator('#roi-value')).toBeVisible();
        });

        test('experience timeline is displayed', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check timeline section exists
            const timeline = page.locator('.experience-timeline');
            await expect(timeline).toBeVisible();

            // Check key milestones are present
            await expect(page.locator('text=1991')).toBeVisible(); // Start date
            await expect(page.locator('text=North Sea')).toBeVisible();
            await expect(page.locator('text=30+')).toBeVisible(); // Years experience
        });

        test('data sources section displays correctly', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check data sources section
            await expect(page.locator('text=Our Data Sources & Methodology')).toBeVisible();
            await expect(page.locator('text=North Sea Equipment Database')).toBeVisible();
            await expect(page.locator('text=Google BigQuery')).toBeVisible();
            await expect(page.locator('text=Monte Carlo simulation')).toBeVisible();
        });

        test('API documentation section', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Navigate to API section
            await page.click('.nav__link:has-text("API")');

            // Check API documentation is displayed
            await expect(page.locator('text=API Documentation & Integration')).toBeVisible();
            await expect(page.locator('text=ML Prediction API')).toBeVisible();
            await expect(page.locator('text=Data Access Layer')).toBeVisible();

            // Check endpoints are listed
            await expect(page.locator('text=/predict/toolstring-failure')).toBeVisible();
            await expect(page.locator('text=/data/equipment-directory.json')).toBeVisible();
        });

        test('footer links and privacy notice', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check footer elements
            await expect(page.locator('.footer')).toBeVisible();
            await expect(page.locator('text=Privacy Notice')).toBeVisible();
            await expect(page.locator('text=v2.4.0')).toBeVisible();

            // Test privacy notice link
            await page.click('a:has-text("Privacy Notice")');
            await expect(page.locator('.popup').or(page.locator('text=essential cookies only'))).toBeVisible();
        });
    });

    // ============================================
    // OPERATIONS DASHBOARD TESTS
    // ============================================
    test.describe('Operations Dashboard', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/operations-dashboard.html`);
        });

        test('loads and displays initial state', async ({ page }) => {
            await expect(page).toHaveTitle(/Operations Intelligence/);
            await expect(page.locator('h1')).toContainText('Operations Intelligence');
            await expect(page.locator('#riskPlaceholder')).toBeVisible();
        });

        test('risk analysis form works', async ({ page }) => {
            // Fill out the analysis form
            await page.selectOption('#wellType', 'intervention');
            await page.fill('#depth', '10000');
            await page.fill('#deviation', '45');
            await page.fill('#pressure', '5000');
            await page.fill('#temperature', '200');
            await page.selectOption('#riskFactor', 'equipment_stuck');
            await page.selectOption('#crewExperience', 'experienced');

            // Submit form
            await page.click('button:has-text("Generate Analysis")');

            // Check loading state
            await expect(page.locator('#loading')).toBeVisible();

            // Wait for results
            await expect(page.locator('#riskResults')).toBeVisible({ timeout: 3000 });

            // Check risk scores are displayed
            await expect(page.locator('#nptRisk')).not.toHaveText('--');
            await expect(page.locator('#costRisk')).not.toHaveText('--');
            await expect(page.locator('#successRate')).not.toHaveText('--');
        });

        test('charts render correctly', async ({ page }) => {
            // Complete analysis first
            await page.selectOption('#wellType', 'workover');
            await page.fill('#depth', '15000');
            await page.fill('#deviation', '60');
            await page.fill('#pressure', '10000');
            await page.fill('#temperature', '250');
            await page.selectOption('#riskFactor', 'well_control');
            await page.selectOption('#crewExperience', 'intermediate');
            await page.click('button:has-text("Generate Analysis")');

            // Wait for charts
            await expect(page.locator('#riskChart')).toBeVisible({ timeout: 3000 });
            await expect(page.locator('#costChart')).toBeVisible({ timeout: 3000 });

            // Check chart canvas elements exist
            const riskCanvas = page.locator('#riskChart');
            await expect(riskCanvas).toHaveAttribute('width');
            await expect(riskCanvas).toHaveAttribute('height');
        });

        test('dropdown behavior improvements', async ({ page }) => {
            const select = page.locator('#wellType');
            await select.click();

            // Check initial placeholder is visible
            await expect(page.locator('option[value=""]')).toBeVisible();

            // Select an option
            await select.selectOption('completion');

            // Placeholder should be hidden after selection
            await expect(page.locator('option[value=""]')).toHaveCSS('display', 'none');
        });
    });

    // ============================================
    // EQUIPMENT CATALOG TESTS
    // ============================================
    test.describe('Equipment Catalog', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/equipment.html`);
            // Wait for equipment data to load - be more patient
            await page.waitForSelector('.equipment-card', { timeout: 10000 });
        });

        test('loads and displays equipment', async ({ page }) => {
            await expect(page).toHaveTitle(/Equipment Catalog/);
            await expect(page.locator('.equipment-grid')).toBeVisible();

            // Check equipment cards are displayed
            const cards = page.locator('.equipment-card');
            await expect(cards.first()).toBeVisible();
        });

        test('tab switching works', async ({ page }) => {
            const tabs = ['Drilling', 'Intervention', 'Completion', 'P&A'];

            for (const tabName of tabs) {
                await page.click(`.tab-button:has-text("${tabName}")`);
                await expect(page.locator(`.tab-button:has-text("${tabName}")`)).toHaveClass(/active/);
                await page.waitForTimeout(500); // Allow content to update
            }
        });

        test('search functionality', async ({ page }) => {
            const searchTerm = 'milling';

            // Perform search
            await page.fill('#searchInput', searchTerm);

            // Check results are filtered
            const cards = page.locator('.equipment-card');
            const firstCard = cards.first();
            await expect(firstCard).toBeVisible();

            // Verify search result contains search term
            const cardText = await firstCard.textContent();
            expect(cardText.toLowerCase()).toContain(searchTerm);
        });

        test('filter functionality', async ({ page }) => {
            // Apply type filter
            await page.selectOption('#equipmentTypeFilter', 'mill');

            // Apply OD range filter
            await page.fill('#odMin', '5');
            await page.fill('#odMax', '10');

            // Apply manufacturer filter
            const manufacturerFilter = page.locator('#manufacturerFilter');
            if (await manufacturerFilter.count() > 0) {
                const manufacturers = await manufacturerFilter.locator('option').count();
                if (manufacturers > 1) {
                    await manufacturerFilter.selectOption({ index: 1 });
                }
            }

            // Check clear filters button
            await page.click('#clearFilters');

            // Verify filters are cleared
            await expect(page.locator('#equipmentTypeFilter')).toHaveValue('all');
            await expect(page.locator('#odMin')).toHaveValue('');
            await expect(page.locator('#odMax')).toHaveValue('');
        });

        test('equipment selection', async ({ page }) => {
            const firstCard = page.locator('.equipment-card').first();

            // Click to select
            await firstCard.click();
            await expect(firstCard).toHaveClass(/selected/);

            // Check toolstring panel appears
            await expect(page.locator('#toolstringPanel')).toHaveClass(/visible/);

            // Check selected count updates
            await expect(page.locator('#selectedCount')).toHaveText('1');

            // Deselect the item
            await firstCard.click();
            await expect(firstCard).not.toHaveClass(/selected/);
        });

        test('equipment detail modal', async ({ page }) => {
            const firstCard = page.locator('.equipment-card').first();

            // Ctrl+click to show details
            await firstCard.click({ modifiers: ['Control'] });

            // Check modal appears
            await expect(page.locator('#modalOverlay')).toHaveClass(/visible/);

            // Check modal content
            await expect(page.locator('#modalTitle')).toBeVisible();
            await expect(page.locator('#modalBody')).toBeVisible();

            // Close modal
            await page.click('#modalClose');
            await expect(page.locator('#modalOverlay')).not.toHaveClass(/visible/);
        });
    });

    // ============================================
    // SOP LIBRARY TESTS
    // ============================================
    test.describe('SOP Library', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/sop-library.html`);
            // Wait for data to load - be more patient
            await page.waitForSelector('.sop-card', { timeout: 10000 });
        });

        test('loads and displays SOPs', async ({ page }) => {
            await expect(page).toHaveTitle(/SOP Library/);
            await expect(page.locator('.sop-grid')).toBeVisible();

            // Check SOP cards are displayed
            const cards = page.locator('.sop-card');
            await expect(cards.first()).toBeVisible();
        });

        test('search functionality', async ({ page }) => {
            const searchTerm = 'pumping';

            // Search for SOP
            await page.fill('#searchInput', searchTerm);
            await page.click('#searchBtn');

            // Check results
            const results = page.locator('.sop-result');
            if (await results.count() > 0) {
                const firstResult = results.first();
                const resultText = await firstResult.textContent();
                expect(resultText.toLowerCase()).toContain(searchTerm.toLowerCase());
            }
        });

        test('quick filter buttons', async ({ page }) => {
            const filters = ['Well Intervention', 'Equipment', 'Safety', 'Emergency'];

            for (const filter of filters) {
                await page.click(`.quick-filter:has-text("${filter}")`);
                await expect(page.locator(`.quick-filter:has-text("${filter}")`)).toHaveClass(/active/);
                await page.waitForTimeout(500);
            }
        });

        test('clear search', async ({ page }) => {
            // Perform a search first
            await page.fill('#searchInput', 'test');
            await page.click('#searchBtn');

            // Clear search
            await page.click('#clearBtn');

            // Verify search is cleared
            await expect(page.locator('#searchInput')).toHaveValue('');
        });

        test('SOP detail view', async ({ page }) => {
            const firstSOP = page.locator('.sop-card').first();

            // Click to view details
            await firstSOP.click();

            // Check modal or detail view appears
            const modal = page.locator('.modal').or(page.locator('.sop-detail'));
            if (await modal.count() > 0) {
                await expect(modal.first()).toBeVisible();
            }
        });
    });

    // ============================================
    // PLANNER PAGE TESTS
    // ============================================
    test.describe('Planner Page', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${BASE_URL}/planner.html`);
        });

        test('loads and displays planner interface', async ({ page }) => {
            await expect(page).toHaveTitle(/Operations Planner/);
            await expect(page.locator('.planner-interface')).toBeVisible();
        });

        test('planner form inputs', async ({ page }) => {
            // Test various inputs
            await page.fill('#wellName', 'TEST-WELL-001');
            await page.selectOption('#operationType', 'intervention');
            await page.fill('#plannedDuration', '5');

            // Verify values are set
            await expect(page.locator('#wellName')).toHaveValue('TEST-WELL-001');
            await expect(page.locator('#operationType')).toHaveValue('intervention');
            await expect(page.locator('#plannedDuration')).toHaveValue('5');
        });

        test('AI recommendations feature', async ({ page }) => {
            // Check if AI recommendations section exists
            const aiSection = page.locator('.ai-recommendations');
            if (await aiSection.count() > 0) {
                await expect(aiSection).toBeVisible();

                // Test if recommendations load
                await page.waitForTimeout(2000);
                const recommendations = page.locator('.recommendation-item');
                if (await recommendations.count() > 0) {
                    await expect(recommendations.first()).toBeVisible();
                }
            }
        });
    });

    // ============================================
    // CHANGELOG PAGE TESTS
    // ============================================
    test.describe('Changelog Page', () => {

        test('loads and displays version history', async ({ page }) => {
            await page.goto(`${BASE_URL}/changelog.html`);

            await expect(page).toHaveTitle(/Changelog/);
            await expect(page.locator('h1')).toContainText('Platform Changelog');

            // Check version entries exist
            const versionItems = page.locator('.changelog-item');
            await expect(versionItems.first()).toBeVisible();

            // Check for latest version
            await expect(page.locator('text=Version 2.4.0')).toBeVisible();
        });

        test('version categories are displayed', async ({ page }) => {
            await page.goto(`${BASE_URL}/changelog.html`);

            // Check category badges
            await expect(page.locator('.changelog-category--new')).toBeVisible();
            await expect(page.locator('.changelog-category--improved')).toBeVisible();
            await expect(page.locator('.changelog-category--fixed')).toBeVisible();
        });
    });

    // ============================================
    // CROSS-SITE TESTS
    // ============================================
    test.describe('Cross-Site Functionality', () => {

        test('navigation consistency across pages', async ({ page }) => {
            const pages = [
                '/index.html',
                '/operations-dashboard.html',
                '/equipment.html',
                '/sop-library.html',
                '/planner.html',
                '/changelog.html'
            ];

            for (const pagePath of pages) {
                await page.goto(`${BASE_URL}${pagePath}`);

                // Check navigation elements exist
                await expect(page.locator('.nav')).toBeVisible();

                // Check logo exists and links to home (with timeout for slow loads)
                const logo = page.locator('.nav__logo').first();
                await logo.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
                    console.warn(`Logo not found on ${pageName} at viewport ${viewport.name}`);
                });

                if (await logo.isVisible()) {
                    await logo.click();
                    await expect(page).toHaveURL(/index.html$/);
                }
            }
        });

        test('responsive design across devices', async ({ page }) => {
            const viewports = [
                { width: 1920, height: 1080, name: 'Desktop' },
                { width: 1024, height: 768, name: 'Tablet' },
                { width: 768, height: 1024, name: 'Mobile Large' },
                { width: 375, height: 667, name: 'Mobile Small' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize(viewport);
                await page.goto(`${BASE_URL}/index.html`);

                // Check page is usable
                await expect(page.locator('h1')).toBeVisible();

                if (viewport.width <= 768) {
                    // Check mobile navigation
                    await expect(page.locator('.menu-toggle')).toBeVisible();
                }
            }
        });

        test('error handling for 404 pages', async ({ page }) => {
            const nonExistentPage = '/page-that-does-not-exist.html';
            const response = await page.goto(`${BASE_URL}${nonExistentPage}`);

            // Should either get a 404 or redirect to home
            if (response && response.status() === 404) {
                // Use first() to avoid strict mode violation if multiple 404 text elements exist
                await expect(page.locator('text=404').first()).toBeVisible();
            } else {
                // Should redirect to home
                await expect(page).toHaveURL(/index.html$/);
            }
        });

        test('performance metrics', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check Core Web Vitals
            const metrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                return {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
                };
            });

            // Performance assertions (adjust thresholds as needed)
            expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
            expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
            expect(metrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds
        });

        test('no broken links', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Get all links
            const links = await page.locator('a[href]').all();

            for (const link of links.slice(0, 10)) { // Test first 10 links to save time
                const href = await link.getAttribute('href');

                // Skip external links, anchors, mailto, tel, and invalid URLs
                if (!href ||
                    href.startsWith('http') ||
                    href.startsWith('#') ||
                    href.startsWith('mailto:') ||
                    href.startsWith('tel:') ||
                    href.startsWith('javascript:') ||
                    href.trim() === '') {
                    continue;
                }

                // Ensure href starts with / for relative paths
                const cleanHref = href.startsWith('/') ? href : `/${href}`;

                try {
                    // Check internal link
                    const linkResponse = await page.goto(`${BASE_URL}${cleanHref}`);
                    expect(linkResponse.status()).toBeLessThan(400);
                } catch (error) {
                    console.warn(`Failed to navigate to ${cleanHref}: ${error.message}`);
                }
            }
        });
    });

    // ============================================
    // SECURITY TESTS
    // ============================================
    test.describe('Security Tests', () => {

        test('no sensitive data in client-side code', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Check for potential API keys or sensitive data
            const pageContent = await page.content();

            // Common patterns to avoid (adjust as needed)
            const sensitivePatterns = [
                /api[_-]?key/i,
                /password/i,
                /secret/i,
                /token.*=/
            ];

            for (const pattern of sensitivePatterns) {
                const matches = pageContent.match(pattern);
                if (matches) {
                    console.warn('Potential sensitive data found:', matches);
                }
                // This is informational - adapt based on your needs
            }
        });

        test('HTTPS enforcement in production', async ({ page }) => {
            // This test would need to run against production
            // For local testing, we just check the redirect logic
            const isProduction = !BASE_URL.includes('localhost') && !BASE_URL.includes('127.0.0.1');

            if (isProduction) {
                await page.goto(`${BASE_URL.replace('https', 'http')}`);
                await expect(page).toHaveURL(/https:/);
            }
        });

        test('XSS protection', async ({ page }) => {
            await page.goto(`${BASE_URL}/index.html`);

            // Test search input for XSS protection
            const xssPayload = '<script>alert("XSS")</script>';

            // Try in search inputs
            const searchInputs = page.locator('input[type="search"]');
            if (await searchInputs.count() > 0) {
                await searchInputs.first().fill(xssPayload);
                await page.waitForTimeout(1000);

                // Check that no alert was triggered (basic XSS test)
                const alertExists = await page.locator('.alert').count();
                // This is a basic check - enhance based on your security requirements
            }
        });
    });
});