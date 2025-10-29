const { test, expect } = require('@playwright/test');
const { setupPlannerTest } = require('./support/planner-fixture');

const {
  skipIfChromiumUnavailable,
  gotoPlannerHome,
  openPlannerWorkspace,
  waitForPlannerWorkspace,
  captureConsoleErrors
} = setupPlannerTest(test);

test('hero planner CTA opens the planner workspace without console errors', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);

  const pageErrors = captureConsoleErrors(page);

  await gotoPlannerHome(page);

  const heroCTA = page.locator('#hero-planner-btn');
  await expect(heroCTA).toBeVisible();

  await heroCTA.click();
  await waitForPlannerWorkspace(page);

  const plannerView = page.locator('#planner-view');
  await expect(plannerView).toBeVisible();
  await expect(page.locator('#home-view')).toBeHidden();
  await expect(page.locator('.well-card-enhanced')).toHaveCount(7);

  expect(pageErrors, `Unexpected console errors: ${pageErrors.map((err) => err.message).join('\n')}`).toEqual([]);
});

test('selecting a planner well unlocks step two and opens the history modal', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await openPlannerWorkspace(page);

  const plannerCards = page.locator('.planner-card');
  await expect(plannerCards).toHaveCount(7);

  const targetCard = page.locator('.planner-card[data-well-id="W666"]');
  await targetCard.click();

  await expect(page.locator('#step-1-continue')).toBeVisible();
  await expect(page.locator('#step-2')).toBeVisible();
  await expect(page.locator('#data-scrubbing-panel')).toBeVisible();
  await expect(page.locator('#step-2-indicator')).toHaveClass(/active/);

  const iconLocator = targetCard.locator('span[role="img"][aria-label="Critical intervention required"]');
  await expect(iconLocator).toBeVisible();

  await targetCard.locator('.view-details-btn').click();
  const modal = page.locator('#well-history-modal');
  await expect(modal).toBeVisible();
  await expect(page.locator('#modal-content span[aria-label="Lesson learned"]').first()).toBeVisible();

  await page.locator('#close-modal-btn').click();
  await expect(modal).toBeHidden();
});

test('planner portfolio filters and search narrow the visible wells', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await openPlannerWorkspace(page);

  const wellCards = page.locator('.planner-card');
  await expect(wellCards).toHaveCount(7);

  const summary = page.locator('#well-filter-summary');
  await expect(summary).toContainText('Showing 7 of 7 wells');

  const searchInput = page.locator('#well-search-input');
  await searchInput.fill('W666');
  await expect(summary).toContainText('Showing 1 of 7 wells');
  await expect(page.locator('.planner-card:visible')).toHaveCount(1);
  await expect(page.locator('.planner-card[data-well-id="W666"]')).toBeVisible();

  await searchInput.fill('');
  await expect(wellCards).toHaveCount(7);

  const flowChip = page.locator('[data-theme-filter="flow-assurance"]');
  await flowChip.click();
  await expect(flowChip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.planner-card')).toHaveCount(5);
  await expect(summary).toContainText('Showing 5 of 7 wells');

  const caseChip = page.locator('[data-focus-filter="case"]');
  await caseChip.click();
  await expect(caseChip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-focus-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.planner-card')).toHaveCount(4);
  await expect(summary).toContainText('Filters active');

  await flowChip.click();
  await expect(flowChip).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.planner-card')).toHaveCount(6);

  const allChip = page.locator('[data-focus-filter="all"]');
  await allChip.click();
  await expect(allChip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.planner-card')).toHaveCount(7);
});

test('readiness summary surfaces sustainability metrics for generated plan', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  const errors = captureConsoleErrors(page);
  await openPlannerWorkspace(page);

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
  expect(errors, `Unexpected console errors: ${errors.map((err) => err.message).join('\n')}`).toEqual([]);
});

test('handover package lists deliverables and sign-offs once execution is unlocked', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await openPlannerWorkspace(page);

  const targetCard = page.locator('.planner-card[data-well-id="W666"]');
  await targetCard.click();

  const stepOneContinue = page.locator('#step-1-continue');
  await expect(stepOneContinue).toBeEnabled();
  await stepOneContinue.click();

  await page.locator('[data-objective-id="obj1"] label').click();

  const stepTwoContinue = page.locator('#step-2-continue');
  await expect(stepTwoContinue).toBeEnabled();
  await stepTwoContinue.click();

  const generateProgram = page.locator('#generate-program-btn');
  await expect(generateProgram).toBeEnabled();
  await generateProgram.click();

  const stepFourContinue = page.locator('#step-4-continue');
  await expect(stepFourContinue).toBeEnabled();
  await stepFourContinue.click();

  const stepFiveContinue = page.locator('#step-5-continue');
  await expect(stepFiveContinue).toBeEnabled();
  await stepFiveContinue.click();

  await expect(page.locator('#step-6')).toBeVisible();

  const handoverBinder = page.locator('#handover-output');
  await expect(handoverBinder).toBeVisible();
  await expect(handoverBinder).toContainText('Digital Handover Binder');
  await expect(handoverBinder).toContainText('As-built expandable patch schematic');
  await expect(handoverBinder).toContainText('Barrier restoration certificate');
  await expect(handoverBinder.locator('.status-inprogress').first()).toBeVisible();
  await expect(handoverBinder.locator('.status-atrisk').first()).toBeVisible();

  const launchButton = page.locator('#begin-op-btn');
  await expect(launchButton).toBeEnabled();
});
