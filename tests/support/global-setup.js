const { ensureChromium } = require('./chromium-guard');

module.exports = async () => {
  const allowAutoInstall = process.env.PLAYWRIGHT_AUTO_INSTALL_DEPS === 'true';
  delete process.env.PLAYWRIGHT_SKIP_REASON;

  try {
    await ensureChromium({ allowDependencyInstall: allowAutoInstall });
  } catch (error) {
    const manualInstruction = allowAutoInstall
      ? 'Automatic dependency installation failed.'
      : 'Re-run with PLAYWRIGHT_AUTO_INSTALL_DEPS=true to attempt an automatic apt install, or run "npx playwright install-deps chromium" manually.';

    const skipMessage = [
      'Playwright could not launch Chromium. Install the system dependencies',
      'with "npx playwright install-deps" (or the equivalent apt packages)',
      'before re-running smoke tests.',
      manualInstruction,
      'Original error:',
      error.message
    ].join(' ');

    process.env.PLAYWRIGHT_SKIP_REASON = skipMessage;
    console.warn(skipMessage);
  }
};
