#!/usr/bin/env node
/**
 * Sanity checks for SCI/PCS module.
 * Run: node scripts/sexual-contract-check.mjs
 */
import {
  computeSexualContractIndex,
  evaluateCollapseConvergence,
  applySciDelusionBoost,
  clusterDeltasFromSci
} from '../shared/sexual-contract-index.mjs';
import { SEXUAL_CONTRACT_CLUSTER_DELTA_CAP } from '../shared/sexual-contract-config.mjs';

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed++;
  } else {
    console.log('ok:', msg);
  }
}

const neutral = computeSexualContractIndex({ gender: 'male', inventoryAnswers: {} });
assert(neutral.contractFragility >= 0 && neutral.contractFragility <= 1, 'contractFragility bounded');
assert(neutral.polarityCollapse >= 0 && neutral.polarityCollapse <= 1, 'polarityCollapse bounded');
assert(neutral.inputsHash, 'inputsHash present');

const highFrag = computeSexualContractIndex({
  gender: 'female',
  inventoryAnswers: {
    inv_osr_1: 10,
    inv_hyp_1: 10,
    inv_tx_1: 10,
    inv_ins_1: 10,
    inv_dir_1: 10,
    inv_dir_3: 10,
    inv_sink_1: 10
  }
});
assert(highFrag.contractFragility > neutral.contractFragility, 'high insulation/tx raises fragility');

const suppress = evaluateCollapseConvergence({
  gender: 'female',
  subIndices: { consequenceInsulation: 0.2 },
  pcsSub: { directorCompensation: 0.3 },
  polarityCollapse: 0.4,
  necessityContext: 0.2,
  initiativePref: 0.8
});
assert(suppress.showCollapseFraming === false, 'high initiate + low necessity suppresses collapse framing');

const delusion = applySciDelusionBoost(20, {
  subIndices: { osrExposure: 0.9, hypergamyLoad: 0.85 }
});
assert(delusion > 20 && delusion <= 35, 'SCI delusion boost capped');

const deltas = clusterDeltasFromSci(highFrag, SEXUAL_CONTRACT_CLUSTER_DELTA_CAP);
assert(Math.abs(deltas.reproductiveConfidence) <= SEXUAL_CONTRACT_CLUSTER_DELTA_CAP, 'cluster delta cap');

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll sexual-contract checks passed.');
