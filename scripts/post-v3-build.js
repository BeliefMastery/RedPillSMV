/**
 * After Vite build: copy static assets engines need into www/
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WWW = path.join(ROOT, "www");

const COPY_DIRS = [
  "images",
  "fonts",
  "style",
  "archetype-data",
  "temperament-data",
  "relationship-data",
  "shared",
];

const COPY_FILES = [
  "attraction-data.js",
  "archetype-engine.js",
  "temperament-engine.js",
  "attraction-engine.js",
  "relationship-engine.js",
  "archetype-spread.html",
  "site.webmanifest",
];

function writeCapacitorNativePurchaseVendors() {
  const vendorDir = path.join(WWW, "shared", "vendor");
  const capSrc = path.join(ROOT, "node_modules", "@capacitor", "core", "dist", "index.js");
  const npDir = path.join(ROOT, "node_modules", "@capgo", "native-purchases", "dist", "esm");
  if (!fs.existsSync(capSrc) || !fs.existsSync(npDir)) {
    console.warn("Skip shared/vendor: install npm deps");
    return;
  }
  fs.mkdirSync(path.join(vendorDir, "native-purchases"), { recursive: true });
  fs.copyFileSync(capSrc, path.join(vendorDir, "capacitor-core.js"));
  for (const f of ["index.js", "web.js", "definitions.js"]) {
    const srcText = fs.readFileSync(path.join(npDir, f), "utf8");
    const text = srcText
      .split("from '@capacitor/core'")
      .join("from '../capacitor-core.js'")
      .split("from './definitions'")
      .join("from './definitions.js'")
      .split("import('./web')")
      .join("import('./web.js')");
    fs.writeFileSync(path.join(vendorDir, "native-purchases", f), text);
  }
  console.log("Wrote www/shared/vendor");
}

function copyRecurse(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      if (f === "vendor") continue;
      copyRecurse(path.join(src, f), path.join(dest, f));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

for (const dir of COPY_DIRS) {
  const src = path.join(ROOT, dir);
  const dest = path.join(WWW, dir);
  if (fs.existsSync(src)) {
    copyRecurse(src, dest);
    console.log("Copied dir:", dir);
  }
}

for (const file of COPY_FILES) {
  const src = path.join(ROOT, file);
  const dest = path.join(WWW, file);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log("Copied file:", file);
  }
}

writeCapacitorNativePurchaseVendors();
console.log("post-v3-build complete");
