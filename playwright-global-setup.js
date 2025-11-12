/**
 * Playwright Global Setup
 * Handles external CDN resources to prevent page crashes in tests
 */

export default function globalSetup() {
  console.log('🔧 Playwright global setup initialized');
  console.log('📦 External CDN mocking will be handled per-test via route interception');
}
