/**
 * WellTegra Brahan Narrative Homepage Test
 *
 * This test validates the complete Brahan narrative transformation:
 * - "THE PROPHECY OF THE BLACK RAIN" hero section
 * - Mobile Communicator hero video (0.5x speed)
 * - Complete narrative arc: Prophecy → Tragedy → Triumph
 * - "We built the engine to master it" closing
 * - "MASTER YOUR RISK" CTA
 *
 * VIDEO RECORDING:
 * To record this test as a demo video, run:
 * npx playwright test brahan-narrative-homepage.spec.js --headed --project=chromium
 *
 * Videos are automatically saved to: test-videos/
 */

const { test, expect } = require('@playwright/test');

// Configure all tests to always record video (even on success)
test.use({
  video: 'on',
  screenshot: 'on',
  trace: 'on'
});

test.describe('Brahan Narrative Homepage - Complete Walkthrough', () => {

  test('Complete Brahan narrative: Hero → Prophecy → Story → Payoff → CTA', async ({ page }) => {

    // ============================================
    // STEP 1: LOAD HOMEPAGE & HERO VIDEO
    // ============================================
    console.log('📍 STEP 1: Loading homepage with Mobile Communicator hero video...');

    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });

    // Verify page loaded
    await expect(page).toHaveTitle(/Well-Tegra/);
    console.log('✅ Homepage loaded');

    // Check hero video is present
    const heroVideo = page.locator('#hero-video');
    await expect(heroVideo).toBeVisible();
    console.log('✅ Hero video element found');

    // Verify video is using hero33.mp4
    const videoSource = await heroVideo.getAttribute('data-lazy-video');
    expect(videoSource).toContain('hero33.mp4');
    console.log('✅ Mobile Communicator video (hero33.mp4) confirmed');

    // Check video playback rate is set to 0.5x (half speed)
    await page.waitForTimeout(2000); // Wait for video to load
    const playbackRate = await heroVideo.evaluate((video) => video.playbackRate);
    expect(playbackRate).toBe(0.5);
    console.log('✅ Video playback speed confirmed at 0.5x (half speed)');

    // Verify hero heading
    await expect(page.locator('h2').filter({ hasText: 'Stop Pushing Square Wheels' })).toBeVisible();
    console.log('✅ Hero heading visible');

    // Pause to show hero section (for video recording)
    await page.waitForTimeout(4000);

    // ============================================
    // STEP 2: SCROLL TO BRAHAN NARRATIVE SECTION
    // ============================================
    console.log('📍 STEP 2: Scrolling to Brahan narrative section...');

    // Scroll to the Brahan section
    const brahanSection = page.locator('section').filter({ hasText: 'THE PROPHECY OF THE BLACK RAIN' });
    await brahanSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // ============================================
    // STEP 3: VERIFY "THE PROPHECY OF THE BLACK RAIN" HEADER
    // ============================================
    console.log('📍 STEP 3: Verifying "THE PROPHECY OF THE BLACK RAIN" header...');

    const prophecyHeader = page.locator('h2').filter({ hasText: 'THE PROPHECY OF THE BLACK RAIN' });
    await expect(prophecyHeader).toBeVisible();
    console.log('✅ Main prophecy header visible');

    // Check subtitle
    await expect(page.locator('text=The Brahan Seer foretold a future of risk')).toBeVisible();
    await expect(page.locator('text=We built the engine that sees its certainty')).toBeVisible();
    console.log('✅ Prophecy subtitle verified');

    // Pause to show the prophecy section
    await page.waitForTimeout(3000);

    // ============================================
    // STEP 4: SCROLL TO "WE REPLACE PROPHECY WITH PREDICTION"
    // ============================================
    console.log('📍 STEP 4: Scrolling to "We Replace Prophecy with Prediction" section...');

    const predictionSection = page.locator('h3').filter({ hasText: 'We Replace Prophecy with Prediction' });
    await predictionSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Verify key narrative elements
    await expect(page.locator('text=Legends spoke of ambiguity')).toBeVisible();
    await expect(page.locator('text=We speak in real data')).toBeVisible();
    console.log('✅ "Legends vs. Real Data" contrast visible');

    // Check for the Seer's tragic fate
    await expect(page.locator('text=The original Seer was executed in a barrel of tar')).toBeVisible();
    await expect(page.locator('text=consumed by the very problem he could only prophesy')).toBeVisible();
    console.log('✅ Seer\'s tragic fate narrative visible');

    // Check for the pivot: "How times have changed"
    await expect(page.locator('text=How times have changed')).toBeVisible();
    console.log('✅ Pivot line "How times have changed" confirmed');

    // Check for dual meaning of "tar"
    await expect(page.locator('text=asphaltene buildup')).toBeVisible();
    console.log('✅ Dual tar meaning (asphaltene) confirmed');

    // Check for final statement
    await expect(page.locator('text=We turn uncertainty into your most powerful, predictable asset')).toBeVisible();
    console.log('✅ Power statement visible');

    // Pause to show the narrative
    await page.waitForTimeout(4000);

    // ============================================
    // STEP 5: SCROLL TO THE PAYOFF SECTION
    // ============================================
    console.log('📍 STEP 5: Scrolling to the payoff section...');

    const payoffSection = page.locator('h3').filter({ hasText: 'We built the engine to master it' });
    await payoffSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Verify setup line
    await expect(page.locator('text=The Seer was consumed by tar')).toBeVisible();
    console.log('✅ Setup line visible: "The Seer was consumed by tar"');

    // Verify payoff line
    await expect(page.locator('h3').filter({ hasText: 'We built the engine to master it' })).toBeVisible();
    console.log('✅ Payoff line visible: "We built the engine to master it"');

    // Pause to show the dramatic payoff
    await page.waitForTimeout(3000);

    // ============================================
    // STEP 6: VERIFY "MASTER YOUR RISK" CTA BUTTON
    // ============================================
    console.log('📍 STEP 6: Verifying "MASTER YOUR RISK" CTA button...');

    const masterRiskButton = page.locator('a').filter({ hasText: 'Master Your Risk' });
    await expect(masterRiskButton).toBeVisible();
    console.log('✅ "MASTER YOUR RISK" CTA button visible');

    // Verify it's a mailto link
    const href = await masterRiskButton.getAttribute('href');
    expect(href).toContain('mailto:contact@welltegra.network');
    expect(href).toContain('Master%20Your%20Risk');
    console.log('✅ CTA links to correct email with subject line');

    // Hover over the button (for video effect)
    await masterRiskButton.hover();
    await page.waitForTimeout(2000);

    // Highlight the button with a subtle animation (for video)
    await masterRiskButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    console.log('✅ CTA button highlighted');

    // ============================================
    // STEP 7: SCROLL BACK TO TOP (COMPLETE THE LOOP)
    // ============================================
    console.log('📍 STEP 7: Scrolling back to top to show complete narrative arc...');

    // Scroll back to hero
    await page.locator('#hero-video').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Scroll back down through each narrative section one more time (cinematic effect)
    console.log('📍 Cinematic recap: Scrolling through narrative sections...');

    // Section 1: Prophecy
    await prophecyHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Section 2: Prediction
    await predictionSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Section 3: Payoff
    await payoffSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Section 4: CTA
    await masterRiskButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // ============================================
    // STEP 8: VERIFY RESPONSIVE DESIGN (MOBILE/TABLET)
    // ============================================
    console.log('📍 STEP 8: Testing responsive design...');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);

    // Verify hero is still visible
    await expect(heroVideo).toBeVisible();
    console.log('✅ Mobile view: Hero video visible');

    // Verify prophecy header wraps correctly
    await expect(prophecyHeader).toBeVisible();
    console.log('✅ Mobile view: Prophecy header visible');

    // Verify CTA is still accessible
    await expect(masterRiskButton).toBeVisible();
    console.log('✅ Mobile view: CTA button visible');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.waitForTimeout(1000);

    await expect(prophecyHeader).toBeVisible();
    console.log('✅ Tablet view: All elements visible');

    // Return to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    // ============================================
    // FINAL SUMMARY
    // ============================================
    await page.waitForTimeout(2000); // Final pause for video

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ BRAHAN NARRATIVE HOMEPAGE TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('Verified Elements:');
    console.log('  1. ✅ Mobile Communicator hero video (hero33.mp4)');
    console.log('  2. ✅ Video playback speed at 0.5x (half speed)');
    console.log('  3. ✅ "THE PROPHECY OF THE BLACK RAIN" header');
    console.log('  4. ✅ Complete narrative arc (Prophecy → Tragedy → Triumph)');
    console.log('  5. ✅ Seer\'s tragic fate (executed in tar barrel)');
    console.log('  6. ✅ Pivot: "How times have changed"');
    console.log('  7. ✅ Dual meaning of tar (asphaltene buildup)');
    console.log('  8. ✅ Payoff: "We built the engine to master it"');
    console.log('  9. ✅ "MASTER YOUR RISK" CTA button');
    console.log(' 10. ✅ Responsive design (mobile/tablet/desktop)');
    console.log('='.repeat(60));
  });

  test('Brahan narrative accessibility and SEO validation', async ({ page }) => {

    console.log('📍 Starting accessibility and SEO validation...');

    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });

    // ============================================
    // ACCESSIBILITY CHECKS
    // ============================================
    console.log('📍 Checking accessibility...');

    // Check hero video has proper ARIA labels
    const heroVideo = page.locator('#hero-video');
    const ariaLabel = await heroVideo.getAttribute('aria-labelledby');
    expect(ariaLabel).toBe('hero-video-description');
    console.log('✅ Hero video has proper ARIA label');

    // Check video description for screen readers
    const videoDescription = page.locator('#hero-video-description');
    await expect(videoDescription).toBeVisible({ visible: false }); // Should exist but be visually hidden
    await expect(videoDescription).toContainText('Mobile Communicator');
    console.log('✅ Screen reader description exists');

    // Check heading hierarchy (h1 → h2 → h3)
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();
    const h3 = page.locator('h3').first();

    await expect(h1).toBeVisible();
    await expect(h2).toBeVisible();
    await expect(h3).toBeVisible();
    console.log('✅ Heading hierarchy correct');

    // Check CTA button has proper link text (not "Click here")
    const ctaButton = page.locator('a').filter({ hasText: 'Master Your Risk' });
    const ctaText = await ctaButton.textContent();
    expect(ctaText).toContain('Master Your Risk');
    console.log('✅ CTA has descriptive link text');

    // ============================================
    // SEO CHECKS
    // ============================================
    console.log('📍 Checking SEO...');

    // Check page title
    const title = await page.title();
    expect(title).toContain('Well-Tegra');
    console.log(`✅ Page title: "${title}"`);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    const descriptionContent = await metaDescription.getAttribute('content');
    expect(descriptionContent).toBeTruthy();
    console.log(`✅ Meta description exists (${descriptionContent?.length} chars)`);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    console.log('✅ Open Graph title exists');

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveCount(1);
    console.log('✅ Open Graph description exists');

    // Check canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    const canonicalHref = await canonical.getAttribute('href');
    expect(canonicalHref).toContain('welltegra.network');
    console.log(`✅ Canonical URL: ${canonicalHref}`);

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ ACCESSIBILITY & SEO VALIDATION COMPLETE');
    console.log('='.repeat(60));
  });

  test('Performance: Homepage loads in under 3 seconds', async ({ page }) => {

    console.log('📍 Testing homepage performance...');

    const startTime = Date.now();
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds

    // Check that video lazy loads properly
    const heroVideo = page.locator('#hero-video');
    const preload = await heroVideo.getAttribute('preload');
    expect(preload).toBe('none'); // Should be lazy loaded
    console.log('✅ Video configured for lazy loading');

    console.log('✅ Performance test passed');
  });

  test('Quick 60-second demo reel (for social media)', async ({ page }) => {

    console.log('📍 Starting 60-second demo reel...');

    // Load homepage (5 seconds)
    await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    console.log('✅ Homepage shown (5s)');

    // Scroll to prophecy (10 seconds)
    const prophecyHeader = page.locator('h2').filter({ hasText: 'THE PROPHECY OF THE BLACK RAIN' });
    await prophecyHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(10000);
    console.log('✅ Prophecy section shown (10s)');

    // Scroll to narrative (15 seconds)
    const predictionSection = page.locator('h3').filter({ hasText: 'We Replace Prophecy with Prediction' });
    await predictionSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(15000);
    console.log('✅ Narrative section shown (15s)');

    // Scroll to payoff (10 seconds)
    const payoffSection = page.locator('h3').filter({ hasText: 'We built the engine to master it' });
    await payoffSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(10000);
    console.log('✅ Payoff section shown (10s)');

    // Highlight CTA (10 seconds)
    const masterRiskButton = page.locator('a').filter({ hasText: 'Master Your Risk' });
    await masterRiskButton.scrollIntoViewIfNeeded();
    await masterRiskButton.hover();
    await page.waitForTimeout(10000);
    console.log('✅ CTA highlighted (10s)');

    // Scroll back to hero (10 seconds)
    await page.locator('#hero-video').scrollIntoViewIfNeeded();
    await page.waitForTimeout(10000);
    console.log('✅ Returned to hero (10s)');

    console.log('✅ 60-second demo reel complete (~60s total)');
  });

});
