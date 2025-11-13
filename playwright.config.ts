import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  
  // -- NEW: This block tells Playwright to start a web server --
  webServer: {
    command: 'npx http-server -p 8080',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: !process.env.CI,
  },

  use: {
    headless: true,
    browserName: 'chromium',
    
    // -- NEW: This tells all 'page.goto()' commands to use this URL --
    baseURL: 'http://127.0.0.1:8080', 
  },
});
