const { chromium, expect } = require('@playwright/test');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

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

const rootDir = path.resolve(__dirname, '..', '..');
const shouldAutoInstallDependencies = process.env.PLAYWRIGHT_AUTO_INSTALL_DEPS === 'true';

const createStaticServer = () =>
  http.createServer(async (req, res) => {
    try {
      const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const normalizedPath = path
        .normalize(requestPath)
        .replace(/^([.]{2}[\\/])+/, '')
        .replace(/^\/+/, '');

      let filePath = normalizedPath ? path.join(rootDir, normalizedPath) : path.join(rootDir, 'index.html');

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

const runPlaywrightCLI = (args, failureMessage) => {
  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const result = spawnSync(npxCommand, ['playwright', ...args], {
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(failureMessage);
  }
};

const downloadChromiumIfMissing = async () => {
  runPlaywrightCLI(['install', 'chromium'], 'Playwright Chromium download failed');
};

const installChromiumDependenciesIfMissing = async () => {
  if (!shouldAutoInstallDependencies) {
    throw new Error('Automatic dependency installation is disabled.');
  }

  runPlaywrightCLI(['install-deps', 'chromium'], 'Playwright Chromium system dependency installation failed');
};

const verifyChromium = async () => {
  try {
    const browser = await chromium.launch();
    await browser.close();
  } catch (error) {
    const needsDownload =
      /Executable doesn't exist/.test(error.message) || /run the following command to download/.test(error.message);
    const missingDependencies = /Host system is missing dependencies/.test(error.message);

    if (needsDownload) {
      console.warn('Chromium binaries missing. Downloading with "npx playwright install chromium"...');
      try {
        await downloadChromiumIfMissing();
      } catch (downloadError) {
        throw new Error(
          `Unable to download Chromium for Playwright. Original error: ${error.message}. Download error: ${downloadError.message}`
        );
      }

      const browser = await chromium.launch();
      await browser.close();
      return;
    }

    if (missingDependencies) {
      if (!shouldAutoInstallDependencies) {
        throw error;
      }

      console.warn('Chromium dependencies missing. Installing with "npx playwright install-deps chromium"...');
      try {
        await installChromiumDependenciesIfMissing();
      } catch (dependencyError) {
        throw new Error(
          `Unable to install Chromium system dependencies. Original error: ${error.message}. Dependency error: ${dependencyError.message}`
        );
      }

      const browser = await chromium.launch();
      await browser.close();
      return;
    }

    throw error;
  }
};

function setupPlannerTest(test) {
  let server;
  let baseURL;
  let launchSkipMessage;

  test.beforeAll(async () => {
    try {
      await verifyChromium();
    } catch (error) {
      const manualInstruction = shouldAutoInstallDependencies
        ? 'Automatic dependency installation failed.'
        : 'Re-run with PLAYWRIGHT_AUTO_INSTALL_DEPS=true to attempt an automatic apt install, or run "npx playwright install-deps chromium" manually.';

      launchSkipMessage = [
        'Playwright could not launch Chromium. Install the system dependencies',
        'with "npx playwright install-deps" (or the equivalent apt packages)',
        'before re-running smoke tests.',
        manualInstruction,
        'Original error:',
        error.message
      ].join(' ');
      console.warn(launchSkipMessage);
    }
  });

  test.beforeAll(async () => {
    if (launchSkipMessage) {
      return;
    }

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

  const skipIfChromiumUnavailable = (testInfo) => {
    if (launchSkipMessage) {
      testInfo.skip(launchSkipMessage);
    }
  };

  const gotoPlannerHome = async (page) => {
    await page.goto(`${baseURL}/index.html`);
    await page.waitForFunction(() => {
      const container = document.getElementById('app-container');
      return container && container.classList.contains('flex');
    });
  };

  const waitForPlannerWorkspace = async (page) => {
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
  };

  const openPlannerWorkspace = async (page) => {
    await gotoPlannerHome(page);
    const heroCTA = page.locator('#hero-planner-btn');
    await expect(heroCTA).toBeVisible();
    await heroCTA.click();
    await waitForPlannerWorkspace(page);
  };

  const captureConsoleErrors = (page) => {
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
    return pageErrors;
  };

  return {
    skipIfChromiumUnavailable,
    gotoPlannerHome,
    openPlannerWorkspace,
    waitForPlannerWorkspace,
    captureConsoleErrors,
    getBaseURL: () => baseURL
  };
}

module.exports = {
  setupPlannerTest
};
