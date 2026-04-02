# SMV weighting: aesthetics, fertility, and effective shares

Maintainer reference for how **physical aesthetics** and **fertility markers** enter Sexual Market Value (SMV) scoring. Implementation: [`attraction-data.js`](../attraction-data.js), [`attraction-engine.js`](../attraction-engine.js), shared math [`shared/attraction-smv-core.mjs`](../shared/attraction-smv-core.mjs).

## Weighting policy: preferences vs numeric model

- **Cluster weights** (`MALE_CLUSTER_WEIGHTS` / `FEMALE_CLUSTER_WEIGHTS`) and **axis sub-blend weights** (`AXIS_SUBCATEGORY_WEIGHTS`) are **fixed** in code so overall SMV stays **comparable** across respondents and runs.
- **Market preference answers** (partner age band, relationship goal, physical standards, fertility priority, height/income/status requirements, etc.) are used for:
  - **Delusion index** (standards vs scored position),
  - **Narrative “Preferences vs scored pillars”** blocks: [`getMaleStandardsContextNote`](../attraction-engine.js) and [`getFemaleStandardsContextNote`](../attraction-engine.js),
  - **Target market** copy where applicable.
- They **do not** renormalize or rescale cluster/axis weights at runtime. If product later adopts **preference-conditioned weighting**, document new rules here, cap deltas, and extend `scripts/smv-sensitivity-check.mjs`.

### Male age vs stated partner ages (preferences layer only)

[`shared/male-age-gap.js`](../shared/male-age-gap.js) derives:

- **gapYounger** = respondent `age − target_age_max` (positive when the oldest acceptable partner is younger than self).
- **valueLeverage** = `0.45×overall + 0.35×axisOfAttraction + 0.20×coalitionRank` from scored SMV only (no preference fields).
- **Delusion index:** a smooth **ageDelusionContribution** (buffered by valueLeverage) feeds the male branch of the delusion calculation; higher composite value offsets the same calendar gap.
- **Realistic-options / mate-quality copy:** an internal **effectiveOverall** (clamped) is passed to [`computeTargetMarketSummary`](../shared/attraction-target-market-summary.js) for men only; the headline overall percentile in the report remains the raw weighted cluster SMV.
- **Younger-partner access band** (`favorable` / `mixed` / `strained`): computed for all males; **report + export** surface the badge only when headline overall is **below ~50** and the band is **`mixed` or `strained`** (favorable is not shown in the opening summary). Delusion and realistic-options copy still use the full `male-age-gap` context.

Female scoring and delusion paths are unchanged.

## Pipeline

1. For each cluster, raw Likert values (1–10 stepped scale) are collected per **subcategory**. Within each subcategory, a **weighted mean** of raw scores is computed (`weight` on each question, default **1** if omitted), then mapped to a **percentile** via a sigmoid (`scoreToPercentile` in `shared/attraction-smv-core.mjs`).
2. **Cluster** percentile (coalition, reproductive) remains the **unweighted** mean of all answered raw values in that cluster, then `scoreToPercentile` — unchanged from legacy behavior.
3. **Axis of Attraction** cluster percentile is **not** that raw mean: subcategory percentiles are blended with **`AXIS_SUBCATEGORY_WEIGHTS`** (male vs female). Missing subcategories are dropped and weights renormalized.
4. **Male `radActivity`** overrides the subcategory percentile: weighted `rad_1`–`rad_4` plus anti-rad floor (`RAD_ACTIVITY_TYPE_MODIFIER` in `attraction-data.js`). Rad questions still participate in weighted subcategory math before override. **Product framing:** this pillar is meant to read as how *cool / novel / radical* pursuits *outside the relationship* are—benign **competition for the mate’s share of attention** and **boredom mitigation**—not generic “mission” language alone.
5. **Overall SMV** = dot product of **cluster percentiles** with **`MALE_CLUSTER_WEIGHTS`** or **`FEMALE_CLUSTER_WEIGHTS`**.

## Cluster weights (overall SMV)

|        | coalitionRank | reproductiveConfidence | axisOfAttraction |
|--------|---------------|------------------------|------------------|
| Male   | 0.25          | 0.35                   | 0.40             |
| Female | 0.20          | 0.30                   | 0.50             |

Female axis carries **50%** of overall SMV vs **40%** for males.

## Axis sub-blend weights (code — source of truth)

| Male subcategory   | Weight |
|--------------------|--------|
| radActivity        | 0.15   |
| performanceStatus  | 0.35   |
| physicalGenetic    | 0.35   |
| humour             | 0.15   |

