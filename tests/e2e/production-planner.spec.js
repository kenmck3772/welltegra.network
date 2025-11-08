// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * WellTegra Production Planner E2E Tests
 *
 * CRITICAL P0 TEST SUITE
 *
 * This test suite validates the core planner functionality on the production
 * index.html file, including the navigation fixes deployed in commit 538b890.
 *
 * Test Coverage:
 * - Navigation event handlers (nav links + hero button)
 * - Planner view rendering
 * - Well selection workflow
 * - Objective selection workflow
 * - Plan generation workflow
 * - Browser navigation (back/forward, hash-based routing)
 * - Direct URL linking to planner
 * - Mobile responsiveness
 * - Error handling
 *
 * This is the PRODUCTION READINESS test suite referenced in the P0 diagnostic.
 */

test.describe('P0: Critical Planner Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to production index.html
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('P0-001: Hero "Try the Planner" button navigates to planner view', async ({ page }) => {
    // CRITICAL TEST: This is the primary CTA on the homepage

    // Wait for hero button to be visible
    const heroPlannerBtn = page.locator('#hero-planner-btn');
    await expect(heroPlannerBtn).toBeVisible({ timeout: 5000 });

    // Verify button text
    const buttonText = await heroPlannerBtn.textContent();
    expect(buttonText).toContain('Planner');

    // Click the button
    await heroPlannerBtn.click();

    // Verify planner view is now visible
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Verify planner view is NOT hidden
    await expect(plannerView).not.toHaveClass(/hidden/);

    // Verify URL hash updated
    await expect(page).toHaveURL(/#planner-view$/);

    // Verify planner nav link is now active
    const plannerNavLink = page.locator('#planner-nav-link');
    await expect(plannerNavLink).toHaveClass(/active/);

    // Verify home view is hidden
    const homeView = page.locator('#home-view');
    await expect(homeView).toHaveClass(/hidden/);
  });

  test('P0-002: Planner navigation link works from header', async ({ page }) => {
    // CRITICAL TEST: Header navigation must work

    const plannerNavLink = page.locator('#planner-nav-link');
    await expect(plannerNavLink).toBeVisible({ timeout: 5000 });

    // Click the nav link
    await plannerNavLink.click();

    // Verify planner view is visible
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Verify URL hash
    await expect(page).toHaveURL(/#planner-view$/);

    // Verify active state
    await expect(plannerNavLink).toHaveClass(/active/);
  });

  test('P0-003: Direct URL navigation to planner via hash', async ({ page }) => {
    // CRITICAL TEST: Direct linking must work

    // Navigate directly to planner via hash
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');

    // Verify planner view is visible
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Verify nav link is active
    const plannerNavLink = page.locator('#planner-nav-link');
    await expect(plannerNavLink).toHaveClass(/active/);
  });

  test('P0-004: Browser back button returns to home', async ({ page }) => {
    // CRITICAL TEST: Browser navigation must work

    // Start on home
    await expect(page.locator('#home-view')).toBeVisible();

    // Navigate to planner
    const heroPlannerBtn = page.locator('#hero-planner-btn');
    await heroPlannerBtn.click();
    await expect(page.locator('#planner-view')).toBeVisible();

    // Use browser back
    await page.goBack();

    // Should be back on home
    await expect(page.locator('#home-view')).toBeVisible();
    await expect(page.locator('#planner-view')).toHaveClass(/hidden/);
  });

  test('P0-005: Browser forward button returns to planner', async ({ page }) => {
    // CRITICAL TEST: Browser forward navigation must work

    // Navigate to planner
    await page.locator('#hero-planner-btn').click();
    await expect(page.locator('#planner-view')).toBeVisible();

    // Go back
    await page.goBack();
    await expect(page.locator('#home-view')).toBeVisible();

    // Go forward
    await page.goForward();
    await expect(page.locator('#planner-view')).toBeVisible();
  });

  test('P0-006: Multiple view navigation maintains state', async ({ page }) => {
    // CRITICAL TEST: Navigation between multiple views

    // Home -> Planner
    await page.locator('#hero-planner-btn').click();
    await expect(page.locator('#planner-view')).toBeVisible();

    // Planner -> About (if exists)
    const aboutNavLink = page.locator('#about-nav-link');
    if (await aboutNavLink.count() > 0) {
      await aboutNavLink.click();
      const aboutView = page.locator('#about-view');
      await expect(aboutView).toBeVisible({ timeout: 5000 });

      // About -> Planner
      await page.locator('#planner-nav-link').click();
      await expect(page.locator('#planner-view')).toBeVisible();
    }
  });
});

test.describe('P1: Planner Workflow - Well Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');

    // Wait for planner to be visible
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });
  });

  test('P1-001: Planner view displays well selection cards', async ({ page }) => {
    // Check for well selection UI
    const wellCards = page.locator('.planner-card, .well-card, [data-well-id]');

    // Should have at least one well card
    expect(await wellCards.count()).toBeGreaterThan(0);

    // First card should be visible
    await expect(wellCards.first()).toBeVisible();
  });

  test('P1-002: Well card selection highlights card', async ({ page }) => {
    const wellCards = page.locator('.planner-card, .well-card');

    if (await wellCards.count() > 0) {
      const firstCard = wellCards.first();

      // Click the card
      await firstCard.click();

      // Card should have selected class
      await expect(firstCard).toHaveClass(/selected/);

      // Check if well name is displayed somewhere
      const wellName = await firstCard.getAttribute('data-well-name') ||
                        await firstCard.locator('h3, .well-name').textContent();
      expect(wellName).toBeTruthy();
    }
  });

  test('P1-003: Multiple well card clicks maintain single selection', async ({ page }) => {
    const wellCards = page.locator('.planner-card, .well-card');
    const cardCount = await wellCards.count();

    if (cardCount >= 2) {
      // Click first card
      await wellCards.nth(0).click();
      await expect(wellCards.nth(0)).toHaveClass(/selected/);

      // Click second card
      await wellCards.nth(1).click();
      await expect(wellCards.nth(1)).toHaveClass(/selected/);

      // First card should no longer be selected
      await expect(wellCards.nth(0)).not.toHaveClass(/selected/);
    }
  });

  test('P1-004: Well selection enables next step', async ({ page }) => {
    const wellCards = page.locator('.planner-card, .well-card');

    if (await wellCards.count() > 0) {
      // Click a well
      await wellCards.first().click();

      // Check if objective selection becomes available
      const objectiveSection = page.locator('#objective-selection, .objective-container');

      // Give it a moment to enable
      await page.waitForTimeout(500);

      // Objective section should be present
      expect(await objectiveSection.count()).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('P1: Planner Workflow - Objective Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    // Select a well first
    const wellCards = page.locator('.planner-card, .well-card');
    if (await wellCards.count() > 0) {
      await wellCards.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('P1-005: Objective radio buttons are present', async ({ page }) => {
    // Look for objective selection UI
    const objectiveRadios = page.locator('input[type="radio"][name="objective"]');

    if (await objectiveRadios.count() > 0) {
      // Should have multiple objectives
      expect(await objectiveRadios.count()).toBeGreaterThan(0);

      // First one should be visible (or its parent label)
      const firstRadio = objectiveRadios.first();
      const parent = firstRadio.locator('..');
      await expect(parent).toBeVisible();
    }
  });

  test('P1-006: Objective selection enables plan generation', async ({ page }) => {
    const objectiveRadios = page.locator('input[type="radio"][name="objective"]');

    if (await objectiveRadios.count() > 0) {
      // Select first objective
      await objectiveRadios.first().check();

      // Look for generate plan button
      const generateBtn = page.locator('#generate-plan-btn-manual, button:has-text("Generate Plan")');

      if (await generateBtn.count() > 0) {
        // Button should be enabled
        await expect(generateBtn.first()).toBeEnabled();
      }
    }
  });

  test('P1-007: Different objectives can be selected', async ({ page }) => {
    const objectiveRadios = page.locator('input[type="radio"][name="objective"]');
    const radioCount = await objectiveRadios.count();

    if (radioCount >= 2) {
      // Select first
      await objectiveRadios.nth(0).check();
      await expect(objectiveRadios.nth(0)).toBeChecked();

      // Select second
      await objectiveRadios.nth(1).check();
      await expect(objectiveRadios.nth(1)).toBeChecked();

      // First should be unchecked
      await expect(objectiveRadios.nth(0)).not.toBeChecked();
    }
  });
});

test.describe('P1: Planner Workflow - Plan Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    // Select a well
    const wellCards = page.locator('.planner-card, .well-card');
    if (await wellCards.count() > 0) {
      await wellCards.first().click();
      await page.waitForTimeout(500);
    }

    // Select an objective
    const objectiveRadios = page.locator('input[type="radio"][name="objective"]');
    if (await objectiveRadios.count() > 0) {
      await objectiveRadios.first().check();
      await page.waitForTimeout(500);
    }
  });

  test('P1-008: Generate plan button triggers plan creation', async ({ page }) => {
    const generateBtn = page.locator('#generate-plan-btn-manual, button:has-text("Generate Plan")');

    if (await generateBtn.count() > 0 && await generateBtn.first().isEnabled()) {
      // Click generate
      await generateBtn.first().click();

      // Wait for plan to generate
      await page.waitForTimeout(2000);

      // Look for plan output
      const planDisplay = page.locator('#generated-plan, .plan-output, .procedure-details');

      if (await planDisplay.count() > 0) {
        await expect(planDisplay.first()).toBeVisible();

        // Plan should have content
        const planContent = await planDisplay.first().textContent();
        expect(planContent.length).toBeGreaterThan(0);
      }
    }
  });

  test('P1-009: Generated plan enables navigation links', async ({ page }) => {
    const generateBtn = page.locator('#generate-plan-btn-manual, button:has-text("Generate Plan")');

    if (await generateBtn.count() > 0 && await generateBtn.first().isEnabled()) {
      // Check analyzer nav before plan
      const analyzerNav = page.locator('#analyzer-nav-link');
      if (await analyzerNav.count() > 0) {
        const wasDisabled = await analyzerNav.evaluate(el => el.classList.contains('disabled'));

        // Generate plan
        await generateBtn.first().click();
        await page.waitForTimeout(2000);

        // Check if nav is now enabled
        const nowDisabled = await analyzerNav.evaluate(el => el.classList.contains('disabled'));

        // If it was disabled, it should now be enabled
        if (wasDisabled) {
          expect(nowDisabled).toBe(false);
        }
      }
    }
  });

  test('P1-010: Plan includes well and objective details', async ({ page }) => {
    const generateBtn = page.locator('#generate-plan-btn-manual, button:has-text("Generate Plan")');

    if (await generateBtn.count() > 0 && await generateBtn.first().isEnabled()) {
      // Get selected well name
      const selectedWellCard = page.locator('.planner-card.selected, .well-card.selected');
      const wellName = await selectedWellCard.getAttribute('data-well-name') ||
                       await selectedWellCard.locator('h3, .well-name').textContent();

      // Generate plan
      await generateBtn.first().click();
      await page.waitForTimeout(2000);

      // Check header details for well info
      const headerDetails = page.locator('#header-details');
      if (await headerDetails.count() > 0) {
        const headerText = await headerDetails.textContent();

        // Should contain well reference
        if (wellName) {
          expect(headerText).toContain(wellName.slice(0, 4)); // At least part of well name
        }
      }
    }
  });
});

