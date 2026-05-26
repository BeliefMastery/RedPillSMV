// Archetypal Insights for Relationship Optimization
// Based on archetypes.html: vulnerability, biological essentialism, polarity, STATUS/SELECTION/ATTRACTION

export const ARCHETYPAL_INSIGHTS = {
  vulnerability: {
    description: 'Each gender carries inherent vulnerability: the masculine fractures at the edge of shame, the feminine at the edge of fear. These are survival codes written into the human field.',
    application: {
      masculine: [
        'When addressing relationship issues with a masculine partner, avoid triggering shame. Focus on solutions and competence rather than failure.',
        'Masculine vulnerability surfaces when competence, control, or courage are questioned. Support through acknowledgment of strength, not criticism of weakness.',
        'Masculine partners need to feel capable and effective. Frame requests as opportunities to demonstrate competence rather than failures to meet needs.'
      ],
      feminine: [
        'When addressing relationship issues with a feminine partner, avoid triggering fear. Create safety and security before addressing problems.',
        'Feminine vulnerability surfaces when safety, connection, or belonging are threatened. Support through presence and reassurance, not logic or solutions.',
        'Feminine partners need to feel safe and seen. Prioritize emotional connection and validation before problem-solving.'
      ],
      both: [
        'Recognize that vulnerability responses are biological, not personal. They operate below conscious awareness.',
        'Create safety for vulnerability by responding with care rather than defensiveness or dismissal.',
        'Understand that vulnerability is a gateway to deeper intimacy when met with respect and care.'
      ]
    }
  },
  biologicalEssentialism: {
    description: 'Biological essentialism asserts that human behavior and identity are deeply rooted in biological traits shaped by evolutionary forces. These traits influence everything from individual instincts to societal structures.',
    application: [
      'Some relationship needs are hardwired, not negotiable. Recognize the difference between preferences and biological imperatives.',
      'Evolutionary pressures shape mate selection, status dynamics, and attachment patterns. Understanding these can reduce personalization of conflicts.',
      'Hormonal and psychological foundations influence behavior. Testosterone drives dominance and provision; oxytocin drives bonding and caregiving.',
      'Social synergies reflect evolutionary strategies. Cooperation, competition, and resource allocation operate at both conscious and instinctual levels.',
      'Cultural evolution amplifies biological patterns. Relationship dynamics often echo deeper evolutionary imperatives.'
    ],
    compatibilityPoints: {
      'trust-reliability': 'Trust operates at both conscious and instinctual levels. Broken trust triggers survival responses that require both emotional and structural repair.',
      'mutual-support': 'Support demonstrates Provider and Protector capacity (reproductive confidence). Support needs may differ based on biological factors.',
      'sexual-compatibility': 'Attraction operates at both conscious and instinctual levels. Sexual compatibility involves biological signals as well as conscious preferences.',
      'financial-compatibility': 'Financial dynamics relate to Provider capacity (reproductive confidence). Financial stress triggers survival responses.',
      'energy-dynamics': 'Energy and temperament have biological foundations. Some mismatches may stem from hardwired differences rather than personal failings.'
    }
  },
  polarity: {
    description: 'Polarity functions as complementary alignment. The masculine steadies, holds, and leads; the feminine tests, amplifies, and confirms. Clean polarity stabilizes and energizes both; collapsed polarity corrodes into resentment and control.',
    application: [
      'Healthy relationships require both masculine and feminine energies, regardless of gender. Both partners need to access both, but typically one is dominant.',
      'Clean polarity creates charge and attraction. Collapsed polarity (sameness, no distinction) leads to boredom and resentment.',
      'Masculine energy provides structure, direction, and containment. Feminine energy provides flow, presence, and testing.',
      'Polarity dynamics influence communication: masculine tends toward problem-solving, feminine toward emotional processing. Both are necessary.',
      'Boundaries are essential for maintaining polarity. Collapsed boundaries erode masculine/feminine dynamics.',
      'Conflict resolution supports polarity when it creates charge and resolution rather than collapse into sameness or control.'
    ],
    compatibilityPoints: {
      'communication-styles': 'Masculine communication tends toward problem-solving, feminine toward emotional processing. Both are valid and necessary.',
      'conflict-resolution': 'Healthy conflict resolution supports polarity: it creates charge and resolution rather than collapse.',
      'personal-boundaries': 'Boundaries are essential for maintaining polarity. Collapsed boundaries erode masculine/feminine dynamics.',
      'energy-dynamics': 'Energy dynamics reflect polarity. Matching energies can create harmony; complementary energies can create charge.'
    }
  },
  statusSelectionAttraction: {
    description: 'Three undercurrents organize the field: Coalition Rank (intrasex respect), Reproductive Confidence (mate selection criteria), and Axis of Attraction (display signals).',
    maleClusters: {
      coalitionRank: {
        components: ['Courage (risk tolerance under threat)', 'Control (mastery over impulses and stress)', 'Competence (ability to solve problems and secure resources under pressure)'],
        function: 'Decides male standing in groups; higher rank → more allies, more resources, better mate access.',
        application: [
          'Masculine partners need to feel respected among peers. Support their competence and courage rather than undermining it.',
          'Control and competence are central to masculine identity. Frame requests as opportunities to demonstrate these rather than failures.',
          'Coalition rank influences relationship dynamics. Partners who support each other\'s standing strengthen the relationship.'
        ]
      },
      reproductiveConfidence: {
        components: ['Perspicacity (acute perception of threats/opportunities)', 'Protector (physical defense capacity and intent)', 'Provider (consistent resource generation)', 'Parental Investor (willingness and competence in offspring rearing)'],
        function: 'Determines long-term mate selection by women; tied to genetic legacy.',
        application: [
          'Masculine partners demonstrate reproductive confidence through provision, protection, and parental investment. Acknowledge and appreciate these contributions.',
          'Support masculine partners in developing these capacities rather than criticizing their absence.',
          'Recognize that reproductive confidence operates at both conscious and instinctual levels.'
        ]
      },
      axisOfAttraction: {
        components: ['Wealth/Finance/Status/Performance/Productivity/Talent/Popularity', 'Looks/Physical/Genetic/Aesthetic'],
        function: 'Immediate draw in mating/coalition markets; amplifies or bottlenecks access to opportunities from other clusters.',
        application: [
          'Attraction operates through multiple channels. Physical, status, and performance signals all contribute.',
          'Recognize that attraction is not purely conscious. Biological signals influence attraction below awareness.',
          'Support each other\'s efforts to maintain attraction signals while recognizing that deeper compatibility matters more long-term.'
        ]
      }
    },
    femaleClusters: {
      coalitionRank: {
        components: ['Social Influence (control over perceptions and alliances)', 'Selectivity & Mate Guarding Success (ability to attract and retain top male attention against rivals)', 'Status Signaling (strategic display of beauty, fertility, and alliance without triggering sabotage)'],
        function: 'Controls resource flow, reduces threats, and determines how protected she is within the female network.',
        application: [
          'Feminine partners need to feel respected and protected within social networks. Support their social standing and influence.',
          'Recognize that feminine coalition rank involves both social skills and mate selection success.',
          'Support feminine partners in maintaining social connections and status without jealousy or control.'
        ]
      },
      reproductiveConfidence: {
        components: ['Paternity Certainty (signals of loyalty and exclusivity)', 'Nurturing Standard (alignment with or exceeding the male\'s early maternal care baseline)', 'Collaborative Trust Efficiency (ability to work together effectively)'],
        function: 'Determines long-term mate selection by men; tied to genetic legacy and offspring success.',
        application: [
          'Feminine partners demonstrate reproductive confidence through loyalty, nurturing, and collaborative trust. Acknowledge and appreciate these contributions.',
          'Support feminine partners in developing these capacities rather than taking them for granted.',
          'Recognize that reproductive confidence operates at both conscious and instinctual levels.'
        ]
      },
      hypergamy: {
        description: 'Female mate choice operates as a composite filter across all three clusters. Hypergamy seeks upward convergence.',
        application: [
          'Hypergamy is not personal rejection; it\'s a biological filter that seeks the best genetic and resource outcomes.',
          'Masculine partners can respond to hypergamy by developing competence, provision, and protection capacities.',
          'Recognize that hypergamy operates at both conscious and instinctual levels. Some attraction patterns are hardwired.',
          'Long-term relationships require both partners to continue developing and maintaining attraction signals.'
        ]
      }
    },
    compatibilityPoints: {
      'trust-reliability': 'Trust supports reproductive confidence. Broken trust undermines both masculine and feminine mate selection criteria.',
      'mutual-support': 'Support demonstrates Provider/Protector capacity (masculine) and Nurturing/Collaborative capacity (feminine).',
      'sexual-compatibility': 'Sexual compatibility relates to Axis of Attraction and reproductive confidence. Attraction operates through multiple biological and conscious channels.',
      'financial-compatibility': 'Financial capacity relates to Provider function (masculine reproductive confidence) and resource security (feminine coalition rank).',
      'energy-dynamics': 'Energy dynamics may reflect coalition rank and reproductive confidence. Higher status partners may have different energy needs.'
    }
  },
  resentment: {
    description: 'Resentment is a deeply disempowering emotion that traps us in negative cycles. It disconnects us from others, fuels conflict, and locks us into patterns of blame and hurt.',
    stages: [
      {
        stage: 'Externalizing Responsibility',
        description: 'Belief that someone else is responsible for your feelings or circumstances.',
        intervention: 'Reclaim agency by acknowledging that your emotions and actions are your responsibility.'
      },
      {
        stage: 'Disconnection',
        description: 'Emotional withdrawal, creating isolation rather than resolution.',
        intervention: 'Recognize that resentment-based disconnection breeds contempt rather than healing. Seek connection over isolation.'
      },
      {
        stage: 'Victimhood',
        description: 'Self-righteousness reinforcing sense of injustice.',
        intervention: 'Break the cycle by taking responsibility for your emotional state rather than waiting for external change.'
      },
      {
        stage: 'Indifference',
        description: 'Suppressed pain disguised as apathy.',
        intervention: 'Recognize that indifference blocks growth. Engage with emotions rather than suppressing them.'
      },
      {
        stage: 'Wishing Harm',
        description: 'Active malice where resentment turns into justification for harmful actions.',
        intervention: 'This is a critical stage requiring immediate intervention. Seek professional support and reaffirm your values.'
      }
    ],
    resolution: [
      'Understand the root causes: reflect on what led to conflict and recognize that both parties may have acted out of hurt or misunderstanding.',
      'Release through forgiveness: this doesn\'t mean excusing harmful behavior—it\'s about releasing the emotional burden for your own well-being.',
      'Cultivate compassion: extend compassion toward yourself and the other person where possible. Acknowledge that imperfection is universal.',
      'Engage judiciously: if the source of resentment remains a persistent source of aggravation, it\'s okay to reduce engagement to protect your mental health.',
      'Pursue reconciliation where appropriate: when both parties are open, express feelings openly, share unmet needs, and collaborate on solutions.'
    ]
  }
};

