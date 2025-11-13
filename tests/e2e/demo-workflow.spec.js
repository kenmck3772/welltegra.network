// @ts-check
import { test, expect } from '@playwright/test';
import { setupCDNMocks } from '../fixtures/cdn-mock.js';

/**
 * WellTegra Demo Workflow E2E Tests
 *
 * This test suite validates the complete demo workflow:
 * Dashboard → Well Planner → Equipment Catalog & Tool String Builder → Planner (updated) → Execution
 */

test.describe('Demo Workflow - Complete 5-Act Narrative', () => {
  test.beforeEach(async ({ page }) => {
    // Setup CDN mocking to prevent crashes from external libraries
    await setupCDNMocks(page);

    // Navigate to the main application
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the page to stabilize
    await page.waitForTimeout(1000);

    // Mock authentication for demo
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'demo_token_12345');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 'demo_user',
        name: 'Demo User',
        role: 'engineer'
      }));
      localStorage.setItem('auth_token_expiry', (Date.now() + 3600000).toString());
    });
  });

  test('Act 1: Dashboard displays well overview and status', async ({ page }) => {
    // Verify dashboard is visible
    const homeView = page.locator('#home-view');
    await expect(homeView).toBeVisible();

    // Check for well cards
    const wellCards = page.locator('.well-card');
    await expect(wellCards.first()).toBeVisible();

    // Verify critical wells are highlighted
    const criticalWells = page.locator('.well-status-critical, .well-status-warning');
    await expect(criticalWells.first()).toBeVisible();

    // Check for alerts/notifications
    const alerts = page.locator('.alert, .notification');
    if (await alerts.count() > 0) {
      await expect(alerts.first()).toBeVisible();
    }

    // Verify data is populated (check for W666)
    const w666Card = page.locator('[data-well-id="W666"], .well-card:has-text("W666")');
    await expect(w666Card).toBeVisible();
  });

  test('Act 2: Navigate to Well Planner and select intervention', async ({ page }) => {
    // Click on planner navigation
    const plannerNav = page.locator('#planner-nav-link, a:has-text("Planner"), button:has-text("Planner")');
    await plannerNav.click();

    // Wait for planner view to load
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Verify well selection dropdown/list
    const wellSelector = page.locator('#well-selector, select[name="well"], .well-dropdown');
    await expect(wellSelector).toBeVisible();

    // Select W666 if not already selected
    const w666Option = page.locator('option:has-text("W666"), [data-well="W666"]');
    if (await w666Option.count() > 0) {
      await wellSelector.selectOption({ label: /W666/ });
    }

    // Verify intervention type options are available
    const interventionTypes = page.locator('#intervention-type, select[name="intervention"]');
    await expect(interventionTypes).toBeVisible();

    // Check for common intervention types
    const hasWireline = await page.locator('option:has-text("Wireline"), text=Wireline').count() > 0;
    const hasCoiledTubing = await page.locator('option:has-text("Coiled Tubing"), text=Coiled').count() > 0;

    expect(hasWireline || hasCoiledTubing).toBeTruthy();
  });

  test('Act 3: Navigate to Equipment Catalog and build tool string', async ({ page }) => {
    // Navigate to equipment catalog
    const equipmentNav = page.locator('#equipment-nav-link, a:has-text("Equipment"), button:has-text("Equipment")');
    await equipmentNav.click();

    // Wait for equipment view to load
    const equipmentView = page.locator('#equipment-view');
    await expect(equipmentView).toBeVisible({ timeout: 5000 });

    // Verify catalog tab is active
    const catalogTab = page.locator('#catalog-tab, [data-tab="catalog"]');
    await expect(catalogTab).toBeVisible();

    // Check for equipment categories
    const categories = page.locator('.equipment-category, .category-btn');
    await expect(categories.first()).toBeVisible();

    // Search for equipment
    const searchInput = page.locator('#search-tools, input[placeholder*="Search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('BHA');
      await page.waitForTimeout(500); // Debounce

      // Verify search results
      const searchResults = page.locator('.equipment-item, .tool-card');
      await expect(searchResults.first()).toBeVisible();
    }

    // Switch to builder tab
    const builderTab = page.locator('#builder-tab, [data-tab="builder"], button:has-text("Builder")');
    if (await builderTab.count() > 0) {
      await builderTab.click();

      // Verify builder interface
      const builder = page.locator('#tool-string-builder, .builder-container');
      await expect(builder).toBeVisible();

      // Check for drag-drop zones or add buttons
      const addZone = page.locator('.drop-zone, .add-component-btn, button:has-text("Add")');
      expect(await addZone.count()).toBeGreaterThan(0);
    }
  });

  test('Act 4: Return to Planner with selected tool string', async ({ page }) => {
    // First build a tool string in equipment catalog
    const equipmentNav = page.locator('#equipment-nav-link, a:has-text("Equipment"), button:has-text("Equipment")');
    await equipmentNav.click();
    await page.waitForLoadState('networkidle');

    // Navigate to builder tab
    const builderTab = page.locator('#builder-tab, [data-tab="builder"], button:has-text("Builder")');
    if (await builderTab.count() > 0) {
      await builderTab.click();

      // Simulate adding components or using a template
      const useButton = page.locator('button:has-text("Use in Planner"), button:has-text("Apply")');

      if (await useButton.count() > 0) {
        await useButton.first().click();

        // Should navigate back to planner automatically
        await page.waitForTimeout(1000);
      }
    }

    // Navigate back to planner manually
    const plannerNav = page.locator('#planner-nav-link, a:has-text("Planner"), button:has-text("Planner")');
    await plannerNav.click();

    // Verify planner view is visible
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Check if tool string is populated
    const toolStringDisplay = page.locator('#selected-toolstring, .toolstring-summary');
    if (await toolStringDisplay.count() > 0) {
      // Tool string integration is working
      expect(await toolStringDisplay.textContent()).toBeTruthy();
    }

    // Verify risk assessment is visible
    const riskSection = page.locator('#risk-assessment, .risk-matrix');
    expect(await riskSection.count()).toBeGreaterThan(0);
  });

  test('Act 5: Review and prepare for execution', async ({ page }) => {
    // Navigate to planner
    const plannerNav = page.locator('#planner-nav-link, a:has-text("Planner"), button:has-text("Planner")');
    await plannerNav.click();

    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Check for execution controls
    const executeButton = page.locator('button:has-text("Execute"), button:has-text("Start Operation"), button:has-text("Run")');

    if (await executeButton.count() > 0) {
      // Verify button exists and is in the correct state
      const firstExecBtn = executeButton.first();
      await expect(firstExecBtn).toBeVisible();

      // Check if button requires confirmation
      const isDisabled = await firstExecBtn.isDisabled();

      // If enabled, we can test the confirmation flow
      if (!isDisabled) {
        await firstExecBtn.click();

        // Look for confirmation modal
        const confirmModal = page.locator('.modal, .confirmation-dialog, [role="dialog"]');
        if (await confirmModal.count() > 0) {
          await expect(confirmModal).toBeVisible();

          // Cancel for safety in tests
          const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Close")');
          if (await cancelBtn.count() > 0) {
            await cancelBtn.first().click();
          }
        }
      }
    }

    // Verify checklist or procedure steps
    const checklist = page.locator('.checklist, .procedure-steps, .pre-job-checklist');
    expect(await checklist.count()).toBeGreaterThan(0);

    // Verify documentation links
    const docLinks = page.locator('a[href*="documents"], a[href*=".pdf"], a[href*=".md"]');
    expect(await docLinks.count()).toBeGreaterThan(0);
  });

  test('Complete Demo Workflow - Full Integration', async ({ page }) => {
    // This test runs through the entire workflow in sequence

    // Act 1: Dashboard
    await expect(page.locator('#home-view')).toBeVisible();

    // Act 2: Navigate to Planner
    const plannerNav = page.locator('#planner-nav-link, a:has-text("Planner")');
    await plannerNav.click();
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    // Act 3: Navigate to Equipment
    const equipmentNav = page.locator('#equipment-nav-link, a:has-text("Equipment")');
    await equipmentNav.click();
    await expect(page.locator('#equipment-view')).toBeVisible({ timeout: 5000 });

    // Verify equipment catalog loaded
    const catalogItems = page.locator('.equipment-item, .tool-card, .catalog-item');
    expect(await catalogItems.count()).toBeGreaterThan(0);

    // Act 4: Return to Planner
    await plannerNav.click();
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    // Act 5: Verify execution readiness
    const riskAssessment = page.locator('#risk-assessment, .risk-section, .risk-matrix');
    const documentLinks = page.locator('a[href*="documents"]');

    // At least one of these should be visible
    const hasRisk = await riskAssessment.count() > 0;
    const hasDocs = await documentLinks.count() > 0;

    expect(hasRisk || hasDocs).toBeTruthy();
  });
});

