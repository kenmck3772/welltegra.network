const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./tests/support/global-setup'),
  use: {
    browserName: 'chromium'
  }
});
