import { test, expect } from '@playwright/test';

test('Index loads WITHOUT any mocking', async ({ page }) => {
  console.log('Loading without mocking...');

  try {
    await page.goto('http://localhost:8080/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ Page loaded!');

    // Check if page has content
    const title = await page.title();
    console.log('Page title:', title);

    // Try to find some element
    const header = await page.locator('#app-header').count();
    console.log('Header found:', header > 0);

  } catch (e) {
    console.log('❌ Error:', e.message);
  }
});