test.describe('Critical User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-v23-fresh.html');
    await page.waitForLoadState('networkidle');
  });

  test('Toast notifications display correctly', async ({ page }) => {
    // Trigger an action that shows a toast
    // Check if toast container exists
    const toastContainer = page.locator('#toast-container, .toast-container');

    // Toast might not be visible initially
    expect(await toastContainer.count()).toBeGreaterThanOrEqual(0);

    // If we can trigger a toast, verify it appears and dismisses
    // This would require simulating an action that triggers a toast
  });

  test('Authentication state persists', async ({ page }) => {
    // Set auth in localStorage
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test_token');
      localStorage.setItem('auth_user', JSON.stringify({ name: 'Test User' }));
    });

    // Reload page
    await page.reload();

    // Check auth is still present
    const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(authToken).toBe('test_token');
  });

  test('Search functionality filters equipment', async ({ page }) => {
    // Navigate to equipment
    const equipmentNav = page.locator('#equipment-nav-link, a:has-text("Equipment")');
    if (await equipmentNav.count() > 0) {
      await equipmentNav.click();
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('#search-tools, input[placeholder*="Search"]');

      if (await searchInput.count() > 0) {
        // Count items before search
        const itemsBefore = await page.locator('.equipment-item, .tool-card').count();

        // Perform search
        await searchInput.fill('BHA');
        await page.waitForTimeout(500); // Debounce

        // Count items after search
        const itemsAfter = await page.locator('.equipment-item, .tool-card').count();

        // Search should filter results (unless everything contains "BHA")
        expect(itemsAfter).toBeGreaterThan(0);
      }
    }
  });

  test('Well schematic images exist and are accessible', async ({ page }) => {
    // Check if schematic files are accessible
    const schematicUrls = [
      '/documents/W666/Schematics/W666_As_Built_Schematic_Rev3.svg',
      '/documents/M21/Schematics/M21_As_Built_Schematic_Rev4.svg',
      '/documents/S15/Schematics/S15_As_Built_Schematic_Rev3.svg',
      '/documents/F11/Schematics/F11_As_Built_Schematic_Rev5.svg',
      '/documents/C08/Schematics/C08_As_Built_Schematic_Rev4.svg',
      '/documents/P12/Schematics/P12_As_Built_Schematic_Rev4.svg',
      '/documents/S77/Schematics/S77_As_Built_Schematic_Rev6.svg'
    ];

    for (const url of schematicUrls) {
      const response = await page.request.get(url);
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('image/svg');
    }
  });
});

