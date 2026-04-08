// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
});

test('index: locked Polarity nav shows prerequisite modal', async ({ page }) => {
  await page.goto('/index.html');
  const link = page.locator('header.site-header nav a[href*="temperament"]').first();
  await expect(link).toHaveAttribute('data-suite-locked', 'true');
  await link.click({ force: true });
  await expect(page.locator('.confirm-modal-backdrop')).toBeVisible();
  await expect(page.locator('.confirm-modal-box p')).toContainText('Archetype');
  await page.locator('.confirm-modal-btn-primary').click();
  await expect(page.locator('.confirm-modal-backdrop')).toBeHidden();
});

test('temperament: start assessment blocked until archetype complete', async ({ page }) => {
  await page.goto('/temperament.html');
  await expect(page.locator('#suiteStageGate')).toBeVisible();
  await page.locator('#startAssessment').click();
  await expect(page.locator('.confirm-modal-box p')).toContainText('Archetype');
});

test('attraction: start assessment blocked until prerequisites complete', async ({ page }) => {
  await page.goto('/attraction.html');
  await expect(page.locator('#suiteStageGate')).toBeVisible();
  await page.locator('#startAssessment').click();
  await expect(page.locator('.confirm-modal-box p')).toContainText('Archetype');
});
