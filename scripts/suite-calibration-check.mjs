/**
 * Regression checks for cross-assessment calibration (polarity category boundaries + attraction caps).
 * Run: node scripts/suite-calibration-check.mjs
 * Thresholds must stay aligned with temperament-engine category assignment + temperament-data/temperament-scoring.js
 */

import { applyArchetypePolarityCalibration } from '../shared/archetype-polarity-calibration.mjs';
import { applyAttractionSuiteCalibration } from '../shared/attraction-suite-calibration.mjs';
import {
  ARCHETYPE_POLARITY_MAX_DELTA,
  ATTRACTION_CLUSTER_DELTA_CAP,
  ATTRACTION_OVERALL_DELTA_CAP,
  ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER
} from '../shared/suite-calibration-config.mjs';

/** Sync with TEMPERAMENT_SCORING.thresholds — keep in sync with temperament-data/temperament-scoring.js */
const TH = {
  highly_masculine: 0.75,
  predominantly_masculine: 0.6,
  balanced_masculine: 0.55,
  balanced: 0.45,
  balanced_feminine: 0.4,
  predominantly_feminine: 0.25,
  highly_feminine: 0.0
};

function temperamentCategory(normalizedScore) {
  const t = TH;
  if (normalizedScore >= t.highly_masculine) return 'highly_masculine';
  if (normalizedScore >= t.predominantly_masculine) return 'predominantly_masculine';
  if (normalizedScore >= t.balanced_masculine) return 'balanced_masculine';
  if (normalizedScore >= t.balanced) return 'balanced';
  if (normalizedScore >= t.balanced_feminine) return 'balanced_feminine';
  if (normalizedScore >= t.predominantly_feminine) return 'predominantly_feminine';
  return 'highly_feminine';
}

const ARCHETYPE_IDS_BY_CLUSTER = {
  Alpha: 'alpha_male',
  Beta: 'beta_male',
  Gamma: 'gamma_male',
  Delta: 'delta_male',
  Sigma: 'sigma_male',
  Omega: 'omega_male',
  Phi: 'phi_male'
};

function snapshotForCluster(cluster) {
  const id = ARCHETYPE_IDS_BY_CLUSTER[cluster] || 'alpha_male';
  return { analysisData: { primaryArchetype: { id } } };
}

function runPolarityBoundarySweep() {
  console.log('\n--- Polarity: category changes vs archetype nudge (grid raw 0..1 step 0.0025) ---');
  let flips = 0;
  for (let raw = 0; raw <= 1.0001; raw += 0.0025) {
    const r = Math.min(1, raw);
    const catBefore = temperamentCategory(r);
    for (const cluster of Object.keys(ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER)) {
      const snap = snapshotForCluster(cluster);
      const { adjustedNormalizedScore } = applyArchetypePolarityCalibration(snap, r);
      const catAfter = temperamentCategory(adjustedNormalizedScore);
      if (catBefore !== catAfter) {
        flips++;
        if (flips <= 12) {
          console.log(
            `  flip: cluster=${cluster} raw=${r.toFixed(4)} → adj=${adjustedNormalizedScore.toFixed(4)} | ${catBefore} → ${catAfter}`
          );
        }
      }
    }
  }
  const gridPoints = Math.floor(1 / 0.0025) + 1;
  const total = gridPoints * Object.keys(ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER).length;
  console.log(`  Total category flips (raw×cluster): ${flips} / ${total} comparisons`);
  console.log(`  ARCHETYPE_POLARITY_MAX_DELTA = ${ARCHETYPE_POLARITY_MAX_DELTA}`);
}

const MALE_W = { coalitionRank: 0.25, reproductiveConfidence: 0.35, axisOfAttraction: 0.4 };
const FEMALE_W = { coalitionRank: 0.2, reproductiveConfidence: 0.3, axisOfAttraction: 0.5 };

function runAttractionGrid() {
  console.log('\n--- Attraction: grid caps (archetype × polarity norm × baseline) ---');
  const norms = [0, 0.25, 0.5, 0.75, 1];
  const baselines = [
    { label: 'mid', clusters: { coalitionRank: 50, reproductiveConfidence: 50, axisOfAttraction: 50 }, overall: 50 },
    { label: 'edge', clusters: { coalitionRank: 48, reproductiveConfidence: 52, axisOfAttraction: 49 }, overall: 50.2 }
  ];
  let violations = 0;
  const clusters = Object.keys(ARCHETYPE_DIRECTIONAL_BIAS_BY_CLUSTER);

  for (const gender of ['male', 'female']) {
    const w = gender === 'male' ? MALE_W : FEMALE_W;
    for (const arch of clusters) {
      const archSnap = snapshotForCluster(arch);
      for (const norm of norms) {
        const polSnap = { analysisData: { overallTemperament: { normalizedScore: norm } } };
        for (const base of baselines) {
          const smv = {
            clusters: { ...base.clusters },
            overall: base.overall,
            marketPosition: '',
            delusionIndex: 0,
            delusionBand: 'low',
            levelClassification: '',
            targetMarket: {},
            recommendation: {}
          };
          applyAttractionSuiteCalibration(smv, archSnap, polSnap, gender, w);
          const cal = smv.suiteCalibration;
          if (!cal) continue;
          for (const k of ['coalitionRank', 'reproductiveConfidence', 'axisOfAttraction']) {
            const d = Math.abs((cal.clusterDeltas && cal.clusterDeltas[k]) ?? 0);
            if (d > ATTRACTION_CLUSTER_DELTA_CAP + 1e-6) {
              console.log(`  VIOLATION cluster delta cap: ${arch} norm=${norm} ${gender} ${k}=${d}`);
              violations++;
            }
          }
          const od = Math.abs(cal.overallDeltaApplied ?? 0);
          if (od > ATTRACTION_OVERALL_DELTA_CAP + 1e-6) {
            console.log(`  VIOLATION overall cap: ${arch} norm=${norm} ${gender} overallDelta=${od}`);
            violations++;
          }
        }
      }
    }
  }
  console.log(`  Assertions: ${violations === 0 ? 'PASS' : 'FAIL'} (${violations} cap violations)`);
  if (violations > 0) process.exitCode = 1;
}

function runCoherenceSpotCheck() {
  console.log('\n--- Coherence: masculine archetype + masculine polarity should not pull clusters in opposite directions (spot) ---');
  const smv = {
    clusters: { coalitionRank: 50, reproductiveConfidence: 50, axisOfAttraction: 50 },
    overall: 50,
    marketPosition: '',
    delusionIndex: 0,
    delusionBand: 'low',
    levelClassification: '',
    targetMarket: {},
    recommendation: {}
  };
  const archSnap = snapshotForCluster('Alpha');
  const polSnap = { analysisData: { overallTemperament: { normalizedScore: 0.85 } } };
  applyAttractionSuiteCalibration(smv, archSnap, polSnap, 'male', MALE_W);
  const d = smv.suiteCalibration.clusterDeltas;
  const sign =
    d.coalitionRank >= 0 && d.axisOfAttraction >= 0 ? 'aligned (non-negative coalition+axis)' : 'mixed';
  console.log(`  Alpha + high polarity norm: coalition=${d.coalitionRank} repro=${d.reproductiveConfidence} axis=${d.axisOfAttraction} (${sign})`);
}

function main() {
  console.log('Suite calibration check (see docs/SUITE_CALIBRATION.md for metrics)');
  runPolarityBoundarySweep();
  runAttractionGrid();
  runCoherenceSpotCheck();
  console.log('\nDone.\n');
}

main();
