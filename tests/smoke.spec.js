const { test, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.woff2': 'font/woff2'
};

const rootDir = path.resolve(__dirname, '..');

let server;
let baseURL;

const createStaticServer = () => {
  return http.createServer(async (req, res) => {
    try {
      const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const normalizedPath = path
        .normalize(requestPath)
        .replace(/^([.]{2}[\/])+/, '')
        .replace(/^\/+/, '');

      let filePath = normalizedPath
        ? path.join(rootDir, normalizedPath)
        : path.join(rootDir, 'index.html');

      const stats = await fs.promises.stat(filePath).catch(async (error) => {
        if (error.code === 'ENOENT' && normalizedPath.endsWith('/')) {
          return fs.promises.stat(path.join(filePath, 'index.html'));
        }
        throw error;
      });

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
    }
  });
};

test.beforeAll(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('hero planner CTA opens the planner workspace without console errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => {
    console.error('PAGE ERROR:', error);
    pageErrors.push(error);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const error = new Error(message.text());
      console.error('CONSOLE ERROR:', message.text());
      pageErrors.push(error);
    }
  });

  await page.goto(`${baseURL}/index.html`);

  const heroCTA = page.locator('#hero-planner-btn');
  await expect(heroCTA).toBeVisible();

  await page.waitForFunction(() => {
    const container = document.getElementById('app-container');
    return container && container.classList.contains('flex');
  });

  await heroCTA.click();

  await page.waitForFunction(() => {
    const plannerViewEl = document.getElementById('planner-view');
    const homeViewEl = document.getElementById('home-view');
    return (
      !!plannerViewEl &&
      !plannerViewEl.classList.contains('hidden') &&
      !!homeViewEl &&
      homeViewEl.classList.contains('hidden')
    );
  });

  const plannerView = page.locator('#planner-view');
  await expect(plannerView).toBeVisible();
  await expect(page.locator('#home-view')).toBeHidden();
  await expect(page.locator('.well-card-enhanced')).toHaveCount(7);

  expect(pageErrors, `Unexpected console errors: ${pageErrors.map((err) => err.message).join('\n')}`).toEqual([]);
});
