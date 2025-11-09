const { test, expect } = require('@playwright/test');

test('Debug what browser is actually rendering', async ({ page }) => {
  console.log('Loading test-simple.html...');

  const response = await page.goto('http://localhost:8080/test-simple.html', {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  console.log('Response status:', response.status());
  console.log('Response URL:', response.url());

  // Wait a bit for rendering
  await page.waitForTimeout(2000);

  // Get the actual HTML content
  const html = await page.content();
  console.log('Page HTML length:', html.length);
  console.log('First 500 chars:', html.substring(0, 500));

  // Get the title
  const title = await page.title();
  console.log('Page title:', title);

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-screenshot.png' });
  console.log('Screenshot saved to test-results/debug-screenshot.png');

  // Get page text content
  const text = await page.locator('body').textContent();
  console.log('Body text:', text);
});
