// Relationship Optimization - 20 Compatibility Points
// Based on relationship-optimization.html

export const COMPATIBILITY_POINTS = {
  // Very High Impact (4 points)
  'core-values': {
    id: 'core-values',
    name: 'Core Values',
    impactTier: 'very-high',
    description: 'Core values define the most important beliefs and principles guiding a person\'s actions and decisions. When partners share similar core values, it creates a strong foundation of mutual understanding and respect.',
    impact: 'Core values influence virtually every aspect of a relationship, from major life decisions to daily interactions. Misalignment can lead to severe friction and a sense of disconnection.',
    needs: ['Trust', 'Respect', 'Mutuality', 'Safety', 'Security', 'Belonging', 'Cooperation', 'Compassion'],
    negativeExpressions: ['Resentment', 'Frustration', 'Disappointment', 'Anger', 'Inferiority', 'Animosity'],
    questions: [
      'How aligned are your fundamental beliefs about what matters most in life?',
      'Do you share similar principles regarding honesty, integrity, and moral conduct?',
      'Are your core values reflected in your daily actions and decisions?',
      'How often do you feel your partner\'s values conflict with your own?',
      'Do you feel respected and understood in your value system?'
    ],
    weight: 1.0
  },
  'trust-reliability': {
    id: 'trust-reliability',
    name: 'Trust and Reliability',
    impactTier: 'very-high',
    description: 'Trust is built on honesty, integrity, and dependability. When one partner is reliable and follows through on commitments, the relationship flourishes. Trust is essential for intimacy and emotional security.',
    impact: 'Trust is foundational to any healthy relationship. Without it, feelings of anxiety, suspicion, or insecurity arise. When trust is broken, rebuilding it can be difficult and requires significant effort.',
    needs: ['Safety', 'Security', 'Mutuality', 'Support', 'Respect', 'Compassion', 'Closeness', 'Love', 'Trust'],
    negativeExpressions: ['Anger', 'Disappointment', 'Animosity', 'Fear', 'Resentment', 'Distrust', 'Anxiety', 'Inferiority'],
    questions: [
      'How consistently does your partner follow through on their commitments?',
      'Do you feel you can rely on your partner in times of need?',
      'How transparent and honest is communication in your relationship?',
      'Have there been breaches of trust that remain unresolved?',
      'Do you feel emotionally safe and secure with your partner?'
    ],
    weight: 1.0
  },
  'personal-boundaries': {
    id: 'personal-boundaries',
    name: 'Personal Boundaries',
    impactTier: 'very-high',
    description: 'Personal boundaries refer to the physical, emotional, and mental limits that individuals set in relationships to protect their well-being. Healthy boundaries ensure respect for individuality and prevent codependency or emotional overwhelm, including the balance between closeness and space.',
    impact: 'Clear and respected boundaries allow for healthy interdependence and individual autonomy. Violating these boundaries can lead to feelings of disrespect, suffocation, or resentment, and can polarize partners into control vs. withdrawal.',
    needs: ['Autonomy', 'Respect', 'Safety', 'Security', 'Independence', 'Space', 'Freedom', 'Trust'],
    negativeExpressions: ['Anger', 'Fear', 'Resentment', 'Frustration', 'Anxiety', 'Inferiority', 'Guilt'],
    questions: [
      'Are your personal boundaries clearly communicated and respected?',
      'Do you feel your need for space and independence is honored?',
      'How often do you feel your boundaries are violated or ignored?',
      'Do you feel comfortable saying "no" without fear of conflict?',
      'Is there a healthy balance between togetherness and individual autonomy, or does the relationship swing between closeness and distance?'
    ],
    weight: 1.0
  },
  'mutual-support': {
    id: 'mutual-support',
    name: 'Mutual Support and Dependability',
    impactTier: 'very-high',
    description: 'This point refers to the degree to which partners can rely on each other for emotional, practical, or financial support. It involves consistency, reliability, and a willingness to be there for each other in both good and difficult times.',
    impact: 'A relationship thrives when partners can depend on each other, especially in challenging times. Lack of mutual support can create resentment, emotional distance, and instability.',
    needs: ['Support', 'Safety', 'Stability', 'Trust', 'Compassion', 'Nurturing', 'Closeness', 'Mutuality'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Disappointment', 'Insecurity', 'Desperation'],
    questions: [
      'How consistently does your partner show up for you when you need support?',
      'Do you feel your partner is emotionally available during difficult times?',
      'How balanced is the give-and-take of support in your relationship?',
      'Do you feel you can depend on your partner for practical help?',
      'How often do you feel alone or unsupported in your relationship?'
    ],
    weight: 1.0
  },
  
  // High Impact (8 points)
  'communication-styles': {
    id: 'communication-styles',
    name: 'Communication Styles',
    impactTier: 'high',
    description: 'How partners express themselves, listen, and understand each other. Effective communication enables connection, while poor communication leads to misunderstandings and conflict.',
    impact: 'Communication is the foundation of understanding. Mismatched styles can create constant friction, while aligned communication fosters intimacy and resolution.',
    needs: ['Understanding', 'Respect', 'Safety', 'Support', 'Compassion', 'Empathy', 'Closeness', 'Trust'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Fear', 'Anxiety', 'Isolation', 'Bitterness'],
    questions: [
      'How well do you and your partner understand each other\'s communication style?',
      'Do you feel heard and understood when expressing your needs?',
      'How effectively do you resolve misunderstandings?',
      'Do you feel safe expressing difficult emotions or concerns?',
      'How often do conversations escalate into conflict or misunderstanding?'
    ],
    weight: 0.9
  },
  'emotional-intelligence': {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence',
    impactTier: 'high',
    description: 'Emotional intelligence involves the ability to recognize, understand, and manage one\'s emotions, and to empathize with others. High EI enables partners to navigate conflicts and emotional landscapes effectively.',
    impact: 'EI supports emotional safety and empathy in the relationship, preventing emotional explosions or avoidance. Low EI can lead to emotional neglect, misunderstandings, or defensive behavior.',
    needs: ['Empathy', 'Compassion', 'Closeness', 'Understanding', 'Respect', 'Safety', 'Support', 'Nurturing'],
    negativeExpressions: ['Anger', 'Resentment', 'Frustration', 'Fear', 'Insecurity', 'Bitterness'],
    questions: [
      'How well does your partner recognize and respond to your emotional needs?',
      'Do you feel your partner understands your emotional experience?',
      'How effectively do you both manage emotional conflicts?',
      'Do you feel emotionally validated and supported?',
      'How often do emotional issues go unaddressed or misunderstood?'
    ],
    weight: 0.9
  },
  'life-goals': {
    id: 'life-goals',
    name: 'Life Goals and Aspirations',
    impactTier: 'high',
    description: 'Life goals are long-term objectives that shape the direction of one\'s life. Compatibility in this area means both partners have aligned or complementary visions for their future and a shared sense of direction.',
    impact: 'When partners\' life goals align, there is a sense of shared purpose and clarity. Divergence in goals can create tension and anxiety, especially when the relationship lacks direction or initiative.',
    needs: ['Purpose', 'Connection', 'Support', 'Growth', 'Independence', 'Competence', 'Mutuality', 'Respect'],
    negativeExpressions: ['Frustration', 'Resentment', 'Disappointment', 'Anger', 'Inferiority'],
    questions: [
      'How aligned are your long-term life goals and aspirations?',
      'Do you feel supported in pursuing your personal goals?',
      'How well do your individual goals complement each other?',
      'Do you share a vision for your future together?',
      'How often do you feel uncertain about the direction of the relationship or who is initiating next steps?'
    ],
    weight: 0.9
  },
  'conflict-resolution': {
    id: 'conflict-resolution',
    name: 'Conflict Resolution Styles',
    impactTier: 'high',
    description: 'Partners\' ability to manage disagreement and conflict. Healthy conflict resolution enables partners to grow closer through resolving tension, while poor conflict management can create division and lingering resentment.',
    impact: 'Conflict resolution determines the relationship\'s resilience. Healthy approaches promote growth and intimacy, while unhealthy approaches deepen wounds.',
    needs: ['Respect', 'Safety', 'Understanding', 'Support', 'Compassion', 'Empathy', 'Love'],
    negativeExpressions: ['Anger', 'Frustration', 'Resentment', 'Bitterness', 'Disappointment', 'Fear', 'Guilt'],
    questions: [
      'How effectively do you and your partner resolve conflicts?',
      'Do conflicts typically lead to resolution or lingering resentment?',
      'How well do you both handle disagreements without escalation?',
      'Do you feel safe expressing disagreements?',
      'When conflict appears, does one of you pursue resolution while the other withdraws or avoids it?'
    ],
    weight: 0.9
  },
  'energy-dynamics': {
    id: 'energy-dynamics',
    name: 'Energy Dynamics / Temperament',
    impactTier: 'high',
    description: 'The natural energetic dynamic between partners, including their emotional rhythm, physical energy levels, and how they interact emotionally. A mismatch in energy or polarity (who leads, who follows, who initiates, who responds) can lead to discord.',
    impact: 'When energies align, it creates a smooth, harmonious relationship. When mismatched, one partner may feel overwhelmed, ignored, or drained, and polarity can collapse into neutrality or swing into control vs. withdrawal.',
    needs: ['Connection', 'Closeness', 'Support', 'Nurturing', 'Mutuality', 'Safety', 'Compassion', 'Trust'],
    negativeExpressions: ['Frustration', 'Resentment', 'Impatience', 'Anger', 'Anxiety'],
    questions: [
      'How often do energy mismatches create friction, shutdown, or conflict?',
      'Do differences in pace or intensity leave you feeling drained, overlooked, or pressured?',
      'How often do you feel overwhelmed or ignored due to energy mismatches?',
      'Do energy mismatches reduce closeness or make it harder to stay connected?',
      'Does the lead/follow or initiate/receive dynamic create tension or confusion when it shifts?'
    ],
    weight: 0.9
  },
  'transactional-compatibility': {
    id: 'transactional-compatibility',
    name: 'Transactional Compatibility (Give and Take)',
    impactTier: 'high',
    description: 'Transactional compatibility refers to how the partners balance the effort and emotional investment they give to the relationship. This includes sharing responsibilities and emotional labor without falling into overfunctioner/underfunctioner dynamics.',
    impact: 'An imbalance in effort can lead to feelings of resentment and emotional depletion, as one partner may feel like they are carrying more of the weight or the relationship direction.',
    needs: ['Mutuality', 'Support', 'Trust', 'Respect', 'Nurturing', 'Compassion', 'Cooperation', 'Stability'],
    negativeExpressions: ['Frustration', 'Resentment', 'Bitterness', 'Anger', 'Exhaustion'],
    questions: [
      'How balanced is the give-and-take of effort in your relationship?',
      'Do you feel you contribute equally to the relationship?',
      'How often do you feel you\'re carrying more of the emotional or practical load?',
      'Do you feel your contributions are recognized and appreciated?',
      'Does the relationship drift into one partner managing everything while the other defaults to passivity?'
    ],
    weight: 0.9
  },
  'parenting-compatibility': {
    id: 'parenting-compatibility',
    name: 'Parenting Compatibility',
    impactTier: 'high',
    description: 'Alignment in parenting styles and values around child-rearing. Differences in parenting can be a significant source of conflict.',
    impact: 'Mismatched parenting approaches can cause significant stress and division in the family.',
    needs: ['Nurturing', 'Mutuality', 'Cooperation', 'Safety', 'Support', 'Respect'],
    negativeExpressions: ['Anger', 'Frustration', 'Resentment', 'Disappointment'],
    questions: [
      'How aligned are your parenting styles and values?',
      'Do you feel supported in your parenting decisions?',
      'How well do you both work together as a parenting team?',
      'Do you feel your parenting approach is respected?',
      'How often do parenting differences create conflict?'
    ],
    weight: 0.9
  },
  'relationship-efficiency': {
    id: 'relationship-efficiency',
    name: 'Relationship Efficiency and Emotional Management',
    impactTier: 'high',
    description: 'The capacity of both partners to handle emotional challenges, anxieties, and apprehensions without allowing them to consume an overwhelming portion of the relationship\'s energy. This includes clarity around direction, decision-making, and who carries momentum when uncertainty appears.',
    impact: 'While addressing emotional concerns is critical, an overemphasis on managing turbulence can sap the relationship\'s energy, reduce practical progress, and intensify anxiety about direction or responsibility.',
    needs: ['Emotional Regulation', 'Stability', 'Cooperation', 'Autonomy', 'Focused Energy', 'Practicality', 'Progress'],
    negativeExpressions: ['Exhaustion', 'Frustration', 'Overwhelm', 'Anxiety', 'Resentment', 'Insecurity', 'Defensiveness'],
    questions: [
      'How efficiently do you both manage emotional challenges without draining the relationship?',
      'Do emotional issues consume an excessive amount of your relationship energy?',
      'How well do you balance emotional processing with practical relationship goals?',
      'Do you feel the relationship has energy for growth and shared projects?',
      'When uncertainty appears, does one of you take direction while the other stalls or disengages?'
    ],
    weight: 0.9
  },
  
  // Moderate to High Impact (4 points)
  'sexual-compatibility': {
    id: 'sexual-compatibility',
    name: 'Sexual Compatibility',
    impactTier: 'moderate-high',
    description: 'Sexual compatibility refers to alignment in sexual desires, frequency, and intimacy needs. It includes polarity in initiation and receptivity, not just attraction.',
    impact: 'Sexual intimacy strengthens the bond, while mismatched desires, initiation, or receptivity can lead to frustration and emotional disconnection.',
    needs: ['Affection', 'Intimacy', 'Trust', 'Respect', 'Closeness', 'Compassion', 'Safety', 'Nurturing'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Fear', 'Guilt', 'Shame', 'Disappointment'],
    questions: [
      'How aligned are your sexual desires and frequency needs?',
      'Do you feel sexually satisfied and connected?',
      'How well do you communicate about sexual needs and preferences?',
      'Do you feel safe and respected in your sexual relationship?',
      'How balanced is initiation and receptivity between you (and does it shift comfortably by context)?'
    ],
    weight: 0.8
  },
  'financial-compatibility': {
    id: 'financial-compatibility',
    name: 'Financial Compatibility',
    impactTier: 'moderate-high',
    description: 'Financial compatibility involves how partners manage money, set financial goals, and handle spending, saving, and debt.',
    impact: 'Financial stress is a leading cause of relationship tension; conflicting attitudes can result in arguments and long-term instability, while alignment supports stability and reduces conflict.',
    needs: ['Stability', 'Security', 'Trust', 'Support', 'Mutuality', 'Cooperation'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Fear', 'Insecurity', 'Greed'],
    questions: [
      'How aligned are your financial goals and money management styles?',
      'Do you feel secure about your financial situation together?',
      'How well do you both communicate about financial decisions?',
      'Do you feel your financial contributions are balanced and fair?',
      'How often do financial issues create conflict or stress?'
    ],
    weight: 0.8
  },
  'intellectual-compatibility': {
    id: 'intellectual-compatibility',
    name: 'Intellectual Compatibility',
    impactTier: 'moderate-high',
    description: 'Intellectual compatibility refers to the alignment of partners\' cognitive styles, intellectual curiosity, and the ways they engage with ideas. It involves shared interests in knowledge, learning, and problem-solving.',
    impact: 'Lack of stimulation or mismatch can lead to boredom, frustration, or disconnection; alignment fosters growth and connection.',
    needs: ['Growth', 'Learning', 'Challenge', 'Competence', 'Understanding', 'Self-Expression', 'Consciousness', 'Creativity'],
    negativeExpressions: ['Frustration', 'Boredom', 'Disinterest', 'Resentment', 'Inferiority'],
    questions: [
      'How well do you intellectually stimulate and challenge each other?',
      'Do you share similar levels of intellectual curiosity?',
      'How often do you engage in meaningful intellectual conversations?',
      'Do you feel intellectually understood and respected?',
      'How often do you feel bored or unstimulated intellectually?'
    ],
    weight: 0.8
  },
  'spiritual-compatibility': {
    id: 'spiritual-compatibility',
    name: 'Spiritual Compatibility',
    impactTier: 'moderate-high',
    description: 'Spiritual compatibility refers to shared beliefs, values, or practices related to a higher power, meaning, or purpose. It includes shared rituals, world-views, and existential perspectives.',
    impact: 'Differences can create isolation or conflict in existential matters; alignment strengthens bonds through shared practices, rituals, and meaning.',
    needs: ['Meaning', 'Purpose', 'Connection', 'Companionship', 'Growth', 'Trust', 'Spiritual Expression', 'Understanding'],
    negativeExpressions: ['Anger', 'Fear', 'Resentment', 'Frustration', 'Disappointment', 'Intolerance'],
    questions: [
      'How aligned are your spiritual or existential beliefs?',
      'Do you feel you can share your spiritual experiences and perspectives?',
      'How well do you respect each other\'s spiritual differences?',
      'Do you feel spiritually connected or isolated?',
      'How often do spiritual differences create conflict or distance?'
    ],
    weight: 0.8
  },
  
  // Moderate Impact (4 points)
  'work-life-balance': {
    id: 'work-life-balance',
    name: 'Work-Life Balance',
    impactTier: 'moderate',
    description: 'This refers to how partners manage the balance between work responsibilities and personal life. When balanced, it allows for quality time together and healthy space for individual pursuits.',
    impact: 'Poor balance can lead to neglect, stress, and feelings of abandonment; alignment allows quality time together and mutual respect for boundaries.',
    needs: ['Companionship', 'Closeness', 'Support', 'Mutuality', 'Freedom', 'Independence'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Exhaustion'],
    questions: [
      'How well do you both balance work responsibilities with relationship time?',
      'Do you feel you have quality time together?',
      'How often do work demands interfere with your relationship?',
      'Do you feel your partner prioritizes the relationship appropriately?',
      'How well do you both respect each other\'s need for work and personal space?'
    ],
    weight: 0.7
  },
  'time-management': {
    id: 'time-management',
    name: 'Time Management and Priorities',
    impactTier: 'moderate',
    description: 'This compatibility refers to how partners prioritize their time and manage their schedules. It includes how much time is dedicated to each other, personal pursuits, work, family, and social obligations.',
    impact: 'Mismatches can leave one partner feeling neglected or overburdened and create ongoing tension; alignment supports stability and connection.',
    needs: ['Respect', 'Time', 'Closeness', 'Autonomy', 'Cooperation', 'Stability', 'Support'],
    negativeExpressions: ['Frustration', 'Resentment', 'Anger', 'Disappointment', 'Insecurity', 'Neglect'],
    questions: [
      'How aligned are your priorities for time allocation?',
      'Do you feel you get enough quality time together?',
      'How well do you both balance time for the relationship with individual pursuits?',
      'Do you feel your partner prioritizes you appropriately?',
      'How often do time management differences create conflict?'
    ],
    weight: 0.7
  },
  'social-compatibility': {
    id: 'social-compatibility',
    name: 'Social Compatibility',
    impactTier: 'moderate',
    description: 'Social compatibility involves shared social interests, social energy, and social behaviors. It includes how partners engage with friends, family, and social circles. Whether one partner enjoys large social gatherings while the other prefers intimacy or quiet time is part of this dynamic.',
    impact: 'Differences in social appetite can create friction when one partner feels overwhelmed or neglected; alignment supports shared social lives and reduces resentment.',
    needs: ['Companionship', 'Connection', 'Community', 'Support', 'Love', 'Mutuality', 'Belonging'],
    negativeExpressions: ['Frustration', 'Loneliness', 'Resentment', 'Boredom', 'Anger', 'Isolation'],
    questions: [
      'How aligned are your social energy levels and preferences?',
      'Do you enjoy socializing together?',
      'How well do you both balance social time with couple time?',
      'Do you feel your social needs are respected and met?',
      'How often do social differences create conflict or distance?'
    ],
    weight: 0.7
  },
  'lifestyle-compatibility': {
    id: 'lifestyle-compatibility',
    name: 'Lifestyle Compatibility',
    impactTier: 'moderate',
    description: 'Lifestyle compatibility refers to alignment in daily habits, routines, health practices, and how partners structure their lives. This includes sleep patterns, diet, exercise, and overall approach to living.',
    impact: 'Compatible lifestyles create ease and harmony in daily life, while mismatches can create constant friction and adjustment challenges.',
    needs: ['Stability', 'Cooperation', 'Respect', 'Support', 'Mutuality', 'Health', 'Well-being'],
    negativeExpressions: ['Frustration', 'Resentment', 'Irritation', 'Exhaustion', 'Stress'],
    questions: [
      'How aligned are your daily habits and routines?',
      'Do you feel your lifestyle preferences are respected?',
      'How well do you both accommodate each other\'s lifestyle needs?',
      'Do you feel your health and well-being practices are compatible?',
      'How often do lifestyle differences create daily friction?'
    ],
    weight: 0.7
  }
};

// Impact tier weights for scoring
export const IMPACT_TIER_WEIGHTS = {
  'very-high': 1.0,
  'high': 0.9,
  'moderate-high': 0.8,
  'moderate': 0.7
};

// Scoring thresholds (for Priority: Critical/High/Moderate/Low)
export const SCORING_THRESHOLDS = {
  weakestLink: 4.0, // Below this score indicates a weakest link
  critical: 3.0, // Critical weakness requiring immediate attention
  moderate: 5.0, // Moderate area for improvement
  strong: 7.0 // Strong area, maintain
};

// Severity/state tiers with explicit value ranges (0–10). Order: worst to best.
// Used for strain state labels, report display, terminal caveat, and overview colors.
export const SEVERITY_TIERS = [
  { id: 'Critical', minScore: 0, maxScore: 2, stateLabel: 'Critical', countsAsCritical: true },
  { id: 'Severe', minScore: 3, maxScore: 4, stateLabel: 'Challenged', countsAsCritical: true },
  { id: 'Moderate', minScore: 5, maxScore: 6, stateLabel: 'Moderate strain', countsAsCritical: false },
  { id: 'Mild', minScore: 7, maxScore: 8, stateLabel: 'Strained', countsAsCritical: false },
  { id: 'Minimal', minScore: 9, maxScore: 10, stateLabel: 'Minimal', countsAsCritical: false }
];

