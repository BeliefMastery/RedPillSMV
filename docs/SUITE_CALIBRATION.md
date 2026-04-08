# Suite cross-assessment calibration

Sequential unlock: **Archetype → Polarity → Attraction** (Relationship is independent).

## Source of truth

All tunables live in [`shared/suite-calibration-config.mjs`](../shared/suite-calibration-config.mjs). [`shared/archetype-polarity-calibration.mjs`](../shared/archetype-polarity-calibration.mjs) and [`shared/attraction-suite-calibration.mjs`](../shared/attraction-suite-calibration.mjs) import from it.

**Coupling:** `ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER` drives both the polarity composite nudge and (via `ARCHETYPE_ATTRACTION_BIAS_BY_CLUSTER`, same object by default) attraction SMV cluster deltas. To tune attraction independently of polarity, replace `ARCHETYPE_ATTRACTION_BIAS_BY_CLUSTER` in config with a separate table.

## Success metrics (tuning targets)

| Concern | What we measure |
|--------|------------------|
| **Stability** | Distribution of `suiteCalibration.delta` (polarity) and `overallDeltaApplied` (attraction); how often deltas hit caps |
| **Boundary sensitivity** | Category changes where `temperamentCategory(raw) !== temperamentCategory(adjusted)` — run `npm run suite:calibration-check` |
| **Coherence** | Masculine-leaning archetype + masculine polarity should not invert coalition/axis direction without a documented reason (script includes a spot check) |
| **Transparency** | Bump `ARCHETYPE_POLARITY_CALIBRATION_VERSION` / `ATTRACTION_SUITE_CALIBRATION_VERSION` when behavior changes; exports reference version |

## Polarity (temperament)

- After the questionnaire-derived composite `normalizedScore` (0–1) is computed, a small adjustment may be applied from the **primary archetype** cluster (Alpha, Beta, Gamma, Delta, Sigma, Omega, Phi; `dark_*` uses the same base cluster).
- **Cap:** total shift ≤ `ARCHETYPE_POLARITY_MAX_DELTA` on the 0–1 scale (see config).
- Category thresholds are applied **after** this nudge (see [`temperament-data/temperament-scoring.js`](../temperament-data/temperament-scoring.js)).

## Attraction (SMV)

- After base cluster percentiles and overall SMV are computed from responses, **suite calibration** may adjust cluster percentiles using stored archetype + polarity snapshots.
- **Caps:** per-cluster ±`ATTRACTION_CLUSTER_DELTA_CAP` percentile points; overall change capped at ±`ATTRACTION_OVERALL_DELTA_CAP` vs questionnaire overall.
- `smv.suiteCalibration.inputsHash` fingerprints archetype id + polarity norm + gender + version for audit.
- Derivative fields (market position, delusion band, recommendations) are recomputed after calibration.

## Versioning / changelog

- **v2 (polarity):** Softer directional biases (~15% vs v1) and slightly lower max delta (`0.024` vs `0.03`) to reduce threshold-only category flips while keeping questionnaire-primary behavior.
- **v2 (attraction):** Aligned with v2 bias table; adds `inputsHash` on stored `suiteCalibration`.

- `analysisData.suiteCalibration` (polarity) and `smv.suiteCalibration` (attraction) record `version` and deltas for exports and debugging.

## Automation

- `npm run suite:calibration-check` — polarity boundary sweep + attraction cap assertions + coherence spot check.
- `npm run smv:sensitivity` — SMV pillar swings; includes a suite calibration fixture line.
