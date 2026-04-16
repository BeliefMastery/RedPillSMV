# Why `archetype-spread.html` Shows Male/Female Discrepancy

## Core claim

The discrepancy is expected and structurally coherent in this app's paradigm.

`archetype-spread.html` is not displaying "one neutral distribution split by sex." It shows two parallel market maps:

- male archetype lanes (male signaling/positioning under female selection)
- female archetype lanes (female filtering/signaling under male selection)

These are related systems inside one model, but not mirror images of the same function.

Critical correction:

- same label does not mean same function
- same function does not mean same outcome

So a "Beta Male" and a "Beta Female" are not equivalent units at identity or outcome level.

## What the table is (and is not)

The spread page renders static rows from `archetype-data/archetype-spread.js` and partitions by row name suffix (`Male` vs `Female`).

Each row is a prior reference record:

- archetype label
- attraction/market-read framing
- cross-paradigm equivalents
- `socialProportion`

So this page is a curated reference prior layer, not a live output histogram from runtime assessments.

## Deeper source of the discrepancy: selection-loop asymmetry

A taxonomy difference exists, but it is downstream. The deeper asymmetry is role asymmetry in the mating market model:

- male archetypes (in this model) optimize to be chosen
- female archetypes (in this model) optimize what gets chosen

Equivalent restatement:

- male lanes encode performance/positioning strategies in competitive signaling
- female lanes encode filtering/boundary/signaling strategies in selection and risk management

Those are not inverse functions. Because the modeled roles differ, strict lane parity is not just unlikely - it is structurally unavailable.

This framing is more precise than a broad "sex roles" statement: the key difference is position in the selection loop.

## Why 1:1 lane mapping fails in practice

### 1) Different underlying taxonomies

`archetypes.js` defines sex-native families and subtype inventories that are conceptually parallel but not symmetric at lane resolution.

### 2) Explicit remapping/collapse for female interpretability

Engine mapping intentionally routes some subtype paths into nearest female-equivalent lanes. This is not cosmetic; it stabilizes interpretability in the female-native taxonomy.

### 3) Sex-specific market semantics

Attraction/market-read language is sex-calibrated by design in this paradigm. The modeled "high value" signal stack differs by sex, so prior surfaces differ.

Same visible behavior can produce opposite market effects depending on loop position. Example: reduced exposure/withdrawal can lower male selection probability while increasing female selectivity signal.

### 4) Staged resolution amplifies asymmetry

Family signal is established early; subtype separation is conditional and later (Phase 2 + adaptive Phase 6). In low-signal or tie-pressure cases, within-family resolution can drift toward defaults, and that drift expresses differently across sex-native subtype inventories.

### 5) Static priors versus runtime pipeline

`socialProportion` priors are reference values. Runtime outputs pass through:

- mapping/remapping
- family normalization
- tie-pressure rules
- determinative Phase 6 refinement

So table priors and observed outputs are not expected to match lane-for-lane.

## Current model layers (explicitly framed)

The app already implies a three-layer architecture:

1. Native layer (implemented)
   - sex-native archetypes and subtypes
   - full asymmetry retained
2. Functional layer (partially implicit)
   - shared functions like competitive display, selection filtering, provisioning/stability, autonomy, avoidant collapse, shadow volatility
   - this is where cross-sex comparability actually belongs
3. Projection layer (optional extension)
   - meta-family or functional projections for analytics/reporting
   - preserves native outputs while enabling normalized comparison

## What is comparable versus non-comparable

Comparable across sexes:

- functional tendencies (dominance, withdrawal, selectivity, nurturance, autonomy, volatility)
- regulation style (reactive vs controlled, avoidant vs approach, etc.)
- signaling style (direct, indirect, scarcity, provisioning, boundary-heavy, etc.)

Not directly comparable across sexes:

- identity-level type equivalence ("X male equals X female")
- market outcome parity
- desirability ranking equivalence
- lifecycle trajectory equivalence

Precision rule:

Archetypes can be compared at functional-axis level, not at identity or outcome level.

## Why remapping is not a patch but a requirement

The remap layer is necessary because male subtype granularity often encodes micro-competitive strategy distinctions that do not produce clean female-native analog lanes at equal resolution.

Without bounded remapping/collapse:

- outputs become noisier
- subtype stability drops in low-signal cases
- interpretation quality degrades

## What counts as a bug versus expected behavior

Expected:

- non-1:1 lane distributions between male and female tables
- different subtype density and collapse patterns by sex

Bug indicators:

- male rows rendered in female table (or inverse)
- broken name-to-ID/equivalent lookup
- remap mass consistently routing to clearly wrong target lanes
- same saved answer state producing unstable results across refresh

Diagnostics:

- `docs/ARCHETYPE_SUBCLASS_SKEW_DIAGNOSIS.md`
- `analysisData.subclassDiagnostics`
- Phase 6 before/after deltas

## Integration propositions (next-step roadmap)

1. Add a spread-page legend
   - "Male and Female archetype spreads use parallel but non-identical taxonomies; 1:1 lane symmetry is not expected in this model."
2. Formalize a functional layer schema
   - define shared functional axes used for cross-sex comparison
3. Add optional projection output
   - report both sex-native result and normalized functional/meta-family projection
4. Expose remap transparency in diagnostics UI/export
   - show pre-map vs post-map contribution summaries for explainability
5. Link tie-break behavior directly in docs
   - cross-reference Phase 6 bounded resolution rules from spread explainer

## Bottom line

The discrepancy exists because this system models two different roles inside one selection ecology, not two cosmetically different versions of the same actor.

Once that is explicit, the discrepancy stops looking like inconsistency and starts reading as model fidelity.

---

## Repository context

This app ships as **static web** and **Capacitor Android**. **Polarity** and **Attraction** require a **Google Play** one-time unlock on native Android only; web builds are unaffected. See [ANDROID_IAP.md](ANDROID_IAP.md), [UI_AND_PLATFORM_ARCHITECTURE.md](UI_AND_PLATFORM_ARCHITECTURE.md), and [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).
