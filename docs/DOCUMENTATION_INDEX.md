# Documentation index

Central map of Markdown in this repository (excluding `node_modules/` and generated copies under `www/` / `android/.../public/`). Use this when onboarding or porting the app.

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Project overview, structure, scripts, web vs Android, privacy |
| [ANDROID-BUILD.md](../ANDROID-BUILD.md) | Capacitor Android build, Play upload, package id |
| [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md) | Themes, swipe navigation, sliders/allocations, shared UI mechanisms, suite/IAP hooks |
| [ANDROID_IAP.md](ANDROID_IAP.md) | Google Play one-time unlock for Polarity & Attraction (native Android only) |
| [PLAY_STORE_PUBLISHING_CHECKLIST.md](PLAY_STORE_PUBLISHING_CHECKLIST.md) | End-to-end: build, billing setup, testing tracks, signing, listing, go-live |
| [EXPLANATION_DISCLAIMER_AUDIT.md](EXPLANATION_DISCLAIMER_AUDIT.md) | Disclosure-toggle audit: redundancy, layout opportunities, accessibility + shared toggle implementation |
| [SUITE_CALIBRATION.md](SUITE_CALIBRATION.md) | Cross-assessment calibration (Archetype → Polarity → Attraction) |
| [MULTI_SLIDER_REFACTOR_SPEC.md](MULTI_SLIDER_REFACTOR_SPEC.md) | `value_allocation` / multi-bucket question schema across engines |
| [engine-proofing-blueprint.md](engine-proofing-blueprint.md) | Generic pattern for validating assessment engines |
| [ARCHETYPE_SOFT_GATES.md](ARCHETYPE_SOFT_GATES.md) | Archetype soft-gate / must-have tooling |
| [ARCHETYPE_WEIGHTING_ASSESSMENT_AUDIT_PLAN.md](ARCHETYPE_WEIGHTING_ASSESSMENT_AUDIT_PLAN.md) | Archetype weighting audit plan |
| [ARCHETYPE_WEIGHTING_AUDIT_REPORT.md](ARCHETYPE_WEIGHTING_AUDIT_REPORT.md) | Archetype weighting audit results |
| [ARCHETYPE_SUBCLASS_SKEW_DIAGNOSIS.md](ARCHETYPE_SUBCLASS_SKEW_DIAGNOSIS.md) | Subclass skew analysis |
| [ARCHETYPE_SPREAD_SEX_DISCREPANCY_EXPLAINER.md](ARCHETYPE_SPREAD_SEX_DISCREPANCY_EXPLAINER.md) | Spread vs sex discrepancy notes |
| [TEMPERAMENT_SPECTRUM_REEVALUATION_PLAN.md](TEMPERAMENT_SPECTRUM_REEVALUATION_PLAN.md) | Polarity/temperament spectrum planning |
| [TEMPERAMENT_GLOSSARY.md](TEMPERAMENT_GLOSSARY.md) | Temperament terminology |
| [TEMPERAMENT_LANGUAGE_DECISION_LOG.md](TEMPERAMENT_LANGUAGE_DECISION_LOG.md) | Copy/language decisions |
| [SMV_WEIGHTING_NOTE.md](SMV_WEIGHTING_NOTE.md) | Attraction/SMV weighting note |
| [WEIGHTING_CALIBRATION_NOTE.md](../WEIGHTING_CALIBRATION_NOTE.md) | Relationship Stage-1 weighting calibration |
| [archetype-data/PROPOSAL-RESPECT-CONTEXT.md](../archetype-data/PROPOSAL-RESPECT-CONTEXT.md) | Archetype data proposal (respect context) |

**Platform summary:** The same static assets run on **GitHub Pages / local web** (no IAP paywall) and in the **Capacitor Android** WebView (Polarity + Attraction require a Play purchase). See [ANDROID_IAP.md](ANDROID_IAP.md).
