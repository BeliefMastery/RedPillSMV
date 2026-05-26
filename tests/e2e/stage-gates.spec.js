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

test('home: locked Polarity nav shows lock hint', async ({ page }) => {
  await page.goto('/#/');
  const locked = page.getByTitle(/Archetype/i).first();
  await expect(locked).toBeVisible();
});

test('polarity: start assessment blocked until archetype complete', async ({ page }) => {
  await page.goto('/#/engines/polarity');
  await expect(page.locator('#startAssessment')).toBeVisible({ timeout: 15000 });
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText(/Archetype/i);
});

test('attraction: start assessment blocked until prerequisites complete', async ({ page }) => {
  await page.goto('/#/engines/attraction');
  await expect(page.locator('#startAssessment')).toBeVisible({ timeout: 15000 });
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText(/Archetype/i);
});

test('attraction: when archetype done, gate points to Polarity first', async ({ page }) => {
  await page.addInitScript(() => {
    const archProgress = {
      data: { gender: 'male', analysisData: { primaryArchetype: { id: 'alpha_male' } } }
    };
    localStorage.setItem('archetype-assessment:progress', JSON.stringify(archProgress));
  });
  await page.goto('/#/engines/attraction');
  await expect(page.locator('#startAssessment')).toBeVisible({ timeout: 15000 });
  await page.locator('#startAssessment').click({ force: true });
  await expect(page.locator('.confirm-modal-box p')).toContainText(/Polarity/i);
});

test('polarity: cached completed report is hidden after archetype reset', async ({ page }) => {
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
  });
  await page.goto('/#/engines/polarity');
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
  });
  await page.goto('/#/engines/attraction');
  await expect(page.locator('#resultsSection')).not.toBeVisible();
});
