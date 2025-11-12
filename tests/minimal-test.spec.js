import { test, expect } from '@playwright/test';

test('Minimal HTML loads', async ({ page }) => {
  const response = await page.goto('http://localhost:8080/test-minimal.html', {
    waitUntil: 'domcontentloaded',
    timeout: 10000
  });

  console.log('Status:', response.status());
  const title = await page.title();
  console.log('Title:', title);

  expect(title).toBe('Minimal Test');
  console.log('✅ Minimal HTML works!');
});
