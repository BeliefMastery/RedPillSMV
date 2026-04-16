# Multi-Slider Refactor Spec (Attraction, Temperament, Relationship)

This spec implements the cross-assessment audit plan and translates it into an execution-ready design.

**UI / platform:** How `value_allocation` and related controls are presented (themes, gestures, engine shell) is summarized in [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md). **Distribution:** [ANDROID_IAP.md](ANDROID_IAP.md) for native Android monetization on Polarity/Attraction.

## 1) Attraction Pilot Spec (`attraction-pilot-spec`)

Primary files:
- `attraction-data.js`
- `attraction-engine.js`
- `shared/attraction-smv-core.mjs`

## Pilot candidate set (first wave)

High-confidence conversions to `value_allocation`:
- `courage_1`
- `courage_3`
- `protector_2`
- `parental_2`
- `rad_2`
- `collab_1`
- `personality_2`

Optional second wave (medium confidence):
- `rad_3`
- `collab_2`
- `risk_2`
- `hidden_2`
- `signal_1`

## Question schema addition

For converted items in `attraction-data.js`:
- `type: 'value_allocation'`
- `allocationTotal: 100`
- `allocationBuckets`: explicit bucket descriptors per item
- `allocationToScaleMap`: numeric anchors that map each bucket to current scalar direction (1..10)

Example shape:
```js
{
  id: 'courage_1',
  subcategory: 'courage',
  type: 'value_allocation',
  allocationTotal: 100,
  allocationBuckets: [
    { key: 'avoid', label: 'Avoid/escape', scaleAnchor: 1 },
    { key: 'deescalate', label: 'De-escalate first', scaleAnchor: 4 },
    { key: 'assert', label: 'Assertive defense', scaleAnchor: 7 },
    { key: 'dominate', label: 'Dominant confrontation', scaleAnchor: 10 }
  ],
  weight: 1.0
}
```

## Projection rule into current scalar scoring

Attraction core currently expects numeric values in `responses[q.id]` and performs reverse scoring where configured in `computeSmvClustersAndSubs`.

For `value_allocation`, compute scalar projection before existing math:

- normalize shares from allocation percents
- projected scalar `v = sum(share_i * scaleAnchor_i)` on 1..10
- store projected scalar in `responses[id]`
- optionally retain raw allocation in a sibling map for export/debug

This preserves current cluster/subcategory weighting and percentile transforms.

## RAD-specific caveat

`calculateRadActivityPercentile` uses `rad_1` threshold floor logic (`ANTI_RAD_THRESHOLD`).
- Do not convert `rad_1` in wave 1.
- If converted later, define explicit floor trigger from projected scalar or designated anti-rad bucket share.

---

## 2) Cross-Engine Allocation Contract (`allocation-scoring-contract`)

Applies to all three engines.

## Canonical payload

Each allocation answer persists as:
```js
{
  type: 'value_allocation',
  allocationPercents: number[], // same length as buckets/options
  allocationTotal: 100
}
```

## Normalization

- If sum > 0: `share_i = percent_i / sum`
- If sum <= 0: fallback to uniform shares

## Scalar bridge projection

Where legacy scoring requires scalar:
- `projected = sum(share_i * anchor_i)`
- anchors defined per question in data (`allocationToScaleMap` or bucket anchors)

## Reverse-score transform

Keep existing convention:
- scalar reverse: `v = 11 - v`

For allocation questions:
- project to scalar first, then apply reverse
- do not reverse raw shares directly unless engine is redesigned to operate on vector math end-to-end

## Missing/incomplete handling

- strict mode (default): require 100 total before advancing
- restore mode: normalize partial sums for resumed sessions
- scoring mode: if malformed payload (length mismatch), skip item and log debug event

## Backward compatibility

- Existing scalar responses remain valid.
- Mixed-mode scoring supports both scalar and allocation per item.

---

## 3) Temperament Allocation Bridge (`temperament-bridge-design`)

