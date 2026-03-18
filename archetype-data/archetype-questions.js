// Multi-Tier Archetype Assessment Questions
// Following bias-mitigation principles: behavioral focus, concrete scenarios, values-neutral framing

// PHASE 1: Core Orientation (15-20 forced-choice scenarios)
// Purpose: Identify primary quadrant (Alpha/Beta/Gamma/Delta/Sigma/Omega/Phi)
export const PHASE_1_QUESTIONS = [
  {
    id: 'p1_q1',
    question: 'You\'re invited to join a community project. What most appeals to you?',
    type: 'forced_choice',
    options: [
      { text: 'Leading the initiative and setting the vision', archetypes: ['alpha'], weight: 3 },
      { text: 'Contributing specialized expertise and knowledge', archetypes: ['gamma'], weight: 3 },
      { text: 'Supporting others and ensuring everyone\'s included', archetypes: ['beta'], weight: 3 },
      { text: 'Working independently on a specific component', archetypes: ['sigma'], weight: 3 },
      { text: 'Handling practical logistics and execution', archetypes: ['delta'], weight: 3 },
      { text: 'Observing and learning without committing', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q2',
    question: 'When a project you\'re involved in fails, you typically:',
    type: 'forced_choice',
    options: [
      { text: 'Take responsibility and lead the recovery effort', archetypes: ['alpha'], weight: 3 },
      { text: 'Analyze what went wrong and propose solutions', archetypes: ['gamma'], weight: 3 },
      { text: 'Support others who are struggling with the failure', archetypes: ['beta'], weight: 3 },
      { text: 'Focus on your specific part and ensure it works', archetypes: ['delta'], weight: 3 },
      { text: 'Withdraw and work on something else independently', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel overwhelmed and avoid dealing with it', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q3',
    question: 'At a party where you know few people, you:',
    type: 'forced_choice',
    options: [
      { text: 'Introduce yourself to groups and take leadership in conversations', archetypes: ['alpha'], weight: 3 },
      { text: 'Find interesting people to have deep conversations with', archetypes: ['gamma'], weight: 3 },
      { text: 'Look for people who seem left out and include them', archetypes: ['beta'], weight: 3 },
      { text: 'Help with practical tasks like serving food or cleaning', archetypes: ['delta'], weight: 3 },
      { text: 'Find a quiet corner and observe, engaging only if approached', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel uncomfortable and leave early', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q4',
    question: 'If you could only choose one:',
    type: 'forced_choice',
    options: [
      { text: 'Recognition from peers for your achievements', archetypes: ['alpha'], weight: 3 },
      { text: 'Freedom from obligation and social expectations', archetypes: ['sigma'], weight: 3 },
      { text: 'Deep understanding of how things work', archetypes: ['gamma'], weight: 3 },
      { text: 'Being needed and valued by others', archetypes: ['beta'], weight: 3 },
      { text: 'Completing practical tasks that make a difference', archetypes: ['delta'], weight: 3 },
      { text: 'Being left alone without expectations', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q5',
    question: 'When someone challenges your approach with less experience:',
    type: 'forced_choice',
    options: [
      { text: 'Assert your authority and explain why your method works', archetypes: ['alpha'], weight: 3 },
      { text: 'Engage in debate and explore their perspective', archetypes: ['gamma'], weight: 3 },
      { text: 'Listen carefully and try to incorporate their ideas', archetypes: ['beta'], weight: 3 },
      { text: 'Show them the practical steps and help them understand', archetypes: ['delta'], weight: 3 },
      { text: 'Ignore them and continue your way independently', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel intimidated and defer to their opinion', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q6',
    question: 'In a group decision, you prefer to:',
    type: 'forced_choice',
    options: [
      { text: 'Make the final call after hearing input', archetypes: ['alpha'], weight: 3 },
      { text: 'Question assumptions and propose alternatives', archetypes: ['gamma'], weight: 3 },
      { text: 'Ensure everyone\'s voice is heard and find consensus', archetypes: ['beta'], weight: 3 },
      { text: 'Focus on what\'s practical and achievable', archetypes: ['delta'], weight: 3 },
      { text: 'Opt out and make your own decision separately', archetypes: ['sigma'], weight: 3 },
      { text: 'Go along with whatever others decide', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q7',
    question: 'When you see injustice or unfairness, you:',
    type: 'forced_choice',
    options: [
      { text: 'Take action to correct it directly', archetypes: ['alpha', 'alpha_rho'], weight: 3 },
      { text: 'Question the system and propose alternatives', archetypes: ['gamma'], weight: 3 },
      { text: 'Support those who are being treated unfairly', archetypes: ['beta'], weight: 3 },
      { text: 'Work within the system to make practical changes', archetypes: ['delta'], weight: 3 },
      { text: 'Withdraw from the system entirely', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel powerless and avoid the situation', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q8',
    question: 'Your ideal work environment is:',
    type: 'forced_choice',
    options: [
      { text: 'Leading a team with clear hierarchy', archetypes: ['alpha'], weight: 3 },
      { text: 'Independent research or creative work', archetypes: ['gamma', 'sigma'], weight: 3 },
      { text: 'Supportive team where everyone collaborates', archetypes: ['beta'], weight: 3 },
      { text: 'Structured environment with clear tasks', archetypes: ['delta'], weight: 3 },
      { text: 'Completely autonomous, no oversight', archetypes: ['sigma'], weight: 3 },
      { text: 'Minimal interaction, simple tasks', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q9',
    question: 'When you disagree with someone in authority:',
    type: 'forced_choice',
    options: [
      { text: 'Challenge them directly and assert your position', archetypes: ['alpha'], weight: 3 },
      { text: 'Question their reasoning and propose alternatives', archetypes: ['gamma'], weight: 3 },
      { text: 'Express your view gently and seek compromise', archetypes: ['beta'], weight: 3 },
      { text: 'Follow protocol but work around the issue', archetypes: ['delta'], weight: 3 },
      { text: 'Ignore their authority and do what you think is right', archetypes: ['sigma'], weight: 3 },
      { text: 'Avoid confrontation and comply', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q10',
    question: 'In relationships, you value most:',
    type: 'forced_choice',
    options: [
      { text: 'Respect and recognition of your leadership', archetypes: ['alpha'], weight: 3 },
      { text: 'Intellectual connection and deep conversations', archetypes: ['gamma'], weight: 3 },
      { text: 'Harmony, support, and mutual care', archetypes: ['beta'], weight: 3 },
      { text: 'Practical partnership and shared responsibilities', archetypes: ['delta'], weight: 3 },
      { text: 'Independence and space for personal growth', archetypes: ['sigma'], weight: 3 },
      { text: 'Acceptance without expectations', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q11',
    question: 'When you need to learn something new, you:',
    type: 'forced_choice',
    options: [
      { text: 'Take charge of the learning process and teach others', archetypes: ['alpha'], weight: 3 },
      { text: 'Deep dive into theory and explore multiple perspectives', archetypes: ['gamma'], weight: 3 },
      { text: 'Learn alongside others and share knowledge', archetypes: ['beta'], weight: 3 },
      { text: 'Focus on practical, hands-on application', archetypes: ['delta'], weight: 3 },
      { text: 'Learn independently through experimentation', archetypes: ['sigma'], weight: 3 },
      { text: 'Struggle and may need significant support', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q12',
    question: 'When facing a major life decision, you primarily:',
    type: 'forced_choice',
    options: [
      { text: 'Make the decision confidently and take responsibility', archetypes: ['alpha'], weight: 3 },
      { text: 'Analyze all options deeply and question assumptions', archetypes: ['gamma'], weight: 3 },
      { text: 'Consult with trusted others and seek consensus', archetypes: ['beta'], weight: 3 },
      { text: 'Focus on practical considerations and what works', archetypes: ['delta'], weight: 3 },
      { text: 'Trust your own judgment regardless of others\' input', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel overwhelmed and delay the decision', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q13',
    question: 'Your response to social conflict is typically:',
    type: 'forced_choice',
    options: [
      { text: 'Step in and mediate or take control', archetypes: ['alpha'], weight: 3 },
      { text: 'Question the underlying issues and propose solutions', archetypes: ['gamma'], weight: 3 },
      { text: 'Try to help everyone feel heard and find peace', archetypes: ['beta'], weight: 3 },
      { text: 'Focus on practical resolution and moving forward', archetypes: ['delta'], weight: 3 },
      { text: 'Remove yourself from the situation', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel anxious and avoid the conflict', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q14',
    question: 'When you achieve something significant, you:',
    type: 'forced_choice',
    options: [
      { text: 'Share it widely and expect recognition', archetypes: ['alpha'], weight: 3 },
      { text: 'Reflect on what it means and what you learned', archetypes: ['gamma'], weight: 3 },
      { text: 'Share it with close others and celebrate together', archetypes: ['beta'], weight: 3 },
      { text: 'Move on to the next practical task', archetypes: ['delta'], weight: 3 },
      { text: 'Keep it private and continue independently', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel it\'s not significant enough to matter', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p1_q15',
    question: 'In a crisis, your natural response is to:',
    type: 'forced_choice',
    options: [
      { text: 'Take charge and direct the response', archetypes: ['alpha', 'alpha_xi'], weight: 3 },
      { text: 'Analyze the situation and propose strategic solutions', archetypes: ['gamma', 'sigma_kappa'], weight: 3 },
      { text: 'Support and care for those affected', archetypes: ['beta', 'delta_mu'], weight: 3 },
      { text: 'Focus on practical tasks that need doing', archetypes: ['delta'], weight: 3 },
      { text: 'Handle your own needs independently', archetypes: ['sigma'], weight: 3 },
      { text: 'Feel overwhelmed and seek help', archetypes: ['omega'], weight: 2 }
    ]
  }
];

// PHASE 2: Dimensional Refinement (20-25 Likert-scale statements)
// Purpose: Distinguish between main type and variants (e.g., Alpha vs Alpha-Xi vs Dark Alpha)
export const PHASE_2_QUESTIONS = [
  {
    id: 'p2_q1',
    question: 'I explain patiently why my method works when challenged',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'alpha', weight: 2 },
      { id: 'alpha_rho', weight: 3 }
    ]
  },
  {
    id: 'p2_q2',
    question: 'I feel disrespected when my approach is questioned',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_alpha', weight: 3 },
      { id: 'alpha', weight: 1 }
    ]
  },
  {
    id: 'p2_q3',
    question: 'I appreciate fresh perspectives even from less experienced people',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'beta', weight: 3 },
      { id: 'gamma', weight: 2 },
      { id: 'alpha_rho', weight: 2 }
    ]
  },
  {
    id: 'p2_q4',
    question: 'I value honor and loyalty above personal gain',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'alpha_xi', weight: 3 },
      { id: 'beta', weight: 2 }
    ]
  },
  {
    id: 'p2_q5',
    question: 'I focus on justice and fairness in all situations',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'alpha_rho', weight: 3 },
      { id: 'alpha', weight: 1 }
    ]
  },
  {
    id: 'p2_q6',
    question: 'I use manipulation to get what I need',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'sigma_kappa', weight: 2 },
      { id: 'dark_alpha', weight: 1 }
    ]
  },
  {
    id: 'p2_q6b',
    question: 'I align with dominant social causes to gain approval or access',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'beta_kappa', weight: 3 },
      { id: 'beta', weight: 1 }
    ]
  },
  {
    id: 'p2_q7',
    question: 'I prefer gentle, nurturing approaches to conflict',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'beta_iota', weight: 3 },
      { id: 'beta', weight: 2 },
      { id: 'delta_mu', weight: 2 }
    ]
  },
  {
    id: 'p2_q8',
    question: 'I value tradition and established ways of doing things',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'beta_nu', weight: 3 },
      { id: 'delta', weight: 2 }
    ]
  },
  {
    id: 'p2_q9',
    question: 'I question social norms and conventional wisdom',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'gamma', weight: 3 },
      { id: 'sigma', weight: 2 }
    ]
  },
  {
    id: 'p2_q10',
    question: 'I am drawn to romantic ideals and deep emotional connection',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'gamma_nu', weight: 3 },
      { id: 'beta_iota', weight: 2 }
    ]
  },
  {
    id: 'p2_q11',
    question: 'I seek mystical or spiritual experiences',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'gamma_theta', weight: 3 },
      { id: 'phi', weight: 2 }
    ]
  },
  {
    id: 'p2_q12',
    question: 'I take calculated risks and seize opportunities',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'gamma_pi', weight: 3 },
      { id: 'alpha', weight: 1 }
    ]
  },
  {
    id: 'p2_q13',
    question: 'I feel isolated and disconnected from others',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_gamma', weight: 3 },
      { id: 'omega', weight: 2 },
      { id: 'sigma', weight: 1 }
    ]
  },
  {
    id: 'p2_q14',
    question: 'I find meaning in hard work and practical service',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'delta', weight: 3 },
      { id: 'beta', weight: 1 }
    ]
  },
  {
    id: 'p2_q15',
    question: 'I am naturally protective and fatherly/motherly',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'delta_mu', weight: 3 },
      { id: 'beta_rho', weight: 2 }
    ]
  },
  {
    id: 'p2_q16',
    question: 'I sacrifice my own needs for others frequently',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_delta', weight: 3 },
      { id: 'beta', weight: 2 }
    ]
  },
  {
    id: 'p2_q17',
    question: 'I prefer to work completely independently',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'sigma', weight: 3 },
      { id: 'gamma', weight: 1 }
    ]
  },
  {
    id: 'p2_q18',
    question: 'I use strategic thinking and indirect influence',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'sigma_kappa', weight: 3 },
      { id: 'gamma', weight: 1 }
    ]
  },
  {
    id: 'p2_q19',
    question: 'I express myself through creative or artistic work',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'sigma_lambda', weight: 3 },
      { id: 'gamma', weight: 1 }
    ]
  },
  {
    id: 'p2_q20',
    question: 'I am anti-establishment and reject social structures',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_sigma_zeta', weight: 3 },
      { id: 'sigma', weight: 1 }
    ]
  },
  {
    id: 'p2_q21',
    question: 'I feel powerless in social situations',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'omega', weight: 3 },
      { id: 'beta', weight: 1 }
    ]
  },
  {
    id: 'p2_q22',
    question: 'I feel destructive or nihilistic tendencies',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_omega', weight: 3 },
      { id: 'dark_gamma', weight: 2 }
    ]
  },
  {
    id: 'p2_q23',
    question: 'I operate beyond typical social hierarchies',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'phi', weight: 3 },
      { id: 'sigma', weight: 1 }
    ]
  },
  {
    id: 'p2_q24',
    question: 'I use care and nurturing as a form of control',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'beta_rho', weight: 3 },
      { id: 'delta_mu', weight: 1 }
    ]
  },
  {
    id: 'p2_q25',
    question: 'I become defensive when my methods are questioned',
    type: 'likert',
    scale: 5,
    archetypes: [
      { id: 'dark_alpha', weight: 3 },
      { id: 'alpha', weight: 1 },
      { id: 'gamma', weight: 1 }
    ]
  }
];

