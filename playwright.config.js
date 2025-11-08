// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for WellTegra E2E tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test artifacts
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    // Base URL for tests
    baseURL: 'http://127.0.0.1:8000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1920, height: 1080 },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Special project for video recording (instructional videos)
    {
      name: 'video-recording',
      use: {
        ...devices['Desktop Chrome'],
        video: 'on', // Always record video
        trace: 'on', // Always capture trace
        screenshot: 'on', // Take screenshots
        viewport: { width: 1920, height: 1080 }, // Full HD
        launchOptions: {
          slowMo: 500, // Slow down actions by 500ms for better visibility
        },
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
