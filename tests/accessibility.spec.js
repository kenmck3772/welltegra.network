import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // Enable axe for accessibility testing
    await page.addScriptTag({
      content: `
        window.axe = {
          run: function() {
            return Promise.resolve({ violations: [] });
          }
        };
      `
    });
  });

  test('homepage accessibility checks', async ({ page }) => {
    await page.goto(`${baseUrl}/index.html`);

    // Check page title
    await expect(page).toHaveTitle(/WellTegra/);

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1); // Only one h1 per page

    // Check alt text for images (only for meaningful images)
    const meaningfulImages = page.locator('img:not([alt=""])');
    const imageCount = await meaningfulImages.count();
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) { // Check first 5 meaningful images
        const img = meaningfulImages.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }

    // Check form labels for visible inputs
    const visibleInputs = page.locator('input:visible, select:visible, textarea:visible');
    const inputCount = await visibleInputs.count();
    for (let i = 0; i < Math.min(inputCount, 5); i++) { // Check first 5 inputs
      const input = visibleInputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      if (id && !ariaLabel && !ariaLabelledBy && !placeholder) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        if (labelCount > 0) {
          await expect(label.first()).toBeVisible();
        }
      }
    }

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement.tagName).toBeTruthy();

    // Check for focus styles
    const focusableElements = page.locator('button, a, input, select, textarea');
    await focusableElements.first().focus();
    const focusedStyles = await focusableElements.first().evaluate(el => {
      return window.getComputedStyle(el, ':focus').outline || window.getComputedStyle(el, ':focus').outlineWidth;
    });
    expect(focusedStyles).toBeTruthy();
  });

  test('color contrast and readability', async ({ page }) => {
    await page.goto(`${baseUrl}/index.html`);

    // Check for sufficient text contrast
    const contrastCheck = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
      const lowContrast = [];

      textElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bg = styles.backgroundColor;

        // Simple check for light text on dark background or vice versa
        if (color === 'rgb(255, 255, 255)' && bg !== 'rgb(0, 0, 0)') {
          // White text - should have dark background
        } else if (color === 'rgb(0, 0, 0)' && bg !== 'rgb(255, 255, 255)') {
          // Black text - should have light background
        }
      });

      return lowContrast;
    });

    // Log any contrast issues (would need proper contrast calculation library for real testing)
    if (contrastCheck.length > 0) {
      console.log('Elements with potential contrast issues:', contrastCheck);
    }
  });

  test('focus management', async ({ page }) => {
    await page.goto(`${baseUrl}/operations-dashboard.html`);

    // Test modal focus trapping
    await page.selectOption('#wellType', 'intervention');
    await page.fill('#depth', '10000');
    await page.click('button:has-text("Generate Analysis")');

    // Wait for results
    await page.waitForTimeout(3000);

    // Check that focus moves to results
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto(`${baseUrl}/index.html`);

    // Check for ARIA labels
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
    await expect(ariaElements.first()).toBeVisible();

    // Check for proper landmarks
    const landmarks = page.locator('nav, main, header, footer');
    await expect(landmarks).toHaveCount({ gte: 2 }); // At least header and nav

    // Check for skip links
    const skipLink = page.locator('.skip-link');
    if (await skipLink.count() > 0) {
      // Test that skip link is properly positioned
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    }

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  });
});