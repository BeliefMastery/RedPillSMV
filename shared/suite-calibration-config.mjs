/**
 * Single source of truth for cross-assessment calibration constants.
 * @see docs/SUITE_CALIBRATION.md — tuning workflow and success metrics.
 */

/** Bump when polarity nudge math or bias table changes (persisted on analysisData.suiteCalibration). */
export const ARCHETYPE_POLARITY_CALIBRATION_VERSION = 2;

/**
 * Max absolute shift on polarity composite (0–1). Keeps questionnaire primary;
 * lower values reduce category flips near thresholds (see suite-calibration-check.mjs).
 */
export const ARCHETYPE_POLARITY_MAX_DELTA = 0.024;

/**
 * Directional bias toward masculine pole (+) or feminine pole (−) from primary archetype cluster.
 * Used for: (1) polarity normalized score nudge, (2) attraction SMV cluster deltas (scaled separately).
 * v2: ~15% softer than v1 to cut boundary-only category flips while preserving directionality.
 */
export const ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER = {
  Alpha: 0.0153,
  Beta: -0.0102,
  Gamma: 0.0051,
  Delta: 0.0085,
  Sigma: 0.0136,
  Omega: -0.0153,
  Phi: 0
};

/** Alias — polarity composite uses this table directly (capped by ARCHETYPE_POLARITY_MAX_DELTA). */
export const ARCHETYPE_POLARITY_BIAS_BY_CLUSTER = ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER;

/**
 * Attraction layer: same directional story as polarity by default (coupled tuning).
 * To tune SMV impact independently of polarity composite, replace with a copy that diverges.
 */
export const ARCHETYPE_ATTRACTION_BIAS_BY_CLUSTER = ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER;

/** Bump when attraction post-pass math or caps change (persisted on smv.suiteCalibration). */
export const ATTRACTION_SUITE_CALIBRATION_VERSION = 2;

/** SMV cluster percentile points — hard cap per cluster vs questionnaire. */
export const ATTRACTION_CLUSTER_DELTA_CAP = 3;

/** Overall SMV points — cap vs questionnaire overall after cluster nudge + reweighted dot. */
export const ATTRACTION_OVERALL_DELTA_CAP = 2;

/** Maps archetype directional bias into coalition / axis / reproductive cluster deltas (before cap). */
export const ATTRACTION_ARCHETYPE_CLUSTER_SCALE = {
  coalition: 90,
  axis: 100,
  reproductive: -40
};

/** Polarity normalized score (0 fem — 1 masc) → cluster delta scaling (before cap). */
export const ATTRACTION_POLARITY_T_MULTIPLIERS = {
  male: { coalition: 2.2, axis: 2.5, reproductive: 1.2 },
  female: { coalition: 2.0, axis: 2.5, reproductive: 1.4 }
};
