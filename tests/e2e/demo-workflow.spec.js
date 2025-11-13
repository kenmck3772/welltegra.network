import { test, expect } from '@playwright/test';

test.describe('Full Demo Workflow (FIXED)', () => {

  test('Complete 5-Act User Journey', async ({ page }) => {
    
    // ---------------------------------
    // ** INVINCIBLE MOCK **
    // This Proxy object accepts ANY call (new Chart, Chart.register, etc.)
    // and returns itself. It is impossible to crash.
    // ---------------------------------
    await page.addInitScript(() => {
      const getMock = () => new Proxy(function() {}, {
        get: () => getMock(),
        apply: () => getMock(),
        construct: () => getMock()
      });
      
      window.Chart = getMock();
      window.jspdf = { jsPDF: getMock() };
      window.html2canvas = getMock();
    });

    // ---------------------------------
    // ACT 1: LOAD HOME
    // ---------------------------------
    await page.goto('/index.html');
    await expect(page.locator('#home-view')).toBeVisible();

    // ---------------------------------
    // ACT 2: NAVIGATE TO PLANNER
    // ---------------------------------
    await page.locator('#planner-nav-link').click();
    await expect(page.locator('#planner-view')).toBeVisible();

    // ---------------------------------
    // ** WAIT FOR CARD **
    // ---------------------------------
    // Wait for the card that proves JS finished running
    await expect(page.locator('.planner-card[data-well-id="W666"]')).toBeVisible({ timeout: 10000 });
    
    // ---------------------------------
    // ** GENERATE A PLAN **
    // ---------------------------------
    await page.locator('.planner-card[data-well-id="W666"]').click();
    await page.locator('#ai-toggle').check();
    await page.locator('.objective-card[data-problem-id="prob1"]').click();
    await expect(page.locator('.ai-recommendation-enhanced')).toBeVisible({ timeout: 10000 });
    await page.locator('.ai-recommendation-enhanced').first().click();
    await page.locator('#generate-plan-btn-ai').click();
    await expect(page.locator('#plan-output')).toBeVisible({ timeout: 10000 });

    // ---------------------------------
    // ACT 3: NAVIGATE TO EQUIPMENT
    // ---------------------------------
    await page.locator('#equipment-nav-link').click();
    await expect(page.locator('#equipment-view')).toBeVisible({ timeout: 10000 });

    // ---------------------------------
    // ACT 4: SEARCH FOR EQUIPMENT
    // ---------------------------------
    const searchBar = page.locator('#equipment-catalog-search');
    await expect(searchBar).toBeVisible({ timeout: 10000 });
    await searchBar.fill('BHA');
    await expect(searchBar).toHaveValue('BHA');
  });

});
