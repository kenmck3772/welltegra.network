const { test, expect } = require('@playwright/test');
const { setupPlannerTest } = require('./support/planner-fixture');

const { skipIfChromiumUnavailable, openPlannerWorkspace } = setupPlannerTest(test);

test('engineering blueprint loads for selected objective and resets between wells', async ({ page }, testInfo) => {
  skipIfChromiumUnavailable(testInfo);
  await openPlannerWorkspace(page);

  const w666Card = page.locator('.planner-card[data-well-id="W666"]');
  await expect(w666Card).toBeVisible();
  await w666Card.click();

  const blueprintPanel = page.locator('#design-blueprint');
  await expect(blueprintPanel).toContainText('Select an objective or AI recommendation');

  await page.locator('[data-objective-id="obj1"] label').click();
  await expect(blueprintPanel).toContainText('Expandable Patch Engineering Blueprint');
  await expect(blueprintPanel).toContainText('Restore 9 5/8" casing integrity at 9,200 ft');

  await page.reload();
  await openPlannerWorkspace(page);

  const otherCard = page.locator('.planner-card[data-well-id="M-21"]');
  await otherCard.click();
  await expect(blueprintPanel).toContainText('Select an objective or AI recommendation');
});