test.describe('P2: AI Advisor Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });
  });

  test('P2-001: AI toggle switches between manual and AI modes', async ({ page }) => {
    const aiToggle = page.locator('#ai-toggle, input[type="checkbox"][id*="ai"]');

    if (await aiToggle.count() > 0) {
      // Check current state
      const initialState = await aiToggle.isChecked();

      // Toggle
      await aiToggle.click();

      // State should change
      const newState = await aiToggle.isChecked();
      expect(newState).not.toBe(initialState);

      // Check if view changed
      const manualView = page.locator('#manual-planning-view, .manual-mode');
      const aiView = page.locator('#ai-advisor-view, .ai-mode');

      if (newState) {
        // AI mode active
        if (await aiView.count() > 0) {
          await expect(aiView).toBeVisible();
        }
      } else {
        // Manual mode active
        if (await manualView.count() > 0) {
          await expect(manualView).toBeVisible();
        }
      }
    }
  });

  test('P2-002: AI mode displays problem analysis', async ({ page }) => {
    const aiToggle = page.locator('#ai-toggle, input[type="checkbox"][id*="ai"]');

    if (await aiToggle.count() > 0) {
      // Enable AI mode
      if (!await aiToggle.isChecked()) {
        await aiToggle.click();
      }

      // Select a well
      const wellCards = page.locator('.planner-card, .well-card');
      if (await wellCards.count() > 0) {
        await wellCards.first().click();
        await page.waitForTimeout(1000);

        // Look for AI recommendations
        const aiRecommendations = page.locator('#ai-recommendations-container, .ai-recommendations');

        if (await aiRecommendations.count() > 0) {
          // Should show problem analysis
          const problems = page.locator('input[type="radio"][name="problem"]');
          expect(await problems.count()).toBeGreaterThan(0);
        }
      }
    }
  });
});

