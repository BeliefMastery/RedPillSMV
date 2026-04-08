import { evaluateMustHaveGates } from '../shared/archetype-must-have-gates.mjs';

const ARCHETYPES = {
  alpha: { id: 'alpha', subtypes: ['alpha_xi'] },
  alpha_xi: { id: 'alpha_xi', parentType: 'alpha' },
  beta: { id: 'beta' },
  gamma: { id: 'gamma', subtypes: ['gamma_pi'] },
  gamma_pi: { id: 'gamma_pi', parentType: 'gamma' },
  delta: { id: 'delta' },
  sigma: { id: 'sigma' },
  omega: { id: 'omega' },
  phi: { id: 'phi' },
  alpha_female: { id: 'alpha_female' },
  beta_female: { id: 'beta_female' },
  gamma_female: { id: 'gamma_female' },
  delta_female: { id: 'delta_female' }
};

function runScenario(name, input) {
  const out = evaluateMustHaveGates(input);
  const fam = out.familyDiagnostics || {};
  const alpha = fam.alpha?.multiplier ?? 1;
  const gamma = fam.gamma?.multiplier ?? 1;
  const omega = fam.omega?.multiplier ?? 1;
  console.log(`${name}: alpha=${alpha.toFixed(2)} gamma=${gamma.toFixed(2)} omega=${omega.toFixed(2)}`);
  return out;
}

const q = (id, value, selectedIndex) => ({ [id]: { value, selectedIndex } });

const maleRiskAverse = {
  gender: 'male',
  archetypes: ARCHETYPES,
  archetypeScores: { alpha: {}, gamma: {}, gamma_pi: {}, omega: {} },
  answers: {
    ...q('p2_q12', 1, 1),
    ...q('p2_q9', 2, 2),
    ...q('p1_q6', 1, 1),
    ...q('p2_q14', 4, 4),
    ...q('p2_q17', 2, 2),
    ...q('p2_q21', 1, 1),
    ...q('p5_m_cr_control', 2, 2),
    ...q('p5_m_aa_status', 2, 2),
    ...q('p5_m_rc_provider', 4, 4),
    ...q('p5_m_rc_provision_stability', 4, 4)
  },
  aspirationAnswers: {},
  respectContextAnswers: {
    respect_business_deference: { value: 2 },
    respect_social_feel: { value: 2 }
  },
  questionIndex: {
    p1_q6: { id: 'p1_q6', options: [{ archetypes: ['beta'] }, { archetypes: ['delta'] }, { archetypes: ['alpha'] }] }
  }
};

const femaleHighAlpha = {
  gender: 'female',
  archetypes: ARCHETYPES,
  archetypeScores: { alpha_female: {}, gamma_female: {}, beta_female: {}, delta_female: {} },
  answers: {
    ...q('p1_q6', 2, 2),
    ...q('p2_q9', 3, 3),
    ...q('p2_q14', 3, 3),
    ...q('p5_f_cr_selectivity', 5, 5),
    ...q('p5_f_cr_status', 5, 5),
    ...q('p5_f_id_career', 4, 4),
    ...q('p5_f_rc_nesting', 3, 3),
    ...q('p5_f_rc_maternal_instinct', 3, 3)
  },
  aspirationAnswers: {},
  respectContextAnswers: {
    respect_business_deference: { value: 4 },
    respect_social_feel: { value: 4 }
  },
  questionIndex: {
    p1_q6: { id: 'p1_q6', options: [{ archetypes: ['beta'] }, { archetypes: ['delta'] }, { archetypes: ['alpha'] }] }
  }
};

const r1 = runScenario('male_risk_averse', maleRiskAverse);
const r2 = runScenario('female_high_alpha', femaleHighAlpha);

if ((r1.familyDiagnostics?.gamma?.multiplier ?? 1) > 0.93) {
  throw new Error('Expected gamma soft gate penalty in male_risk_averse scenario.');
}
if ((r2.familyDiagnostics?.alpha?.multiplier ?? 1) < 0.93) {
  throw new Error('Expected strong alpha retention in female_high_alpha scenario.');
}
console.log('must-have gates checks passed');
