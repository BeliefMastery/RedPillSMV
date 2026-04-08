/**
 * Bounded nudge to polarity composite from completed archetype (questionnaire remains primary).
 * @see docs/SUITE_CALIBRATION.md
 */

import {
  ARCHETYPE_POLARITY_CALIBRATION_VERSION,
  ARCHETYPE_POLARITY_MAX_DELTA,
  ARCHETYPE_POLARITY_BIAS_BY_CLUSTER
} from './suite-calibration-config.mjs';

export { ARCHETYPE_POLARITY_CALIBRATION_VERSION, ARCHETYPE_POLARITY_MAX_DELTA, ARCHETYPE_POLARITY_BIAS_BY_CLUSTER };

/**
 * @param {string|null|undefined} archetypeId e.g. alpha_male, dark_gamma_female
 * @returns {keyof typeof ARCHETYPE_POLARITY_BIAS_BY_CLUSTER|null}
 */
export function clusterKeyFromArchetypeId(archetypeId) {
  if (!archetypeId || typeof archetypeId !== 'string') return null;
  let id = archetypeId.toLowerCase().replace(/^dark_/, '');
  const first = id.split('_')[0];
  if (!first) return null;
  const cap = first.charAt(0).toUpperCase() + first.slice(1);
  return cap in ARCHETYPE_POLARITY_BIAS_BY_CLUSTER ? cap : null;
}

/**
 * @param {object|null} archetypeSnapshot from getSuiteSnapshots().archetype
 * @param {number} rawNormalizedScore 0..1
 * @returns {{ adjustedNormalizedScore: number, rawNormalizedScore: number, delta: number, version: number, cluster: string|null }}
 */
export function applyArchetypePolarityCalibration(archetypeSnapshot, rawNormalizedScore) {
  const raw = Math.max(0, Math.min(1, Number(rawNormalizedScore) || 0));
  const primary = archetypeSnapshot?.analysisData?.primaryArchetype;
  const id = primary?.id || '';
  const cluster = clusterKeyFromArchetypeId(id);
  let bias = cluster ? ARCHETYPE_POLARITY_BIAS_BY_CLUSTER[cluster] : 0;
  let delta = Math.max(-ARCHETYPE_POLARITY_MAX_DELTA, Math.min(ARCHETYPE_POLARITY_MAX_DELTA, bias));
  const adjusted = Math.max(0, Math.min(1, raw + delta));
  return {
    adjustedNormalizedScore: adjusted,
    rawNormalizedScore: raw,
    delta: adjusted - raw,
    version: ARCHETYPE_POLARITY_CALIBRATION_VERSION,
    cluster
  };
}
