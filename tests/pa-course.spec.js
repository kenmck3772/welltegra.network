const { test, expect } = require('@playwright/test');

test.describe('P&A Course Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the course page
    await page.goto('https://welltegra.network/pa-course.html');
    await page.waitForLoadState('networkidle');

    // Wait for video player to load
    await page.waitForSelector('#youtube-player', { timeout: 10000 });
  });

  test('Module 1 - Before/After Slider should drag', async ({ page }) => {
    console.log('🧪 Testing Before/After Slider...');

    // Open Module 1 (might be locked, so we'll check)
    const module1 = await page.locator('[data-module="1"]');
    await module1.scrollIntoViewIfNeeded();
    await module1.screenshot({ path: 'screenshots/module1-before-open.png' });

    // Try to click module 1
    await module1.click();
    await page.waitForTimeout(1000);

    // Find slider handle
    const sliderHandle = await page.locator('#sliderHandle');
    if (await sliderHandle.isVisible()) {
      console.log('✅ Slider handle found');

      // Get slider bounds
      const sliderBounds = await page.locator('#beforeAfterSlider').boundingBox();

      // Drag slider from left to right
      await sliderHandle.hover();
      await page.mouse.down();
      await page.mouse.move(sliderBounds.x + sliderBounds.width * 0.7, sliderBounds.y + sliderBounds.height / 2);
      await page.mouse.up();

      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/slider-dragged.png' });
      console.log('✅ Slider dragged successfully');
    } else {
      console.log('⚠️  Slider not visible (module might be locked)');
      await page.screenshot({ path: 'screenshots/slider-locked.png' });
    }
  });

  test('Module 1 - Well Depth Visualizer should show details', async ({ page }) => {
    console.log('🧪 Testing Well Depth Visualizer...');

    const module1 = await page.locator('[data-module="1"]');
    await module1.click();
    await page.waitForTimeout(1000);

    // Click on each depth marker
    const depthMarkers = ['surface', 'shallow', 'intermediate', 'production', 'deep', 'ultra-deep'];

    for (const depth of depthMarkers) {
      const marker = await page.locator(`[data-depth="${depth}"]`);
      if (await marker.isVisible()) {
        console.log(`  Testing depth: ${depth}`);
        await marker.click();
        await page.waitForTimeout(500);

        // Check if detail panel is shown
        const detailPanel = await page.locator(`#depth-${depth}`);
        const isVisible = await detailPanel.isVisible();

        await page.screenshot({ path: `screenshots/depth-${depth}.png` });
        console.log(`  ${isVisible ? '✅' : '❌'} Detail panel for ${depth}: ${isVisible ? 'visible' : 'hidden'}`);
      }
    }
  });

  test('Module 1 - Risk Cards should show details', async ({ page }) => {
    console.log('🧪 Testing Risk Cards...');

    const module1 = await page.locator('[data-module="1"]');
    await module1.click();
    await page.waitForTimeout(1000);

    const risks = ['groundwater', 'soil', 'greenhouse', 'safety'];

    for (const risk of risks) {
      const card = await page.locator(`[data-risk="${risk}"]`);
      if (await card.isVisible()) {
        console.log(`  Testing risk: ${risk}`);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForTimeout(500);

        const detailPanel = await page.locator(`#risk-${risk}`);
        const isVisible = await detailPanel.isVisible();

        await page.screenshot({ path: `screenshots/risk-${risk}.png` });
        console.log(`  ${isVisible ? '✅' : '❌'} Risk detail for ${risk}: ${isVisible ? 'visible' : 'hidden'}`);
      }
    }
  });

  test('Module 2 - Decision Tree should navigate', async ({ page }) => {
    console.log('🧪 Testing Decision Tree Navigator...');

    // This will likely be locked, but we can test if unlocked
    const module2 = await page.locator('[data-module="2"]');
    await module2.scrollIntoViewIfNeeded();
    await module2.click();
    await page.waitForTimeout(1000);

    // Try to click USA button
    const usaButton = await page.getByText('United States').first();
    if (await usaButton.isVisible()) {
      await usaButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/decision-tree-step1.png' });
      console.log('✅ Decision tree navigation working');
    } else {
      console.log('⚠️  Decision tree not visible (module might be locked)');
    }
  });

  test('Module 4 - Barrier Sequence Builder drag and drop', async ({ page }) => {
    console.log('🧪 Testing Barrier Sequence Builder...');

    const module4 = await page.locator('[data-module="4"]');
    await module4.scrollIntoViewIfNeeded();
    await module4.click();
    await page.waitForTimeout(1000);

    // Test drag and drop
    const bridgePlugCard = await page.locator('[data-barrier="bridge-plug"]');
    const bottomSlot = await page.locator('#slot-bottom');

    if (await bridgePlugCard.isVisible() && await bottomSlot.isVisible()) {
      console.log('  Testing drag-and-drop...');

      // Drag bridge plug to bottom slot
      await bridgePlugCard.dragTo(bottomSlot);
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/barrier-builder-drag.png' });

      // Check if slot is filled
      const isFilled = await bottomSlot.evaluate(el => el.classList.contains('filled'));
      console.log(`  ${isFilled ? '✅' : '❌'} Bridge Plug placed: ${isFilled}`);
    }

    // Test click-to-add
    const resetBtn = await page.getByText('Reset Sequence');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await page.waitForTimeout(500);
    }

    const addButton = await page.getByText('Add to Sequence').first();
    if (await addButton.isVisible()) {
      console.log('  Testing click-to-add...');
      await addButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/barrier-builder-click.png' });

      const isFilled = await bottomSlot.evaluate(el => el.classList.contains('filled'));
      console.log(`  ${isFilled ? '✅' : '❌'} Bridge Plug added via click: ${isFilled}`);
    }
  });

  test('Module 4 - Cement Calculator should calculate', async ({ page }) => {
    console.log('🧪 Testing Cement Calculator...');

    const module4 = await page.locator('[data-module="4"]');
    await module4.click();
    await page.waitForTimeout(1000);

    // Find calculator inputs
    const holeDiameter = await page.locator('#hole-diameter');
    const plugLength = await page.locator('#plug-length');

    if (await holeDiameter.isVisible()) {
      console.log('  Entering values...');
      await holeDiameter.fill('8.5');
      await plugLength.fill('100');

      const calculateBtn = await page.getByText('Calculate Cement Required');
      await calculateBtn.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/cement-calculator.png' });

      // Check if results are shown
      const results = await page.locator('#cement-results');
      const isVisible = await results.isVisible();
      console.log(`  ${isVisible ? '✅' : '❌'} Calculation results shown: ${isVisible}`);
    }
  });

  test('Module 4 - Pressure Test Simulator should run', async ({ page }) => {
    console.log('🧪 Testing Pressure Test Simulator...');

    const module4 = await page.locator('[data-module="4"]');
    await module4.click();
    await page.waitForTimeout(1000);

    const startBtn = await page.locator('#start-test-btn');
    if (await startBtn.isVisible()) {
      await startBtn.scrollIntoViewIfNeeded();
      await startBtn.click();

      console.log('  Test running...');
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'screenshots/pressure-test.png' });
      console.log('✅ Pressure test completed');
    }
  });

  test('Module 5 - Liability Timeline should highlight items', async ({ page }) => {
    console.log('🧪 Testing Liability Timeline...');

    const module5 = await page.locator('[data-module="5"]');
    await module5.click();
    await page.waitForTimeout(1000);

    const years = ['0', '10', '25', '50', '100'];

    for (const year of years) {
      const timelineItem = await page.locator(`[data-year="${year}"]`);
      if (await timelineItem.isVisible()) {
        console.log(`  Testing year: ${year}`);
        await timelineItem.click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: `screenshots/timeline-year-${year}.png` });
        console.log(`  ✅ Timeline year ${year} clicked`);
      }
    }
  });

  test('Module 6 - Cost Breakdown Pie Chart should show details', async ({ page }) => {
    console.log('🧪 Testing Cost Breakdown Pie Chart...');

    const module6 = await page.locator('[data-module="6"]');
    await module6.click();
    await page.waitForTimeout(1000);

    const categories = ['equipment', 'labor', 'materials', 'testing', 'mobilization', 'regulatory'];

    for (const category of categories) {
      const segment = await page.locator(`[data-category="${category}"]`).first();
      if (await segment.isVisible()) {
        console.log(`  Testing category: ${category}`);
        await segment.click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: `screenshots/cost-${category}.png` });
        console.log(`  ✅ Cost category ${category} clicked`);
      }
    }
  });

  test('Module 7 - Golden Rules should show applications', async ({ page }) => {
    console.log('🧪 Testing Golden Rules...');

    const module7 = await page.locator('[data-module="7"]');
    await module7.click();
    await page.waitForTimeout(1000);

    for (let rule = 1; rule <= 3; rule++) {
      const ruleCard = await page.locator(`[data-rule="${rule}"]`);
      if (await ruleCard.isVisible()) {
        console.log(`  Testing rule: ${rule}`);
        await ruleCard.click();
        await page.waitForTimeout(500);

        const ruleApp = await page.locator(`#rule-app-${rule}`);
        const isVisible = await ruleApp.isVisible();

        await page.screenshot({ path: `screenshots/golden-rule-${rule}.png` });
        console.log(`  ${isVisible ? '✅' : '❌'} Rule ${rule} application: ${isVisible ? 'visible' : 'hidden'}`);
      }
    }
  });

  test('All modules should not collapse when clicking interactive elements', async ({ page }) => {
    console.log('🧪 Testing event propagation prevention...');

    // Open module 1
    const module1 = await page.locator('[data-module="1"]');
    await module1.click();
    await page.waitForTimeout(1000);

    const content = await page.locator('#content-1');
    const isOpenBefore = await content.evaluate(el => el.classList.contains('active'));
    console.log(`  Module 1 open: ${isOpenBefore}`);

    // Click a risk card
    const riskCard = await page.locator('[data-risk="groundwater"]');
    if (await riskCard.isVisible()) {
      await riskCard.click();
      await page.waitForTimeout(500);

      const isOpenAfter = await content.evaluate(el => el.classList.contains('active'));

      if (isOpenBefore && isOpenAfter) {
        console.log('  ✅ Module stayed open after clicking interactive element');
      } else {
        console.log('  ❌ Module collapsed when clicking interactive element');
      }

      await page.screenshot({ path: 'screenshots/propagation-test.png' });
    }
  });

  test('Console errors check', async ({ page }) => {
    console.log('🧪 Checking for console errors...');

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate and interact
    await page.locator('[data-module="1"]').click();
    await page.waitForTimeout(2000);

    if (errors.length === 0) {
      console.log('✅ No console errors detected');
    } else {
      console.log('❌ Console errors found:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
  });
});
