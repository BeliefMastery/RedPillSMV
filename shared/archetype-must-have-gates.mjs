/**
 * Must-have family soft gates for archetype scoring.
 * Applies conservative penalties when core family signals are missing.
 */
export const MUST_HAVE_GATES_VERSION = 1;

const DEFAULT_LIKERT_THRESHOLD = 4;
const DEFAULT_CONTEXT_THRESHOLD = 4;

// Pass-rate -> multiplier (descending strictness).
export const MUST_HAVE_PENALTY_CURVE = [
  { minPassRate: 0.67, multiplier: 1.0 },
  { minPassRate: 0.45, multiplier: 0.93 },
  { minPassRate: 0.25, multiplier: 0.85 },
  { minPassRate: 0.0, multiplier: 0.72 }
];

const BASE_FAMILY_GATES = {
  alpha: [
    { id: 'p1_q6', type: 'forced_family', family: 'alpha', weight: 2.0 },
    { id: 'respect_business_deference', type: 'context_min', threshold: DEFAULT_CONTEXT_THRESHOLD, weight: 1.4 }
  ],
  beta: [
    { id: 'p2_q7', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 },
    { id: 'p2_q8', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 },
    { id: 'p3_q2', type: 'forced_family', family: 'beta', weight: 1.0 }
  ],
  gamma: [
    { id: 'p2_q9', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.4 },
    { id: 'p3_q9', type: 'forced_family', family: 'gamma', weight: 1.2 }
  ],
  delta: [
    { id: 'p2_q14', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.3 },
    { id: 'p1_q8', type: 'forced_family', family: 'delta', weight: 1.1 }
  ],
  sigma: [
    { id: 'p2_q17', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.4 },
    { id: 'p1_q4', type: 'forced_family', family: 'sigma', weight: 1.2 },
    { id: 'p1_q12', type: 'forced_family', family: 'sigma', weight: 1.0 }
  ],
  omega: [
    { id: 'p2_q21', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.4 },
    { id: 'p3_q6', type: 'forced_family', family: 'omega', weight: 1.1 },
    { id: 'respect_social_feel', type: 'context_max', threshold: 2, weight: 1.1 }
  ],
  phi: [
    { id: 'p2_q23', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.4 },
    { id: 'p2_q11', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.0 },
    { id: 'p3_aspiration_1', type: 'aspiration_target', target: 'phi', weight: 1.0 }
  ]
};

const GENDER_OVERRIDES = {
  male: {
    alpha: [
      { id: 'p5_m_cr_control', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.3 },
      { id: 'p5_m_aa_status', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 }
    ],
    gamma: [
      { id: 'p5_m_rc_perspicacity', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 }
    ],
    delta: [
      { id: 'p5_m_rc_provider', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 },
      { id: 'p5_m_rc_provision_stability', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.1 }
    ]
  },
  female: {
    alpha: [
      { id: 'p5_f_cr_selectivity', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.3 },
      { id: 'p5_f_cr_status', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 }
    ],
    beta: [
      { id: 'p5_f_rc_loyalty', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 }
    ],
    gamma: [
      { id: 'p5_f_id_career', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 }
    ],
    delta: [
      { id: 'p5_f_rc_nesting', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.2 },
      { id: 'p5_f_rc_maternal_instinct', type: 'likert_min', threshold: DEFAULT_LIKERT_THRESHOLD, weight: 1.1 }
    ]
  }
};

function canonicalFamilyId(archetypeId, archetypes) {
  if (!archetypeId) return '';
  const id = String(archetypeId);
  const def = archetypes?.[id];
  const parent = def?.parentType || id;
  return parent.replace(/_female$/, '');
}

function pickMultiplier(passRate) {
  for (const row of MUST_HAVE_PENALTY_CURVE) {
    if (passRate >= row.minPassRate) return row.multiplier;
  }
  return 1;
}

function optionFamilyContribution(option, family, archetypes) {
  if (!Array.isArray(option?.archetypes) || option.archetypes.length === 0) return 0;
  const matches = option.archetypes.filter((id) => canonicalFamilyId(id, archetypes) === family).length;
  return matches / option.archetypes.length;
}

