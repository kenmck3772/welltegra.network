import { test } from '@playwright/test';

test('Test if app.js causes crash', async ({ page }) => {
  console.log('Testing app.js...');
  try {
    await page.goto('http://localhost:8080/test-app-js.html', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    console.log('✅ Page with app.js loaded!');
    const title = await page.title();
    console.log('Title:', title);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
});