/**
 * Concise female-lens archetypal impact per compatibility point.
 * Values can be a string (one bullet) or array of strings (multiple bullets).
 * Used in relationship report; supports cases where female lens has more effects than male.
 */
export const FEMALE_LENS_BY_POINT = {
  'core-values': 'Value alignment signals nurturing standard and collaborative fit; misalignment undermines female reproductive confidence in partner choice.',
  'trust-reliability': [
    'Trust underpins paternity certainty and collaborative trust efficiency—core to female reproductive confidence in long-term mate choice.',
    'Broken trust undermines loyalty signals and nesting commitment that drive male long-term choice.'
  ],
  'personal-boundaries': 'Boundaries protect social influence and selectivity; collapsed boundaries erode female coalition rank and safety signalling.',
  'mutual-support': [
    'Support reflects and elicits nurturing and collaborative trust; lack of it undermines female reproductive confidence.',
    'Unbalanced support affects how female coalition rank (social influence, selectivity) is perceived.'
  ],
  'communication-styles': 'Communication style affects collaborative trust efficiency and emotional safety—central to female reproductive confidence.',
  'emotional-intelligence': 'Emotional attunement aligns with nurturing standard and paternity certainty signals.',
  'conflict-resolution': [
    'Conflict repair supports collaborative trust efficiency and reduces threat to female coalition rank.',
    'Ongoing conflict undermines nesting and loyalty signals that drive male commitment.'
  ],
  'sexual-compatibility': [
    'Sexual compatibility ties to attraction and fertility signalling; affects commitment and hypergamy calibration.',
    'Mismatch here can trigger hypergamy (seeking upward) or withdrawal of commitment signals.'
  ],
  'financial-compatibility': 'Financial dynamics affect resource security and provider signals; stress undermines female coalition rank and nesting confidence.',
  'energy-dynamics': 'Energy fit affects coalition rank and day-to-day collaborative efficiency.',
  'generic': 'Strain here may touch female coalition rank (social influence, selectivity) or reproductive confidence (nurturing, collaborative trust, loyalty signals).'
};

