# Relationship Weighting Calibration Note

Date: 2026-03-18

## Scope

Stage-1 relationship triage weighting in:
- `relationship-data/compatibility-points.js`
- `relationship-engine.js` (formula unchanged: `raw * tierWeight * point.weight`)

## Calibration method

- Compared baseline `A0` vs candidates `C1`, `C2`, `C3` on 12 synthetic Stage-1 profiles.
- Included stress profiles by tier, mixed realistic profiles, and boundary/tie profiles.
- Evaluated weak-link top-7 alignment, reversal counts, boundary robustness, and Stage-2 routing proxies.

## Result

Selected candidate: `C3` (two-layer, gentlest calibrated slope).

Why:
- Preserved intended weak-link capture patterns across stress and mixed profiles.
- Produced the lowest reversal count in the calibration run.
- Reduced over-suppression of lower tiers while keeping tier ordering intact.

## Applied coefficients

- `IMPACT_TIER_WEIGHTS`:
  - very-high: `1.00`
  - high: `0.94`
  - moderate-high: `0.88`
  - moderate: `0.82`

- Point weights by tier:
  - very-high points: `1.00`
  - high points: `0.96`
  - moderate-high points: `0.92`
  - moderate points: `0.88`

Effective tier multipliers after calibration:
- very-high: `1.000`
- high: `0.902`
- moderate-high: `0.810`
- moderate: `0.722`

## 11D governance trigger

Current governance level is minimal. Upgrade to standard governance (`11B`) when either condition is met:
- two additional weighting edits are made, or
- a new Stage-1 compatibility tier is introduced.
