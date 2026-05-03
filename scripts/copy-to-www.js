/**
 * Copy app assets to www/ for Capacitor build (excludes dev files)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const INCLUDE = [
  'index.html', 'archetype.html', 'archetype-spread.html', 'attraction.html',
  'temperament.html', 'relationship.html', 'integrated-map.html', 'integrated-map.js',
  'style.css', 'attraction-data.js',
  'archetype-engine.js', 'attraction-engine.js', 'temperament-engine.js', 'relationship-engine.js',
  'shared', 'archetype-data', 'temperament-data', 'relationship-data', 'images', 'fonts', 'style'
];

const EXCLUDE = ['node_modules', '.git', 'package-lock.json', 'capacitor.config.json', 'capacitor.config.ts', 'android', 'ios', 'www', 'scripts'];

/**
 * Vendored ESM so static pages can import Capacitor + @capgo/native-purchases without a bundler.
 * Rewrites plugin imports from '@capacitor/core' to '../capacitor-core.js'.
 */
function writeCapacitorNativePurchaseVendors() {
  const vendorDir = path.join(ROOT, 'shared', 'vendor');
  const capSrc = path.join(ROOT, 'node_modules', '@capacitor', 'core', 'dist', 'index.js');
  const npDir = path.join(ROOT, 'node_modules', '@capgo', 'native-purchases', 'dist', 'esm');
  if (!fs.existsSync(capSrc) || !fs.existsSync(npDir)) {
    console.warn('Skip shared/vendor: install npm deps (@capacitor/core, @capgo/native-purchases)');
    return;
  }
  fs.mkdirSync(path.join(vendorDir, 'native-purchases'), { recursive: true });
  fs.copyFileSync(capSrc, path.join(vendorDir, 'capacitor-core.js'));
  for (const f of ['index.js', 'web.js', 'definitions.js']) {
    const srcText = fs.readFileSync(path.join(npDir, f), 'utf8');
    const text = srcText
      .split("from '@capacitor/core'").join("from '../capacitor-core.js'")
      .split("from './definitions'").join("from './definitions.js'")
      .split("import('./web')").join("import('./web.js')");
    fs.writeFileSync(path.join(vendorDir, 'native-purchases', f), text);
  }
  console.log('Wrote shared/vendor (Capacitor core + NativePurchases ESM)');
}

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) rmrf(p);
      else fs.unlinkSync(p);
    });
    fs.rmdirSync(dir);
  }
}

function copyRecurse(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(f => {
      if (EXCLUDE.includes(f)) return;
      copyRecurse(path.join(src, f), path.join(dest, f));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

writeCapacitorNativePurchaseVendors();

rmrf(WWW);
fs.mkdirSync(WWW, { recursive: true });

INCLUDE.forEach(item => {
  const src = path.join(ROOT, item);
  const dest = path.join(WWW, item);
  if (fs.existsSync(src)) {
    copyRecurse(src, dest);
    console.log('Copied:', item);
  }
});

console.log('Done. www/ ready for Capacitor.');