/**
 * Single unified list of archetypal-pressure bullets per compatibility point.
 * Each bullet carries its affiliation in the line (brackets or natural wording).
 * Report renders one list only; no separate male/female sublists.
 */
export const ARCHETYPAL_PRESSURES_BY_POINT = {
  'core-values': [
    'Value alignment signals nurturing standard and collaborative fit; misalignment undermines what men assess in women for long-term commitment (reproductive confidence).'
  ],
  'trust-reliability': [
    'Trust is foundational to what women assess in men: perspicacity, protector and provider capacity, and parental investment (reproductive confidence).',
    'Trust underpins paternity certainty and collaborative trust efficiency—what men assess in women for long-term commitment (reproductive confidence).'
  ],
  'personal-boundaries': [
    'Boundaries protect social influence and selectivity; collapsed boundaries erode standing and safety within same-sex networks (coalition rank).'
  ],
  'mutual-support': [
    'Support demonstrates provision, protection, and capacity to invest—what women assess in men (reproductive confidence).',
    'Support reflects and elicits nurturing and collaborative trust; lack of it undermines what men assess in women for commitment (reproductive confidence).'
  ],
  'communication-styles': [
    'Communication style affects collaborative trust efficiency and emotional safety—what men assess in women for long-term commitment (reproductive confidence).'
  ],
  'emotional-intelligence': [
    'Emotional attunement aligns with nurturing standard and paternity certainty—what men assess in women (reproductive confidence).'
  ],
  'conflict-resolution': [
    'Conflict repair supports collaborative trust efficiency and reduces threat to standing within same-sex networks (coalition rank).',
    'Ongoing conflict undermines nesting and loyalty signals that drive long-term commitment (reproductive confidence).'
  ],
  'sexual-compatibility': [
    'Sexual compatibility ties to attraction and fertility signalling; strain affects commitment and mate-choice calibration (axis of attraction; reproductive confidence).'
  ],
  'financial-compatibility': [
    'Financial dynamics relate to provision and resource security—what women assess in men (reproductive confidence).',
    'Financial stress undermines standing and nesting confidence within same-sex and partnership dynamics (coalition rank; reproductive confidence).'
  ],
  'energy-dynamics': [
    'Energy fit affects standing and day-to-day collaborative efficiency within same-sex and partnership dynamics (coalition rank).'
  ],
  'lifestyle-compatibility': [
    'Lifestyle mismatch can undermine how reliably you show up in partnership and in social contexts, and how much daily collaboration feels sustainable (reproductive confidence; coalition rank).'
  ]
  // No generic fallback: show Archetypal Pressures only when this map has a specific entry for the strain point.
};

