// Relationship Viability Evaluation — 6 key considerations
// Aligned with termination-assessment / Closure reflection

export const VIABILITY_DIMENSIONS = [
  {
    id: 'future-potential',
    name: 'Future potential / shared vision',
    description: 'Does the relationship support the future you envision? Is there a shared vision that makes the effort worthwhile?',
    questions: [
      { id: 'v_future_1', question: 'Does this relationship support the future I envision for myself?', scaleLabelLow: 'No', scaleLabelHigh: 'Yes' },
      { id: 'v_future_2', question: 'Is there a shared vision for growth, dreams, or life goals that makes the effort worthwhile?', scaleLabelLow: 'No', scaleLabelHigh: 'Yes' }
    ]
  },
  {
    id: 'temporary-vs-pattern',
    name: 'Temporary vs pattern',
    description: 'Is the strain temporary or a recurring pattern that undermines your goals?',
    questions: [
      { id: 'v_pattern_1', question: 'Is the discomfort or conflict temporary, or a pattern that undermines my goals?', scaleLabelLow: 'Recurring pattern', scaleLabelHigh: 'Temporary' }
    ]
  },
  {
    id: 'energy-investment',
    name: 'Energy investment',
    description: 'Does resolution bring long-term value or drain you? Are both committed to solutions that foster mutual growth?',
    questions: [
      { id: 'v_energy_1', question: 'Does the energy spent resolving issues bring long-term value, or does it drain my emotional and mental health?', scaleLabelLow: 'Drains me', scaleLabelHigh: 'Brings value' },
      { id: 'v_energy_2', question: 'Are we both committed to finding solutions that foster mutual understanding and growth?', scaleLabelLow: 'No', scaleLabelHigh: 'Yes' }
    ]
  },
  {
    id: 'shared-convictions',
    name: 'Shared convictions',
    description: 'Values, goals, and growth trajectories aligned or diverging?',
    questions: [
      { id: 'v_convictions_1', question: 'Do we share the same goals, values, and vision for the future?', scaleLabelLow: 'No', scaleLabelHigh: 'Yes' },
      { id: 'v_convictions_2', question: 'Are our growth trajectories compatible, or are they diverging?', scaleLabelLow: 'Diverging', scaleLabelHigh: 'Compatible' }
    ]
  },
  {
    id: 'indicators-worthwhile',
    name: 'Indicators of a worthwhile relationship',
    description: 'Understanding, depth, humor, growth, reflection in conflict.',
    questions: [
      { id: 'v_worth_1', question: 'Can we communicate openly and understand each other\'s perspectives, or is there a constant disconnect?', scaleLabelLow: 'Constant disconnect', scaleLabelHigh: 'Open understanding' },
      { id: 'v_worth_2', question: 'Does this person engage with me at a meaningful emotional or intellectual level that enriches my life?', scaleLabelLow: 'Shallow / unfulfilling', scaleLabelHigh: 'Meaningful depth' },
      { id: 'v_worth_3', question: 'In times of conflict, do we use these moments to grow and heal, or does the relationship become reactive and stagnant?', scaleLabelLow: 'Reactive / stagnant', scaleLabelHigh: 'Grow and heal' }
    ]
  },
  {
    id: 'decision-clarity',
    name: 'Decision clarity',
    description: 'Communication, depth, joy, growth commitment, reflection vs reactivity.',
    questions: [
      { id: 'v_decision_1', question: 'Do we communicate well and perceive reality similarly, or is there a frequent disconnect?', scaleLabelLow: 'Frequent disconnect', scaleLabelHigh: 'Communicate well' },
      { id: 'v_decision_2', question: 'Are they committed to growth, or do they resist change and limit my own progress?', scaleLabelLow: 'Resist change', scaleLabelHigh: 'Committed to growth' }
    ]
  }
];

/** Flat list of all viability questions for the engine */
export function getViabilityQuestions() {
  const list = [];
  VIABILITY_DIMENSIONS.forEach(dim => {
    dim.questions.forEach(q => {
      list.push({ ...q, dimensionId: dim.id, dimensionName: dim.name });
    });
  });
  return list;
}

/** Overall band from dimension average scores. scoreByDimension: { dimensionId: number } */
export function getViabilityBand(scoreByDimension) {
  const scores = Object.values(scoreByDimension || {}).filter(n => typeof n === 'number');
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg < 4) return 'consider-stepping-away';
  if (avg <= 6) return 'unclear-use-reflection';
  return 'worth-investing';
}

export const VIABILITY_BAND_LABELS = {
  'consider-stepping-away': 'Consider stepping away',
  'unclear-use-reflection': 'Unclear — use reflection',
  'worth-investing': 'Worth investing in resolution'
};

/** Full overall conclusion to stress in the report (headline + paragraph) */
export const VIABILITY_BAND_CONCLUSIONS = {
  'consider-stepping-away': {
    headline: 'Overall conclusion: Consider stepping away',
    conclusion: 'Your answers suggest the relationship is unlikely to reward further investment. Disconnection, one-sided effort, or lack of shared vision points toward stepping away with clarity. Use the dimensions below to confirm where the gaps are, and align your next steps with your goals and values.'
  },
  'unclear-use-reflection': {
    headline: 'Overall conclusion: Unclear — use reflection',
    conclusion: 'Your answers are mixed: some dimensions suggest potential while others suggest strain. There is no clear signal to invest heavily or to step away. Take time to reflect, revisit the dimensions below, and consider whether a few key areas tip the balance. Honest conversation with your partner or a trusted perspective may help clarify.'
  },
  'worth-investing': {
    headline: 'Overall conclusion: Worth investing in resolution',
    conclusion: 'Your answers suggest shared vision, mutual commitment, or enough alignment that working through conflict is likely to bring long-term value. The relationship appears to support the future you want. Focus effort on the strain points that matter most, and use the Closure & Next Steps section to keep your actions aligned with your goals.'
  }
};
