import { test } from '@playwright/test';
import { setupCDNMocks } from './fixtures/cdn-mock.js';

test('Capture console errors from index.html', async ({ page }) => {
  // Setup CDN mocking to prevent external resource failures
  await setupCDNMocks(page);

  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    console.log(`CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`PAGE ERROR: ${error.message}`);
    console.log(`STACK: ${error.stack}`);
  });

  try {
    await page.goto('http://localhost:8080/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    console.log('✅ Page loaded successfully');
  } catch (e) {
    console.log(`❌ Page failed to load: ${e.message}`);
  }

  // Print all collected errors
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(`[${msg.type}] ${msg.text}`));

  console.log('\n=== PAGE ERRORS ===');
  errors.forEach(err => console.log(err));
});
