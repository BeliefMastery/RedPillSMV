# Unplugged Dynamics — Android App Build Guide

## Prerequisites

- **Node.js** (v18+)
- **Android Studio** (Arctic Fox or newer) with Android SDK
- **Java 17** (required by Capacitor 8)

## Repository layout

Work from the **repository root** (this project), not a nested `apps/` path. Source HTML/JS/CSS live at the root; **`www/`** is a **build output** produced by `npm run copy:www`. **`android/`** is the Capacitor native project.

## Phase 1: Offline prep (design)

- Local Inter font (`fonts/`) — no Google Fonts dependency
- Base href removed for local loading
- Static assets use relative paths for GitHub Pages and file/WebView loading

## Build for Android

```bash
# From repository root
npm install

# Copy web assets to www/ (includes shared/vendor regeneration) and sync native project
npm run cap:sync

# Optional: open Android Studio
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync
2. Configure signing for release builds
3. **Build → Build Bundle(s) / APK(s) → Build Bundle(s)**
4. AAB output (typical): `android/app/build/outputs/bundle/release/app-release.aab`

## Google Play upload

**Step-by-step publishing and IAP setup:** [docs/PLAY_STORE_PUBLISHING_CHECKLIST.md](docs/PLAY_STORE_PUBLISHING_CHECKLIST.md)

1. Create the app in [Google Play Console](https://play.google.com/console)
2. Upload `app-release.aab`
3. Complete store listing, content rating, privacy policy, **Data safety** (billing / stored purchase state)
4. Application ID: **`com.beliefmastery.redpill`** (see `capacitor.config.json`)

## In-app purchases (Polarity + Attraction)

Managed product id and QA checklist: **[docs/ANDROID_IAP.md](docs/ANDROID_IAP.md)**. The WebView loads vendored Capacitor + `@capgo/native-purchases` from **`shared/vendor/`**; run **`npm run copy:www`** after changing those dependencies.

## Development workflow

- Edit source files at the **repo root** (not only under `www/`)
- Run **`npm run cap:sync`** after web changes so `android/app/src/main/assets/public` updates
- Run on a device or emulator from Android Studio or: `npx cap run android`
- Billing tests require a **Play Store** image / device and **license testers** (see IAP doc)
