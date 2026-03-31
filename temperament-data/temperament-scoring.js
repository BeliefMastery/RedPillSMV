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
  // Every active dimension key used in Phase 2 has an explicit entry below (no silent 1.0 fallbacks in product logic).
  // Recalibration notes:
  //   Core behavioral: raised shame_and_fear to 1.2 (primary threat-response axis),
  //     provision_and_nurture to 1.2 (highly discriminating), independence_and_interdependence
  //     to 1.1 (maps directly to attachment/autonomy axis), stability_and_movement to 1.0
  //     (movement-seeking is a clear feminine polarity signal).
  //     control_and_flow lowered from 1.2 to 1.0 (overlaps with direction_and_structure).
  //   Intimate/attraction modules: modest reductions (1.3→1.2, 1.2→1.1, 1.1→1.0) to
  //     prevent the 10 intimate dimensions dominating over the 10 core behavioral ones.
  //   New: aesthetic_orientation at 1.1 — mood-led expression vs deliberate, functional, or deprioritised grooming (not mood-orchestrated).
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
    aesthetic_orientation: 1.1,         // deliberate/functional/deprioritised vs mood-led expressive grooming
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
    'aesthetic_orientation'       // Mood-led vs deliberate/functional presentation style varies widely
  ],
  
  // Interpretation guide
  interpretation: {
    highly_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'Expresses strong alignment with masculine archetypal patterns: direction, structure, provision, focus, and achievement orientation.',
      characteristics: [
        'Establishes direction and structure as a default',
        'Prioritises provision, protection, and securing outcomes',
        'Runs focused, goal-directed action',
        'Registers shame and status pressure clearly',
        'Steers toward control and mastery',
        'Takes lead in intimate dynamics'
      ],
      variations: 'Emotional range, connection needs, and intuition still vary—the summary is the centre of gravity, not every moment.'
    },
    predominantly_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'Expresses a clear masculine orientation with real room for feminine-leaning qualities.',
      characteristics: [
        'Prefers structure while allowing flexibility',
        'Balances provision with nurture',
        'Acts with focus while staying emotionally aware',
        'Tracks both shame- and fear-related signals',
        'Leans control with some receptivity'
      ],
      variations: 'Wide range is normal across mood, partner, and season; the headline is the average lean.'
    },
    balanced_masculine: {
      label: 'Masculine-Leaning Expression',
      description: 'On the weighted composite, you lean masculine with substantial integration of feminine-leaning patterns—individual dimensions can still sit tight or open.',
      characteristics: [
        'Uses structure but lets flow interrupt when it serves',
        'Holds both provision and nurture as live options',
        'Combines action bias with emotional expression',
        'Sits between shame- and fear-sensitivity without locking to one'
      ],
      variations: 'The bullets below describe aggregate tendencies from the average; row-level flags and bands above show where you diverge.'
    },
    balanced: {
      label: 'Balanced Polarity Expression',
      description: 'On the weighted composite, masculine and feminine pulls average out toward the middle—this is not a claim that every dimension sits mid-spectrum.',
      characteristics: [
        'Moves between structure and flow as context asks',
        'Switches between provision and nurture without a fixed winner',
        'Balances action and expression rather than privileging one',
        'Carries moderate sensitivity to both shame and fear',
        'Leads or follows based on situation'
      ],
      variations: 'The bullets below describe soft themes implied by the composite; strong leans, anomalies, and magnetism on specific dimensions are reconciled in “Reading your profile together” below.'
    },
    balanced_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'On the weighted composite, you lean feminine with substantial integration of masculine-leaning patterns—individual dimensions can still sit tight or open.',
      characteristics: [
        'Prefers flow while borrowing structure when needed',
        'Centres nurture while keeping provision available',
        'Leads with expression and adds focused action where useful',
        'Balances fear- and shame-sensitivity without fixing on one'
      ],
      variations: 'The bullets below describe aggregate tendencies from the average; row-level flags and bands above show where you diverge.'
    },
    predominantly_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'Expresses a clear feminine orientation with real room for masculine-leaning qualities.',
      characteristics: [
        'Prefers emergence and responsive flow',
        'Centres nurture and connection',
        'Leads with emotional expression and receptivity',
        'Registers fear and isolation sharply',
        'Chooses receptive and responsive stances under pressure'
      ],
      variations: 'Structure needs, achievement drive, and logic still vary—the label captures the main pull.'
    },
    highly_feminine: {
      label: 'Feminine-Leaning Expression',
      description: 'Expresses strong alignment with feminine archetypal patterns: flow, expression, nurture, receptivity, and connection orientation.',
      characteristics: [
        'Prioritises emergence and adaptive flow',
        'Centres nurture, connection, and emotional depth',
        'Runs expressive, emotionally responsive patterns',
        'Registers fear, isolation, and ambiguity strongly',
        'Chooses receptivity and response as home base',
        'Receives and responds in intimate dynamics'
      ],
      variations: 'Structure, achievement, and analytical style still vary by dimension; read the blend from the map below.'
    }
  }
};

