# Video Recording Instructions for Brahan Narrative Homepage

## Quick Start

To record a complete video walkthrough of your new Brahan narrative homepage:

```bash
# 1. Start the local server
npx http-server . -p 8080 -c-1

# 2. In a new terminal, run the test with headed browser (video recording enabled)
npx playwright test tests/e2e/brahan-narrative-homepage.spec.js --headed --project=chromium

# 3. Find your video in:
test-videos/
```

##Test Suite Overview

The `brahan-narrative-homepage.spec.js` test includes:

### Test 1: Complete Brahan Narrative Walkthrough (~90 seconds)
- ✅ Loads homepage with Mobile Communicator hero video (hero33.mp4)
- ✅ Verifies video playback speed at 0.5x (half speed)
- ✅ Scrolls to "THE PROPHECY OF THE BLACK RAIN" section
- ✅ Shows complete narrative: Prophecy → Tragedy (Seer consumed by tar) → Triumph
- ✅ Highlights "How times have changed" pivot
- ✅ Shows dual meaning of "tar" (asphaltene buildup)
- ✅ Displays payoff: "We built the engine to master it"
- ✅ Highlights "MASTER YOUR RISK" CTA button
- ✅ Cinematic recap scroll through all sections
- ✅ Tests responsive design (mobile/tablet/desktop)

### Test 2: Accessibility & SEO Validation
- ✅ ARIA labels for video
- ✅ Screen reader descriptions
- ✅ Heading hierarchy (h1 → h2 → h3)
- ✅ Descriptive CTA link text
- ✅ Meta tags and Open Graph
- ✅ Canonical URLs

### Test 3: Performance Test
- ✅ Homepage loads in under 3 seconds
- ✅ Video lazy loading confirmed

### Test 4: Quick 60-Second Demo Reel
- ✅ Fast-paced walkthrough for social media
- ✅ Hero (5s) → Prophecy (10s) → Narrative (15s) → Payoff (10s) → CTA (10s) → Hero (10s)

## Video Output Locations

All videos are automatically saved to:
- **Default**: `test-videos/`
- **Test results**: `test-results/`

## Customizing the Recording

### Slow Motion (for detailed demos)
Add `slowMo` to playwright.config.ts:

```typescript
use: {
  slowMo: 1000, // 1 second delay between actions
}
```

### Change Video Quality
In playwright.config.ts:

```typescript
use: {
  video: {
    mode: 'on',
    size: { width: 1920, height: 1080 } // Full HD
  }
}
```

### Record Only Specific Test

```bash
# Record just the main walkthrough (test 1)
npx playwright test tests/e2e/brahan-narrative-homepage.spec.js -g "Complete Brahan narrative" --headed

# Record just the 60-second demo reel (test 4)
npx playwright test tests/e2e/brahan-narrative-homepage.spec.js -g "60-second demo" --headed
```

## Creating Demo Videos for Supermajor Briefing

### Option 1: Use Playwright (Automated)

```bash
# Run with visible browser for maximum quality
npx playwright test tests/e2e/brahan-narrative-homepage.spec.js --headed --project=chromium

# Videos saved to: test-videos/
```

### Option 2: Manual Screen Recording

If you prefer manual control:

1. **macOS**: Use QuickTime Player → File → New Screen Recording
2. **Windows**: Use Xbox Game Bar (Win + G)
3. **Linux**: Use SimpleScreenRecorder or OBS Studio

Then follow the test steps manually:
1. Open http://localhost:8080/index.html
2. Wait 4 seconds (show hero video at 0.5x speed)
3. Scroll to "THE PROPHECY OF THE BLACK RAIN" (pause 3s)
4. Scroll to "We Replace Prophecy with Prediction" (pause 4s)
5. Scroll to "We built the engine to master it" (pause 3s)
6. Highlight "MASTER YOUR RISK" button (pause 2s)
7. Scroll back to top for cinematic loop

### Option 3: Export to MP4 with FFmpeg

Playwright videos are WebM format. To convert to MP4:

```bash
# Install ffmpeg (if not installed)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: Download from ffmpeg.org

# Convert video
ffmpeg -i test-videos/your-video.webm -c:v libx264 -c:a aac demo.mp4
```

## Using Videos in Presentations

### For Zoom/Teams Presentations
- Use the 60-second demo reel (Test 4)
- Share screen and play video
- Videos are automatically optimized for screen sharing

### For Embedded Presentations (PowerPoint/Keynote)
1. Run Test 4 (60-second demo)
2. Convert to MP4 with FFmpeg
3. Insert into slide deck

### For Social Media (LinkedIn/Twitter)
- Use Test 4 (60-second version)
- Aspect ratio: 16:9 (default)
- Max file size: Compress with Handbrake if needed

## Troubleshooting

### Issue: "Page crashed" error
**Solution**: Run with `--headed` flag (shows browser):
```bash
npx playwright test --headed
```

### Issue: Video not recording
**Solution**: Check playwright.config.ts has `video: 'on'` in project settings

### Issue: Video too fast
**Solution**: Increase wait times in test or add `slowMo`:
```typescript
test.use({ slowMo: 500 });
```

### Issue: Video quality low
**Solution**: Set explicit video size in config:
```typescript
video: {
  mode: 'on',
  size: { width: 1920, height: 1080 }
}
```

## Next Steps

1. **Run the tests** to generate videos
2. **Review videos** in test-videos/ folder
3. **Convert to MP4** if needed for presentations
4. **Share with team** (Gus, Izzy, Midas) for supermajor briefing prep
5. **Embed in pitch deck** for maximum impact

---

**Pro Tip**: The "Complete Brahan narrative" test (Test 1) is designed to be the perfect demo video for your supermajor CIO briefing. It shows the full narrative arc in ~90 seconds with cinematic pacing.
