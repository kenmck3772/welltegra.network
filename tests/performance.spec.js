import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';

  test('Core Web Vitals - Homepage', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${baseUrl}/index.html`);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        largestContentfulPaint: 0, // Would need PerformanceObserver
        firstInputDelay: 0 // Would need PerformanceObserver
      };
    });

    console.log('Performance Metrics:', navigationTiming);

    // Performance assertions
    expect(navigationTiming.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(navigationTiming.loadComplete).toBeLessThan(8000); // 8 seconds
    expect(navigationTiming.firstContentfulPaint).toBeLessThan(4000); // 4 seconds

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(10000); // 10 seconds total
  });

  test('bundle size analysis', async ({ page }) => {
    const responses = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        responses.push({
          url: url,
          size: response.headers()['content-length'] || 0
        });
      }
    });

    await page.goto(`${baseUrl}/index.html`);
    await page.waitForLoadState('networkidle');

    // Calculate total bundle size
    let totalJSSize = 0;
    let totalCSSSize = 0;

    responses.forEach(response => {
      const size = parseInt(response.size) || 0;
      if (response.url.includes('.js')) {
        totalJSSize += size;
      } else if (response.url.includes('.css')) {
        totalCSSSize += size;
      }
    });

    console.log(`Total JS bundle size: ${(totalJSSize / 1024).toFixed(2)} KB`);
    console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);

    // Verify bundle sizes are reasonable (adjust thresholds as needed)
    expect(totalJSSize).toBeLessThan(500 * 1024); // 500KB
    expect(totalCSSSize).toBeLessThan(200 * 1024); // 200KB
  });

  test('image optimization', async ({ page }) => {
    const imageUrls = [];

    page.on('response', response => {
      const url = response.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageUrls.push({
          url: url,
          size: response.headers()['content-length'] || 0
        });
      }
    });

    await page.goto(`${baseUrl}/index.html`);

    // Check for large images
    const largeImages = imageUrls.filter(img => img.size > 500 * 1024); // 500KB
    if (largeImages.length > 0) {
      console.log('Large images found:', largeImages);
    }

    // Recommend optimization if images are too large
    expect(largeImages.length).toBeLessThan(3); // Allow some large images but limit them
  });

  test('API response times', async ({ page }) => {
    const apiResponseTimes = [];

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('.json') || url.includes('api')) {
        const timing = response.headers()['x-response-time'] || '0';
        apiResponseTimes.push({
          url: url,
          responseTime: parseFloat(timing) || 0
        });
      }
    });

    // Test with equipment page that loads JSON data
    await page.goto(`${baseUrl}/equipment.html`);
    await page.waitForTimeout(2000); // Wait for data to load

    // Check if any APIs were slow
    const slowAPIs = apiResponseTimes.filter(api => api.responseTime > 1000); // 1 second
    if (slowAPIs.length > 0) {
      console.log('Slow API responses:', slowAPIs);
    }
  });

  test('memory usage', async ({ page }) => {
    await page.goto(`${baseUrl}/operations-dashboard.html`);

    // Perform some interactions
    await page.selectOption('#wellType', 'intervention');
    await page.fill('#depth', '10000');
    await page.click('button:has-text("Generate Analysis")');
    await page.waitForTimeout(3000);

    // Check memory usage
    const memoryInfo = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryInfo) {
      console.log(`Memory used: ${(memoryInfo.used / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory total: ${(memoryInfo.total / 1024 / 1024).toFixed(2)} MB`);

      // Check for memory leaks (basic check)
      expect(memoryInfo.used).toBeLessThan(memoryInfo.limit * 0.5); // Less than 50% of limit
    }
  });

  test('caching headers', async ({ page }) => {
    const responses = [];

    page.on('response', response => {
      const url = response.url();
      if (url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2?)$/i)) {
        responses.push({
          url: url,
          cacheControl: response.headers()['cache-control'] || '',
          etag: response.headers()['etag'] || ''
        });
      }
    });

    await page.goto(`${baseUrl}/index.html`);

    // Check if static assets have caching headers
    const assetsWithoutCache = responses.filter(asset =>
      !asset.cacheControl.includes('max-age') &&
      !asset.cacheControl.includes('immutable')
    );

    if (assetsWithoutCache.length > 0) {
      console.warn('Assets without proper caching:', assetsWithoutCache.map(a => a.url));
    }

    // At least 80% of assets should have caching
    const cachedPercentage = ((responses.length - assetsWithoutCache.length) / responses.length) * 100;
    expect(cachedPercentage).toBeGreaterThan(80);
  });
});