// Temperament Scoring System
// Maps responses to masculine-feminine spectrum positioning

export const TEMPERAMENT_SCORING = {
  // Scoring thresholds for spectrum positioning
  thresholds: {
    highly_masculine: 0.75,  // 75%+ masculine
    predominantly_masculine: 0.60,  // 60-75% masculine
    balanced_masculine: 0.55,  // 55-60% masculine
    balanced: 0.45,  // 45-55% (balanced)
    balanced_feminine: 0.40,  // 40-45% feminine
    predominantly_feminine: 0.25,  // 25-40% feminine
    highly_feminine: 0.0  // 0-25% feminine
  },
  
  // Dimension weights (some dimensions are more indicative than others)
  // Recalibration notes:
  //   Core behavioral: raised shame_and_fear to 1.2 (primary threat-response axis),
  //     provision_and_nurture to 1.2 (highly discriminating), independence_and_interdependence
  //     to 1.1 (maps directly to attachment/autonomy axis), stability_and_movement to 1.0
  //     (movement-seeking is a clear feminine polarity signal).
  //     control_and_flow lowered from 1.2 to 1.0 (overlaps with direction_and_structure).
  //   Intimate/attraction modules: modest reductions (1.3→1.2, 1.2→1.1, 1.1→1.0) to
  //     prevent the 10 intimate dimensions dominating over the 10 core behavioral ones.
  //   New: aesthetic_orientation at 1.1 — bridges temperament and archetype aesthetic capital.
  dimensionWeights: {
    // Core behavioral dimensions
    direction_and_structure: 1.2,       // foundational agency/structure axis — hold
    provision_and_nurture: 1.2,         // raised: highly discriminating for polarity
    focus_and_expression: 1.0,          // hold
    certainty_and_clarity: 0.9,         // hold — context-variable
    shame_and_fear: 1.2,                // raised: primary masculine/feminine threat-response axis
    achievement_and_connection: 1.1,    // hold
    control_and_flow: 1.0,              // lowered: overlaps with direction_and_structure
    independence_and_interdependence: 1.1, // raised: maps to attachment/autonomy axis
    logic_and_intuition: 0.9,           // hold — cognitive style, not pure polarity
    stability_and_movement: 1.0,        // raised: movement-seeking is a clear feminine signal
    aesthetic_orientation: 1.1,         // new: structured/disciplined vs intuitive/expressive
    // Intimate dynamics and attraction-responsiveness modules
    // (reduced modestly to prevent 10 intimate dims dominating 10 core behavioral dims)
    preferred_dynamics: 1.2,            // lowered from 1.3 — still most indicative intimate signal
    emotional_responses: 1.1,           // lowered from 1.2
    satisfaction_and_preference: 1.2,   // lowered from 1.3
    positions_and_preferences: 1.0,     // lowered from 1.1 — behavioural, not temperament-foundational
    arousal_and_responsiveness: 1.1,    // lowered from 1.2
    status_and_rank: 1.0,               // hold
    selection_criteria: 1.1,            // hold — gender-swap logic already handles this
    attraction_signals: 1.0,            // hold
    hypergamy_and_choice: 1.0,          // hold
    responsiveness_patterns: 1.1        // lowered from 1.2
  },
  
  // Variation indicators - dimensions where variation is expected and common
  expectedVariation: [
    'logic_and_intuition',        // Many people have both
    'achievement_and_connection', // Can value both
    'certainty_and_clarity',      // Different needs at different times
    'satisfaction_and_preference', // Can enjoy both giving and receiving
    'aesthetic_orientation'       // Approach to self-presentation varies widely
  ],
  
  // Interpretation guide
  interpretation: {
    highly_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'Tends to express strong alignment with masculine archetypal patterns: direction, structure, provision, focus, and achievement orientation.',
      characteristics: [
        'Often shows preference for establishing direction and structure',
        'Tends to express drive to provide, protect, and secure',
        'Shows preference toward focused, goal-directed action',
        'Often expresses sensitivity to shame and status',
        'Shows preference toward control and mastery',
        'Tends to take lead in intimate dynamics'
      ],
      variations: 'May show variation in emotional expression, need for connection, or intuitive capacity while maintaining core masculine-leaning expression.'
    },
    predominantly_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'Tends to express clear masculine orientation with some integration of feminine qualities.',
      characteristics: [
        'Shows preference for structure with some flexibility',
        'Tends to express provision-oriented patterns with capacity for nurture',
        'Often shows focused action with emotional awareness',
        'Tends to express some sensitivity to both shame and fear',
        'Shows preference toward control with some receptivity'
      ],
      variations: 'May show significant variation in emotional expression, connection needs, or intuitive/feeling capacity.'
    },
    balanced_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'Tends to express masculine-leaning patterns with substantial integration of feminine qualities.',
      characteristics: [
        'Often appreciates structure but can flow',
        'Tends to express both provision and nurture capacities',
        'Shows preference toward action-oriented patterns with emotional expression',
        'Often expresses some balance between shame and fear sensitivity'
      ],
      variations: 'Significant variation expected across dimensions - may be highly structured in some areas, highly expressive in others.'
    },
    balanced: {
      label: 'Balanced Polarity Expression',
      description: 'Tends to express integration of both masculine and feminine qualities without strong preference for either pole.',
      characteristics: [
        'Often shows comfort with both structure and flow',
        'Tends to express both provision and nurture capacities',
        'Shows preference toward action and expression in balance',
        'Often expresses moderate sensitivity to both shame and fear',
        'Tends to take lead or follow as needed'
      ],
      variations: 'High variation expected - may show strong masculine traits in some contexts, strong feminine traits in others. This is normal and healthy.'
    },
    balanced_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'Tends to express feminine-leaning patterns with substantial integration of masculine qualities.',
      characteristics: [
        'Shows preference for flow with some structure',
        'Tends to express nurture-oriented patterns with provision capacity',
        'Often shows expression with some focused action',
        'Tends to express some balance between fear and shame sensitivity'
      ],
      variations: 'Significant variation expected - may be highly expressive in some areas, highly structured in others.'
    },
    predominantly_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'Tends to express clear feminine orientation with some integration of masculine qualities.',
      characteristics: [
        'Shows preference for flow and emergence',
        'Tends to express nurture and connection-oriented patterns',
        'Often shows emotional expression and receptivity',
        'Tends to express sensitivity to fear and isolation',
        'Shows preference toward receptive and responsive patterns'
      ],
      variations: 'May show variation in structure needs, achievement drive, or logical capacity while maintaining core feminine-leaning expression.'
    },
    highly_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'Tends to express strong alignment with feminine archetypal patterns: flow, expression, nurture, receptivity, and connection orientation.',
      characteristics: [
        'Often shows strong preference for flow and emergence',
        'Tends to express drive for nurture, connection, and emotional richness',
        'Shows preference toward expressive and emotionally responsive patterns',
        'Often expresses sensitivity to fear, isolation, and lack of clarity',
        'Shows preference toward receptivity and response',
        'Tends to receive and respond in intimate dynamics'
      ],
      variations: 'May show variation in structure capacity, achievement orientation, or logical thinking while maintaining core feminine-leaning expression.'
    }
  }
};