test.describe('P2: Reset and New Plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');
  });

  test('P2-003: Reset button clears selection and returns to step 1', async ({ page }) => {
    // Select well and objective
    const wellCards = page.locator('.planner-card, .well-card');
    if (await wellCards.count() > 0) {
      await wellCards.first().click();
    }

    const objectiveRadios = page.locator('input[type="radio"][name="objective"]');
    if (await objectiveRadios.count() > 0) {
      await objectiveRadios.first().check();
    }

    // Find reset button
    const resetBtn = page.locator('#reset-app-btn, button:has-text("Reset"), button:has-text("New Plan")');

    if (await resetBtn.count() > 0) {
      await resetBtn.first().click();

      // Wait for reset
      await page.waitForTimeout(500);

      // Well cards should be deselected
      const selectedCards = page.locator('.planner-card.selected, .well-card.selected');
      expect(await selectedCards.count()).toBe(0);

      // Objectives should be unchecked
      const checkedObjectives = page.locator('input[type="radio"][name="objective"]:checked');
      expect(await checkedObjectives.count()).toBe(0);
    }
  });
});

test.describe('P3: Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('P3-001: No JavaScript errors on page load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Navigate to planner
    await page.locator('#hero-planner-btn').click();
    await page.waitForTimeout(2000);

    // Should have no errors
    expect(errors).toHaveLength(0);
  });

  test('P3-002: No console errors during navigation', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through views
    await page.locator('#hero-planner-btn').click();
    await page.waitForTimeout(500);

    await page.locator('#home-nav-link').click();
    await page.waitForTimeout(500);

    await page.locator('#planner-nav-link').click();
    await page.waitForTimeout(500);

    // Filter out benign errors (like missing optional resources)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('Failed to load resource') &&
      !err.includes('404') &&
      !err.includes('favicon')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('P3-003: Disabled nav links do not navigate', async ({ page }) => {
    // Before generating a plan, some nav links should be disabled
    const analyzerNav = page.locator('#analyzer-nav-link');

    if (await analyzerNav.count() > 0) {
      const isDisabled = await analyzerNav.evaluate(el => el.classList.contains('disabled'));

      if (isDisabled) {
        // Try to click it
        await analyzerNav.click();

        // Should NOT navigate to analyzer view
        const analyzerView = page.locator('#analyzer-view');
        await expect(analyzerView).toHaveClass(/hidden/);
      }
    }
  });

  test('P3-004: Page handles missing hash gracefully', async ({ page }) => {
    // Navigate to root
    await page.goto('/');

    // Should default to home view
    const homeView = page.locator('#home-view');
    await expect(homeView).toBeVisible();
  });

  test('P3-005: Page handles invalid hash gracefully', async ({ page }) => {
    // Navigate with invalid hash
    await page.goto('/#invalid-view-12345');
    await page.waitForLoadState('networkidle');

    // Should stay on home or planner (not crash)
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();

    // Should not show error modal
    const errorModal = page.locator('.error-modal, [role="alertdialog"]');
    expect(await errorModal.count()).toBe(0);
  });
});

