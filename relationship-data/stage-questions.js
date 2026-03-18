// Multi-Stage Relationship Optimization Questions
// Stage 1: Broad Compatibility Assessment
// Stage 2: Domain-Specific Deep Dive
// Stage 3: Scenario-Based Roleplay Questions

// Stage 1: Broad compatibility questions (current structure, but refined)
export const STAGE_1_COMPATIBILITY_QUESTIONS = {
  // These are the initial broad questions that identify weak areas
  // They remain similar to current structure but are refined
};

// Stage 2: Domain-specific questions broken down by compatibility point
export const STAGE_2_DOMAIN_QUESTIONS = {
  'core-values': {
    domain: 'values-foundation',
    questions: [
      {
        id: 'domain_core_values_1',
        question: 'Imagine you and your partner are making a significant life decision together. How aligned do you feel in your fundamental approach? Do you share similar priorities about what matters most?',
        weight: 1.0,
        compatibilityPoint: 'core-values',
        domain: 'values-foundation'
      },
      {
        id: 'domain_core_values_2',
        question: 'When you observe your partner\'s daily actions and choices, how well do they reflect the values you thought you shared? Rate the consistency between stated values and lived values.',
        weight: 1.1,
        compatibilityPoint: 'core-values',
        domain: 'values-foundation'
      },
      {
        id: 'domain_core_values_3',
        question: 'Think about a time when your values were tested. How did your partner respond? Did they support your values, challenge them constructively, or create conflict?',
        weight: 1.2,
        compatibilityPoint: 'core-values',
        domain: 'values-foundation'
      },
      {
        id: 'domain_core_values_4',
        question: 'How often do you find yourself compromising your core values to avoid conflict with your partner? Rate how much you feel you must sacrifice your principles for harmony.',
        weight: 1.3,
        compatibilityPoint: 'core-values',
        domain: 'values-foundation'
      }
    ]
  },
  'trust-reliability': {
    domain: 'trust-dependability',
    questions: [
      {
        id: 'domain_trust_1',
        question: 'When your partner makes a commitment, how confident are you that they will follow through? Think about both small promises and significant commitments.',
        weight: 1.0,
        compatibilityPoint: 'trust-reliability',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_trust_2',
        question: 'Imagine you need to rely on your partner during a crisis. How certain are you that they will be there for you? Consider both emotional and practical support.',
        weight: 1.1,
        compatibilityPoint: 'trust-reliability',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_trust_3',
        question: 'When your partner shares information with you, how transparent and complete does it feel? Do you feel you\'re getting the full picture, or do you sense omissions?',
        weight: 1.2,
        compatibilityPoint: 'trust-reliability',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_trust_4',
        question: 'If there have been breaches of trust in the past, how effectively have they been addressed? Rate the level of repair and restoration of trust.',
        weight: 1.3,
        compatibilityPoint: 'trust-reliability',
        domain: 'trust-dependability'
      }
    ]
  },
  'personal-boundaries': {
    domain: 'boundaries-autonomy',
    questions: [
      {
        id: 'domain_boundaries_1',
        question: 'When you communicate a boundary to your partner, how consistently is it respected? Think about both emotional and physical boundaries.',
        weight: 1.0,
        compatibilityPoint: 'personal-boundaries',
        domain: 'boundaries-autonomy'
      },
      {
        id: 'domain_boundaries_2',
        question: 'Imagine you need space or time alone. How comfortable are you requesting this, and how well does your partner honor this need?',
        weight: 1.1,
        compatibilityPoint: 'personal-boundaries',
        domain: 'boundaries-autonomy'
      },
      {
        id: 'domain_boundaries_3',
        question: 'When you say "no" to your partner, what happens? Do you feel safe and respected, or do you experience pushback, guilt, or conflict?',
        weight: 1.2,
        compatibilityPoint: 'personal-boundaries',
        domain: 'boundaries-autonomy'
      },
      {
        id: 'domain_boundaries_4',
        question: 'How balanced is the dynamic between togetherness and individual autonomy? Do you feel you have enough space to be yourself while still being connected?',
        weight: 1.1,
        compatibilityPoint: 'personal-boundaries',
        domain: 'boundaries-autonomy'
      },
      {
        id: 'domain_boundaries_5',
        question: 'When your partner needs space or sets a boundary with you, how do you typically respond? Do you respect it easily, or do you feel rejected or anxious?',
        weight: 1.0,
        compatibilityPoint: 'personal-boundaries',
        domain: 'boundaries-autonomy'
      }
    ]
  },
  'mutual-support': {
    domain: 'trust-dependability',
    questions: [
      {
        id: 'domain_support_1',
        question: 'When you need emotional support, how consistently does your partner show up for you? Think about both availability and quality of support.',
        weight: 1.0,
        compatibilityPoint: 'mutual-support',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_support_2',
        question: 'Imagine you\'re going through a difficult time. How well does your partner provide both emotional presence and practical help? Rate the balance of both types of support.',
        weight: 1.1,
        compatibilityPoint: 'mutual-support',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_support_3',
        question: 'When your partner needs support, how available and present are you? Do you feel capable of providing what they need, or do you struggle to be there?',
        weight: 1.0,
        compatibilityPoint: 'mutual-support',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_support_4',
        question: 'How balanced is the give-and-take of support in your relationship? Do you feel the support flows both ways, or is it more one-sided?',
        weight: 1.2,
        compatibilityPoint: 'mutual-support',
        domain: 'trust-dependability'
      },
      {
        id: 'domain_support_5',
        question: 'When you feel alone or unsupported in your relationship, what specific situations or patterns trigger this feeling?',
        weight: 1.1,
        compatibilityPoint: 'mutual-support',
        domain: 'trust-dependability'
      }
    ]
  },
  'communication-styles': {
    domain: 'communication-connection',
    questions: [
      {
        id: 'domain_communication_1',
        question: 'When you express your needs or concerns, how well does your partner understand what you\'re trying to communicate? Do you feel heard and understood?',
        weight: 1.0,
        compatibilityPoint: 'communication-styles',
        domain: 'communication-connection'
      },
      {
        id: 'domain_communication_2',
        question: 'How effectively do you both resolve misunderstandings? When communication breaks down, what typically happens and how long does it take to repair?',
        weight: 1.1,
        compatibilityPoint: 'communication-styles',
        domain: 'communication-connection'
      },
      {
        id: 'domain_communication_3',
        question: 'When you need to discuss something difficult, how safe do you feel expressing it? Do you feel you can be honest without fear of escalation or dismissal?',
        weight: 1.2,
        compatibilityPoint: 'communication-styles',
        domain: 'communication-connection'
      },
      {
        id: 'domain_communication_4',
        question: 'How well do you understand your partner\'s communication style? Do you recognize when they\'re trying to express something important, even if it\'s not said directly?',
        weight: 1.0,
        compatibilityPoint: 'communication-styles',
        domain: 'communication-connection'
      },
      {
        id: 'domain_communication_5',
        question: 'When conversations escalate into conflict or misunderstanding, what patterns do you notice? What typically triggers the breakdown?',
        weight: 1.1,
        compatibilityPoint: 'communication-styles',
        domain: 'communication-connection'
      }
    ]
  },
  'emotional-intelligence': {
    domain: 'communication-connection',
    questions: [
      {
        id: 'domain_ei_1',
        question: 'How well does your partner recognize and respond to your emotional needs? Do they notice when you\'re struggling, even if you haven\'t said anything?',
        weight: 1.0,
        compatibilityPoint: 'emotional-intelligence',
        domain: 'communication-connection'
      },
      {
        id: 'domain_ei_2',
        question: 'When you share your emotional experience, how well does your partner understand and validate it? Do you feel emotionally seen and heard?',
        weight: 1.1,
        compatibilityPoint: 'emotional-intelligence',
        domain: 'communication-connection'
      },
      {
        id: 'domain_ei_3',
        question: 'How effectively do you both manage emotional conflicts? When emotions are high, can you both navigate the situation without causing more harm?',
        weight: 1.2,
        compatibilityPoint: 'emotional-intelligence',
        domain: 'communication-connection'
      },
      {
        id: 'domain_ei_4',
        question: 'How well does your partner manage their own emotions during difficult moments? Do they regulate themselves, or do their emotions tend to escalate and affect you?',
        weight: 1.0,
        compatibilityPoint: 'emotional-intelligence',
        domain: 'communication-connection'
      },
      {
        id: 'domain_ei_5',
        question: 'When emotional issues go unaddressed or misunderstood, what impact does that have on your connection? How long do unresolved emotions tend to linger?',
        weight: 1.1,
        compatibilityPoint: 'emotional-intelligence',
        domain: 'communication-connection'
      }
    ]
  },
  'life-goals': {
    domain: 'values-foundation',
    questions: [
      {
        id: 'domain_goals_1',
        question: 'How aligned are your long-term life goals and aspirations? Do you share a similar vision for where you want to be in 5-10 years?',
        weight: 1.0,
        compatibilityPoint: 'life-goals',
        domain: 'values-foundation'
      },
      {
        id: 'domain_goals_2',
        question: 'When you pursue your personal goals, how supported do you feel by your partner? Do they encourage your growth, or do you feel unsupported or even discouraged?',
        weight: 1.1,
        compatibilityPoint: 'life-goals',
        domain: 'values-foundation'
      },
      {
        id: 'domain_goals_3',
        question: 'How well do your individual goals complement each other? Do they work together to create a shared future, or do they pull in different directions?',
        weight: 1.2,
        compatibilityPoint: 'life-goals',
        domain: 'values-foundation'
      },
      {
        id: 'domain_goals_4',
        question: 'Do you share a vision for your future together? When you imagine your life in the future, how compatible are your individual visions?',
        weight: 1.1,
        compatibilityPoint: 'life-goals',
        domain: 'values-foundation'
      },
      {
        id: 'domain_goals_5',
        question: 'When your goals conflict with your partner\'s, how do you typically handle it? Do you find ways to support each other, or does it create ongoing tension or uncertainty about direction?',
        weight: 1.0,
        compatibilityPoint: 'life-goals',
        domain: 'values-foundation'
      }
    ]
  },
  'conflict-resolution': {
    domain: 'communication-connection',
    questions: [
      {
        id: 'domain_conflict_1',
        question: 'When you have a disagreement, how effectively do you both work toward resolution? Do conflicts typically lead to understanding and repair, or do they create distance?',
        weight: 1.0,
        compatibilityPoint: 'conflict-resolution',
        domain: 'communication-connection'
      },
      {
        id: 'domain_conflict_2',
        question: 'After a conflict, how well do you both repair and reconnect? Do you feel closer after resolving issues, or does resentment tend to linger?',
        weight: 1.1,
        compatibilityPoint: 'conflict-resolution',
        domain: 'communication-connection'
      },
      {
        id: 'domain_conflict_3',
        question: 'When disagreements arise, how well do you both handle them without escalation? Can you stay present and work through issues, or do things tend to get heated?',
        weight: 1.2,
        compatibilityPoint: 'conflict-resolution',
        domain: 'communication-connection'
      },
      {
        id: 'domain_conflict_4',
        question: 'How safe do you feel expressing disagreements? Do you feel you can voice concerns without fear of retaliation, dismissal, or the conflict spiraling out of control?',
        weight: 1.1,
        compatibilityPoint: 'conflict-resolution',
        domain: 'communication-connection'
      },
      {
        id: 'domain_conflict_5',
        question: 'When conflicts remain unresolved or resurface later, what patterns do you notice? Does one of you pursue resolution while the other withdraws or avoids it?',
        weight: 1.0,
        compatibilityPoint: 'conflict-resolution',
        domain: 'communication-connection'
      }
    ]
  },
  'energy-dynamics': {
    domain: 'intimacy-emotional',
    questions: [
      {
        id: 'domain_energy_1',
        question: 'When your energy or emotional pace differs, what happens to connection—do you feel friction, distance, or misattunement?',
        weight: 1.0,
        compatibilityPoint: 'energy-dynamics',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_energy_2',
        question: 'When one of you leads or initiates, does the dynamic feel smooth, or does it create tension, resistance, or confusion?',
        weight: 1.1,
        compatibilityPoint: 'energy-dynamics',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_energy_3',
        question: 'How often do energy mismatches leave you feeling drained, pressured, or emotionally flooded?',
        weight: 1.1,
        compatibilityPoint: 'energy-dynamics',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_energy_4',
        question: 'When roles shift (who leads, who follows), does the transition feel smooth or does it create instability?',
        weight: 1.0,
        compatibilityPoint: 'energy-dynamics',
        domain: 'intimacy-emotional'
      }
    ]
  },
  'sexual-compatibility': {
    domain: 'intimacy-emotional',
    questions: [
      {
        id: 'domain_sexual_1',
        question: 'How aligned are your sexual desires and pacing? Do you feel matched in intensity and frequency?',
        weight: 1.0,
        compatibilityPoint: 'sexual-compatibility',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_sexual_2',
        question: 'How balanced is initiation and receptivity between you? Does it shift comfortably by context?',
        weight: 1.1,
        compatibilityPoint: 'sexual-compatibility',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_sexual_3',
        question: 'When one of you initiates and the other is not receptive, how well do you handle the mismatch without resentment or withdrawal?',
        weight: 1.1,
        compatibilityPoint: 'sexual-compatibility',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_sexual_4',
        question: 'Do you feel your partner understands and respects your boundaries and desires without pressure or shutdown?',
        weight: 1.0,
        compatibilityPoint: 'sexual-compatibility',
        domain: 'intimacy-emotional'
      }
    ]
  },
  'relationship-efficiency': {
    domain: 'intimacy-emotional',
    questions: [
      {
        id: 'domain_efficiency_1',
        question: 'How often does emotional turbulence consume the relationship’s energy and stall progress on practical goals?',
        weight: 1.0,
        compatibilityPoint: 'relationship-efficiency',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_efficiency_2',
        question: 'When uncertainty appears, does one of you take direction while the other hesitates or disengages?',
        weight: 1.1,
        compatibilityPoint: 'relationship-efficiency',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_efficiency_3',
        question: 'How well do you both move from emotional processing to concrete decisions and next steps?',
        weight: 1.0,
        compatibilityPoint: 'relationship-efficiency',
        domain: 'intimacy-emotional'
      },
      {
        id: 'domain_efficiency_4',
        question: 'Does decision-making feel balanced, or does one person consistently carry momentum?',
        weight: 1.0,
        compatibilityPoint: 'relationship-efficiency',
        domain: 'intimacy-emotional'
      }
    ]
  },
  'transactional-compatibility': {
    domain: 'growth-development',
    questions: [
      {
        id: 'domain_transaction_1',
        question: 'How balanced is the day-to-day load (planning, logistics, emotional labor) between you?',
        weight: 1.0,
        compatibilityPoint: 'transactional-compatibility',
        domain: 'growth-development'
      },
      {
        id: 'domain_transaction_2',
        question: 'Do responsibilities and follow-through feel evenly shared, or does one of you become the default manager?',
        weight: 1.1,
        compatibilityPoint: 'transactional-compatibility',
        domain: 'growth-development'
      },
      {
        id: 'domain_transaction_3',
        question: 'When one of you is overwhelmed, how reliably does the other step in without resentment?',
        weight: 1.0,
        compatibilityPoint: 'transactional-compatibility',
        domain: 'growth-development'
      },
      {
        id: 'domain_transaction_4',
        question: 'Does the relationship drift into one person overfunctioning while the other underfunctions? If so, how often?',
        weight: 1.0,
        compatibilityPoint: 'transactional-compatibility',
        domain: 'growth-development'
      }
    ]
  }
  // Additional compatibility points will follow the same pattern
  // The engine will generate generic questions for points not explicitly defined
};

