const { test, expect, chromium } = require('@playwright/test');
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

const rootDir = path.resolve(__dirname, '..');

let server;
let baseURL;
let launchSkipMessage;
const shouldAutoInstallDependencies = process.env.PLAYWRIGHT_AUTO_INSTALL_DEPS === 'true';

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
    return;
  } catch (error) {
    const needsDownload =
      /Executable doesn't exist/.test(error.message) ||
      /run the following command to download/.test(error.message);
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
    test.skip(true, launchSkipMessage);
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

test('hero planner CTA opens the planner workspace without console errors', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
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

test('selecting a planner well unlocks step two and opens the history modal', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await page.goto(`${baseURL}/index.html`);

  await page.waitForFunction(() => {
    const container = document.getElementById('app-container');
    return container && container.classList.contains('flex');
  });

  await page.locator('#hero-planner-btn').click();

  const plannerCards = page.locator('.planner-card');
  await expect(plannerCards).toHaveCount(7);

  const targetCard = page.locator('.planner-card[data-well-id="W666"]');
  await targetCard.click();

  await expect(page.locator('#step-2')).toBeVisible();
  await expect(page.locator('#data-scrubbing-panel')).toBeVisible();
  await expect(page.locator('#step-2-indicator')).toHaveClass(/active/);

  const iconLocator = targetCard.locator('span[role="img"][aria-label="Critical intervention required"]');
  await expect(iconLocator).toBeVisible();

  await targetCard.locator('.view-details-btn').click();
  const modal = page.locator('#well-history-modal');
  await expect(modal).toBeVisible();
  await expect(page.locator('#modal-content span[aria-label="Lesson learned"]')).toBeVisible();

  await page.locator('#close-modal-btn').click();
  await expect(modal).toBeHidden();
});

test('planner portfolio filters and search narrow the visible wells', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await page.goto(`${baseURL}/index.html`);

  await page.waitForFunction(() => {
    const container = document.getElementById('app-container');
    return container && container.classList.contains('flex');
  });

  await page.locator('#hero-planner-btn').click();

  const wellCards = page.locator('.planner-card');
  await expect(wellCards).toHaveCount(7);

  const summary = page.locator('#well-filter-summary');
  await expect(summary).toContainText('Showing 7 of 7 wells');

  const searchInput = page.locator('#well-search-input');
  await searchInput.fill('Storm');
  await expect(wellCards).toHaveCount(1);
  await expect(summary).toContainText('Showing 1 of 7 wells');

  await searchInput.fill('');
  await expect(wellCards).toHaveCount(7);

  const flowChip = page.locator('[data-theme-filter="flow-assurance"]');
  await flowChip.click();
  await expect(flowChip).toHaveAttribute('aria-pressed', 'true');
  await expect(wellCards).toHaveCount(5);
  await expect(summary).toContainText('Showing 5 of 7 wells');

  const caseChip = page.locator('[data-focus-filter="case"]');
  await caseChip.click();
  await expect(caseChip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-focus-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(wellCards).toHaveCount(4);
  await expect(summary).toContainText('Filters active');

  await flowChip.click();
  await expect(flowChip).toHaveAttribute('aria-pressed', 'false');
  await expect(wellCards).toHaveCount(6);

  const allChip = page.locator('[data-focus-filter="all"]');
  await allChip.click();
  await expect(allChip).toHaveAttribute('aria-pressed', 'true');
  await expect(wellCards).toHaveCount(7);
});

test('readiness summary surfaces sustainability metrics for generated plan', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await page.goto(`${baseURL}/index.html`);

  await page.waitForFunction(() => {
    const container = document.getElementById('app-container');
    return container && container.classList.contains('flex');
  });

  await page.locator('#hero-planner-btn').click();

  const targetCard = page.locator('.planner-card[data-well-id="W666"]');
  await targetCard.click();

  const continueStepOne = page.locator('#step-1-continue');
  await expect(continueStepOne).toBeEnabled();
  await continueStepOne.click();

  await page.locator('[data-objective-id="obj1"] label').click();

  const continueStepTwo = page.locator('#step-2-continue');
  await expect(continueStepTwo).toBeEnabled();
  await continueStepTwo.click();

  await expect(page.locator('#step-3')).toBeVisible();

  const generateProgram = page.locator('#generate-program-btn');
  await expect(generateProgram).toBeEnabled();
  await generateProgram.click();

  const planOutput = page.locator('#plan-output');
  await expect(planOutput).toContainText('Intervention Plan');

  const continueStepFour = page.locator('#step-4-continue');
  await expect(continueStepFour).toBeEnabled();
  await continueStepFour.click();

  await expect(page.locator('#step-5')).toBeVisible();

  const sustainabilityCard = page.locator('[data-test-sustainability-card="true"]');
  await expect(sustainabilityCard).toBeVisible();
  await expect(sustainabilityCard).toContainText('CO₂e Avoided');
  await expect(sustainabilityCard).toContainText('Digital Twin Coverage');
});
