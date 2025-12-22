import { chromium } from '@playwright/test';

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');

  // Optional: Set up test data or mock APIs
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // You can pre-load data or perform setup tasks here
  console.log('✅ Global setup complete');

  await browser.close();
}

export default globalSetup;