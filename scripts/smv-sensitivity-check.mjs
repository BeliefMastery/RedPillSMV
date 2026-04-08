/**
 * Synthetic SMV sensitivity: vary only phys_* (male) or fert_* (female), baseline mid-scale elsewhere.
 * Run: node scripts/smv-sensitivity-check.mjs
 * Keep cluster/question IDs in sync with attraction-data.js.
 */

import {
  computeSmvClustersAndSubs,
  computeOverallSmv
} from '../shared/attraction-smv-core.mjs';
import { applyAttractionSuiteCalibration } from '../shared/attraction-suite-calibration.mjs';

const RAD_ACTIVITY_TYPE_MODIFIER = { ANTI_RAD_FLOOR: 25, ANTI_RAD_THRESHOLD: 2 };

const MALE_CLUSTER_WEIGHTS = {
  coalitionRank: 0.25,
  reproductiveConfidence: 0.35,
  axisOfAttraction: 0.40
};
const FEMALE_CLUSTER_WEIGHTS = {
  coalitionRank: 0.2,
  reproductiveConfidence: 0.3,
  axisOfAttraction: 0.5
};
const AXIS_SUBCATEGORY_WEIGHTS = {
  male: {
    radActivity: 0.15,
    performanceStatus: 0.35,
    physicalGenetic: 0.35,
    humour: 0.15
  },
  female: {
    fertility: 0.3,
    riskCost: 0.3,
    personality: 0.2,
    factorsHidden: 0.2
  }
};

const q = (id, subcategory, reverseScore = false) => ({
  id,
  subcategory,
  weight: 1,
  ...(reverseScore ? { reverseScore: true } : {})
});

const qw = (id, subcategory, weight, reverseScore = false) => ({
  id,
  subcategory,
  weight,
  ...(reverseScore ? { reverseScore: true } : {})
});

const MALE_PHYS_IDS = ['phys_1', 'phys_2', 'phys_6', 'phys_7', 'phys_8', 'phys_9', 'phys_10', 'phys_3', 'phys_4', 'phys_12', 'phys_5', 'phys_11'];
const FEMALE_FERT_IDS = ['fert_1', 'fert_2', 'fert_4', 'fert_5', 'fert_6', 'fert_7', 'fert_3', 'fert_8'];

function buildMaleClusters() {
  const coalition = ['courage', 'control', 'competence'].flatMap(sub =>
    [1, 2, 3].map(i => q(`${sub}_${i}`, sub))
  );
  const repro = [
    ...[1, 2, 3].map(i => q(`perspicacity_${i}`, 'perspicacity')),
    ...[1, 2, 3].map(i => q(`protector_${i}`, 'protector')),
    ...[1, 2, 3].map(i => q(`provider_${i}`, 'provider')),
    ...[1, 2, 3].map(i => q(`parental_${i}`, 'parentalInvestor'))
  ];
  const axis = [
    qw('rad_1', 'radActivity', 0.4),
    qw('rad_2', 'radActivity', 0.3),
    qw('rad_3', 'radActivity', 0.2),
    qw('rad_4', 'radActivity', 0.1),
    ...[1, 2, 3, 4, 5, 6].map(i => qw(`perf_${i}`, 'performanceStatus', 1.0)),
    qw('perf_7', 'performanceStatus', 0.95),
    qw('perf_8', 'performanceStatus', 0.9),
    qw('phys_1', 'physicalGenetic', 1.2),
    qw('phys_2', 'physicalGenetic', 1.0),
    qw('phys_6', 'physicalGenetic', 1.1),
    qw('phys_7', 'physicalGenetic', 0.9),
    qw('phys_8', 'physicalGenetic', 1.0),
    qw('phys_9', 'physicalGenetic', 0.85),
    qw('phys_10', 'physicalGenetic', 0.8),
    qw('phys_3', 'physicalGenetic', 1.0),
    qw('phys_4', 'physicalGenetic', 1.0),
    qw('phys_12', 'physicalGenetic', 0.95),
    qw('phys_5', 'physicalGenetic', 1.0),
    qw('phys_11', 'physicalGenetic', 0.65),
    ...[1, 2, 3, 4, 5].map(i => qw(`humour_${i}`, 'humour', 1.0))
  ];
  return {
    coalitionRank: { questions: coalition },
    reproductiveConfidence: { questions: repro },
    axisOfAttraction: { questions: axis }
  };
}

function buildFemaleClusters() {
  const coalition = [
    ...[1, 2, 3].map(i => q(`social_${i}`, 'socialInfluence')),
    ...[1, 2, 3].map(i => q(`select_${i}`, 'selectivity')),
    ...[1, 2, 3].map(i => q(`signal_${i}`, 'statusSignaling'))
  ];
  const repro = [
    q('pat_1', 'paternityCertainty'),
    q('pat_2', 'paternityCertainty', true),
    q('pat_3', 'paternityCertainty'),
    ...[1, 2, 3].map(i => q(`nurture_${i}`, 'nurturingStandard')),
    q('collab_1', 'collaborativeTrust'),
    q('collab_2', 'collaborativeTrust', true),
    q('collab_3', 'collaborativeTrust')
  ];
  const axis = [
    qw('fert_1', 'fertility', 1.2),
    qw('fert_2', 'fertility', 1.15),
    qw('fert_4', 'fertility', 1.0),
    qw('fert_5', 'fertility', 0.9),
    qw('fert_6', 'fertility', 1.0),
    qw('fert_7', 'fertility', 0.8),
    qw('fert_3', 'fertility', 1.2),
    qw('fert_8', 'fertility', 0.65),
    q('risk_1', 'riskCost', true),
    q('risk_2', 'riskCost', true),
    q('risk_3', 'riskCost', true),
    ...[1, 2, 3].map(i => q(`personality_${i}`, 'personality')),
    q('hidden_1', 'factorsHidden', true),
    q('hidden_2', 'factorsHidden'),
    q('hidden_3', 'factorsHidden', true)
  ];
  return {
    coalitionRank: { questions: coalition },
    reproductiveConfidence: { questions: repro },
    axisOfAttraction: { questions: axis }
  };
}