Primary files:
- `temperament-engine.js`
- `temperament-data/temperament-dimensions.js`
- `temperament-data/intimate-dynamics.js`
- `temperament-data/attraction-responsiveness.js`

Temperament Phase 2 currently uses single `0..10` slider and computes:
- `normalizedAnswer = (answer - 5) / 5`

## Proposed candidates (phase 2 first)

High:
- `vuln_4`, `prov_1`, `ach_2`, `ctrl_1`, `foc_3`
- `int_emo_4`, `int_emo_5`
- `attr_hyp_1`

Medium-high:
- `int_sat_5`, `attr_sig_2`

Medium:
- `attr_resp_4`, `cert_2`

## Bridge approach

For each converted item:
- define two or more buckets mapped to 0..10 anchors
- project allocation to scalar answer
- run current net contribution math unchanged

This avoids immediate re-derivation of all `masculineWeight` / `feminineWeight` logic.

## Recalibration notes

- After conversion, inspect dimension net distributions for shift in center/variance.
- If net center drifts systematically, adjust only per-item anchor placements before touching dimension weights.

## Weighting impact reflection (required)

`value_allocation` increases effective response granularity. That can change score shape even when nominal item weights stay fixed, because respondents no longer commit to a single anchor.

Reflection rules for each converted question:
- Check whether expected score compression occurs (more mid-weighted blends, fewer extremes).
- Check whether converted items now contribute more consistently than neighboring scalar items because every response distributes across anchors.
- If converted item influence appears stronger than intended, first tune anchor spacing or question `weight` locally before editing cluster/dimension global weights.
- If converted item influence appears weaker than intended, first validate projection mapping and reverse-score handling before increasing weights.

Do not change global cluster weight architecture until per-item projection behavior is stable across pilot telemetry.

---

## 4) Relationship Type-Routing Design (`relationship-type-routing-design`)

Primary files:
- `relationship-engine.js`
- `relationship-data/stage-questions.js`
- `relationship-data/compatibility-points.js`

Current runtime behavior treats questions as scalar 0..10 sliders; data `type` is not driving rendering/scoring.

## Required engine changes before data conversion

1. Add type-aware rendering branch:
   - `likert_slider` (current)
   - `value_allocation` (new)

2. Add type-aware answer persistence:
   - scalar `value`
   - allocation `allocationPercents`

3. Add type-aware scoring adapter:
   - if allocation -> scalar projection -> existing score path

## Initial relationship candidates (after routing exists)

High:
- `domain_support_4`
- `domain_transaction_1`
- `domain_transaction_2`

Medium-high:
- `domain_efficiency_3`
- `domain_efficiency_4`

Medium:
- `domain_sexual_2`
- `domain_boundaries_4`
- `domain_goals_3`

## Keep scalar by default

Do not convert trust/repair/viability absolute-state checks in first pass.

---

## 5) Telemetry and Threshold Checks (`telemetry-and-threshold-checks`)

Post-conversion, record and compare per engine:

## Input quality metrics
- completion rate
- abandonment rate at converted items
- percent malformed allocation payloads

## Score stability metrics
- pre/post mean and variance by converted subcategory/dimension
- rank order drift of top outputs
- rate of threshold band changes (where thresholds exist)

## Calibration checks
- no silent directional flips on reverse-scored constructs
- no systematic inflation/deflation in converted categories
- no sharp increase in tie/noise behavior (where applicable)

## Gate criteria for rollout

Promote next wave only if:
- completion drop <= 3%
- malformed payloads <= 1%
- no unexplained rank drift spikes in calibration samples
- threshold band distribution shifts are interpretable and acceptable

---

## Implementation order

1. Attraction wave 1 conversion + projection bridge.
2. Telemetry instrumentation and baseline comparison.
3. Temperament bridge for high-confidence items.
4. Relationship type-routing implementation.
5. Relationship selective conversions.

