# Archetype weighting and assessment — audit execution report

**Date:** 2026-04-02  
**Scope:** [`archetype-engine.js`](../archetype-engine.js) scoring pipeline, [`archetype-data/archetype-questions.js`](../archetype-data/archetype-questions.js), [`archetype-data/archetypes.js`](../archetype-data/archetypes.js).  
**Plan reference:** [`ARCHETYPE_WEIGHTING_ASSESSMENT_AUDIT_PLAN.md`](./ARCHETYPE_WEIGHTING_ASSESSMENT_AUDIT_PLAN.md)

---

## Executive summary

| Area | Result | Notes |
|------|--------|--------|
| Phase weight table | **Verified** | Male/female `phaseWeights` documented in `calculateFinalScores()`; Phase 5 counts match comments (16 male / 18 female questions). |
| Question → taxonomy IDs | **Pass** | 31 distinct canonical IDs referenced in questions; all exist in `ARCHETYPES`. No orphan question IDs. |
| Subtype selection | **Documented** | `pickSubtype()` uses **phase2 only**; product decision, not a bug. |
| Secondary / tertiary gates | **Verified** | Secondary if score > 25% of primary; tertiary if > 15% of primary (`identifyArchetypes`). |
| Context adjustments | **Reviewed** | Aspiration, respect, provision (male), aesthetics apply to phase1–3 as coded; keys use canonical base IDs + `baseId` strip for `_female`. |
| Phase 4 vignettes | **P0 fixed** | Phase 4 did **not** map vignette IDs to gender-specific score keys and did not initialize buckets — **runtime risk for female respondents**. **Fixed** in `scorePhase4Answer` (same mapping pattern as Phases 1–3 / 5). |
| IQ funnel | **Reviewed** | `filterQuestionsByIQ` scores question relevance by archetype tags; reduces Phase 1 to 12, Phase 2 to 15, Phase 3 non-aspiration to 6 when IQ ≠ unknown. Empirical skew not simulated in this pass. |
| Distribution / Monte Carlo | **Not run** | Requires scripted personas or telemetry; track as follow-up. |

---

## A. Phase weights (from code)

Raw score multipliers before `phaseWeights`:

| Phase | Per-answer multiplier (typical) | `phaseWeights` (male) | `phaseWeights` (female) |
|-------|----------------------------------|------------------------|---------------------------|
| 1 | option weight × **3** | 0.025 (45% target) | 0.0233 (42% target) |
| 2 | Likert: `(value−3) × arch.weight × **2**`; forced-choice: `1 × weight × **2**` | 0.0194 (28%) | 0.0194 (28%) |
| 3 | weight × **1** | 0.0175 (14%) | 0.0175 (14%) |
| 4 | weight × **0.5** | 0.0467 (7%) | 0.0467 (7%) |
| 5 | `(value−3) × arch.weight × **1**` | 0.0060 (6%) | 0.0090 (9%) |

**Phase 5 question counts:** male **16**, female **18** — aligned with comments in `calculateFinalScores` about recalibrating `phase5` weight.

---

## B. Coverage: question file vs taxonomy

Script: [`scripts/archetype-audit-extract.mjs`](../scripts/archetype-audit-extract.mjs)

- **31** distinct archetype IDs appear in `archetype-questions.js` (arrays + `{ id, weight }` lines).
- **All 31** match keys in `ARCHETYPES` (**no orphan IDs**).

Female-specific IDs (e.g. `alpha_female`, `gamma_female`) **do not** appear in the question file; the engine maps canonical IDs (e.g. `alpha`, `gamma`) per gender when scoring. The following taxonomy keys are therefore **not** directly named in questions — **expected**:

`alpha_iota_female`, `alpha_unicorn_female`, `alpha_xi_female`, `beta_nu_female`, `beta_rho_female`, `dark_*_female`, `delta_mu_female`, `gamma_female`, `gamma_theta_female`, `omega_female`, `phi_female`, `sigma_feminist_female`.

---

## C. Subtype logic

- `pickSubtype(primary)` ranks subtypes by **`this.archetypeScores[id].phase2`** only.
- If top subtype phase2 ≤ 0, no subtype swap.