| Female subcategory | Weight |
|--------------------|--------|
| fertility          | 0.30   |
| riskCost           | 0.30   |
| personality        | 0.20   |
| factorsHidden      | 0.20   |

## Effective share of overall SMV (all axis subs present)

Approximate **slot** for a pillar = `axisClusterWeight × subWeight`:

| Path                   | Male (40% axis) | Female (50% axis) |
|------------------------|-----------------|-------------------|
| physicalGenetic        | **14%**         | —                 |
| fertility              | —               | **15%**           |

Within `physicalGenetic` / `fertility`, each item’s influence on the subcategory raw composite is **`weight / sum(weights)`** (not equal slices). Higher `weight` = more pull on that subcategory’s percentile.

### Male — `performanceStatus` weights (sum ≈ 7.85)

| ID      | Weight | Role |
|---------|--------|------|
| perf_1  | 1.0    | Social status / influence |
| perf_2  | 1.0    | Income bracket |
| perf_3  | 1.0    | Generosity / sharing resources |
| perf_4  | 1.0    | Productivity / output |
| perf_5  | 1.0    | Popularity / regard in circles |
| perf_6  | 1.0    | Standout talent |
| perf_7  | 0.95   | Financial solidity beyond income (savings, debt, runway) |
| perf_8  | 0.9    | Verifiable professional credibility |

### Male — `physicalGenetic` weights (sum ≈ 11.45)

| ID      | Weight | Role |
|---------|--------|------|
| phys_1  | 1.2    | Face / features |
| phys_2  | 1.0    | Fitness / strength / capability |
| phys_6  | 1.1    | Body composition as seen |
| phys_7  | 0.9    | Balance of features / body proportions (plain-language self-report; examples in stem) |
| phys_8  | 1.0    | Skin, hair, teeth |
| phys_9  | 0.85   | Voice, posture, early presence |
| phys_10 | 0.8    | Visible difference — **market friction** read (not worth) |
| phys_3  | 1.0    | Height bracket |
| phys_4  | 1.0    | Grooming / hygiene |
| phys_12 | 0.95   | Style / aesthetic presentation (fit, taste, cohesive look) |
| phys_5  | 1.0    | Energy / vitality |
| phys_11 | 0.65   | Net overall first-impression calibration |

### Male — `humour` weights (sum = 5.0)

| ID       | Weight | Role |
|----------|--------|------|
| humour_1 | 1.0    | Making others laugh |
| humour_2 | 1.0    | Spotting irony / playful angles |
| humour_3 | 1.0    | Defusing tension with humour |
| humour_4 | 1.0    | Insight / stimulating conversation (beyond jokes) |
| humour_5 | 1.0    | Companionship quality (warmth, attunement, extended ease) |

### Female — `fertility` weights (sum ≈ 7.90)

| ID     | Weight | Role |
|--------|--------|------|
| fert_1 | 1.2    | Face / feminine features |
| fert_2 | 1.15   | Waist vs hips **silhouette** (mirror/fitted-clothes categories; not tape-measured WHR) |
| fert_4 | 1.0    | Skin, hair, teeth vitality |
| fert_5 | 0.9    | Balance of features / proportions (examples in stem) |
| fert_6 | 1.0    | Overall leanness / shape (aside from waist–hip line) |
| fert_7 | 0.8    | Visible difference — market friction read |
| fert_3 | 1.2    | Age bracket |
| fert_8 | 0.65   | Net overall first-impression calibration |

## Item → construct map (what is actually scored)

### Male — `physicalGenetic`

See table above. **phys_10** / **fert_7** are framed as *typical stranger/early dating filter*, not a moral score. In the UI they are **`optional`**: the respondent may press Next without selecting; the item is **omitted** from the weighted mean (weights renormalize over answered items only).

### Male — `performanceStatus` and `humour`

**perf_7** and **perf_8** close gaps between “income” and broader **wealth/finance** and **verifiable status/credentials**. **phys_12** adds explicit **aesthetic/style** alongside grooming. **humour_4** and **humour_5** split **intelligence/conversational substance** and **companionship** from humour delivery alone.

### Female — `fertility`

See table above. **fert_2** is silhouette / waist–hip **read**, not clinical ratio; **fert_6** is general shape/leanness to avoid double-counting the same construct.

### Cross-cluster overlap (female)

Coalition **status signaling** and **selectivity** are separate subcategories; they add through **coalition** (20%), not the fertility bucket.

## Preferences vs scored pillars

### Male

