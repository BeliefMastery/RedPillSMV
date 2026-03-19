# Unplugged Dynamics — Android App Build Guide

## Prerequisites

- **Node.js** (v18+)
- **Android Studio** (Arctic Fox or newer) with Android SDK
- **Java 17** (required by Capacitor 8)

## Phase 1: Offline Prep (completed)

- Local Inter font (`fonts/`) — no Google Fonts dependency
- Base href removed for local loading
- Link checker disabled when offline

## Build for Android

```bash
cd apps/red-pill-relationships

# Install dependencies (if not done)
npm install

# Copy web assets to www and sync to Android
npm run cap:sync

# Open in Android Studio
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync
2. **Build → Build Bundle(s) / APK(s) → Build Bundle(s)**
3. AAB output: `android/app/build/outputs/bundle/release/app-release.aab`

## Google Play Upload

1. Create app in [Google Play Console](https://play.google.com/console)
2. Upload `app-release.aab`
3. Complete store listing, content rating, privacy policy
4. Package ID: `com.beliefmastery.redpill`

## Development Workflow

- Edit files in `apps/red-pill-relationships/` (not in `www/`)
- Run `npm run cap:sync` after changes
- Run on device/emulator from Android Studio or: `npx cap run android`