// SUBTYPE REFINEMENT: Targeted forced-choice questions to sharpen subtype selection
export const SUBTYPE_REFINEMENT_QUESTIONS = {
  alpha: [
    {
      id: 'p2_alpha_refine_1',
      question: 'Which leadership posture feels most natural to you?',
      type: 'forced_choice',
      options: [
        { text: 'Dominant, charismatic leadership', archetypes: ['alpha'], weight: 2 },
        { text: 'Resilient protector who defends others', archetypes: ['alpha_xi'], weight: 3 },
        { text: 'Just, fair, rule-setting authority', archetypes: ['alpha_rho'], weight: 3 },
        { text: 'Hard-edged dominance that can become tyrannical', archetypes: ['dark_alpha'], weight: 3 }
      ]
    },
    {
      id: 'p2_alpha_refine_2',
      question: 'In conflict, you are most likely to:',
      type: 'forced_choice',
      options: [
        { text: 'Take command and push for decisive action', archetypes: ['alpha'], weight: 2 },
        { text: 'Stand guard and absorb pressure for the group', archetypes: ['alpha_xi'], weight: 2 },
        { text: 'Enforce fairness and hold people to standards', archetypes: ['alpha_rho'], weight: 2 },
        { text: 'Crush resistance and assert dominance', archetypes: ['dark_alpha'], weight: 2 }
      ]
    }
  ],
  beta: [
    {
      id: 'p2_beta_refine_1',
      question: 'Which supportive role sounds most like you?',
      type: 'forced_choice',
      options: [
        { text: 'Reliable, supportive, but tends to defer', archetypes: ['beta'], weight: 2 },
        { text: 'Gentle, nurturing, innocent-leaning', archetypes: ['beta_iota'], weight: 3 },
        { text: 'Traditional, dutiful, and stability-focused', archetypes: ['beta_nu'], weight: 3 },
        { text: 'Strategic alignment for access or advantage', archetypes: ['beta_kappa'], weight: 3 },
        { text: 'Motherly/creator energy with controlling tendencies', archetypes: ['beta_rho'], weight: 3 }
      ]
    },
    {
      id: 'p2_beta_refine_2',
      question: 'When you provide for others, what drives you most?',
      type: 'forced_choice',
      options: [
        { text: 'Harmony and dependable support', archetypes: ['beta'], weight: 2 },
        { text: 'Innocence, caretaking, and reassurance', archetypes: ['beta_iota'], weight: 2 },
        { text: 'Duty, tradition, and long-term stability', archetypes: ['beta_nu'], weight: 2 },
        { text: 'Securing access or leverage through alignment', archetypes: ['beta_kappa'], weight: 2 },
        { text: 'Creative care with strong boundaries and direction', archetypes: ['beta_rho'], weight: 2 }
      ]
    }
  ],
  gamma: [
    {
      id: 'p2_gamma_refine_1',
      question: 'Which intellectual style fits you most?',
      type: 'forced_choice',
      options: [
        { text: 'Independent, rebellious outsider', archetypes: ['gamma'], weight: 2 },
        { text: 'Romantic idealist devoted to depth', archetypes: ['gamma_nu'], weight: 3 },
        { text: 'Mystic/prophetic and spiritually oriented', archetypes: ['gamma_theta'], weight: 3 },
        { text: 'Opportunistic, risk-taking, and fortune-seeking', archetypes: ['gamma_pi'], weight: 3 },
        { text: 'Isolated, detached, or nihilistic in outlook', archetypes: ['dark_gamma'], weight: 3 }
      ]
    },
    {
      id: 'p2_gamma_refine_2',
      question: 'When you face uncertainty, you tend to:',
      type: 'forced_choice',
      options: [
        { text: 'Question everything and seek truth', archetypes: ['gamma'], weight: 2 },
        { text: 'Idealize and seek a perfect connection', archetypes: ['gamma_nu'], weight: 2 },
        { text: 'Turn inward toward spiritual insight', archetypes: ['gamma_theta'], weight: 2 },
        { text: 'Gamble on opportunity and momentum', archetypes: ['gamma_pi'], weight: 2 },
        { text: 'Withdraw and become more detached', archetypes: ['dark_gamma'], weight: 2 }
      ]
    }
  ],
  delta: [
    {
      id: 'p2_delta_refine_1',
      question: 'Which service-oriented stance fits you most?',
      type: 'forced_choice',
      options: [
        { text: 'Practical, hardworking, and reliable', archetypes: ['delta'], weight: 2 },
        { text: 'Protective, fatherly/motherly, caretaking', archetypes: ['delta_mu'], weight: 3 },
        { text: 'Self-sacrificing or martyr-like', archetypes: ['dark_delta'], weight: 3 }
      ]
    }
  ],
  sigma: [
    {
      id: 'p2_sigma_refine_1',
      question: 'Which independent stance fits you most?',
      type: 'forced_choice',
      options: [
        { text: 'Self-sufficient lone wolf', archetypes: ['sigma'], weight: 2 },
        { text: 'Strategic, eccentric, or politically calculating', archetypes: ['sigma_kappa'], weight: 3 },
        { text: 'Creative, artistic, or bohemian', archetypes: ['sigma_lambda'], weight: 3 },
        { text: 'Anti-social, destructive, or destabilizing', archetypes: ['dark_sigma_zeta'], weight: 3 }
      ]
    },
    {
      id: 'p2_sigma_refine_2',
      question: 'Your independence most often expresses as:',
      type: 'forced_choice',
      options: [
        { text: 'Quiet autonomy and distance from hierarchies', archetypes: ['sigma'], weight: 2 },
        { text: 'Strategic influence behind the scenes', archetypes: ['sigma_kappa'], weight: 2 },
        { text: 'Creative self-expression outside convention', archetypes: ['sigma_lambda'], weight: 2 },
        { text: 'Rejection of norms with sharp defiance', archetypes: ['dark_sigma_zeta'], weight: 2 }
      ]
    }
  ],
  omega: [
    {
      id: 'p2_omega_refine_1',
      question: 'Which description feels closest?',
      type: 'forced_choice',
      options: [
        { text: 'Withdrawn, passive, and overlooked', archetypes: ['omega'], weight: 2 },
        { text: 'Destructive or entropic when overwhelmed', archetypes: ['dark_omega'], weight: 3 }
      ]
    }
  ],
  phi: [
    {
      id: 'p2_phi_refine_1',
      question: 'Which statement fits your orientation?',
      type: 'forced_choice',
      options: [
        { text: 'I operate beyond typical social categories and seek integration', archetypes: ['phi'], weight: 2 }
      ]
    }
  ]
};

