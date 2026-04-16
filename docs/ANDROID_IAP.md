# Android in-app purchase: Polarity & Attraction

This app is static HTML/JS shipped in the Capacitor WebView. **Polarity** (`temperament.html` / `temperament-engine.js`) and **Attraction** (`attraction.html` / `attraction-engine.js`) require a **one-time Google Play managed product** when running on **native Android**. **Archetype** and **Relationships** stay free. Suite prerequisites (Archetype → Polarity → Attraction) are unchanged after purchase.

## Product ID (Play Console)

Create a **non-consumable / one-time managed product** with this identifier (must match code):

`com.beliefmastery.redpill.unlock_polarity_attraction`

Defined in code as `POLARITY_ATTRACTION_PRODUCT_ID` in `shared/premium-entitlement.js`.

The prefix aligns with `appId` in `capacitor.config.json` (`com.beliefmastery.redpill`).

## Implementation notes

- **Plugin:** `@capgo/native-purchases` (Capacitor 8). Billing permission: `com.android.vending.BILLING` in `AndroidManifest.xml`.
- **Static modules:** `npm run copy:www` generates `shared/vendor/` (Capacitor core + plugin ESM with rewritten imports) so the site works **without a bundler**. Commit `shared/vendor/` after dependency upgrades, or run `copy:www` before building Android.
- **Web / GitHub Pages / Playwright:** `isNativeAndroid()` is false; **no paywall**. CI and browser tests should keep using the web build; do not assert IAP UI there.
- **Entitlement:** After a successful purchase or `getPurchases`, valid Android state uses `purchaseState === "1"`. A flag is stored in `localStorage` (`redpill_unlock_polarity_attraction_v1`). This is **client-side only**; determined users can bypass without a backend. For stronger enforcement, add Google Play Developer API verification later.

## Store checklist

1. Create the app and the managed product in Play Console with the ID above.
2. **License testers** (or internal testing track) for unpaid test purchases.
3. **Data safety** form: declare Play Billing; describe local purchase/entitlement state if required.
4. **Restore purchases** is exposed in-app for policy compliance.

## Manual QA (Android)

1. Fresh install: complete Archetype; confirm Polarity paywall appears; purchase; kill app; relaunch; confirm assessments run without paying again.
2. **Restore** on a second device or after clearing app data (expect need to tap Restore if `localStorage` was cleared but the Play account still owns the SKU).
3. Confirm **Relationships** and **Archetype** are not paywalled.

## Build commands

```bash
npm run copy:www
npx cap sync android
```

Then open the project in Android Studio, run on a device or emulator with Play Store, and test with a license tester account.

## See also

- [PLAY_STORE_PUBLISHING_CHECKLIST.md](PLAY_STORE_PUBLISHING_CHECKLIST.md) — full publish + payment gateway stages
- [README.md](../README.md) — project overview, `www/` / `shared/vendor/` pipeline
- [ANDROID-BUILD.md](../ANDROID-BUILD.md) — Gradle, AAB, Play listing
- [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md) — themes, swipe, paywall markup, suite nav
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) — all Markdown in the repo