// Stage 3: Scenario-based roleplay questions for identified weak areas
export const STAGE_3_SCENARIO_QUESTIONS = {
  'core-values': [
    {
      id: 'scenario_core_values_1',
      question: 'Envision this scenario: You discover your partner has made a significant decision that conflicts with your core values, and they didn\'t consult you. How do you imagine you would feel, and how would you want to respond?',
      weight: 1.0,
      compatibilityPoint: 'core-values',
      type: 'scenario',
      example: 'Example: Your partner accepts a job that requires moving, but you had agreed to stay in your current location for family reasons.'
    },
    {
      id: 'scenario_core_values_2',
      question: 'Imagine you\'re in a situation where your values are being tested, and your partner\'s response feels dismissive or unsupportive. What would you need from them in that moment?',
      weight: 1.0,
      compatibilityPoint: 'core-values',
      type: 'scenario',
      example: 'Example: You\'re standing up for something you believe in, and your partner suggests you\'re being too rigid or idealistic.'
    }
  ],
  'trust-reliability': [
    {
      id: 'scenario_trust_1',
      question: 'Picture this: Your partner promises to handle an important task, but when the deadline arrives, it\'s not done and they haven\'t communicated about it. How would this make you feel, and what would you need?',
      weight: 1.0,
      compatibilityPoint: 'trust-reliability',
      type: 'scenario',
      example: 'Example: They agreed to handle the finances this month, but bills are unpaid and you discover this only when a late notice arrives.'
    },
    {
      id: 'scenario_trust_2',
      question: 'Envision needing your partner\'s support during a crisis, but they\'re unavailable or unresponsive. How would you experience this, and what would help restore your sense of security?',
      weight: 1.0,
      compatibilityPoint: 'trust-reliability',
      type: 'scenario',
      example: 'Example: You have a medical emergency and can\'t reach your partner, or they don\'t show up when they said they would.'
    }
  ]
  // Additional scenarios for each compatibility point
};

// Domain categories for organizing questions
export const RELATIONSHIP_DOMAINS = {
  'values-foundation': {
    name: 'Values and Foundation',
    compatibilityPoints: ['core-values', 'life-goals', 'spiritual-compatibility']
  },
  'trust-dependability': {
    name: 'Trust and Dependability',
    compatibilityPoints: ['trust-reliability', 'mutual-support', 'personal-boundaries']
  },
  'communication-connection': {
    name: 'Communication and Connection',
    compatibilityPoints: ['communication-styles', 'emotional-intelligence', 'conflict-resolution']
  },
  'intimacy-emotional': {
    name: 'Intimacy and Emotional',
    compatibilityPoints: ['sexual-compatibility', 'energy-dynamics', 'relationship-efficiency']
  },
  'lifestyle-practical': {
    name: 'Lifestyle and Practical',
    compatibilityPoints: ['lifestyle-compatibility', 'financial-compatibility', 'work-life-balance', 'time-management', 'social-compatibility']
  },
  'growth-development': {
    name: 'Growth and Development',
    compatibilityPoints: ['intellectual-compatibility', 'parenting-compatibility', 'transactional-compatibility']
  }
};

