async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');

  // Clean up any test data or temporary files
  // Close any open connections
  // Reset test environment

  console.log('✅ Global teardown complete');
}

export default globalTeardown;