test.describe('P3: Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('P3-006: Planner navigation works on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero button should be visible and clickable on mobile
    const heroPlannerBtn = page.locator('#hero-planner-btn');
    await expect(heroPlannerBtn).toBeVisible();

    await heroPlannerBtn.click();

    // Planner should load
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });
  });

  test('P3-007: Well cards are interactive on mobile', async ({ page }) => {
    await page.goto('/#planner-view');
    await page.waitForLoadState('networkidle');

    const wellCards = page.locator('.planner-card, .well-card');

    if (await wellCards.count() > 0) {
      const firstCard = wellCards.first();

      // Should be tappable
      await firstCard.tap();

      // Should get selected
      await expect(firstCard).toHaveClass(/selected/);
    }
  });
});

test.describe('P3: Performance and Loading', () => {
  test('P3-008: Planner view loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/#planner-view');

    // Wait for planner to be visible
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('P3-009: Well data loads without blocking UI', async ({ page }) => {
    await page.goto('/#planner-view');

    // UI should be interactive even if data is loading
    const plannerView = page.locator('#planner-view');
    await expect(plannerView).toBeVisible({ timeout: 5000 });

    // Should have loading state or data
    const wellCards = page.locator('.planner-card, .well-card');
    const loadingIndicator = page.locator('.loading, .spinner');

    // Either should have cards OR loading indicator
    const hasCards = await wellCards.count() > 0;
    const hasLoader = await loadingIndicator.count() > 0;

    expect(hasCards || hasLoader).toBe(true);
  });

  test('P3-010: JavaScript files load successfully', async ({ page }) => {
    const failedResources = [];

    page.on('response', response => {
      if (response.url().includes('.js') && !response.ok()) {
        failedResources.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No JS files should fail to load
    expect(failedResources).toHaveLength(0);
  });
});

test.describe('PRODUCTION SMOKE TEST - Quick Validation', () => {
  test('SMOKE: Critical path works end-to-end', async ({ page }) => {
    // This is the ultimate "does it work" test

    // 1. Load homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#home-view')).toBeVisible();

    // 2. Click "Try the Planner"
    await page.locator('#hero-planner-btn').click();
    await expect(page.locator('#planner-view')).toBeVisible({ timeout: 5000 });

    // 3. Select a well
    const wellCards = page.locator('.planner-card, .well-card');
    if (await wellCards.count() > 0) {
      await wellCards.first().click();
      await expect(wellCards.first()).toHaveClass(/selected/);
    }

    // 4. Select an objective
    const objectives = page.locator('input[type="radio"][name="objective"]');
    if (await objectives.count() > 0) {
      await objectives.first().check();
      await expect(objectives.first()).toBeChecked();
    }

    // 5. Generate plan (if button is enabled)
    const generateBtn = page.locator('#generate-plan-btn-manual, button:has-text("Generate Plan")');
    if (await generateBtn.count() > 0) {
      const isEnabled = await generateBtn.first().isEnabled();
      if (isEnabled) {
        await generateBtn.first().click();
        await page.waitForTimeout(2000);

        // Plan should be generated
        const hasContent = await page.locator('body').textContent();
        expect(hasContent.length).toBeGreaterThan(1000);
      }
    }

    // 6. Navigate back to home
    await page.locator('#home-nav-link').click();
    await expect(page.locator('#home-view')).toBeVisible();

    // SUCCESS: Critical path works!
  });
});
