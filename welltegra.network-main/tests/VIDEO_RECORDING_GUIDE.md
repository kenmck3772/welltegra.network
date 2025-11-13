# WellTegra Video Recording Guide

This guide explains how to record instructional videos and walkthroughs of the WellTegra application using Playwright's automated testing framework.

---

## 🎬 Quick Start

### Option 1: Record Full Application Walkthrough (Recommended)

This records a complete end-to-end workflow through the entire application:

```bash
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed
```

**What it records:**
1. Homepage/Dashboard
2. Well Selection (Well 666)
3. Planner Module (creating intervention plan)
4. Risk Assessment
5. Performer Module (live operations monitoring)
6. Analyzer Module (KPIs and metrics)
7. PDF Export
8. Return to Dashboard

**Duration:** ~5-7 minutes

---

### Option 2: Quick Demo (2-Minute Overview)

For shorter promotional videos:

```bash
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed -g "Quick demo"
```

**What it records:**
- Homepage
- Planner
- Performer
- Analyzer
- Equipment Catalog
- 3D Visualization
- Pricing Page

**Duration:** ~2 minutes

---

### Option 3: Feature Showcase Tour

Records a tour through all 12 features:

```bash
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed -g "Feature showcase"
```

**Duration:** ~3-4 minutes

---

## 📁 Where to Find Your Videos

After running tests, videos are saved to:

```
test-results/
└── [test-name]-[browser]-[timestamp]/
    ├── video.webm          ← Your recorded video
    ├── trace.zip           ← Playwright trace (can replay in Playwright Trace Viewer)
    └── screenshots/        ← Screenshots at key moments
```

---

## ⚙️ Customizing Video Recording

### Adjust Recording Speed

Edit `playwright.config.js` under the `video-recording` project:

```javascript
launchOptions: {
  slowMo: 500, // Milliseconds between actions (increase for slower demo)
},
```

- `slowMo: 0` = Normal speed (fast)
- `slowMo: 500` = Half second between actions (recommended for instructional videos)
- `slowMo: 1000` = One second between actions (very slow, good for detailed walkthroughs)

### Change Video Resolution

In `playwright.config.js`:

```javascript
viewport: { width: 1920, height: 1080 }, // Full HD
// OR
viewport: { width: 2560, height: 1440 }, // 2K
// OR
viewport: { width: 3840, height: 2160 }, // 4K
```

---

## 🎥 Converting Videos for Editing

Playwright records videos in `.webm` format. To convert to `.mp4` for editing:

### Using ffmpeg:

```bash
# Install ffmpeg (if not already installed)
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Linux

# Convert .webm to .mp4
ffmpeg -i test-results/video.webm -c:v libx264 -crf 23 output.mp4

# High quality conversion
ffmpeg -i test-results/video.webm -c:v libx264 -crf 18 -preset slow output.mp4
```

---

## 🎤 Adding Narration

### Option 1: Record Audio Separately

1. Run the test to record video:
   ```bash
   npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed
   ```

2. Watch the generated video and record narration alongside it

3. Combine in video editing software (iMovie, Final Cut, Premiere, DaVinci Resolve)

### Option 2: Live Narration During Recording

Use macOS's built-in screen recording with audio:

```bash
# Start screen recording with audio
# System Settings → Privacy & Security → Screen Recording (allow Terminal)

# Then run the test while recording audio
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed
```

---

## 🛠️ Advanced Usage

### Running Tests Without Video (for development)

```bash
# Normal test run (no video)
npx playwright test full-application-walkthrough.spec.js
```

### Debug Mode (see browser, step through slowly)

```bash
# Opens browser inspector
npx playwright test full-application-walkthrough.spec.js --debug
```

### Headless Mode (faster, no browser window)

```bash
npx playwright test full-application-walkthrough.spec.js --project=chromium
```

### Record Multiple Tests in Parallel

```bash
# Record all three walkthrough types at once
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed --workers=1
```

*Note: Use `--workers=1` to prevent tests from interfering with each other*

---

## 📝 Customizing the Walkthrough

Edit `tests/e2e/full-application-walkthrough.spec.js` to customize:

### Adjust Timing

```javascript
// Change pause durations (in milliseconds)
await page.waitForTimeout(2000); // 2 seconds
await page.waitForTimeout(5000); // 5 seconds
```

### Add Text Annotations

```javascript
// Add on-screen text during recording
await page.evaluate(() => {
  const overlay = document.createElement('div');
  overlay.textContent = 'Step 1: Selecting Well 666';
  overlay.style.cssText = 'position: fixed; top: 20px; right: 20px; background: rgba(6, 182, 212, 0.9); color: white; padding: 1rem; border-radius: 8px; font-size: 18px; z-index: 10000;';
  document.body.appendChild(overlay);
});

await page.waitForTimeout(3000);

// Remove overlay
await page.evaluate(() => {
  const overlay = document.querySelector('div');
  if (overlay) overlay.remove();
});
```

### Highlight Elements

```javascript
// Highlight an element with a border
await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.style.border = '3px solid #06b6d4';
    element.style.boxShadow = '0 0 20px rgba(6, 182, 212, 0.8)';
  }
}, '.well-card');

await page.waitForTimeout(2000);
```

---

## 🎯 Best Practices for Instructional Videos

1. **Test before recording**: Run through the test once to ensure it works
2. **Clean browser state**: Close other tabs/windows before recording
3. **Disable notifications**: Turn off system notifications during recording
4. **Check resolution**: Verify viewport size matches your target platform
5. **Add pauses**: Include `waitForTimeout()` calls to give viewers time to read
6. **Test audio**: If narrating, do a sound check first
7. **Use consistent speed**: Set `slowMo` to the same value for all recordings

---

## 🐛 Troubleshooting

### Video not recording?

Check that video recording is enabled in `playwright.config.js`:

```javascript
use: {
  video: 'on',
}
```

### Video is too fast?

Increase `slowMo`:

```javascript
launchOptions: {
  slowMo: 1000, // Increase this number
}
```

### Test fails partway through?

Check the Playwright trace for details:

```bash
npx playwright show-trace test-results/[test-folder]/trace.zip
```

### Server not starting?

Manually start the server first:

```bash
python3 -m http.server 8000
```

Then run tests with:

```bash
npx playwright test --config playwright.config.js
```

---

## 📊 Example Commands Summary

```bash
# Full walkthrough (recommended)
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed

# Quick 2-minute demo
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed -g "Quick demo"

# Feature showcase
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed -g "Feature showcase"

# All three videos at once (sequential)
npx playwright test full-application-walkthrough.spec.js --project=video-recording --headed --workers=1

# View test report
npx playwright show-report test-results/html
```

---

## 🎓 Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/videos)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Video Conversion with FFmpeg](https://ffmpeg.org/ffmpeg.html)

---

**Need help?** Check the [Playwright Discord](https://discord.com/invite/playwright-807756831384403968) or [WellTegra Documentation](../README.md)
