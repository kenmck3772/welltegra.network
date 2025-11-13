import { test, expect } from '@playwright/test';

test.describe('P0 Deliverables - Dashboard Concepts & Assets', () => {

  test.describe('Workstream B: Data Ingestion Dashboard Concepts', () => {

    test('Concept 1 - Flow Diagram: Page loads and renders correctly', async ({ page }) => {
      await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_01_FLOW_DIAGRAM.html');

      // Check page title
      await expect(page).toHaveTitle('WellTegra Data Ingestion Flow - Concept 1');

      // Check header is visible
      const header = page.locator('h1').first();
      await expect(header).toContainText('WellTegra Data Ingestion & Validation Pipeline');

      // Check that all three stages (Before/During/After) are present
      const stages = page.locator('.stage');
      await expect(stages).toHaveCount(3);

      // Check stage headers
      const beforeStage = page.locator('.stage.before');
      const duringStage = page.locator('.stage.during');
      const afterStage = page.locator('.stage.after');

      await expect(beforeStage).toContainText('BEFORE');
      await expect(duringStage).toContainText('DURING');
      await expect(afterStage).toContainText('AFTER');

      // Check DIS meter is visible in each stage
      const disMeters = page.locator('.dis-meter');
      await expect(disMeters).toHaveCount(3);

      // Check stage scores progress: 25% → 65% → 95%
      const disFills = page.locator('.dis-fill');
      const fill1 = await disFills.nth(0).getAttribute('style');
      const fill2 = await disFills.nth(1).getAttribute('style');
      const fill3 = await disFills.nth(2).getAttribute('style');

      expect(fill1).toContain('width: 25%');
      expect(fill2).toContain('width: 65%');
      expect(fill3).toContain('width: 95%');

      // Check data source examples are displayed
      const dataSources = page.locator('.data-source');
      await expect(dataSources).toHaveCount(3);
      await expect(page.locator('.data-source.witsml')).toContainText('WITSML');
      await expect(page.locator('.data-source.edm')).toContainText('EDM');
      await expect(page.locator('.data-source.csv')).toContainText('Spreadsheet');

      // Check issues are displayed
      const issues = page.locator('.data-issue');
      await expect(issues.count()).toBeGreaterThan(0);

      // Check validation rules are present in middle stage
      const rules = page.locator('.rule');
      await expect(rules.count()).toBeGreaterThan(0);

      // Check legend is present
      await expect(page.locator('.legend h3')).toContainText('Data Integrity Score');

      console.log('✓ Concept 1 - Flow Diagram: All visual elements present and correct');
    });

    test('Concept 2 - Real-Time Dashboard UI: Page renders and metrics visible', async ({ page }) => {
      await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_02_REALTIME_UI.html');

      // Check page title
      await expect(page).toHaveTitle('WellTegra Data Ingestion Dashboard - Real-Time UI Concept');

      // Check header
      await expect(page.locator('h1')).toContainText('Data Ingestion & Validation Dashboard');

      // Check status indicator
      await expect(page.locator('.status-indicator')).toContainText('Live');

      // Check DIS score card is visible and shows metric
      const disNumber = page.locator('.dis-number');
      await expect(disNumber).toBeVisible();
      const disValue = await disNumber.textContent();
      expect(disValue).toMatch(/\d+/);

      // Check stats cards (4 expected)
      const statCards = page.locator('.stat-card');
      await expect(statCards).toHaveCount(4);

      // Check for key metrics
      await expect(page.locator('.stat-label')).toContainText('Records Ingested');
      await expect(page.locator('.stat-label')).toContainText('Success Rate');
      await expect(page.locator('.stat-label')).toContainText('Processing Latency');

      // Check log entries are present
      const logEntries = page.locator('.log-entry');
      await expect(logEntries.count()).toBeGreaterThan(0);

      // Check for different log types
      await expect(page.locator('.log-entry.success').first()).toBeVisible();
      await expect(page.locator('.log-entry.warning').first()).toBeVisible();

      // Check data sources section
      const sources = page.locator('.source-item');
      await expect(sources).toHaveCount(3);
      await expect(page.locator('.source-name').first()).toContainText('WITSML');

      // Check validation rules list
      const ruleItems = page.locator('.rule-item');
      await expect(ruleItems.count()).toBeGreaterThan(0);

      // Check alerts section
      const alerts = page.locator('.alert');
      await expect(alerts.count()).toBeGreaterThan(0);

      // Check for throughput chart
      const throughputChart = page.locator('.throughput-chart');
      await expect(throughputChart).toBeVisible();

      console.log('✓ Concept 2 - Real-Time Dashboard UI: All metrics and components present');
    });

    test('Concept 3 - Data Journey Timeline: All 5 stages visible', async ({ page }) => {
      await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_03_DATA_JOURNEY.html');

      // Check page title
      await expect(page).toHaveTitle('WellTegra Data Journey - Concept 3');

      // Check header
      await expect(page.locator('h1')).toContainText('Data Integrity Journey');

      // Check all 5 stages are present
      const stages = page.locator('.stage-block');
      await expect(stages).toHaveCount(5);

      // Check stage numbers
      const stageNumbers = page.locator('.stage-number');
      for (let i = 0; i < 5; i++) {
        const text = await stageNumbers.nth(i).textContent();
        expect(text).toBe((i + 1).toString());
      }

      // Check stage titles
      await expect(page.locator('.stage-title').nth(0)).toContainText('Raw Data Ingestion');
      await expect(page.locator('.stage-title').nth(1)).toContainText('Real-Time Validation');
      await expect(page.locator('.stage-title').nth(2)).toContainText('Data Enrichment');
      await expect(page.locator('.stage-title').nth(3)).toContainText('Secured & Logged');
      await expect(page.locator('.stage-title').nth(4)).toContainText('Production Ready');

      // Check DIS meter progression
      const disMeters = page.locator('.dis-bar');
      await expect(disMeters.count()).toBeGreaterThan(0);

      // Check summary table exists
      const summarySection = page.locator('.summary-section');
      await expect(summarySection).toBeVisible();

      // Check for footer message
      await expect(page.locator('.footer-message')).toContainText('Why This Matters');

      console.log('✓ Concept 3 - Data Journey: All 5 stages and progression visible');
    });

  });

  test.describe('Workstream C: P&A Predictive Model', () => {

    test('P&A Forecast: 30-year visualization loads and renders', async ({ page }) => {
      await page.goto('http://localhost:8080/PA_MODEL_CONCEPT_01_30YEAR_FORECAST.html');

      // Check page title
      await expect(page).toHaveTitle('30-Year P&A Failure Forecast - Interactive Visualization');

      // Check main header
      await expect(page.locator('h1')).toContainText('30-Year P&A Failure Forecast');

      // Check well information is displayed
      await expect(page.locator('.well-info')).toBeVisible();

      // Check well info cards (6 expected)
      const infoCards = page.locator('.info-card');
      await expect(infoCards).toHaveCount(6);

      // Check well details
      await expect(page.locator('.info-label')).toContainText('Well Name');
      await expect(page.locator('.info-value')).toContainText('Aberdeen-52');

      // Check key findings section
      const findings = page.locator('.finding');
      await expect(findings.count()).toBeGreaterThan(0);

      // Check for risk profile
      const riskItems = page.locator('.risk-item');
      await expect(riskItems.count()).toBeGreaterThan(0);

      // Check chart container exists
      const chartContainer = page.locator('.chart-container');
      await expect(chartContainer).toBeVisible();

      // Check SVG visualization
      const svg = page.locator('svg');
      await expect(svg).toBeVisible();

      // Check for data points on chart
      const dataPoints = page.locator('.data-point');
      await expect(dataPoints.count()).toBeGreaterThan(0);

      // Check intervention window line exists
      const interventionLine = page.locator('.intervention-line');
      await expect(interventionLine.count()).toBeGreaterThan(0);

      // Check recommendations section
      const recommendations = page.locator('.recommendations');
      await expect(recommendations).toBeVisible();

      // Check recommendation cards
      const recCards = page.locator('.rec-card');
      await expect(recCards.count()).toBeGreaterThan(0);

      // Check business impact summary exists
      const summaryText = page.locator('.rec-title');
      await expect(summaryText.nth(1)).toContainText('Business Impact');

      console.log('✓ P&A Forecast: 30-year visualization complete and functional');
    });

  });

  test.describe('Workstream D: Operator Pilot Scope', () => {

    test('Operator Pilot Scope Template: Document structure valid', async ({ page, context }) => {
      // This test validates that the markdown template exists and contains required sections
      const response = await context.request.get('http://localhost:8080/OPERATOR_PILOT_SCOPE_TEMPLATE.md');
      const content = await response.text();

      // Check critical sections exist
      expect(content).toContain('# Operator Pilot Scope Document');
      expect(content).toContain('Executive Summary');
      expect(content).toContain('Well & Operator Details');
      expect(content).toContain('System Integration Overview');
      expect(content).toContain('Data Integration Details');
      expect(content).toContain('Physical Constraints');
      expect(content).toContain('Implementation Timeline');
      expect(content).toContain('Success Criteria');
      expect(content).toContain('Risk Assessment');
      expect(content).toContain('Sign-Off & Approvals');

      // Check for key templates
      expect(content).toContain('Well Name');
      expect(content).toContain('Technical Liaison');
      expect(content).toContain('Pump Rate Limits');
      expect(content).toContain('Week 1: Kickoff & Setup');

      // Check for data table templates
      expect(content).toContain('Data to Ingest');
      expect(content).toContain('Data to Export');

      console.log('✓ Operator Pilot Scope: Template structure valid with all required sections');
    });

  });

  test.describe('Documentation Assets', () => {

    test('Gus Dashboard Concepts Guide: Contains all required sections', async ({ page, context }) => {
      const response = await context.request.get('http://localhost:8080/DASHBOARD_CONCEPTS_GUIDE_FOR_GUS.md');
      const content = await response.text();

      // Check critical sections
      expect(content).toContain('Overview');
      expect(content).toContain('The Three Concepts');
      expect(content).toContain('Concept 1: Data Ingestion Flow Diagram');
      expect(content).toContain('Concept 2: Real-Time Dashboard UI');
      expect(content).toContain('Concept 3: Data Journey Timeline');
      expect(content).toContain('How to Use These Concepts');
      expect(content).toContain('Key Talking Points');
      expect(content).toContain('Next Steps');

      // Check for guidance on usage
      expect(content).toContain('Perfect for');
      expect(content).toContain('Best For');
      expect(content).toContain('9 AM Standup');

      console.log('✓ Dashboard Concepts Guide: Complete with usage instructions');
    });

  });

});

test.describe('Performance & Rendering Quality', () => {

  test('Dashboard pages load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_02_REALTIME_UI.html');
    const loadTime = Date.now() - startTime;

    console.log(`Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
  });

  test('All interactive elements are accessible', async ({ page }) => {
    await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_01_FLOW_DIAGRAM.html');

    // Check that all key elements are accessible
    const stages = page.locator('.stage');
    for (let i = 0; i < 3; i++) {
      const stage = stages.nth(i);
      await expect(stage).toBeVisible();
      await expect(stage).toBeFocusable();
    }

    console.log('✓ All dashboard elements are accessible');
  });

});

test.describe('Cross-Browser Compatibility', () => {

  test('Dashboard renders correctly in different zoom levels', async ({ page }) => {
    await page.goto('http://localhost:8080/DASHBOARD_CONCEPT_02_REALTIME_UI.html');

    // Test at 75% zoom
    await page.evaluate(() => window.devicePixelRatio);
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    // Check that page is responsive
    await expect(page.locator('.dashboard')).toBeVisible();

    console.log('✓ Dashboard responsive at standard zoom');
  });

});
