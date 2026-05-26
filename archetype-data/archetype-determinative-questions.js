// Phase 6 determinative questions: subtype discriminators inside selected families.
// These are intentionally narrow and only used when signal density is low or tie pressure is high.

export const PHASE_6_DETERMINATIVE_QUESTIONS = {
  alpha: [
    {
      id: 'p6_alpha_1',
      type: 'forced_choice',
      question: 'When challenged, which response is most instinctive?',
      options: [
        { text: 'Command the room and set direction immediately', archetypes: ['alpha'], weight: 2 },
        { text: 'Shield allies and absorb pressure first', archetypes: ['alpha_xi'], weight: 2 },
        { text: 'Enforce principle and due process', archetypes: ['alpha_rho'], weight: 2 },
        { text: 'Crush opposition to preserve control', archetypes: ['dark_alpha'], weight: 2 }
      ]
    }
  ],
  beta: [
    {
      id: 'p6_beta_1',
      type: 'forced_choice',
      question: 'Your support pattern most often looks like:',
      options: [
        { text: 'Reliable stabilizer who keeps things running', archetypes: ['beta'], weight: 2 },
        { text: 'Tender reassurance and innocent care', archetypes: ['beta_iota'], weight: 2 },
        { text: 'Tradition, duty, and long-term structure', archetypes: ['beta_nu'], weight: 2 },
        { text: 'Alignment for access and social leverage', archetypes: ['beta_kappa'], weight: 2 },
        { text: 'Nurture mixed with directional control', archetypes: ['beta_rho'], weight: 2 }
      ]
    }
  ],
  gamma: [
    {
      id: 'p6_gamma_1',
      type: 'forced_choice',
      question: 'Your outsider edge most often expresses as:',
      options: [
        { text: 'Critical independence and system skepticism', archetypes: ['gamma'], weight: 2 },
        { text: 'Romantic idealism and emotional devotion', archetypes: ['gamma_nu'], weight: 2 },
        { text: 'Mystic-symbolic insight and prophecy framing', archetypes: ['gamma_theta'], weight: 2 },
        { text: 'Opportunity-pouncing and calculated risk', archetypes: ['gamma_pi'], weight: 2 },
        { text: 'Detached nihilism and social withdrawal', archetypes: ['dark_gamma'], weight: 2 }
      ]
    }
  ],
  delta: [
    {
      id: 'p6_delta_1',
      type: 'forced_choice',
      question: 'Your service orientation is best described as:',
      options: [
        { text: 'Practical execution and steady reliability', archetypes: ['delta'], weight: 2 },
        { text: 'Protective caregiving and family sheltering', archetypes: ['delta_mu'], weight: 2 },
        { text: 'Self-sacrifice that drifts into resentment', archetypes: ['dark_delta'], weight: 2 }
      ]
    }
  ],
  sigma: [
    {
      id: 'p6_sigma_1',
      type: 'forced_choice',
      question: 'Your independence usually takes which form?',
      options: [
        { text: 'Quiet self-rule outside group hierarchy', archetypes: ['sigma'], weight: 2 },
        { text: 'Strategic influence and indirect positioning', archetypes: ['sigma_kappa'], weight: 2 },
        { text: 'Creative detachment and aesthetic solitude', archetypes: ['sigma_lambda'], weight: 2 },
        { text: 'Hostile anti-system rejection and burn-down impulse', archetypes: ['dark_sigma_zeta'], weight: 2 }
      ]
    }
  ],
  omega: [
    {
      id: 'p6_omega_1',
      type: 'forced_choice',
      question: 'Under prolonged stress, the pattern is:',
      options: [
        { text: 'Withdrawal, passivity, and shutdown', archetypes: ['omega'], weight: 2 },
        { text: 'Destructive collapse that harms self/others', archetypes: ['dark_omega'], weight: 2 }
      ]
    }
  ],
  phi: []
};
