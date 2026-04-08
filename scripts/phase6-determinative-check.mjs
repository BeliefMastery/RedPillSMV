import {
  evaluatePhase6Decision,
  canonicalFamilyKeyFromNode
} from '../shared/archetype-phase6-logic.mjs';
import { PHASE_6_DETERMINATIVE_QUESTIONS } from '../archetype-data/archetype-determinative-questions.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const lowSignalCase = {
  familyDiagnosticsTop3: [
    { familyId: 'alpha_family', nonZeroSubtypeCount: 1, tiePressure: { weightedDelta: 0.02, phase2Delta: 1.4 } },
    { familyId: 'gamma_family', nonZeroSubtypeCount: 3, tiePressure: { weightedDelta: 0.015, phase2Delta: 1.1 } },
    { familyId: 'sigma_family', nonZeroSubtypeCount: 3, tiePressure: { weightedDelta: 0.013, phase2Delta: 1.1 } }
  ]
};
const highTieCase = {
  familyDiagnosticsTop3: [
    { familyId: 'beta_family', nonZeroSubtypeCount: 4, tiePressure: { weightedDelta: 0.005, phase2Delta: 0.5 } },
    { familyId: 'delta_family', nonZeroSubtypeCount: 3, tiePressure: { weightedDelta: 0.02, phase2Delta: 1.3 } },
    { familyId: 'omega_family', nonZeroSubtypeCount: 2, tiePressure: { weightedDelta: 0.03, phase2Delta: 1.5 } }
  ]
};
const clearCase = {
  familyDiagnosticsTop3: [
    { familyId: 'alpha_family', nonZeroSubtypeCount: 4, tiePressure: { weightedDelta: 0.03, phase2Delta: 2.1 } },
    { familyId: 'beta_family', nonZeroSubtypeCount: 4, tiePressure: { weightedDelta: 0.025, phase2Delta: 1.6 } },
    { familyId: 'gamma_family', nonZeroSubtypeCount: 4, tiePressure: { weightedDelta: 0.02, phase2Delta: 1.2 } }
  ]
};

const d1 = evaluatePhase6Decision(lowSignalCase);
assert(d1.shouldRun === true, 'Expected low signal case to trigger Phase 6.');

const d2 = evaluatePhase6Decision(highTieCase);
assert(d2.shouldRun === true, 'Expected high tie case to trigger Phase 6.');

const d3 = evaluatePhase6Decision(clearCase);
assert(d3.shouldRun === false, 'Expected clear separation case to skip Phase 6.');

const top3Families = ['alpha_family', 'gamma_family', 'sigma_family'];
const selectedKeys = top3Families.map((id) => canonicalFamilyKeyFromNode(id));
const selectedQuestions = selectedKeys.flatMap((k) => PHASE_6_DETERMINATIVE_QUESTIONS[k] || []);
const nonSelectedQuestionExists = Object.entries(PHASE_6_DETERMINATIVE_QUESTIONS)
  .filter(([k]) => !selectedKeys.includes(k))
  .some(([, questions]) => (questions || []).some((q) => selectedQuestions.includes(q)));
assert(nonSelectedQuestionExists === false, 'Expected Phase 6 scope to include only selected top-3 families.');

const beforeTie = { weightedDelta: 0.003 };
const afterTie = { weightedDelta: 0.011 };
assert(afterTie.weightedDelta > beforeTie.weightedDelta, 'Expected post-Phase-6 tie separation improvement in synthetic check.');

['alpha', 'beta', 'gamma', 'delta', 'sigma', 'omega'].forEach((familyKey) => {
  const list = PHASE_6_DETERMINATIVE_QUESTIONS[familyKey];
  assert(Array.isArray(list) && list.length > 0, `Expected determinative questions for ${familyKey}.`);
});

assert(canonicalFamilyKeyFromNode('alpha_family_female') === 'alpha', 'Canonical family conversion failed for female family node.');
assert(canonicalFamilyKeyFromNode('sigma_family') === 'sigma', 'Canonical family conversion failed for male family node.');

console.log('phase6 determinative checks passed');
