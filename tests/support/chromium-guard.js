const { chromium } = require('playwright');
const { spawnSync } = require('child_process');

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
  runPlaywrightCLI(['install-deps', 'chromium'], 'Playwright Chromium system dependency installation failed');
};

async function ensureChromium({ allowDependencyInstall }) {
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
      if (!allowDependencyInstall) {
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
}

module.exports = {
  ensureChromium
};
