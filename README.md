# Red-Pill Archetype and SMV

Map where you fit in the modern relationship marketplace. A self-contained app of **four assessment tools**: modern archetype identification, attraction/SMV, polarity (temperament), and relationship viability. Offline, no account, no tracking. Built for web and Capacitor Android.

---

## What’s in the app

| Tool | Page | Description |
|------|------|-------------|
| **Modern Archetype Identification** | `archetype.html` | Identifies primary, secondary, and tertiary archetypes with subtype refinement and behavioral traits. |
| **Attraction, Status and Selection** | `attraction.html` | Gender-specific Sexual Market Value (SMV) assessment: coalition rank, reproductive confidence, axis of attraction, market position, and recommendations. |
| **Polarity Position Mapping** | `temperament.html` | Masculine–feminine temperament mapping, dimension scores, cross-polarity detection, and context sensitivity. |
| **Relationships** | `relationship.html` | Compatibility and strain across multiple points; viability evaluation; action strategies per strain point. |

Each assessment runs in-browser. Progress can be saved locally. After completion, **Save results** produces a single **readable HTML report** (open in browser, print, or save as PDF). There are no separate JSON, CSV, or “Executive Brief” exports; the saved report is the only export.

---

## Tech stack

- **Front end:** Vanilla HTML, CSS, JavaScript (no framework).
- **Shared:** `shared/` — data-loader, export-utils (readable report generation), engine-ui-controller, debug-reporter, performance-monitor, utils (including SecurityUtils), confirm-modal, background (canvas + CSS).
- **Mobile:** Capacitor 8 (Android). Optional `www/` and `android/` build targets.

---

## Project structure

```
├── index.html              # Hub: links to all four tools
├── relationship.html       # Relationships assessment
├── temperament.html        # Polarity (temperament) assessment
├── archetype.html          # Modern Archetype assessment
├── archetype-spread.html   # Archetype spread reference
├── attraction.html         # Attraction & Status assessment
├── style.css               # Global styles (cosmic theme)
├── fonts/
│   └── fonts.css           # Inter / typography
├── images/                 # Tool cover images
├── shared/
│   ├── export-utils.js     # generateReadableReport, downloadFile
│   ├── data-loader.js      # Load relationship/temperament/archetype data
│   ├── engine-ui-controller.js
│   ├── debug-reporter.js
│   ├── performance-monitor.js
│   ├── utils.js            # SecurityUtils, etc.
│   ├── confirm-modal.js
│   ├── background.js       # Nebula canvas
│   └── background.css
├── relationship-engine.js
├── relationship-data/      # Compatibility points, strategies, viability, etc.
├── temperament-engine.js
├── temperament-data/       # Dimensions, scoring, orientation
├── archetype-engine.js
├── archetype-data/        # Archetypes, questions, spread, BRUTAL-TRUTH
├── attraction-engine.js
├── attraction-data.js      # Clusters, weights, market segments
├── scripts/
│   └── copy-to-www.js      # Copy app into www/ for Capacitor
├── www/                    # Build target (npm run copy:www)
├── android/                # Capacitor Android project
└── package.json
```

---

## Getting started

### Prerequisites

- Node.js (for `npm` and local serve).
- For Android: Android Studio and Capacitor CLI (see [Capacitor](https://capacitorjs.com/docs)).

### Install and run (web)

```bash
npm install
npm run serve
```

Then open **http://localhost:3000** and use `index.html` as the entry point.

### Build for Android (optional)

```bash
npm run copy:www    # Copy root app into www/
npm run cap:sync   # copy:www + cap sync android
```

Then open the `android/` project in Android Studio and run on a device or emulator.

---

## Save results (export)

After completing any assessment, the only export option is **Save results**.

- **Action:** One button per tool: “Save results”.
- **Output:** A single **HTML document** that records the report details (scores, strain points, viability, recommendations, archetype profile, etc.). The file is self-contained (inline CSS), suitable for:
  - Opening in any browser  
  - Printing  
  - Saving as PDF from the browser  
- **File names:** e.g. `relationships-report-<timestamp>.html`, `attraction-report-<gender>-<timestamp>.html`, `temperament-report-<timestamp>.html`, `archetype-report-<timestamp>.html`.

JSON, CSV, and Executive Brief exports have been removed; the readable report supersedes them.

---

## Separability

- **No dependency on a parent site.** All navigation is app-only (Home + the four tools). Script and style paths are relative.
- **Shared code is local:** `shared/` and `style.css` live inside the repo. Nothing is linked from an external codebase.
- **To extract or reuse:** Copy the entire app folder into another repo. Serve `index.html` as the entry; the four tool pages and engines work as-is. For Capacitor, run `npm run copy:www` and `npx cap sync android` from the copied folder.

---

## Privacy

Assessments run in the browser. Progress and results can be stored locally (e.g. localStorage). No personal data is sent to a server by default. The saved report is generated and downloaded on the user’s device.

---

## License and attribution

© 2025 Belief Mastery & Sovereign of Mind. All rights reserved.

Frameworks referenced in the tools: Belief Mastery, Sovereign of Mind.

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run serve` | Serve the project root at http://localhost:3000. |
| `npm run copy:www` | Copy the app into `www/` (for Capacitor). |
| `npm run serve:www` | Copy to `www/` then serve `www/` on port 3000. |
| `npm run cap:sync` | Run `copy:www` then `npx cap sync android`. |
| `npm run test` | Placeholder (no tests configured). |
