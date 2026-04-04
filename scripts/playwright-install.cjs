/**
 * Install Playwright Chromium into repo-local .pw-browsers (stable path for CI and sandboxed dev).
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.pw-browsers');

execSync('npx playwright install chromium', {
  stdio: 'inherit',
  env: process.env,
  cwd: root
});
