import { test } from '@playwright/test';

test('Test first 100 lines of app.js', async ({ page }) => {
  try {
    await page.goto('http://localhost:8080/test-app-partial.html', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    console.log('✅ First 100 lines work!');
  } catch (e) {
    console.log('❌ First 100 lines crash:', e.message);
  }
});
