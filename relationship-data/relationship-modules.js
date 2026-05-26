export const RELATIONSHIP_ANALYSIS_MODULES = [
  {
    id: 'relationship-viability',
    /** Shown in Part 2 (both) to avoid repeating the section title */
    part2CardTitle: 'Strain-area average',
    part2CardSummary: 'One number averaged from your Part 1 compatibility scores—sanity-check against the six dimensions above, not a second conclusion.',
    title: 'Compatibility strain summary',
    summary: 'A single average across your compatibility scores (principles, repair dynamics, many strain areas). Use as a cross-check with the rest of the report.',
    materialKey: 'relationshipViability',
    pointKeys: [
      'core-values',
      'trust-reliability',
      'personal-boundaries',
      'mutual-support',
      'communication-styles',
      'emotional-intelligence',
      'life-goals',
      'conflict-resolution',
      'energy-dynamics',
      'transactional-compatibility',
      'parenting-compatibility',
      'relationship-efficiency',
      'sexual-compatibility',
      'financial-compatibility',
      'intellectual-compatibility',
      'spiritual-compatibility',
      'work-life-balance',
      'time-management',
      'social-compatibility',
      'lifestyle-compatibility'
    ],
    conclusions: {
      strong: 'Indicators suggest the relationship remains viable. Maintain consistency and repair habits early.',
      watch: 'Viability is mixed. Stabilize trust, conflict repair, and shared direction before deciding.',
      urgent: 'Core viability signals are weak. Consider whether repair is realistic or separation is healthier.'
    }
  }
];

