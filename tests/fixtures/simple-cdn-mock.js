/**
 * Simple CDN Mock - Just mock CDN requests without modifying HTML
 */

export async function setupCDNMocks(page) {
  // Only mock CDN requests - don't touch HTML
  await page.route('**/*', async route => {
    const url = route.request().url();

    // Check if this is a CDN request
    const isCDN = url.includes('cdn.jsdelivr.net') ||
                  url.includes('cdnjs.cloudflare.com');

    if (isCDN) {
      console.log(`🚫 Mocking CDN request: ${url}`);

      // Return minimal valid JavaScript
      let mockBody = '// CDN resource mocked\n';

      // Determine library and provide minimal implementation
      if (url.includes('chart')) {
        mockBody = 'window.Chart = class { constructor() {} static register() {} static defaults = { plugins: {} }; };';
      } else if (url.includes('jspdf')) {
        mockBody = 'window.jsPDF = class { constructor() {} addPage() {} text() {} save() {} };';
      } else if (url.includes('html2canvas')) {
        mockBody = 'window.html2canvas = () => Promise.resolve({ toDataURL: () => "" });';
      } else if (url.includes('socket.io')) {
        mockBody = 'window.io = () => ({ on: () => {}, emit: () => {}, connect: () => {}, disconnect: () => {} });';
      }

      // Don't fulfill with our mock - instead just abort the request
      // This prevents SRI failures
      route.abort('failed');
      return;
    }

    // Allow all other requests through
    route.continue();
  });

  console.log('✅ CDN blocking configured');
}