**Implication:** A user can have a higher **weighted** score on subtype A but be labeled subtype B if B wins phase2. Document for UX/research; change only if product wants weighted or blended subtype selection.

---

## D. Secondary and tertiary

- **Secondary:** `sortedArchetypes[1].score > primary.score × 0.25`
- **Tertiary:** `sortedArchetypes[2].score > primary.score × 0.15`

Confidence percentages use each archetype’s **weighted** score over the **sum of all weighted scores** in the sorted list (all keys in `archetypeScores`).

---

## E. Context adjustments (sanity)

- **Aspiration:** multiplies **phase1** and **phase2** only (`calculateFinalScores`).
- **Respect / provision / aesthetics:** multiply phase1–2; phase3 uses damped factor `(1 + (mult − 1) × 0.5)`.
- **Provision (male, low):** explicit multipliers for `alpha*`, `beta*`, `delta*`, etc. in `analyzePhase5Results`.

No empty adjustment tables were found; keys align with canonical IDs.

---

## F. P0 fix: Phase 4 gender mapping

**Issue:** `scorePhase4Answer` incremented `this.archetypeScores[archId]` using vignette IDs such as `'alpha'` for **all** genders. Female scoring uses `alpha_female`, etc., so `archetypeScores['alpha']` was often **undefined** → **TypeError** on `.phase4`, or silent mis-scoring if mixed state existed.

**Fix:** Apply the same `femaleMapping` as other phases, initialize missing score objects, then add to `targetArchId`.

---

## G. IQ funnel (static review)

- `filterQuestionsByIQ(questions, targetCount)` scores each question by overlap with IQ-correlated archetype lists (e.g. lower IQ → beta, delta, omega) and slices to `targetCount`.
- **Risk (untested):** distribution shift vs full questionnaire — reserve for Monte Carlo or A/B (see plan §H).

---

## H. Follow-ups (not executed)

1. **Monte Carlo / scripted personas** — histogram of primary **family** vs [`archetype-spread.js`](../archetype-data/archetype-spread.js) cluster totals.
2. **Automated regression** — minimal unit tests for `scorePhase4Answer` with `gender === 'female'` and one vignette.
3. **Optional:** Deduplicate `femaleMapping` across methods into one helper to avoid drift.

---

## Files changed in this audit execution

- [`archetype-engine.js`](../archetype-engine.js) — `scorePhase4Answer` gender map + initialization.
- [`docs/ARCHETYPE_WEIGHTING_AUDIT_REPORT.md`](./ARCHETYPE_WEIGHTING_AUDIT_REPORT.md) — this report.
- [`scripts/archetype-audit-extract.mjs`](../scripts/archetype-audit-extract.mjs) — coverage helper (rerunnable).

Run `npm run copy:www` after engine changes for Capacitor/`www/` parity.

---

## Balancing changes (post-audit)

Applied in `archetype-engine.js` to align outcomes with the audit findings:

1. **Subtype selection (`pickSubtype`)** — Subtypes are ranked by **full weighted score** (all phases), with **Phase 2 as tie-breaker**. Previously only Phase 2 was used, which could disagree with the calibrated total. A subtype is shown only if **either** weighted **or** Phase 2 is positive for the top subtype.

2. **Respect context (`low_high`)** — The Beta/Delta uplift list now includes **`beta_iota`** and **`beta_rho`**, not only `beta`, `beta_nu`, `beta_kappa`, `delta`, `delta_mu`, so social-respect / business-respect splits treat all common Beta line variants consistently.

3. **Male low provision** — Added nudges for previously missing canonical IDs: **`beta_iota`**, **`beta_rho`**, **`dark_delta`** (up-weight), **`sigma_kappa`**, **`sigma_lambda`** (slight down-weight with other non-provider Sigmas), matching the intent of reducing Alpha over-attribution when provision is strained.

4. **IQ funnel (`filterQuestionsByIQ`)** — Expanded archetype tags used for relevance: **lower IQ** adds `beta_kappa`, `beta_rho`; **higher IQ** adds `gamma_nu`, `gamma_pi`, `sigma_lambda` so subtype-heavy questions are more likely to survive the reduced-question funnel.