// PHASE 3: Shadow/Integration Assessment (10-15 contextual questions)
// Purpose: Identify secondary influences and developmental areas
export const PHASE_3_QUESTIONS = [
  {
    id: 'p3_q1',
    question: 'Under high stress, I\'m most likely to:',
    type: 'forced_choice',
    options: [
      { text: 'Take charge and push harder', archetypes: ['alpha'], weight: 2 },
      { text: 'Withdraw and analyze alone', archetypes: ['gamma', 'sigma'], weight: 2 },
      { text: 'Seek support from trusted others', archetypes: ['beta'], weight: 2 },
      { text: 'Focus on practical tasks', archetypes: ['delta'], weight: 2 },
      { text: 'Become destructive or nihilistic', archetypes: ['dark_omega', 'dark_gamma'], weight: 2 },
      { text: 'Feel overwhelmed and shut down', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q2',
    question: 'In intimate relationships, I tend to:',
    type: 'forced_choice',
    options: [
      { text: 'Take a leadership role', archetypes: ['alpha'], weight: 2 },
      { text: 'Seek deep intellectual connection', archetypes: ['gamma'], weight: 2 },
      { text: 'Prioritize harmony and support', archetypes: ['beta'], weight: 2 },
      { text: 'Focus on practical partnership', archetypes: ['delta'], weight: 2 },
      { text: 'Maintain independence and space', archetypes: ['sigma'], weight: 2 },
      { text: 'Feel insecure and seek constant reassurance', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q3',
    question: 'When I feel I\'m not getting what I need, I:',
    type: 'forced_choice',
    options: [
      { text: 'Assert my needs directly', archetypes: ['alpha'], weight: 2 },
      { text: 'Question why and analyze the situation', archetypes: ['gamma'], weight: 2 },
      { text: 'Try to meet others\' needs hoping they\'ll reciprocate', archetypes: ['beta'], weight: 2 },
      { text: 'Work harder to earn what I need', archetypes: ['delta'], weight: 2 },
      { text: 'Withdraw and handle it independently', archetypes: ['sigma'], weight: 2 },
      { text: 'Feel powerless and resentful', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q4',
    question: 'Which of these considerations produces the most resistance in you?',
    type: 'forced_choice',
    options: [
      { text: 'Losing control or authority', archetypes: ['alpha'], weight: 2 },
      { text: 'Being wrong or ignorant', archetypes: ['gamma'], weight: 2 },
      { text: 'Being rejected or unloved', archetypes: ['beta'], weight: 2 },
      { text: 'Failing in my duties', archetypes: ['delta'], weight: 2 },
      { text: 'Losing my independence', archetypes: ['sigma'], weight: 2 },
      { text: 'Being completely alone', archetypes: ['omega'], weight: 2 }
    ]
  },
  // ASPIRATION TEST: Bias mitigation through reverse psychology
  {
    id: 'p3_aspiration_1',
    question: 'Which of these qualities do you most desire to embody?',
    type: 'multi_select',
    isAspiration: true,
    options: [
      { text: 'Leadership, authority, natural command', archetypes: ['alpha'], aspirationTarget: 'alpha', weight: 1 },
      { text: 'Being supportive, reliable, and well-liked', archetypes: ['beta'], aspirationTarget: 'beta', weight: 1 },
      { text: 'Intellectual depth, creative vision, understanding', archetypes: ['gamma'], aspirationTarget: 'gamma', weight: 1 },
      { text: 'Practical competence, steady service, reliability', archetypes: ['delta'], aspirationTarget: 'delta', weight: 1 },
      { text: 'Independence, freedom from social expectations', archetypes: ['sigma'], aspirationTarget: 'sigma', weight: 1 },
      { text: 'Peace, withdrawal, freedom from pressure', archetypes: ['omega'], aspirationTarget: 'omega', weight: 1 },
      { text: 'Transcendence, operating beyond normal categories', archetypes: ['phi'], aspirationTarget: 'phi', weight: 1 }
    ]
  },
  {
    id: 'p3_aspiration_2',
    question: 'Which of these descriptions best fits how others would describe you?',
    type: 'multi_select',
    isAspiration: true,
    options: [
      { text: 'They see me as comfortable with leadership and authority', archetypes: ['alpha'], aspirationTarget: 'alpha', weight: 1 },
      { text: 'They see me as supportive and reliable', archetypes: ['beta'], aspirationTarget: 'beta', weight: 1 },
      { text: 'They see me as intellectual or creative', archetypes: ['gamma'], aspirationTarget: 'gamma', weight: 1 },
      { text: 'They see me as practical and service-oriented', archetypes: ['delta'], aspirationTarget: 'delta', weight: 1 },
      { text: 'They see me as independent and non-conformist', archetypes: ['sigma'], aspirationTarget: 'sigma', weight: 1 },
      { text: 'They see me as withdrawn or passive', archetypes: ['omega'], aspirationTarget: 'omega', weight: 1 },
      { text: 'They see me as transcending typical categories', archetypes: ['phi'], aspirationTarget: 'phi', weight: 1 }
    ]
  },
  {
    id: 'p3_aspiration_3',
    question: 'What do you admire most in others?',
    type: 'multi_select',
    isAspiration: true,
    options: [
      { text: 'Natural leadership and confidence', archetypes: ['alpha'], aspirationTarget: 'alpha', weight: 1 },
      { text: 'Being well-liked and supportive', archetypes: ['beta'], aspirationTarget: 'beta', weight: 1 },
      { text: 'Intellectual depth and creative vision', archetypes: ['gamma'], aspirationTarget: 'gamma', weight: 1 },
      { text: 'Practical competence and steady service', archetypes: ['delta'], aspirationTarget: 'delta', weight: 1 },
      { text: 'Independence and freedom from expectations', archetypes: ['sigma'], aspirationTarget: 'sigma', weight: 1 },
      { text: 'Peace and freedom from social pressure', archetypes: ['omega'], aspirationTarget: 'omega', weight: 1 },
      { text: 'Operating beyond normal categories', archetypes: ['phi'], aspirationTarget: 'phi', weight: 1 }
    ]
  },
  {
    id: 'p3_aspiration_4',
    question: 'Which of these is your greatest weakness?',
    type: 'forced_choice',
    isAspiration: true,
    options: [
      { text: 'A burden of responsibility and constant pressure to lead', archetypes: ['alpha'], aspirationTarget: 'alpha', weight: 1 },
      { text: 'Submissive tendencies and lack of assertiveness', archetypes: ['beta'], aspirationTarget: 'beta', weight: 1 },
      { text: 'A tendency toward analysis paralysis and isolation', archetypes: ['gamma'], aspirationTarget: 'gamma', weight: 1 },
      { text: 'Being undervalued and lacking recognition', archetypes: ['delta'], aspirationTarget: 'delta', weight: 1 },
      { text: 'Social isolation and difficulty forming connections', archetypes: ['sigma'], aspirationTarget: 'sigma', weight: 1 },
      { text: 'Powerlessness and a tendency to be overlooked', archetypes: ['omega'], aspirationTarget: 'omega', weight: 1 },
      { text: 'Detachment and difficulty engaging with normal life', archetypes: ['phi'], aspirationTarget: 'phi', weight: 1 }
    ]
  },
  {
    id: 'p3_aspiration_5',
    question: 'Which of these would be the most unbearable for you?',
    type: 'forced_choice',
    isAspiration: true,
    options: [
      { text: 'A burden of responsibility and constant pressure to lead', archetypes: ['alpha'], aspirationTarget: 'alpha', weight: 1 },
      { text: 'Submissive tendencies and lack of assertiveness', archetypes: ['beta'], aspirationTarget: 'beta', weight: 1 },
      { text: 'A tendency toward analysis paralysis and isolation', archetypes: ['gamma'], aspirationTarget: 'gamma', weight: 1 },
      { text: 'Being undervalued and lacking recognition', archetypes: ['delta'], aspirationTarget: 'delta', weight: 1 },
      { text: 'Social isolation and difficulty forming connections', archetypes: ['sigma'], aspirationTarget: 'sigma', weight: 1 },
      { text: 'Powerlessness and a tendency to be overlooked', archetypes: ['omega'], aspirationTarget: 'omega', weight: 1 },
      { text: 'Detachment and difficulty engaging with normal life', archetypes: ['phi'], aspirationTarget: 'phi', weight: 1 }
    ]
  },
  {
    id: 'p3_q5',
    question: 'When others succeed where I haven\'t, I:',
    type: 'forced_choice',
    options: [
      { text: 'Feel competitive and work harder', archetypes: ['alpha'], weight: 2 },
      { text: 'Analyze what they did differently', archetypes: ['gamma'], weight: 2 },
      { text: 'Feel happy for them and supportive', archetypes: ['beta'], weight: 2 },
      { text: 'Focus on my own work and improvement', archetypes: ['delta'], weight: 2 },
      { text: 'Don\'t compare, focus on my own path', archetypes: ['sigma'], weight: 2 },
      { text: 'Feel inadequate and discouraged', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q6',
    question: 'In group settings, I often feel:',
    type: 'forced_choice',
    options: [
      { text: 'Natural taking leadership', archetypes: ['alpha'], weight: 2 },
      { text: 'Curious about different perspectives', archetypes: ['gamma'], weight: 2 },
      { text: 'Responsible for others\' comfort', archetypes: ['beta'], weight: 2 },
      { text: 'Useful when given clear tasks', archetypes: ['delta'], weight: 2 },
      { text: 'More comfortable observing', archetypes: ['sigma'], weight: 2 },
      { text: 'Uncomfortable and out of place', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q7',
    question: 'When I make a mistake, I typically:',
    type: 'forced_choice',
    options: [
      { text: 'Take responsibility and fix it immediately', archetypes: ['alpha'], weight: 2 },
      { text: 'Analyze what went wrong and learn from it', archetypes: ['gamma'], weight: 2 },
      { text: 'Feel bad and try to make it up to others', archetypes: ['beta'], weight: 2 },
      { text: 'Focus on practical correction', archetypes: ['delta'], weight: 2 },
      { text: 'Handle it independently without involving others', archetypes: ['sigma'], weight: 2 },
      { text: 'Feel overwhelmed and may avoid dealing with it', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q8',
    question: 'I aspire to be more:',
    type: 'forced_choice',
    options: [
      { text: 'Wise and integrated in my leadership', archetypes: ['alpha'], weight: 2, isAspirational: true },
      { text: 'Connected and understood by others', archetypes: ['gamma'], weight: 2, isAspirational: true },
      { text: 'Assertive and able to set boundaries', archetypes: ['beta'], weight: 2, isAspirational: true },
      { text: 'Confident in taking leadership', archetypes: ['delta'], weight: 2, isAspirational: true },
      { text: 'Able to connect and collaborate', archetypes: ['sigma'], weight: 2, isAspirational: true },
      { text: 'Confident and socially skilled', archetypes: ['omega'], weight: 2, isAspirational: true }
    ]
  },
  {
    id: 'p3_q9',
    question: 'When I feel most authentic, I am:',
    type: 'forced_choice',
    options: [
      { text: 'Leading and making decisions', archetypes: ['alpha'], weight: 2 },
      { text: 'Exploring ideas and questioning', archetypes: ['gamma'], weight: 2 },
      { text: 'Caring for and supporting others', archetypes: ['beta'], weight: 2 },
      { text: 'Working on practical, meaningful tasks', archetypes: ['delta'], weight: 2 },
      { text: 'Operating independently on my own terms', archetypes: ['sigma'], weight: 2 },
      { text: 'Alone and free from expectations', archetypes: ['omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_q10',
    question: 'My shadow side (what I try to hide) includes:',
    type: 'forced_choice',
    options: [
      { text: 'Need for control and dominance', archetypes: ['dark_alpha'], weight: 2, isShadow: true },
      { text: 'Isolation and nihilism', archetypes: ['dark_gamma'], weight: 2, isShadow: true },
      { text: 'Manipulation and self-interest', archetypes: ['sigma_kappa'], weight: 2, isShadow: true },
      { text: 'Martyrdom and resentment', archetypes: ['dark_delta'], weight: 2, isShadow: true },
      { text: 'Destructive rebellion', archetypes: ['dark_sigma_zeta'], weight: 2, isShadow: true },
      { text: 'Destructive consumption', archetypes: ['dark_omega'], weight: 2, isShadow: true }
    ]
  },

  // TEMPERAMENT INDICATORS: 6 questions probing the underlying processing and orientation
  // dimensions that differentiate archetypes with similar behavioral outputs.
  // Covers: shame vs fear, emotional contagion, processing mode,
  // achievement drive, risk posture, and attachment orientation.
  {
    id: 'p3_t1',
    question: 'After a serious falling-out with someone who matters to you, what lingers longest?',
    type: 'forced_choice',
    options: [
      { text: 'The thought that they now see me as weak or incompetent', archetypes: ['alpha'], weight: 2 },
      { text: 'The worry that the relationship is damaged or I might lose them', archetypes: ['beta', 'omega'], weight: 2 },
      { text: 'Whether I acted with integrity and stayed true to my values', archetypes: ['delta'], weight: 2 },
      { text: 'The intellectual frustration that it was never resolved clearly', archetypes: ['gamma'], weight: 2 },
      { text: 'Not much — I process it and move on independently', archetypes: ['sigma', 'phi'], weight: 2 }
    ]
  },
  {
    id: 'p3_t2',
    question: 'When you walk into a room carrying high emotional tension, your state:',
    type: 'forced_choice',
    options: [
      { text: 'Shifts quickly — I absorb whatever energy is already in the room', archetypes: ['beta', 'omega'], weight: 2 },
      { text: 'Stays unchanged — I observe the dynamics without being pulled in', archetypes: ['alpha', 'sigma'], weight: 2 },
      { text: 'Engages analytically — I read the situation without being affected', archetypes: ['gamma', 'sigma'], weight: 2 },
      { text: 'Responds with an impulse to stabilise or take charge of what I\'m sensing', archetypes: ['alpha', 'delta'], weight: 2 },
      { text: 'Senses undercurrents deeply but processes them privately and internally', archetypes: ['phi', 'gamma'], weight: 2 }
    ]
  },
  {
    id: 'p3_t3',
    question: 'Before committing to a major decision, your natural approach is to:',
    type: 'forced_choice',
    options: [
      { text: 'Map it out clearly — steps, risks, and what success looks like', archetypes: ['alpha', 'delta'], weight: 2 },
      { text: 'Sit with it until clarity emerges on its own', archetypes: ['sigma', 'phi'], weight: 2 },
      { text: 'Research and analyse until you understand the underlying logic fully', archetypes: ['gamma'], weight: 2 },
      { text: 'Consult trusted people and weigh their input before moving', archetypes: ['beta', 'delta'], weight: 2 },
      { text: 'Start moving and let structure emerge through action', archetypes: ['alpha', 'sigma'], weight: 2 }
    ]
  },
  {
    id: 'p3_t4',
    question: 'When you reflect on how your life is going, you measure success primarily by:',
    type: 'forced_choice',
    options: [
      { text: 'How I\'m doing relative to my peers and competitors', archetypes: ['alpha', 'gamma'], weight: 2 },
      { text: 'Whether the people closest to me are genuinely thriving', archetypes: ['beta', 'delta'], weight: 2 },
      { text: 'Whether I\'ve mastered what I care most about', archetypes: ['gamma', 'delta'], weight: 2 },
      { text: 'Whether I\'ve kept my freedom and lived on my own terms', archetypes: ['sigma', 'phi'], weight: 2 },
      { text: 'Whether I\'m respected and seen as capable by people I value', archetypes: ['alpha', 'delta'], weight: 2 }
    ]
  },
  {
    id: 'p3_t5',
    question: 'When a high-upside opportunity appears with real uncertainty, your instinct is to:',
    type: 'forced_choice',
    options: [
      { text: 'Move decisively — bold action is how results are created', archetypes: ['alpha'], weight: 2 },
      { text: 'Analyse thoroughly — understand fully before committing', archetypes: ['gamma', 'delta'], weight: 2 },
      { text: 'Find the approach with the lowest downside first', archetypes: ['delta', 'beta'], weight: 2 },
      { text: 'Follow your gut if it feels right — that\'s enough signal', archetypes: ['sigma', 'phi'], weight: 2 },
      { text: 'Seek input or validation from others before deciding', archetypes: ['beta', 'omega'], weight: 2 }
    ]
  },
  {
    id: 'p3_t6',
    question: 'In close relationships, the pattern you most recognise in yourself is:',
    type: 'forced_choice',
    options: [
      { text: 'I give freely but don\'t rely on others for my emotional stability', archetypes: ['alpha', 'sigma'], weight: 2 },
      { text: 'I value closeness but feel uneasy when connection feels inconsistent', archetypes: ['beta', 'omega'], weight: 2 },
      { text: 'I enjoy connection but guard my autonomy — real closeness is rare and earned', archetypes: ['sigma', 'gamma'], weight: 2 },
      { text: 'I invest deeply and take others\' wellbeing as my personal responsibility', archetypes: ['beta', 'delta'], weight: 2 },
      { text: 'I connect in ways that are hard to define — bonds form on different terms to most', archetypes: ['phi', 'gamma'], weight: 2 }
    ]
  }
];

// Respect context: perceived respect and deference (social vs business) for bias mitigation
// Clear phrasing; "social leadership" reframed as deference / scenario (who looks to you to decide)
export const RESPECT_CONTEXT_QUESTIONS = [
  {
    id: 'respect_social_feel',
    question: 'In your personal life — friends, family, people who know you outside work — how much do you feel respected by them?',
    type: 'likert',
    scale: 5,
    isRespectContext: true,
    respectContextKey: 'social',
    respectContextType: 'feel',
    likertLabels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much']
  },
  {
    id: 'respect_business_feel',
    question: 'At work or in your professional life — colleagues, clients, industry — how much do you feel respected by them?',
    type: 'likert',
    scale: 5,
    isRespectContext: true,
    respectContextKey: 'business',
    respectContextType: 'feel',
    likertLabels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much']
  },
  {
    id: 'respect_social_deference',
    question: 'When friends or family have to make an important decision, how often do they ask for your view or look to you to help decide?',
    type: 'likert',
    scale: 5,
    isRespectContext: true,
    respectContextKey: 'social',
    respectContextType: 'deference',
    likertLabels: ['Almost never', 'Rarely', 'Sometimes', 'Often', 'Almost always']
  },
  {
    id: 'respect_business_deference',
    question: 'When colleagues or clients have to make an important decision, how often do they ask for your view or look to you to help decide?',
    type: 'likert',
    scale: 5,
    isRespectContext: true,
    respectContextKey: 'business',
    respectContextType: 'deference',
    likertLabels: ['Almost never', 'Rarely', 'Sometimes', 'Often', 'Almost always']
  }
];

// PHASE 4: Validation & Narrative Matching (8-10 narrative vignettes)
// Purpose: Confirm archetype resonance
export const PHASE_4_QUESTIONS = [
  {
    id: 'p4_q1',
    question: 'Which scenario feels most like you?',
    type: 'narrative',
    vignettes: [
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. Everyone is looking to you for direction. You confidently assess the situation, consider input from others, and make a clear decision that everyone accepts. You feel energized and in your element.',
        archetypes: ['alpha'],
        weight: 3
      },
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. You notice several assumptions that haven\'t been questioned. You raise thoughtful questions, propose alternative perspectives, and the group engages in deeper analysis. You feel intellectually satisfied.',
        archetypes: ['gamma'],
        weight: 3
      },
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. You notice someone seems left out and another person looks stressed. You make sure everyone feels heard, help find common ground, and the group reaches consensus. You feel fulfilled by the harmony.',
        archetypes: ['beta'],
        weight: 3
      },
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. You focus on what\'s practical and achievable, break down the decision into actionable steps, and ensure the logistics are clear. You feel useful and productive.',
        archetypes: ['delta'],
        weight: 3
      },
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. You observe quietly, form your own opinion, and make your decision independently regardless of the group outcome. You feel autonomous and clear.',
        archetypes: ['sigma'],
        weight: 3
      },
      {
        text: 'You\'re at a team meeting where a major decision needs to be made. You feel overwhelmed by the discussion and unsure of your position. You go along with whatever is decided, feeling relieved when it\'s over.',
        archetypes: ['omega'],
        weight: 2
      }
    ]
  },
  {
    id: 'p4_q2',
    question: 'Which relationship dynamic resonates most?',
    type: 'narrative',
    vignettes: [
      {
        text: 'In your closest relationship, you naturally take the lead on major decisions. Your partner respects your judgment and you feel responsible for the relationship\'s direction. You value their input but make the final calls.',
        archetypes: ['alpha'],
        weight: 3
      },
      {
        text: 'In your closest relationship, you have deep, intellectual conversations that last for hours. You challenge each other\'s thinking and explore ideas together. Connection comes through shared curiosity and understanding.',
        archetypes: ['gamma'],
        weight: 3
      },
      {
        text: 'In your closest relationship, you prioritize harmony and mutual support. You\'re attentive to your partner\'s needs and they are to yours. You feel most connected when you\'re caring for each other.',
        archetypes: ['beta'],
        weight: 3
      },
      {
        text: 'In your closest relationship, you focus on practical partnership. You divide responsibilities, work together on shared goals, and build a stable life together. Connection comes through shared work and commitment.',
        archetypes: ['delta'],
        weight: 3
      },
      {
        text: 'In your closest relationship, you maintain strong independence. You value your partner but need significant space and autonomy. Connection comes through mutual respect for each other\'s independence.',
        archetypes: ['sigma'],
        weight: 3
      },
      {
        text: 'In your closest relationship, you often feel insecure and seek reassurance. You worry about being enough and may struggle to express your needs directly. You value acceptance and fear rejection.',
        archetypes: ['omega'],
        weight: 2
      }
    ]
  },
  {
    id: 'p4_q3',
    question: 'Which work scenario fits you best?',
    type: 'narrative',
    vignettes: [
      {
        text: 'You\'re leading a project that\'s facing challenges. You rally the team, make tough decisions, and push through obstacles. People look to you for direction and you deliver results. You thrive under pressure.',
        archetypes: ['alpha', 'alpha_xi'],
        weight: 3
      },
      {
        text: 'You\'re working on a complex problem that requires innovative thinking. You question conventional approaches, research deeply, and propose creative solutions. You work best when given intellectual freedom.',
        archetypes: ['gamma'],
        weight: 3
      },
      {
        text: 'You\'re part of a team where your role is supporting others and ensuring everyone works well together. You handle conflicts, coordinate communication, and help people feel included. The team functions better because of you.',
        archetypes: ['beta'],
        weight: 3
      },
      {
        text: 'You\'re working on a project with clear tasks and responsibilities. You focus on doing your part well, meeting deadlines, and ensuring quality. You take pride in reliable, practical work.',
        archetypes: ['delta'],
        weight: 3
      },
      {
        text: 'You\'re working independently on a project that requires your unique skills. You set your own pace, make your own decisions, and deliver results on your terms. You work best without oversight.',
        archetypes: ['sigma'],
        weight: 3
      },
      {
        text: 'You\'re working on a project but feel uncertain about your contributions. You need clear guidance and may struggle with confidence. You do better with structured support and encouragement.',
        archetypes: ['omega'],
        weight: 2
      }
    ]
  },
  {
    id: 'p4_q4',
    question: 'Which conflict resolution style fits you?',
    type: 'narrative',
    vignettes: [
      {
        text: 'When conflict arises, you step in to mediate or take control. You assess the situation, make a judgment, and enforce a resolution. You\'re comfortable with authority and making tough calls.',
        archetypes: ['alpha', 'alpha_rho'],
        weight: 3
      },
      {
        text: 'When conflict arises, you analyze the underlying issues and propose solutions that address root causes. You question assumptions and help people see different perspectives.',
        archetypes: ['gamma'],
        weight: 3
      },
      {
        text: 'When conflict arises, you focus on helping everyone feel heard and finding common ground. You work to restore harmony and ensure no one feels excluded or hurt.',
        archetypes: ['beta'],
        weight: 3
      },
      {
        text: 'When conflict arises, you focus on practical resolution and moving forward. You help people see what needs to be done and work toward getting things back on track.',
        archetypes: ['delta'],
        weight: 3
      },
      {
        text: 'When conflict arises, you remove yourself from the situation. You prefer to handle your own conflicts independently and avoid getting involved in others\' disputes.',
        archetypes: ['sigma'],
        weight: 3
      },
      {
        text: 'When conflict arises, you feel anxious and may avoid it entirely. You struggle with confrontation and may need support to address conflicts directly.',
        archetypes: ['omega'],
        weight: 2
      }
    ]
  },
  {
    id: 'p4_q5',
    question: 'Which personal growth journey resonates?',
    type: 'narrative',
    vignettes: [
      {
        text: 'You\'re learning to balance leadership with humility, to delegate effectively, and to develop emotional intelligence alongside your natural authority. You want to lead with wisdom, not just power.',
        archetypes: ['alpha'],
        weight: 2,
        isAspirational: true
      },
      {
        text: 'You\'re learning to balance intellectual independence with social connection, to share your insights in ways others can understand, and to value emotional intelligence alongside intellectual depth.',
        archetypes: ['gamma'],
        weight: 2,
        isAspirational: true
      },
      {
        text: 'You\'re learning to balance support for others with self-care, to set healthy boundaries, and to develop assertiveness alongside your natural nurturing. You want to care without losing yourself.',
        archetypes: ['beta'],
        weight: 2,
        isAspirational: true
      },
      {
        text: 'You\'re learning to balance practical service with personal ambition, to take on leadership when appropriate, and to value your contributions as more than just duty. You want to serve while also leading.',
        archetypes: ['delta'],
        weight: 2,
        isAspirational: true
      },
      {
        text: 'You\'re learning to balance independence with connection, to engage with others without losing autonomy, and to value collaboration alongside self-reliance. You want independence without isolation.',
        archetypes: ['sigma'],
        weight: 2,
        isAspirational: true
      },
      {
        text: 'You\'re learning to build confidence and social skills, to express your needs directly, and to value your contributions. You want to feel capable and connected without losing yourself.',
        archetypes: ['omega'],
        weight: 2,
        isAspirational: true
      }
    ]
  }
];

// PHASE 5: Status, Selection & Attraction Markers (gender-specific self-report)
// Purpose: Add selection-criteria signals that refine archetype positioning
export const PHASE_5_QUESTIONS = {
  male: [
    {
      id: 'p5_m_cr_courage',
      question: 'I stay steady and decisive when facing real risk or confrontation.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Cs)',
      markerLabel: 'Courage',
      archetypes: [
        { id: 'alpha_xi', weight: 2.0 },
        { id: 'alpha', weight: 1.2 },
        { id: 'sigma', weight: 0.6 }
      ]
    },
    {
      id: 'p5_m_cr_control',
      question: 'I maintain self-control and composure under pressure.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Cs)',
      markerLabel: 'Control',
      archetypes: [
        { id: 'alpha', weight: 1.4 },
        { id: 'alpha_rho', weight: 1.1 },
        { id: 'sigma', weight: 0.7 }
      ]
    },
    {
      id: 'p5_m_cr_competence',
      question: 'People rely on me to solve complex problems or secure resources.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Cs)',
      markerLabel: 'Competence',
      archetypes: [
        { id: 'gamma', weight: 1.4 },
        { id: 'delta', weight: 1.2 },
        { id: 'alpha', weight: 1.0 }
      ]
    },
    {
      id: 'p5_m_rc_perspicacity',
      question: 'I quickly perceive threats/opportunities and read situations accurately.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Perspicacity',
      archetypes: [
        { id: 'gamma', weight: 1.2 },
        { id: 'sigma_kappa', weight: 1.2 },
        { id: 'alpha', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_rc_protector',
      question: 'I can reliably protect and defend those close to me when needed.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Protector',
      archetypes: [
        { id: 'alpha_xi', weight: 1.6 },
        { id: 'delta_mu', weight: 1.2 },
        { id: 'alpha', weight: 1.0 }
      ]
    },
    {
      id: 'p5_m_rc_provider',
      question: 'I provide consistent resources and stability over time.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Provider',
      archetypes: [
        { id: 'delta', weight: 1.6 },
        { id: 'beta_nu', weight: 1.2 },
        { id: 'alpha', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_rc_parental',
      question: 'I am willing to invest deeply in long-term partnership and parenting.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Parental Investor',
      archetypes: [
        { id: 'delta_mu', weight: 1.5 },
        { id: 'beta_nu', weight: 1.3 },
        { id: 'beta', weight: 1.0 }
      ]
    },
    {
      id: 'p5_m_rc_provision_dating',
      question: 'I can comfortably fund dating, gifts, and courtship without financial strain.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Provision: dating & courtship',
      archetypes: [
        { id: 'delta', weight: 1.4 },
        { id: 'beta_nu', weight: 1.2 },
        { id: 'alpha', weight: 0.9 }
      ]
    },
    {
      id: 'p5_m_rc_provision_lifestyle',
      question: 'I can meaningfully contribute to holidays, major expenses, or occasional luxury without stress.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Provision: lifestyle & discretionary',
      archetypes: [
        { id: 'delta', weight: 1.5 },
        { id: 'delta_mu', weight: 1.2 },
        { id: 'beta_nu', weight: 1.0 }
      ]
    },
    {
      id: 'p5_m_rc_provision_stability',
      question: 'My income is stable and sufficient; I have or am building savings, investment, or home equity.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (4Ps)',
      markerLabel: 'Provision: income consistency & assets',
      archetypes: [
        { id: 'delta', weight: 1.6 },
        { id: 'delta_mu', weight: 1.3 },
        { id: 'beta_nu', weight: 1.0 }
      ]
    },
    {
      id: 'p5_m_aa_status',
      question: 'My status or accomplishments are clearly visible and shape how others respond.',
      type: 'likert',
      scale: 5,
      cluster: 'axis_of_attraction',
      clusterLabel: 'Axis of Attraction (Display Signals)',
      markerLabel: 'Performance/Status Signals',
      archetypes: [
        { id: 'alpha', weight: 1.6 },
        { id: 'gamma_pi', weight: 1.0 },
        { id: 'dark_alpha', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_aa_physical',
      question: 'Physical presence, fitness, and vitality are strengths I actively cultivate.',
      type: 'likert',
      scale: 5,
      cluster: 'axis_of_attraction',
      clusterLabel: 'Axis of Attraction (Display Signals)',
      markerLabel: 'Physical/Genetic Signals',
      archetypes: [
        { id: 'alpha', weight: 1.4 },
        { id: 'sigma', weight: 1.0 },
        { id: 'gamma_pi', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_ac_investment',
      question: 'I actively invest in my physical presentation — training, grooming, style, and appearance are a consistent priority.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Investment',
      archetypes: [
        { id: 'alpha', weight: 1.1 },
        { id: 'sigma', weight: 0.9 },
        { id: 'gamma', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_ac_response',
      question: 'The way I present myself physically generates noticeable positive responses from others — doors open, people lean in, I am treated differently.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Market Return',
      archetypes: [
        { id: 'alpha', weight: 1.3 },
        { id: 'sigma', weight: 1.1 },
        { id: 'delta', weight: 0.8 }
      ]
    },
    {
      id: 'p5_m_ac_engineering',
      question: 'I have deliberately and systematically worked to improve my physical appearance — this was an intentional project, not passive maintenance.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Engineering',
      archetypes: [
        { id: 'gamma_pi', weight: 1.1 },
        { id: 'delta', weight: 1.0 },
        { id: 'alpha', weight: 0.9 }
      ]
    },
    {
      id: 'p5_m_ac_gap',
      question: 'There is a significant gap between how I am received by strangers based on appearance and how people regard me once they know me well.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic-Behavioural Gap',
      likertLabels: ['No gap at all', 'Slight gap', 'Moderate gap', 'Noticeable gap', 'Large gap'],
      archetypes: [
        { id: 'gamma', weight: 1.1 },
        { id: 'beta', weight: 1.1 },
        { id: 'omega', weight: 1.0 }
      ]
    }
  ],
  female: [
    {
      id: 'p5_f_cr_social',
      question: 'I can shape perceptions and alliances in social groups when needed.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Ss)',
      markerLabel: 'Social Influence',
      archetypes: [
        { id: 'alpha', weight: 1.4 },
        { id: 'beta_kappa', weight: 1.0 },
        { id: 'gamma', weight: 0.6 }
      ]
    },
    {
      id: 'p5_f_cr_selectivity',
      question: 'I can attract and retain high-value attention without losing leverage.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Ss)',
      markerLabel: 'Selectivity & Mate Guarding',
      archetypes: [
        { id: 'alpha', weight: 1.2 },
        { id: 'beta_rho', weight: 1.0 },
        { id: 'beta_kappa', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_cr_status',
      question: 'I know how to signal status/beauty without provoking backlash.',
      type: 'likert',
      scale: 5,
      cluster: 'coalition_rank',
      clusterLabel: 'Coalition Rank (3Ss)',
      markerLabel: 'Status Signaling',
      archetypes: [
        { id: 'alpha', weight: 1.3 },
        { id: 'beta_kappa', weight: 1.0 },
        { id: 'beta_nu', weight: 0.7 }
      ]
    },
    {
      id: 'p5_f_rc_loyalty',
      question: 'I naturally signal loyalty and exclusivity in committed bonds.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Paternity Certainty',
      archetypes: [
        { id: 'beta_nu', weight: 1.5 },
        { id: 'beta', weight: 1.0 },
        { id: 'delta_mu', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_rc_nurture',
      question: 'My nurturing standard is high; I naturally provide care and warmth.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Nurturing Standard',
      archetypes: [
        { id: 'beta_iota', weight: 1.4 },
        { id: 'delta_mu', weight: 1.2 },
        { id: 'beta', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_rc_trust',
      question: 'I build collaborative trust and avoid chronic conflict in partnership.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Collaborative Trust',
      archetypes: [
        { id: 'delta', weight: 1.2 },
        { id: 'beta_nu', weight: 1.0 },
        { id: 'beta', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_aa_fertility',
      question: 'I actively maintain health, vitality, and fertility cues.',
      type: 'likert',
      scale: 5,
      cluster: 'axis_of_attraction',
      clusterLabel: 'Axis of Attraction (Male Mate Choice)',
      markerLabel: 'Fertility & Health Cues',
      archetypes: [
        { id: 'alpha', weight: 1.2 },
        { id: 'beta_iota', weight: 1.0 },
        { id: 'beta_rho', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_aa_risk',
      question: 'I keep volatility low and avoid behaviors that signal instability.',
      type: 'likert',
      scale: 5,
      cluster: 'axis_of_attraction',
      clusterLabel: 'Axis of Attraction (Male Mate Choice)',
      markerLabel: 'Risk-Cost Management',
      archetypes: [
        { id: 'beta_nu', weight: 1.2 },
        { id: 'delta', weight: 1.0 },
        { id: 'beta', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_rc_maternal_identity',
      question: 'Having children and being a mother is a meaningful part of how I see my life or future.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Maternal Identity',
      archetypes: [
        { id: 'beta_rho', weight: 1.6 },
        { id: 'delta', weight: 1.4 },
        { id: 'beta', weight: 1.0 }
      ]
    },
    {
      id: 'p5_f_rc_maternal_instinct',
      question: 'When I am around young children, I naturally take on a nurturing, protective role without being asked.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Maternal Instinct',
      archetypes: [
        { id: 'beta_rho', weight: 1.5 },
        { id: 'delta_mu', weight: 1.3 },
        { id: 'delta', weight: 1.1 }
      ]
    },
    {
      id: 'p5_f_rc_nesting',
      question: 'Creating a stable, warm home environment is a genuine priority for me, not just a convenience.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Nesting & Home Orientation',
      archetypes: [
        { id: 'delta', weight: 1.5 },
        { id: 'beta_nu', weight: 1.3 },
        { id: 'beta_rho', weight: 1.1 }
      ]
    },
    {
      id: 'p5_f_rc_maternal_impulse',
      question: 'I feel a genuine pull toward caring for and raising children that feels instinctive, not just socially expected.',
      type: 'likert',
      scale: 5,
      cluster: 'reproductive_confidence',
      clusterLabel: 'Reproductive Confidence (Male Selection Criteria)',
      markerLabel: 'Child-Rearing Impulse',
      archetypes: [
        { id: 'beta_rho', weight: 1.6 },
        { id: 'delta_mu', weight: 1.3 },
        { id: 'delta', weight: 1.0 }
      ]
    },
    {
      id: 'p5_f_id_aesthetic',
      question: 'My approach to appearance, fitness, and physical self-expression is structured, disciplined, and goal-oriented.',
      type: 'likert',
      scale: 5,
      cluster: 'identity_expression',
      clusterLabel: 'Identity & Self-Expression',
      markerLabel: 'Aesthetic Structure vs Flow',
      likertLabels: ['Intuitive / go with flow', 'Mostly relaxed', 'Mixed', 'Mostly structured', 'Disciplined and goal-driven'],
      archetypes: [
        { id: 'alpha', weight: 1.4 },
        { id: 'gamma_pi', weight: 1.2 }
      ]
    },
    {
      id: 'p5_f_id_career',
      question: 'My career, professional ambitions, or intellectual work are central to how I define myself.',
      type: 'likert',
      scale: 5,
      cluster: 'identity_expression',
      clusterLabel: 'Identity & Self-Expression',
      markerLabel: 'Career / Achievement as Identity',
      likertLabels: ['Not at all', 'A little', 'Somewhat', 'Quite a bit', 'Very much so'],
      archetypes: [
        { id: 'gamma', weight: 1.5 },
        { id: 'alpha', weight: 1.2 }
      ]
    },
    {
      id: 'p5_f_ac_investment',
      question: 'I consistently invest in my physical appearance — fitness, grooming, style, and presentation are things I actively manage.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Investment',
      archetypes: [
        { id: 'alpha_female', weight: 1.4 },
        { id: 'gamma_feminist_female', weight: 0.9 },
        { id: 'delta_female', weight: 0.8 }
      ]
    },
    {
      id: 'p5_f_ac_response',
      question: 'My physical appearance generates tangible advantages in social, romantic, and professional environments — I am aware that I am treated differently because of how I look.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Market Return',
      archetypes: [
        { id: 'alpha_female', weight: 1.5 },
        { id: 'sigma_female', weight: 1.1 },
        { id: 'beta_female', weight: 0.9 }
      ]
    },
    {
      id: 'p5_f_ac_engineering',
      question: 'I have made deliberate, systematic improvements to my appearance — this has been a conscious effort to present myself at a higher level than my natural baseline.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic Engineering',
      archetypes: [
        { id: 'gamma_feminist_female', weight: 1.1 },
        { id: 'alpha_female', weight: 1.0 }
      ]
    },
    {
      id: 'p5_f_ac_gap',
      question: 'There is a noticeable difference between the level of attention and treatment I receive from people who do not know me versus those who do — my appearance sets an expectation I do not always match in other ways.',
      type: 'likert',
      scale: 5,
      cluster: 'aesthetics_capital',
      clusterLabel: 'Aesthetic Capital',
      markerLabel: 'Aesthetic-Behavioural Gap',
      likertLabels: ['No gap at all', 'Slight gap', 'Moderate gap', 'Noticeable gap', 'Large gap'],
      archetypes: [
        { id: 'dark_alpha_female', weight: 1.1 },
        { id: 'beta_kappa_female', weight: 1.1 }
      ]
    }
  ]
};

