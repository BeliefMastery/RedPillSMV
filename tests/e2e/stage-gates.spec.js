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

test('index: locked Polarity nav remains navigable', async ({ page }) => {
  await page.goto('/index.html');
  const link = page.locator('header.site-header nav a[href*="temperament"]').first();
  await expect(link).toHaveAttribute('data-suite-locked', 'true');
  await link.click({ force: true });
  await expect(page).toHaveURL(/temperament(?:\.html)?$/);
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('.action-buttons.suite-action-locked')).toBeVisible();
});

test('temperament: start assessment blocked until archetype complete', async ({ page }) => {
  await page.goto('/temperament.html');
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('.action-buttons.suite-action-locked')).toBeVisible();
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText('Archetype');
});

test('attraction: start assessment blocked until prerequisites complete', async ({ page }) => {
  await page.goto('/attraction.html');
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('.action-buttons.suite-action-locked')).toBeVisible();
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText('Archetype');
});

test('attraction: when archetype done, gate points to Polarity first', async ({ page }) => {
  await page.addInitScript(() => {
    const archProgress = {
      data: { gender: 'male', analysisData: { primaryArchetype: { id: 'alpha_male' } } }
    };
    localStorage.setItem('archetype-assessment:progress', JSON.stringify(archProgress));
  });
  await page.goto('/attraction.html');
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('#suiteStageGateInlineMessage')).toContainText(/Polarity/i);
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText(/Polarity/i);
});

test('temperament: cached completed report is hidden after archetype reset', async ({ page }) => {
  await page.addInitScript(() => {
    const tempProgress = {
      data: {
        currentPhase: 2,
        currentQuestionIndex: 0,
        analysisData: {
          gender: 'man',
          overallTemperament: { normalizedScore: 0.61, category: 'predominantly_masculine' }
        }
      }
    };
    localStorage.setItem('temperament-assessment:progress', JSON.stringify(tempProgress));
    // Archetype intentionally absent to simulate upstream reset.
  });
  await page.goto('/temperament.html');
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('#resultsSection')).not.toBeVisible();
});

test('attraction: cached completed report is hidden after polarity reset', async ({ page }) => {
  await page.addInitScript(() => {
    const archProgress = {
      data: { gender: 'male', analysisData: { primaryArchetype: { id: 'alpha_male' } } }
    };
    localStorage.setItem('archetype-assessment:progress', JSON.stringify(archProgress));

    const attResults = {
      currentGender: 'male',
      smv: { overall: 62, clusters: { coalitionRank: 60, reproductiveConfidence: 64, axisOfAttraction: 62 } }
    };
    localStorage.setItem('attraction-assessment-results', JSON.stringify(attResults));
    // Polarity intentionally absent to simulate reset.
  });
  await page.goto('/attraction.html');
  await expect(page.locator('#suiteStageGateInline')).toBeVisible();
  await expect(page.locator('#resultsSection')).not.toBeVisible();
});