function forcedFamilyContribution(answer, question, family, archetypes) {
  if (!question?.options || !Array.isArray(question.options) || !answer) return null;

  if (question.type === 'value_allocation' && Array.isArray(answer.allocationPercents)) {
    const percents = answer.allocationPercents;
    if (percents.length !== question.options.length) return null;
    const sum = percents.reduce((a, b) => a + (Number(b) || 0), 0);
    const shares = sum > 0
      ? percents.map((p) => (Number(p) || 0) / sum)
      : percents.map(() => 1 / question.options.length);
    return shares.reduce((acc, share, i) => {
      const option = question.options[i];
      return acc + (share * optionFamilyContribution(option, family, archetypes));
    }, 0);
  }

  if (typeof answer.selectedIndex === 'number') {
    const option = question.options[answer.selectedIndex];
    if (!option) return null;
    return optionFamilyContribution(option, family, archetypes);
  }

  return null;
}

function buildGatesForGender(gender) {
  const map = {};
  Object.keys(BASE_FAMILY_GATES).forEach((family) => {
    map[family] = [...BASE_FAMILY_GATES[family], ...((GENDER_OVERRIDES[gender]?.[family]) || [])];
  });
  return map;
}

export function evaluateMustHaveGates({
  gender,
  archetypes,
  archetypeScores,
  answers,
  aspirationAnswers,
  respectContextAnswers,
  questionIndex
}) {
  const gatesByFamily = buildGatesForGender(gender === 'female' ? 'female' : 'male');
  const familyDiagnostics = {};
  const familyMultipliers = {};

  Object.entries(gatesByFamily).forEach(([family, gates]) => {
    let passedWeight = 0;
    let consideredWeight = 0;
    const failedSignals = [];

    gates.forEach((gate) => {
      const w = Number(gate.weight) || 1;
      let considered = false;
      let passed = false;

      if (gate.type === 'likert_min') {
        const value = answers?.[gate.id]?.value;
        if (typeof value === 'number') {
          considered = true;
          passed = value >= (gate.threshold ?? DEFAULT_LIKERT_THRESHOLD);
        }
      } else if (gate.type === 'context_min' || gate.type === 'context_max') {
        const value = respectContextAnswers?.[gate.id]?.value;
        if (typeof value === 'number') {
          considered = true;
          passed = gate.type === 'context_min'
            ? value >= (gate.threshold ?? DEFAULT_CONTEXT_THRESHOLD)
            : value <= (gate.threshold ?? 2);
        }
      } else if (gate.type === 'aspiration_target') {
        considered = true;
        const picked = Object.values(aspirationAnswers || {}).flat();
        passed = picked.includes(gate.target);
      } else if (gate.type === 'forced_family') {
        const answer = answers?.[gate.id];
        const q = questionIndex?.[gate.id];
        const contribution = forcedFamilyContribution(answer, q, gate.family, archetypes);
        if (typeof contribution === 'number') {
          considered = true;
          // Carry slider/option family signal as fractional evidence (0..1).
          passedWeight += w * contribution;
          passed = contribution > 0;
        }
      }

      if (considered) {
        consideredWeight += w;
        if (gate.type !== 'forced_family') {
          if (passed) passedWeight += w;
          else failedSignals.push(gate.id);
        } else if (!passed) {
          failedSignals.push(gate.id);
        }
      }
    });

    const passRate = consideredWeight > 0 ? (passedWeight / consideredWeight) : 1;
    const multiplier = pickMultiplier(passRate);
    familyMultipliers[family] = multiplier;
    familyDiagnostics[family] = {
      passRate,
      multiplier,
      passedWeight,
      consideredWeight,
      failedSignals
    };
  });

  const archetypeMultipliers = {};
  Object.keys(archetypeScores || {}).forEach((archId) => {
    const family = canonicalFamilyId(archId, archetypes);
    archetypeMultipliers[archId] = familyMultipliers[family] ?? 1;
  });

  return {
    version: MUST_HAVE_GATES_VERSION,
    familyMultipliers,
    archetypeMultipliers,
    familyDiagnostics
  };
}