function maleBaselineResponses() {
  const r = {};
  const clusters = buildMaleClusters();
  Object.values(clusters).forEach(c => {
    (c.questions || []).forEach(({ id }) => {
      r[id] = id === 'rad_1' ? 6 : 5;
    });
  });
  return r;
}

function femaleBaselineResponses() {
  const r = {};
  const clusters = buildFemaleClusters();
  Object.values(clusters).forEach(c => {
    (c.questions || []).forEach(({ id }) => {
      r[id] = 5;
    });
  });
  return r;
}

function runProfile(label, gender, responses) {
  const clusters = gender === 'male' ? buildMaleClusters() : buildFemaleClusters();
  const weights = gender === 'male' ? MALE_CLUSTER_WEIGHTS : FEMALE_CLUSTER_WEIGHTS;
  const partial = computeSmvClustersAndSubs({
    gender,
    responses,
    clusters,
    axisSubWeights: AXIS_SUBCATEGORY_WEIGHTS,
    radModifier: RAD_ACTIVITY_TYPE_MODIFIER
  });
  const overall = computeOverallSmv(partial.clusters, weights);
  const axis = partial.clusters.axisOfAttraction;
  const physOrFert =
    gender === 'male'
      ? partial.subcategories.axisOfAttraction.physicalGenetic
      : partial.subcategories.axisOfAttraction.fertility;
  return { label, overall: +overall.toFixed(2), axis: +axis.toFixed(2), physOrFert: physOrFert != null ? +physOrFert.toFixed(2) : null };
}

function main() {
  console.log('SMV sensitivity (mid baseline = 5 on 1/3/5/7/10 scale; rad_1 = 6 on 1–10 rad scale)\n');

  const mb = maleBaselineResponses();
  const maleAllPhysMax = { ...mb };
  const maleAllPhysMin = { ...mb };
  MALE_PHYS_IDS.forEach(id => {
    maleAllPhysMax[id] = 10;
    maleAllPhysMin[id] = 1;
  });

  const rowsM = [
    runProfile('Male baseline (all mid)', 'male', { ...mb }),
    runProfile('Male all phys max', 'male', maleAllPhysMax),
    runProfile('Male all phys min', 'male', maleAllPhysMin),
    runProfile('Male face high / body shape low', 'male', { ...mb, phys_1: 10, phys_6: 1 }),
    runProfile('Male face low / body shape high', 'male', { ...mb, phys_1: 1, phys_6: 10 }),
    runProfile('Male phys_10 early-filter item min', 'male', { ...mb, phys_10: 1 })
  ];
  console.table(rowsM);

  const fb = femaleBaselineResponses();
  const femAllFertMax = { ...fb };
  const femAllFertMin = { ...fb };
  FEMALE_FERT_IDS.forEach(id => {
    femAllFertMax[id] = 10;
    femAllFertMin[id] = 1;
  });

  const rowsF = [
    runProfile('Female baseline (all mid)', 'female', { ...fb }),
    runProfile('Female all fert max', 'female', femAllFertMax),
    runProfile('Female all fert min', 'female', femAllFertMin),
    runProfile('Female face high / shape low', 'female', { ...fb, fert_1: 10, fert_6: 1 }),
    runProfile('Female face low / shape high', 'female', { ...fb, fert_1: 1, fert_6: 10 }),
    runProfile('Female fert_7 early-filter item min', 'female', { ...fb, fert_7: 1 })
  ];
  console.table(rowsF);

  const dAxis = rowsM[1].axis - rowsM[2].axis;
  const dOverall = rowsM[1].overall - rowsM[2].overall;
  console.log(
    `\nMale: swing all phys items min→max → Δ axis ≈ ${dAxis.toFixed(2)} pct pts, Δ overall ≈ ${dOverall.toFixed(2)} pct pts`
  );
  const dAxisF = rowsF[1].axis - rowsF[2].axis;
  const dOverallF = rowsF[1].overall - rowsF[2].overall;
  console.log(
    `Female: swing all fert items min→max → Δ axis ≈ ${dAxisF.toFixed(2)} pct pts, Δ overall ≈ ${dOverallF.toFixed(2)} pct pts`
  );

  const smvProbe = {
    clusters: { coalitionRank: 50, reproductiveConfidence: 55, axisOfAttraction: 48 },
    overall: 51.2,
    marketPosition: '',
    delusionIndex: 0,
    delusionBand: 'low',
    levelClassification: '',
    targetMarket: {},
    recommendation: {}
  };
  const archSnap = { analysisData: { primaryArchetype: { id: 'alpha_male' } } };
  const polSnap = { analysisData: { overallTemperament: { normalizedScore: 0.72 } } };
  applyAttractionSuiteCalibration(smvProbe, archSnap, polSnap, 'male', MALE_CLUSTER_WEIGHTS);
  console.log(
    '\nSuite calibration fixture (male): overall',
    smvProbe.overall,
    'meta',
    smvProbe.suiteCalibration,
    smvProbe.suiteCalibration?.inputsHash ? `inputsHash=${smvProbe.suiteCalibration.inputsHash}` : ''
  );
}

main();
