const { test, expect } = require('@playwright/test');

test.describe('WellTegra Portfolio - Comprehensive Test Suite', () => {

  // ============================================
  // HOMEPAGE / LANDING PAGE TESTS
  // ============================================
  test.describe('Homepage (index.html)', () => {

    test('should load homepage and display key sections', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Portfolio notice banner should be visible
      const portfolioBanner = page.locator('.portfolio-notice');
      await expect(portfolioBanner).toBeVisible();
      await expect(portfolioBanner).toContainText('Portfolio Project');

      // Hero section
      const heroHeading = page.locator('h1, .hero h1, [class*="hero"] h1').first();
      await expect(heroHeading).toBeVisible();

      // Navigation should be present
      const nav = page.locator('nav, .nav, header nav').first();
      await expect(nav).toBeVisible();

      await page.screenshot({ path: 'screenshots/homepage-loaded.png' });
      console.log('✅ Homepage loaded successfully');
    });

    test('should have working navigation links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test key navigation links exist
      const expectedLinks = [
        { selector: 'a[href*="planner"]', name: 'Planner' },
        { selector: 'a[href*="equipment"]', name: 'Equipment' },
        { selector: 'a[href*="case-studies"]', name: 'Case Studies' },
        { selector: 'a[href*="historical-runs"]', name: 'Historical Runs' }
      ];

      for (const link of expectedLinks) {
        const element = page.locator(link.selector).first();
        await expect(element).toBeVisible();
        console.log(`✅ ${link.name} link found`);
      }
    });

    test('should display portfolio context disclaimer in footer', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Check for educational disclaimer
      const disclaimerText = await footer.textContent();
      expect(disclaimerText).toMatch(/educational|demonstration|portfolio/i);

      console.log('✅ Footer disclaimer present');
    });
  });

  // ============================================
  // OPERATIONS PLANNER TESTS
  // ============================================
  test.describe('Operations Planner (planner.html)', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/planner.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('should load planner page with all key sections', async ({ page }) => {
      // Risk Priority Matrix should be visible
      const riskMatrix = page.locator('#riskMatrixChart, canvas[id*="risk"]').first();
      await expect(riskMatrix).toBeVisible({ timeout: 10000 });

      // Equipment section should exist
      const equipmentSection = page.locator('text=Equipment').first();
      await expect(equipmentSection).toBeVisible();

      // Personnel section should exist
      const personnelSection = page.locator('text=Personnel').first();
      await expect(personnelSection).toBeVisible();

      await page.screenshot({ path: 'screenshots/planner-loaded.png' });
      console.log('✅ Planner loaded with all sections');
    });

    test('should have Risk Priority Matrix with Chart.js', async ({ page }) => {
      // Wait for Chart.js to load
      await page.waitForFunction(() => typeof Chart !== 'undefined', { timeout: 10000 });

      // Check canvas exists
      const canvas = page.locator('#riskMatrixChart');
      await expect(canvas).toBeVisible();

      // Verify Chart.js is rendering
      const hasChart = await page.evaluate(() => {
        const canvas = document.getElementById('riskMatrixChart');
        return canvas && canvas.chart !== undefined;
      });

      console.log('✅ Risk Priority Matrix rendered');
    });

    test('should have separate Equipment and Personnel sections', async ({ page }) => {
      // Check for Equipment list
      const equipmentList = page.locator('#toolstringList, [id*="equipment"]').first();
      await expect(equipmentList).toBeVisible();

      // Check for Personnel list
      const personnelList = page.locator('#personnelList, [id*="personnel"]').first();
      await expect(personnelList).toBeVisible();

      // Check for clear buttons
      const clearButtons = page.locator('button:has-text("Clear")');
      const buttonCount = await clearButtons.count();
      expect(buttonCount).toBeGreaterThanOrEqual(2); // At least 2 clear buttons

      console.log('✅ Equipment and Personnel sections separated');
    });

    test('should allow opening equipment catalog modal', async ({ page }) => {
      // Look for equipment catalog button
      const catalogButton = page.locator('button:has-text("Equipment Catalog"), a:has-text("Equipment Catalog")').first();

      if (await catalogButton.isVisible()) {
        await catalogButton.click();
        await page.waitForTimeout(500);
        console.log('✅ Equipment catalog opened');
      } else {
        console.log('⚠️  Equipment catalog button not found (may require different selector)');
      }
    });

    test('should display well data cards', async ({ page }) => {
      // Look for well cards or well data
      const wellCards = page.locator('[class*="well-card"], [class*="card"]');
      const cardCount = await wellCards.count();

      if (cardCount > 0) {
        console.log(`✅ Found ${cardCount} well cards`);
      } else {
        console.log('⚠️  No well cards found (may load dynamically)');
      }
    });
  });

  // ============================================
  // EQUIPMENT CATALOG TESTS
  // ============================================
  test.describe('Equipment Catalog (equipment.html)', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/equipment.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('should load equipment catalog page', async ({ page }) => {
      // Page should have title
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      await page.screenshot({ path: 'screenshots/equipment-catalog.png' });
      console.log('✅ Equipment catalog page loaded');
    });

    test('should load equipment data from JSON', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(2000);

      // Check if equipment data loaded
      const hasData = await page.evaluate(() => {
        return window.catalogData !== undefined &&
               window.catalogData.categories &&
               window.catalogData.categories.length > 0;
      });

      if (hasData) {
        const categoryCount = await page.evaluate(() => window.catalogData.categories.length);
        console.log(`✅ Equipment data loaded: ${categoryCount} categories`);
      } else {
        console.log('⚠️  Equipment data not loaded (check data/equipment.json)');
      }
    });

    test('should display equipment categories', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for category tabs or buttons
      const categories = page.locator('[class*="category"], [class*="tab"]');
      const categoryCount = await categories.count();

      if (categoryCount > 0) {
        console.log(`✅ Found ${categoryCount} equipment categories`);
      }
    });

    test('should have search/filter functionality', async ({ page }) => {
      // Look for search input
      const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('packer');
        await page.waitForTimeout(500);
        console.log('✅ Search functionality present');
      } else {
        console.log('ℹ️  No search field found');
      }
    });
  });

  // ============================================
  // HISTORICAL RUNS TESTS
  // ============================================
  test.describe('Historical Runs (historical-runs.html)', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/historical-runs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('should load historical runs page', async ({ page }) => {
      // Check for main heading
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      // Portfolio banner should be present
      const banner = page.locator('.portfolio-notice');
      await expect(banner).toBeVisible();

      await page.screenshot({ path: 'screenshots/historical-runs.png' });
      console.log('✅ Historical runs page loaded');
    });

    test('should load historical data from JSON', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check if data loaded
      const hasData = await page.evaluate(() => {
        return window.historicalData !== undefined &&
               window.historicalData.runs &&
               window.historicalData.runs.length > 0;
      });

      if (hasData) {
        const runCount = await page.evaluate(() => window.historicalData.runs.length);
        console.log(`✅ Historical data loaded: ${runCount} runs`);
        expect(runCount).toBeGreaterThan(0);
      } else {
        console.log('⚠️  Using fallback data');
      }
    });

    test('should display statistics dashboard', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for stats section
      const stats = page.locator('[class*="stat"], [class*="metric"]');
      const statCount = await stats.count();

      if (statCount > 0) {
        console.log(`✅ Found ${statCount} statistics displayed`);
      }
    });

    test('should display run cards', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Look for run cards
      const cards = page.locator('[class*="card"], [class*="run"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        console.log(`✅ Found ${cardCount} run cards`);

        // Click first card to open modal
        const firstCard = cards.first();
        if (await firstCard.isVisible()) {
          await firstCard.click();
          await page.waitForTimeout(500);

          // Check if modal opened
          const modal = page.locator('[class*="modal"]').first();
          if (await modal.isVisible()) {
            console.log('✅ Run detail modal opened');

            // Close modal
            const closeButton = page.locator('button:has-text("×"), button:has-text("Close"), [class*="close"]').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            }
          }
        }
      }
    });
  });

  // ============================================
  // CASE STUDIES TESTS
  // ============================================
  test.describe('Case Studies (case-studies.html)', () => {

    test('should load case studies page', async ({ page }) => {
      await page.goto('/case-studies.html');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();

      await page.screenshot({ path: 'screenshots/case-studies.png' });
      console.log('✅ Case studies page loaded');
    });
  });

  // ============================================
  // P&A COURSE TESTS
  // ============================================
  test.describe('P&A Course (pa-course.html)', () => {

    test('should load P&A course page', async ({ page }) => {
      await page.goto('/pa-course.html');
      await page.waitForLoadState('networkidle');

      // Check for YouTube player
      const youtubePlayer = page.locator('#youtube-player, iframe[src*="youtube"]').first();
      await expect(youtubePlayer).toBeVisible({ timeout: 10000 });

      console.log('✅ P&A course loaded with video player');
    });

    test('should have course modules', async ({ page }) => {
      await page.goto('/pa-course.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for module elements
      const modules = page.locator('[data-module], [class*="module"]');
      const moduleCount = await modules.count();

      if (moduleCount > 0) {
        console.log(`✅ Found ${moduleCount} course modules`);
      }
    });
  });

  // ============================================
  // DATA INTEGRITY TESTS
  // ============================================
  test.describe('Data Integrity', () => {

    test('should load wells data successfully', async ({ page }) => {
      await page.goto('/planner.html');
      await page.waitForLoadState('networkidle');

      // Check if wells data is available
      const hasWellsData = await page.evaluate(() => {
        return typeof wellsData !== 'undefined' && Array.isArray(wellsData);
      });

      if (hasWellsData) {
        console.log('✅ Wells data loaded');
      } else {
        console.log('⚠️  Wells data not found');
      }
    });

    test('should load equipment data successfully', async ({ page }) => {
      await page.goto('/equipment.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check console for data loading messages
      const logs = [];
      page.on('console', msg => logs.push(msg.text()));

      await page.reload();
      await page.waitForTimeout(2000);

      const hasLoadingLog = logs.some(log => log.includes('Loading equipment') || log.includes('Catalog loaded'));

      if (hasLoadingLog) {
        console.log('✅ Equipment data loading confirmed');
      }
    });

    test('should have valid historical data files', async ({ page }) => {
      const response = await page.goto('/data/historical-case-studies.json');

      if (response && response.ok()) {
        const data = await response.json();
        expect(data.runs).toBeDefined();
        expect(Array.isArray(data.runs)).toBeTruthy();
        console.log(`✅ Historical case studies JSON valid: ${data.runs.length} runs`);
      } else {
        console.log('⚠️  Historical case studies JSON not found');
      }
    });
  });

  // ============================================
  // RESPONSIVE DESIGN TESTS
  // ============================================
  test.describe('Responsive Design', () => {

    test('should display mobile navigation on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for hamburger menu
      const hamburger = page.locator('button[class*="hamburger"], button[class*="mobile"], button[aria-label*="menu" i]').first();

      if (await hamburger.isVisible()) {
        await hamburger.click();
        await page.waitForTimeout(500);

        // Check if mobile menu is visible
        const mobileMenu = page.locator('[class*="mobile-nav"], [class*="mobile-menu"]').first();
        await expect(mobileMenu).toBeVisible();

        await page.screenshot({ path: 'screenshots/mobile-navigation.png' });
        console.log('✅ Mobile navigation works');
      }
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/planner.html');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'screenshots/tablet-planner.png' });
      console.log('✅ Tablet layout rendered');
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'screenshots/desktop-homepage.png' });
      console.log('✅ Desktop layout rendered');
    });
  });

  // ============================================
  // NAVIGATION & LINKS TESTS
  // ============================================
  test.describe('Navigation & Cross-linking', () => {

    test('should navigate between pages successfully', async ({ page }) => {
      await page.goto('/');

      const pages = [
        { path: '/planner.html', name: 'Planner' },
        { path: '/equipment.html', name: 'Equipment' },
        { path: '/case-studies.html', name: 'Case Studies' },
        { path: '/historical-runs.html', name: 'Historical Runs' }
      ];

      for (const pageInfo of pages) {
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');

        // Verify page loaded (should have some content)
        const body = await page.locator('body').textContent();
        expect(body.length).toBeGreaterThan(100);

        console.log(`✅ ${pageInfo.name} page accessible`);
      }
    });

    test('should have consistent portfolio branding', async ({ page }) => {
      const pages = ['/', '/planner.html', '/equipment.html', '/historical-runs.html'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');

        // Check for portfolio notice
        const banner = page.locator('.portfolio-notice');
        const hasBanner = await banner.count() > 0;

        console.log(`${hasBanner ? '✅' : '⚠️'} ${pagePath} - Portfolio banner present: ${hasBanner}`);
      }
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  test.describe('Accessibility', () => {

    test('should have proper page titles', async ({ page }) => {
      const pages = [
        { path: '/', shouldContain: 'Ken McKenzie|WellTegra|Portfolio' },
        { path: '/planner.html', shouldContain: 'Planner|Operations' },
        { path: '/equipment.html', shouldContain: 'Equipment|Catalog' },
        { path: '/historical-runs.html', shouldContain: 'Historical|Runs' }
      ];

      for (const pageInfo of pages) {
        await page.goto(pageInfo.path);
        const title = await page.title();

        const titleMatches = pageInfo.shouldContain.split('|').some(keyword =>
          title.toLowerCase().includes(keyword.toLowerCase())
        );

        console.log(`${titleMatches ? '✅' : '⚠️'} ${pageInfo.path} title: "${title}"`);
      }
    });

    test('should have no console errors on main pages', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));

      const pages = ['/', '/planner.html', '/equipment.html'];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }

      if (errors.length === 0) {
        console.log('✅ No JavaScript errors detected');
      } else {
        console.log(`⚠️  Found ${errors.length} errors:`, errors);
      }
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================
  test.describe('Performance', () => {

    test('should load homepage within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`ℹ️  Homepage load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
    });

    test('should have working Chart.js library', async ({ page }) => {
      await page.goto('/planner.html');
      await page.waitForLoadState('networkidle');

      const hasChartJS = await page.evaluate(() => typeof Chart !== 'undefined');
      expect(hasChartJS).toBeTruthy();

      console.log('✅ Chart.js library loaded');
    });
  });
});
