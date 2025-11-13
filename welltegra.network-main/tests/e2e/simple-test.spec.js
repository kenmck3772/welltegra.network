/**
 * Simple diagnostic test to verify Playwright is working
 */

const { test, expect } = require('@playwright/test');
const { setupCDNMocks } = require('../fixtures/cdn-mock.js');

test('Simple page loads successfully', async ({ page }) => {
  await setupCDNMocks(page);
  console.log('Testing simple page load...');

  const response = await page.goto('http://localhost:8080/test-simple.html', {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  console.log('Page loaded with status:', response.status());

  // Just check the page loaded (don't crash)
  expect(response.status()).toBe(200);

  // Check page title
  await expect(page).toHaveTitle('Simple Test Page');

  console.log('✅ Simple page loaded successfully without crashing');
});

test('Index page loads without crashing', async ({ page }) => {
  await setupCDNMocks(page);
  console.log('Testing index.html load...');

  const response = await page.goto('http://localhost:8080/index.html', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  console.log('Index page loaded with status:', response.status());
  expect(response.status()).toBe(200);

  console.log('✅ Index page loaded without crashing!');
});
