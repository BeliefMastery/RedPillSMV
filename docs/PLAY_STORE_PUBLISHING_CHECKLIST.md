# Play Store publishing checklist (Android)

End-to-end stages to **finish the app**, wire **Google Play Billing** (one-time unlock for Polarity + Attraction), and **publish**. Assumes you already have **Android Studio**, a **Google Play Developer account**, and this repo on your machine.

**Application ID (must stay consistent):** `com.beliefmastery.redpill` — see `capacitor.config.json`.

**In-app product ID (must match code exactly):** `com.beliefmastery.redpill.unlock_polarity_attraction` — see `shared/premium-entitlement.js` and [ANDROID_IAP.md](ANDROID_IAP.md).

---

## Stage 1 — Local project health

1. Install dependencies from the **repository root**:
   ```bash
   npm install
   ```
2. Regenerate the web bundle and native sync (refreshes `www/` and `shared/vendor/`):
   ```bash
   npm run cap:sync
   ```
3. Open the Android project:
   ```bash
   npx cap open android
   ```
4. In Android Studio, let **Gradle sync** finish; fix any SDK/JDK issues (Capacitor 8 expects **Java 17**).

**Reference:** [ANDROID-BUILD.md](../ANDROID-BUILD.md)

---

## Stage 2 — Run on a device (debug)

1. Use a **physical device or emulator image that includes Google Play** (billing does not work on plain AOSP images without Play Store).
2. Run the **debug** build from Android Studio onto that device.
3. Smoke-test: open the app, navigate Home → Archetype → Polarity; confirm the WebView loads and no crashes.

---

## Stage 3 — Payment gateway (Google Play Console + code alignment)

There is **no separate Stripe or custom gateway** in this app: monetization is **Google Play In-app products** only, via `@capgo/native-purchases`.

### 3a. Create the app in Play Console (if not already)

1. Go to [Google Play Console](https://play.google.com/console).
2. **Create app** (or select the existing app).
3. Ensure the **package name** in Console matches **`com.beliefmastery.redpill`** (must match the Android `applicationId` / Capacitor `appId`).

### 3b. Create the one-time product

1. In Play Console, open **Monetize → Products → In-app products** (or the current menu path for **managed / one-time** products).
2. Create a **non-consumable / one-time** managed product.
3. Set **Product ID** exactly to:
   ```text
   com.beliefmastery.redpill.unlock_polarity_attraction
   ```
4. Fill name, description, and **default price** (per region as needed). **Activate** the product when ready.

If the ID in Console does not match `POLARITY_ATTRACTION_PRODUCT_ID` in code, purchases will fail until you align them.

### 3c. License testing (before going live)

1. Play Console → **Settings → License testing** (or **Setup → License testing**, depending on Console UI version).
2. Add **Gmail accounts** that will install test builds and make test purchases (no real charge for license testers in standard test flows).
3. Use the same account on the test device’s Play Store.

### 3d. Merchant & payouts

1. Complete **payments profile** and **tax** settings in Play Console if prompted, so you can sell in-app items in your target countries.

**Reference:** [ANDROID_IAP.md](ANDROID_IAP.md)

---

## Stage 4 — Test in-app purchase flows (internal / closed track)

You cannot fully validate billing with only a debug sideload in all cases; use a **testing track** with an uploaded AAB.

1. Build a **signed release** or **uploadable** bundle (see Stage 5 for signing).
2. Upload to **Internal testing** (fastest) or **Closed testing**.
3. Add testers (email lists or Google Groups) and have them opt in via the Play link.
4. On a device, install from the **Play Store test track** (not only `adb install` of a local APK), using a **license tester** account.
5. Manual QA:
   - Complete **Archetype**; unlock **Polarity** per suite rules; confirm **paywall** appears on Polarity/Attraction.
   - Complete a **test purchase**; confirm both tools work.
   - **Force-stop** the app and reopen; confirm entitlement persists (`localStorage` + Play).
   - Tap **Restore purchases** after clearing app data (or fresh install); confirm unlock returns for the same Google account.
   - Confirm **Archetype** and **Relationships** are **not** paywalled.

**Reference:** Manual QA list in [ANDROID_IAP.md](ANDROID_IAP.md)

---

## Stage 5 — Release signing (production)

1. In Android Studio: **Build → Generate Signed App Bundle / APK** (or configure signing in the module’s `build.gradle` with your keystore).
2. Create or reuse a **upload keystore**; store passwords and the keystore file securely (loss = you cannot update the app under the same listing).
3. Build **release AAB**:
   - Typical output: `android/app/build/outputs/bundle/release/app-release.aab`
4. Optionally enable **Play App Signing** (recommended): Google holds the app signing key; you use an upload key.

---

## Stage 6 — Store listing, compliance, and policy

Complete these in Play Console before production (many can be drafted earlier):

| Area | What to do |
|------|------------|
| **Main store listing** | Title, short/full description, screenshots (phone, 7" tablet if required), feature graphic, icon. |
| **Privacy policy** | Public URL; must cover data you collect/store. This app is mostly on-device; declare **local** storage and **Play Billing** if you transmit purchase tokens only to Google. Update if you add analytics or a backend. |
| **Data safety form** | Declare **Billing**; describe what you store (e.g. local entitlement flag / purchase state on device). Answer questions honestly. |
| **Content rating** | Complete questionnaire (IARC or regional equivalent). |
| **Target audience / families** | If children are not the audience, set accordingly; ads declaration if applicable (this project has no ads by default). |
| **News app / COVID / other** | Complete only if applicable. |
| **Countries / pricing** | Select distribution countries; confirm tax and merchant setup. |

---

## Stage 7 — Pre-launch report & staged rollout

1. Upload the **release AAB** to **Production** (or start with a **staged rollout** percentage).
2. Resolve **pre-launch report** issues (crashes, permissions) if shown.
3. Fix **policy** warnings (missing privacy policy, Data safety mismatches, misleading IAP description, etc.).

---

## Stage 8 — Go live

1. When all required sections show **Ready to publish**, submit the release.
2. First review can take **hours to several days**.
3. After approval, monitor **Android vitals**, **ANRs/crashes**, and **reviews**.

---

## Stage 9 — Ongoing maintenance (each app update)

1. Change web/assets at repo root; run:
   ```bash
   npm run cap:sync
   ```
2. Increment **versionCode** / **versionName** in `android/app/build.gradle` (or via your workflow).
3. Build a new **AAB**, upload to Play Console, roll out through testing or production.
4. If you change **Capacitor** or **@capgo/native-purchases**, run `copy:www` before sync so **`shared/vendor/`** matches (see [ANDROID_IAP.md](ANDROID_IAP.md)).

---

## Quick command reference

```bash
npm install
npm run cap:sync          # www/ + shared/vendor + cap sync android
npx cap open android      # Android Studio
```

---

## Related docs

- [ANDROID-BUILD.md](../ANDROID-BUILD.md) — Gradle, AAB paths, workflow
- [ANDROID_IAP.md](ANDROID_IAP.md) — Product ID, plugin, QA, client-only entitlement note
- [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md) — Paywall UI, suite gates, themes
- [README.md](../README.md) — Project overview

---

## Repository context

This app ships as **static web** and **Capacitor Android**. **Polarity** and **Attraction** use **Google Play Billing** on native Android only; the same HTML on the web has **no** paywall.
