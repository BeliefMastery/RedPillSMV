/**
 * Post-questionnaire SMV nudge from archetype + polarity snapshots (capped).
 * @see docs/SUITE_CALIBRATION.md
 */

import { computeOverallSmv } from './attraction-smv-core.mjs';
import { clusterKeyFromArchetypeId } from './archetype-polarity-calibration.mjs';
import {
  ATTRACTION_SUITE_CALIBRATION_VERSION,
  ATTRACTION_CLUSTER_DELTA_CAP,
  ATTRACTION_OVERALL_DELTA_CAP,
  ARCHETYPE_ATTRACTION_BIAS_BY_CLUSTER,
  ATTRACTION_ARCHETYPE_CLUSTER_SCALE,
  ATTRACTION_POLARITY_T_MULTIPLIERS
} from './suite-calibration-config.mjs';

export { ATTRACTION_SUITE_CALIBRATION_VERSION };

function fnv1aHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function clusterDeltasFromArchetype(archetypeSnapshot) {
  const primary = archetypeSnapshot?.analysisData?.primaryArchetype;
  const cluster = clusterKeyFromArchetypeId(primary?.id || '');
  if (!cluster) return { coalitionRank: 0, reproductiveConfidence: 0, axisOfAttraction: 0 };
  const bias = ARCHETYPE_ATTRACTION_BIAS_BY_CLUSTER[cluster] ?? 0;
  const { coalition: sc, axis: sa, reproductive: sr } = ATTRACTION_ARCHETYPE_CLUSTER_SCALE;
  const coalition = bias * sc;
  const axis = bias * sa;
  const repro = bias * sr;
  return {
    coalitionRank: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, coalition)),
    reproductiveConfidence: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, repro)),
    axisOfAttraction: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, axis))
  };
}

function clusterDeltasFromPolarity(polaritySnapshot, gender) {
  const norm = polaritySnapshot?.analysisData?.overallTemperament?.normalizedScore;
  if (typeof norm !== 'number') return { coalitionRank: 0, reproductiveConfidence: 0, axisOfAttraction: 0 };
  const center = 0.5;
  const t = (norm - center) * 2;
  const m = gender === 'male' ? ATTRACTION_POLARITY_T_MULTIPLIERS.male : ATTRACTION_POLARITY_T_MULTIPLIERS.female;
  const coalition = t * m.coalition;
  const axis = t * m.axis;
  const repro = t * m.reproductive;
  return {
    coalitionRank: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, coalition)),
    reproductiveConfidence: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, repro)),
    axisOfAttraction: Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, axis))
  };
}

function addDeltaObjects(a, b) {
  const cap2 = ATTRACTION_CLUSTER_DELTA_CAP * 2;
  return {
    coalitionRank: Math.max(-cap2, Math.min(cap2, (a.coalitionRank || 0) + (b.coalitionRank || 0))),
    reproductiveConfidence: Math.max(-cap2, Math.min(cap2, (a.reproductiveConfidence || 0) + (b.reproductiveConfidence || 0))),
    axisOfAttraction: Math.max(-cap2, Math.min(cap2, (a.axisOfAttraction || 0) + (b.axisOfAttraction || 0)))
  };
}

function clampClusterDelta(d) {
  return Math.max(-ATTRACTION_CLUSTER_DELTA_CAP, Math.min(ATTRACTION_CLUSTER_DELTA_CAP, d));
}

/**
 * @param {object} smv — engine SMV object with clusters + overall
 * @param {object|null} archetypeSnapshot
 * @param {object|null} polaritySnapshot
 * @param {'male'|'female'} gender
 * @param {Record<string, number>} clusterWeights — same as engine cluster weights (caller supplies to avoid CJS import in Node scripts).
 * @returns {object} patched smv (mutates clusters + overall + suiteCalibration)
 */
export function applyAttractionSuiteCalibration(smv, archetypeSnapshot, polaritySnapshot, gender, clusterWeights) {
  if (!smv || !smv.clusters) return smv;
  if (!clusterWeights || typeof clusterWeights !== 'object') return smv;

  const archD = clusterDeltasFromArchetype(archetypeSnapshot);
  const polD = clusterDeltasFromPolarity(polaritySnapshot, gender);
  const sum = addDeltaObjects(archD, polD);

  const keys = ['coalitionRank', 'reproductiveConfidence', 'axisOfAttraction'];
  const clusterDeltasApplied = {};
  const nextClusters = { ...smv.clusters };

  keys.forEach((k) => {
    const d = clampClusterDelta(sum[k] || 0);
    clusterDeltasApplied[k] = d;
    const base = typeof smv.clusters[k] === 'number' ? smv.clusters[k] : 0;
    nextClusters[k] = Math.max(0, Math.min(100, base + d));
  });

  let newOverall = computeOverallSmv(nextClusters, clusterWeights);
  const rawOverall = typeof smv.overall === 'number' ? smv.overall : newOverall;
  const overallDelta = Math.max(-ATTRACTION_OVERALL_DELTA_CAP, Math.min(ATTRACTION_OVERALL_DELTA_CAP, newOverall - rawOverall));
  newOverall = Math.max(0, Math.min(100, rawOverall + overallDelta));

  const primaryId = archetypeSnapshot?.analysisData?.primaryArchetype?.id || '';
  const polNorm = polaritySnapshot?.analysisData?.overallTemperament?.normalizedScore;
  const inputsHash = fnv1aHash(
    [String(ATTRACTION_SUITE_CALIBRATION_VERSION), primaryId, String(polNorm ?? ''), gender].join('|')
  );

  smv.clusters = nextClusters;
  smv.overall = newOverall;
  smv.suiteCalibration = {
    version: ATTRACTION_SUITE_CALIBRATION_VERSION,
    clusterDeltas: clusterDeltasApplied,
    overallDeltaApplied: newOverall - rawOverall,
    rawOverall,
    calibratedOverall: newOverall,
    inputsHash
  };

  return smv;
}
