/**
 * Copy app assets to www/ for Capacitor build (excludes dev files)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const INCLUDE = [
  'index.html', 'archetype.html', 'archetype-spread.html', 'attraction.html',
  'temperament.html', 'relationship.html',
  'style.css', 'attraction-data.js',
  'archetype-engine.js', 'attraction-engine.js', 'temperament-engine.js', 'relationship-engine.js',
  'shared', 'archetype-data', 'temperament-data', 'relationship-data', 'images', 'fonts', 'style'
];

const EXCLUDE = ['node_modules', '.git', 'package-lock.json', 'capacitor.config.json', 'capacitor.config.ts', 'android', 'ios', 'www', 'scripts'];

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
