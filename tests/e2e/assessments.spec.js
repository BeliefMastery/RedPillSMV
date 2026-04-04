// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @param {import('@playwright/test').Download} download
 * @returns {Promise<string>}
 */
async function readHtmlDownload(download) {
  const failure = await download.failure();
  if (failure) throw new Error(`Download failed: ${failure}`);
  let localPath = await download.path();
  if (!localPath) {
    localPath = path.join(os.tmpdir(), `e2e-${Date.now()}-${download.suggestedFilename()}`);
    await download.saveAs(localPath);
  }
  const html = fs.readFileSync(localPath, 'utf8');
  expect(html.length).toBeGreaterThan(500);
  expect(html.toLowerCase()).toContain('<html');
  return html;
}

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

const cases = [
  {
    name: 'attraction',
    path: '/attraction.html',
    resultsSelector: '#resultsSection',
    sampleTimeout: 60000,
    exportMustInclude: ['Your Sexual Market Value Profile', 'Achievable partner quality']
  },
  {
    name: 'temperament',
    path: '/temperament.html',
    resultsSelector: '#resultsSection',
    sampleTimeout: 90000,
    exportMustInclude: ['Your Temperament Analysis', 'Polarity Position']
  },
  {
    name: 'relationship',
    path: '/relationship.html',
    resultsSelector: '#resultsSection',
    sampleTimeout: 240000,
    exportMustInclude: ['Relationships Analysis', 'Strain Points']
  },
  {
    name: 'archetype',
    path: '/archetype.html',
    resultsSelector: '#resultsContainer',
    sampleTimeout: 120000,
    exportMustInclude: ['Your Archetype Profile', 'Primary archetype']
  }
];

for (const c of cases) {
  test(`${c.name}: sample report shows results and export downloads HTML`, async ({ page }) => {
    test.setTimeout(Math.max(c.sampleTimeout + 60000, 120000));

    await page.goto(c.path);
    await page.locator('#generateSampleReport').click();

    const results = page.locator(c.resultsSelector);
    await expect(results).toBeVisible({ timeout: c.sampleTimeout });

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#saveResults').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.html$/i);

    const html = await readHtmlDownload(download);
    for (const fragment of c.exportMustInclude) {
      expect(html).toContain(fragment);
    }
  });
}
