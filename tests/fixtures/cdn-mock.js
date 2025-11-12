/**
 * CDN Mock Fixture
 * Intercepts external CDN requests and provides mock responses to prevent page crashes
 */

export async function setupCDNMocks(page) {
  // Single route handler for all requests
  await page.route('**/*', async route => {
    const url = route.request().url();

    // Check if this is an HTML request - remove integrity attributes
    if (url.endsWith('.html') || url.includes('/index.html')) {
      console.log(`📄 Intercepting HTML: ${url}`);
      const response = await route.fetch();
      let body = await response.text();

      // Only modify if there are actually integrity attributes to remove
      if (body.includes('integrity=')) {
        // Remove integrity and crossorigin attributes from script tags to prevent SRI failures
        body = body.replace(/\s+integrity="[^"]*"/g, '');
        body = body.replace(/\s+crossorigin="[^"]*"/g, '');
        body = body.replace(/\s+referrerpolicy="[^"]*"/g, '');
        console.log('✅ Removed SRI attributes from HTML');
      }

      // Get response headers and preserve them
      const headers = response.headers();

      route.fulfill({
        status: response.status(),
        headers: {
          ...headers,
          'content-type': 'text/html; charset=utf-8',
        },
        body: body
      });
      return;
    }

    // Check if this is a CDN request
    const isCDN = url.includes('cdn.jsdelivr.net') ||
                  url.includes('cdnjs.cloudflare.com');

    if (isCDN) {
      console.log(`🚫 Mocking CDN request: ${url}`);

      // Provide mock libraries
      let mockBody = '// CDN resource mocked for testing\n';

      if (url.includes('chart.js') || url.includes('Chart.js')) {
        mockBody += `
window.Chart = class Chart {
  constructor() {}
  static register() {}
  static defaults = { plugins: {} };
};
`;
      } else if (url.includes('jspdf')) {
        mockBody += `
window.jspdf = { jsPDF: class {} };
window.jsPDF = class jsPDF {};
`;
      } else if (url.includes('html2canvas')) {
        mockBody += `
window.html2canvas = async () => ({ toDataURL: () => '' });
`;
      } else if (url.includes('socket.io')) {
        mockBody += `
window.io = () => ({ on: () => {}, emit: () => {}, connect: () => {} });
`;
      }

      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: mockBody
      });
      return;
    }

    // Allow all other requests to pass through
    route.continue();
  });

  console.log('✅ CDN mocking configured for test');
}