- **`physical_standards`** contributes to **delusion index** vs **whole `axisOfAttraction` percentile**, not the looks/physical sub-bar alone. The report can show a **Market Position** note when standards are high but that subscore is low (`getMaleStandardsContextNote` in `attraction-engine.js`).
- **`fertility_priority`** contributes to **delusion index** vs **`reproductiveConfidence`**.

### Female

- **`height_requirement`**, **`income_requirement`**, **`status_requirement`**, and **`relationship_goal`** can trigger **`getFemaleStandardsContextNote`**: narrative only, comparing stated filters to Coalition Rank, Reproductive Confidence, and (for long-term goals) Fertility & Health subscore.

## Sensitivity check (synthetic, mid baseline)

Script: `node scripts/smv-sensitivity-check.mjs`  
Baseline: all axis/coalition/repro items at mid scale value **5**; male `rad_1 = 6` (rad scale).

| Profile                         | overall | axis  | physicalGenetic / fertility |
|---------------------------------|--------:|------:|----------------------------:|
| Male baseline                   | 42.14   | 42.73 | 41.74                       |
| Male all phys max               | 49.63   | 61.46 | 95.26                       |
| Male all phys min               | 36.96   | 29.78 | 4.74                        |
| Male face high / body shape low | 42.46   | 43.53 | 44.02                       |
| Male face low / body shape high | 42.28   | 43.08 | 42.74                       |
| Male phys_10 early-filter min   | 41.52   | 41.17 | 37.29                       |
| Female baseline                 | 46.42   | 48.90 | 41.74                       |
| Female all fert max             | 54.44   | 64.96 | 95.26                       |
| Female all fert min             | 40.87   | 37.80 | 4.74                        |
| Female face high / shape low    | 47.04   | 50.15 | 45.90                       |
| Female face low / shape high    | 46.48   | 49.03 | 42.15                       |
| Female fert_7 early-filter min  | 45.46   | 46.99 | 35.36                       |

**Swings (all phys / all fert items min→max):**

- Male: **Δ axis ≈ 31.7** percentile points; **Δ overall ≈ 12.7**.
- Female: **Δ axis ≈ 27.2**; **Δ overall ≈ 13.6**.

Face vs body-shape splits move the fertility/physical subscore modestly at baseline mid (other items anchor near 5).

Re-run the script after changing questions, weights, or `scoreToPercentile`.

## Design intent vs alternatives (stakeholder alignment)

**Current intent (as implemented):**

- **Male axis** blends **rad (15%)**, **performance (35%)**, **physicalGenetic (35%)**, **humour (15%)**.
- **Female axis** splits **fertility** and **riskCost** at **30% / 30%**.
- **Overall** female SMV tilts **more** toward the axis than male overall does.

## Weighting + shorthand guardrails (must preserve model integrity)

- Do not add new top-level clusters for future factors (including "game"). Integrate within existing shorthand buckets:
  - Male: 3C's, 4P's, Axis (wealth/finance/status/performance/productivity/talent/popularity; looks/physical/genetic/aesthetic; humour/intelligence/companionship), with Rad Activity as modifier (cool/novel outside pursuits; mate competition for attention; boredom mitigation).
  - Female: 3S's, Reproductive Confidence (Paternity Certainty, Nurturing Standard, Collaborative Trust), Axis (Fertility & Health, Risk Cost, Personality, Factors Hidden).
- Any new factor must map to an existing scored construct before wording is updated in reports. If no clean mapping exists, treat it as narrative-only until scoring design is approved.
- "Game" is currently interpretation-level language describing execution quality (social calibration, frame stability, escalation judgment, logistics follow-through) and is not a separately weighted pillar.
- Keep shorthand stability: do not rename core shorthand families or move constructs across families without an explicit versioned model-change decision.
- Weight-change guardrail: if a proposed factor shifts effective overall share by more than approximately 2 percentage points for any existing shorthand family, require a sensitivity run and written rationale.
- Always rerun `scripts/smv-sensitivity-check.mjs` after question/weight changes and document before/after deltas in this file.

**If product intent shifts toward “looks-first” male SMV:**

- Raise `physicalGenetic` toward **0.30–0.35** in `AXIS_SUBCATEGORY_WEIGHTS.male` and reduce `performanceStatus` and/or `radActivity` proportionally (keep sum = 1).

**Phase 2 (optional):** Split axis into `physicalFace` / `physicalBody` sub-blends with their own rows in `AXIS_SUBCATEGORY_WEIGHTS` for direct control of face vs body share of overall SMV.

Document any adopted change here and keep [`scripts/smv-sensitivity-check.mjs`](../scripts/smv-sensitivity-check.mjs) question IDs and weights aligned with [`attraction-data.js`](../attraction-data.js).