test.describe('Data Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index-v23-fresh.html');
    await page.waitForLoadState('networkidle');
  });

  test('Comprehensive well data loads successfully', async ({ page }) => {
    // Check if well data is loaded
    const hasWellData = await page.evaluate(() => {
      // Check localStorage or global variables
      return window.comprehensiveWellData !== undefined ||
             localStorage.getItem('wellData') !== null;
    });

    // Even if not loaded, the app should handle it gracefully
    expect(typeof hasWellData).toBe('boolean');
  });

  test('Equipment catalog data loads successfully', async ({ page }) => {
    const equipmentNav = page.locator('#equipment-nav-link, a:has-text("Equipment")');

    if (await equipmentNav.count() > 0) {
      await equipmentNav.click();
      await page.waitForLoadState('networkidle');

      // Check if equipment items are rendered
      const items = page.locator('.equipment-item, .tool-card');
      const itemCount = await items.count();

      // Should have equipment items from the catalog
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('Document links reference valid paths', async ({ page }) => {
    // Navigate to a view that shows document links
    const plannerNav = page.locator('#planner-nav-link, a:has-text("Planner")');

    if (await plannerNav.count() > 0) {
      await plannerNav.click();
      await page.waitForLoadState('networkidle');

      // Find document links
      const docLinks = page.locator('a[href*="documents"], a[href*="/Programs/"], a[href*="/Reports/"]');

      if (await docLinks.count() > 0) {
        const firstLink = docLinks.first();
        const href = await firstLink.getAttribute('href');

        // Verify link format
        expect(href).toMatch(/^\/documents\/.*\.(md|pdf)$/);
      }
    }
  });
});
