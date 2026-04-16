# Archetype Must-Have Soft Gates

## Purpose

The archetype engine now applies a **family-level soft exclusion layer** before final weighted ranking.  
If a family lacks core must-have trait signals, it receives a conservative penalty rather than a hard block.

This reduces false positives such as highly specific subtypes winning without their foundational family traits.

## Implementation

- Config + evaluator: [`shared/archetype-must-have-gates.mjs`](../shared/archetype-must-have-gates.mjs)
- Integration point: [`archetype-engine.js`](../archetype-engine.js) in `calculateFinalScores()`
- Diagnostics output: `analysisData.mustHaveGates`
- Class/subtype selection now uses explicit family-node rollup (`*_family` / `*_family_female`) before subtype pick.
- Family rollup diagnostics expose both `rawScore` and `normalizedScore` per class in `analysisData.familyRollup`.

## Versioning

- `MUST_HAVE_GATES_VERSION = 1`
- Penalty curve:
  - pass-rate >= 0.67 => `1.00`
  - 0.45–0.66 => `0.93`
  - 0.25–0.44 => `0.85`
  - < 0.25 => `0.72`

## Signal Types

- `likert_min`: pass when answer >= threshold (default 4/5)
- `forced_family`: selected forced-choice option includes archetype IDs mapped to target family
- `context_min` / `context_max`: pass/fail from respect-context values
- `aspiration_target`: pass when aspiration answers include target family marker

## Family Gates (v1)

Each family includes a compact set of must-have signals plus gender-specific add-ons:

- `alpha`: leadership/deference + control/status
- `beta`: harmony/tradition/support
- `gamma`: norm-questioning + analysis/intellectual signal
- `delta`: practical/service + provision markers
- `sigma`: autonomy/independence markers
- `omega`: social disconnection / low social power markers
- `phi`: transcendence/spiritual markers

Female and male variants use equivalent Phase 5 markers where available.

## Diagnostics

`analysisData.mustHaveGates` stores:

- `version`
- `familyMultipliers`
- `archetypeMultipliers`
- `familyDiagnostics` (pass-rate, multiplier, failed signal IDs)

This is intended for tuning and regression checks.

## Validation Script

Run:

```bash
npm run archetype:must-have-check
```

Current script: [`scripts/must-have-gates-check.mjs`](../scripts/must-have-gates-check.mjs)

It runs male/female synthetic scenarios and asserts:

- risk-averse male profile receives stronger gamma penalty
- high-alpha female profile retains strong alpha multiplier
- normalized class winner is not biased by family channel count
- vanilla subtype can still win when its weighted evidence is strongest

---

## Repository context

This app ships as **static web** and **Capacitor Android**. **Polarity** and **Attraction** require a **Google Play** one-time unlock on native Android only; web builds are unaffected. See [ANDROID_IAP.md](ANDROID_IAP.md), [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md), and [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).
