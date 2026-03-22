# SMV weighting: aesthetics, fertility, and effective shares

Maintainer reference for how **physical aesthetics** and **fertility markers** enter Sexual Market Value (SMV) scoring. Implementation: [`attraction-data.js`](../attraction-data.js), [`attraction-engine.js`](../attraction-engine.js), shared math [`shared/attraction-smv-core.mjs`](../shared/attraction-smv-core.mjs).

## Pipeline

1. For each cluster, raw Likert values (1–10 stepped scale) are collected per **subcategory**. Within each subcategory, a **weighted mean** of raw scores is computed (`weight` on each question, default **1** if omitted), then mapped to a **percentile** via a sigmoid (`scoreToPercentile` in `shared/attraction-smv-core.mjs`).
2. **Cluster** percentile (coalition, reproductive) remains the **unweighted** mean of all answered raw values in that cluster, then `scoreToPercentile` — unchanged from legacy behavior.
3. **Axis of Attraction** cluster percentile is **not** that raw mean: subcategory percentiles are blended with **`AXIS_SUBCATEGORY_WEIGHTS`** (male vs female). Missing subcategories are dropped and weights renormalized.
4. **Male `radActivity`** overrides the subcategory percentile: weighted `rad_1`–`rad_4` plus anti-rad floor (`RAD_ACTIVITY_TYPE_MODIFIER` in `attraction-data.js`). Rad questions still participate in weighted subcategory math before override.
5. **Overall SMV** = dot product of **cluster percentiles** with **`MALE_CLUSTER_WEIGHTS`** or **`FEMALE_CLUSTER_WEIGHTS`**.

## Cluster weights (overall SMV)

|        | coalitionRank | reproductiveConfidence | axisOfAttraction |
|--------|---------------|------------------------|------------------|
| Male   | 0.25          | 0.35                   | 0.40             |
| Female | 0.20          | 0.30                   | 0.50             |

Female axis carries **50%** of overall SMV vs **40%** for males.

## Axis sub-blend weights

| Male subcategory      | Weight |
|-----------------------|--------|
| radActivity           | 0.30   |
| performanceStatus     | 0.30   |
| physicalGenetic       | 0.25   |
| humour                | 0.15   |

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
| physicalGenetic        | **10%**         | —                 |
| fertility              | —               | **15%**           |

Within `physicalGenetic` / `fertility`, each item’s influence on the subcategory raw composite is **`weight / sum(weights)`** (not equal slices). Higher `weight` = more pull on that subcategory’s percentile.

### Male — `physicalGenetic` weights (sum ≈ 10.35)

| ID      | Weight | Role |
|---------|--------|------|
| phys_1  | 1.2    | Face / features |
| phys_2  | 1.0    | Fitness / strength / capability |
| phys_6  | 1.1    | Body composition as seen |
| phys_7  | 0.9    | Symmetry / proportions (self-report) |
| phys_8  | 1.0    | Skin, hair, teeth |
| phys_9  | 0.85   | Voice, posture, first-30s presence |
| phys_10 | 0.8    | Visible difference — **market friction** read (not worth) |
| phys_3  | 1.0    | Height bracket |
| phys_4  | 1.0    | Grooming / hygiene |
| phys_5  | 1.0    | Energy / vitality |
| phys_11 | 0.65   | Net overall first-impression calibration |

### Female — `fertility` weights (sum ≈ 7.90)

| ID     | Weight | Role |
|--------|--------|------|
| fert_1 | 1.2    | Face / feminine features |
| fert_2 | 1.15   | Waist–hip / midsection |
| fert_4 | 1.0    | Skin, hair, teeth vitality |
| fert_5 | 0.9    | Symmetry / proportions |
| fert_6 | 1.0    | Overall leanness / shape (aside from WHR) |
| fert_7 | 0.8    | Visible difference — market friction read |
| fert_3 | 1.2    | Age bracket |
| fert_8 | 0.65   | Net overall first-impression calibration |

## Item → construct map (what is actually scored)

### Male — `physicalGenetic`

See table above. **phys_10** / **fert_7** are framed as *typical stranger/early dating filter*, not a moral score. In the UI they are **`optional`**: the respondent may press Next without selecting; the item is **omitted** from the weighted mean (weights renormalize over answered items only).

### Female — `fertility`

See table above. **fert_2** is WHR-specific; **fert_6** is general shape/leanness to avoid double-counting the same construct.

### Cross-cluster overlap (female)

Coalition **status signaling** and **selectivity** are separate subcategories; they add through **coalition** (20%), not the fertility bucket.

## Preferences vs scored pillars (male)

- **`physical_standards`** contributes to **delusion index** vs **whole `axisOfAttraction` percentile**, not `physicalGenetic` alone. The report can show a **Market Position** note when standards are high but Physical/Genetic is low (`getMaleStandardsContextNote` in `attraction-engine.js`).
- **`fertility_priority`** contributes to **delusion index** vs **`reproductiveConfidence`**.

## Sensitivity check (synthetic, mid baseline)

Script: `node scripts/smv-sensitivity-check.mjs`  
Baseline: all axis/coalition/repro items at mid scale value **5**; male `rad_1 = 6` (rad scale).

| Profile                         | overall | axis  | physicalGenetic / fertility |
|---------------------------------|--------:|------:|----------------------------:|
| Male baseline                   | 42.53   | 43.72 | 41.74                       |
| Male all phys max               | 47.89   | 57.10 | 95.26                       |
| Male all phys min               | 38.83   | 34.47 | 4.74                        |
| Male face high / body shape low | 42.78   | 44.34 | 44.23                       |
| Male face low / body shape high | 42.64   | 43.99 | 42.83                       |
| Male phys_10 early-filter min   | 42.05   | 42.51 | 36.90                       |
| Female baseline                 | 46.42   | 48.90 | 41.74                       |
| Female all fert max             | 54.44   | 64.96 | 95.26                       |
| Female all fert min             | 40.87   | 37.80 | 4.74                        |
| Female face high / shape low    | 47.04   | 50.15 | 45.90                       |
| Female face low / shape high    | 46.48   | 49.03 | 42.15                       |
| Female fert_7 early-filter min  | 45.46   | 46.99 | 35.36                       |

**Swings (all phys / all fert items min→max):**

- Male: **Δ axis ≈ 22.6** percentile points; **Δ overall ≈ 9.1**.
- Female: **Δ axis ≈ 27.2**; **Δ overall ≈ 13.6**.

Face vs body-shape splits move the fertility/physical subscore modestly at baseline mid (other items anchor near 5).

Re-run the script after changing questions, weights, or `scoreToPercentile`.

## Design intent vs alternatives (stakeholder alignment)

**Current intent (as implemented):**

- **Male axis** emphasises **mission/status/rad** (60% combined rad + performance) over **physicalGenetic** (25%).
- **Female axis** splits **fertility** and **riskCost** at **30% / 30%**.
- **Overall** female SMV tilts **more** toward the axis than male overall does.

**If product intent shifts toward “looks-first” male SMV:**

- Raise `physicalGenetic` toward **0.30–0.35** in `AXIS_SUBCATEGORY_WEIGHTS.male` and reduce `performanceStatus` and/or `radActivity` proportionally (keep sum = 1).

**Phase 2 (optional):** Split axis into `physicalFace` / `physicalBody` sub-blends with their own rows in `AXIS_SUBCATEGORY_WEIGHTS` for direct control of face vs body share of overall SMV.

Document any adopted change here and keep [`scripts/smv-sensitivity-check.mjs`](../scripts/smv-sensitivity-check.mjs) question IDs and weights aligned with [`attraction-data.js`](../attraction-data.js).
