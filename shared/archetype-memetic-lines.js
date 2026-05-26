/**
 * Memetic summary lines per archetype id. Value is either one string or two strings to alternate every few seconds in UI.
 */

export const ARCHETYPE_MEMETIC_BY_ID = {
  // Male (dual where provided)
  alpha: [
    "Commands the room, sets the frame … can't afford to leave it",
    'High status, high pull … constant pressure to hold it'
  ],
  alpha_xi: 'dies for the mission, not the spotlight',
  alpha_rho: [
    'Principled, consistent, respected … loses the room',
    'Clear standards, enforced rules … intimacy never made the cut'
  ],
  dark_alpha: [
    'Powerful, commanding, magnetic … empties every room over time',
    'High dominance, high presence … fear replaces loyalty'
  ],
  beta: 'useful, reliable... replaceable',
  beta_iota: [
    'Warm, present, genuinely kind … too harmless to want',
    'Good heart, open hands … softened the edges that made him matter'
  ],
  beta_kappa: 'agrees to belong',
  beta_nu: [
    'Loyal, reliable, fully committed … before desire had a vote',
    'Consistent, devoted, all in … skipped the fire'
  ],
  beta_rho: 'Indispensable on purpose... intimacy on a leash',
  gamma: [
    'Sharp, perceptive, sees the system … opted out early',
    'Intelligent, analytical, self-aware … calls avoidance clarity'
  ],
  gamma_nu: 'loves the idea of love',
  gamma_theta: 'talks to God, struggles with people',
  gamma_pi: [
    'Bold, high-risk, exciting … bets big to avoid the score',
    'Magnetic, spontaneous, lives large … avoids consistency'
  ],
  dark_gamma: 'sees through everything, believes in nothing',
  delta: 'keeps the world running, never leads it',
  delta_mu: [
    'Warm, protective, genuinely fatherly … desired by no one',
    'Steady, caring, always there … never pursued'
  ],
  dark_delta: 'Gives everything... but keeps the receipts.',
  sigma: [
    'Self-directed, high leverage, outside the system … left before it could place him',
    'Autonomous, capable, plays solo … still orbits judgment'
  ],
  sigma_kappa: [
    "Strategic, effective, moves pieces unseen … can't be trusted closely",
    'Intelligent, precise, controls outcomes … reads as dishonest up close'
  ],
  sigma_lambda: [
    'Creative, deep, builds extraordinary things … leaves no room for someone else',
    'Talented, solitary, world-class inner life … mistook it for a full one'
  ],
  dark_sigma_zeta: [
    "Principled, defiant, sees corruption … tears down what he can't build",
    'Fierce, uncompromising, no false loyalty … lives in the rubble'
  ],
  omega: [
    'Perceptive, sensitive, reads damage … still waiting',
    'Thoughtful, aware, preserves himself … guarantees rejection'
  ],
  dark_omega: [
    'Real pain, real wound, deeply felt … turns it into a tax',
    'Suffered genuinely, feels deeply … grievance becomes strategy'
  ],
  phi: "Above the hierarchy... under the roof's mess",

  // Female (dual where provided)
  alpha_female: 'desired, selects-not chased',
  alpha_xi_female: 'cuts through men with standards',
  alpha_unicorn_female: 'idealized loyalty fantasy',
  alpha_iota_female: [
    'Maintains harmony, supports others … absorbs pressure',
    'Keeps peace, manages emotions … internalizes strain'
  ],
  dark_alpha_female: [
    'Controls dynamics, directs outcomes … isolates herself',
    'Holds power, dominates space … loses softness'
  ],
  beta_female: [
    'Secures commitment, prioritizes stability … negotiates desire',
    'Trades access, gains security … reduces attraction'
  ],
  beta_nu_female: [
    'Follows tradition, builds structure … loses self',
    'Commits to role, sustains system … forgets identity'
  ],
  beta_kappa_female: [
    'Leverages attention, reads angles … feels unclaimed',
    'Gains advantage, controls outcomes … lacks attachment'
  ],
  beta_rho_female: [
    'Nurtures deeply, provides care … creates dependence',
    'Gives constantly, anchors others … traps connection'
  ],
  gamma_female: [
    'Evaluates carefully, sees flaws … reveals little',
    'Assesses value, filters hard … limits intimacy'
  ],
  gamma_theta_female: [
    'Sees deeply, reads people … stays distant',
    'Understands motives, detects patterns … avoids closeness'
  ],
  gamma_feminist_female: [
    'Builds independence, prioritizes self … narrows options',
    'Focuses career, achieves stability … misses timing'
  ],
  dark_gamma_female: [
    'Understands pain, analyzes deeply … stays stuck',
    'Thinks clearly, processes fully … never resolves'
  ],
  delta_female: [
    'Gives fully, nurtures consistently … fades in desire',
    'Builds home, offers care … loses attraction'
  ],
  delta_mu_female: [
    'Warm publicly, engaging socially … volatile privately',
    'Charms openly, connects easily … overwhelms later'
  ],
  dark_delta_female: [
    'Gives endlessly, sacrifices fully … builds resentment',
    'Invests deeply, commits strongly … grows bitter'
  ],
  sigma_female: [
    'Self-sufficient, independent … blocks connection',
    'Moves freely, avoids reliance … stays alone'
  ],
  sigma_feminist_female: [
    'Eliminates dependence, maximizes autonomy … removes intimacy',
    'Secures independence, avoids compromise … prevents bonding'
  ],
  dark_sigma_zeta_female: [
    'Opposes systems, asserts identity … depends on opposition',
    'Claims freedom, resists structure … remains tied to it'
  ],
  omega_female: [
    'Avoids risk, protects self … stays unseen',
    'Withdraws early, limits exposure … confirms fear'
  ],
  dark_omega_female: [
    'Holds pain, protects ego … spreads damage',
    'Stays wounded, avoids vulnerability … harms others'
  ],
  phi_female: [
    'Calm presence, low demand … lacks pull',
    'Steady energy, peaceful nature … goes unnoticed'
  ]
};

/** @returns {string[]} Non-empty normalized line list (one or two entries typical). */
export function getMemeticLinesForId(id) {
  const raw = ARCHETYPE_MEMETIC_BY_ID[id];
  if (raw == null) return [];
  const lines = Array.isArray(raw) ? raw : [raw];
  return lines.map((s) => String(s ?? '').trim()).filter(Boolean);
}

/** @returns {boolean} */
export function hasDualMemeticLines(id) {
  return getMemeticLinesForId(id).length > 1;
}

/** When an id has no dedicated memetic line, fall back to parent-cluster one-liner (engine report). */
export const MEMETIC_PARENT_FALLBACK_ENGINE = {
  alpha: 'I decide.',
  beta: 'Pick me.',
  gamma: "I see what others don't-but can't convert it.",
  delta: 'Tell me what to do.',
  sigma: "I don't need your game.",
  omega: 'Why try?',
  phi: "Above the hierarchy... under the roof's mess"
};

/** @returns {string[]} */
export function getMemeticDisplayLinesForEngine(archetype) {
  const id = archetype?.id || '';
  const lines = getMemeticLinesForId(id);
  if (lines.length) return lines;
  const parent = archetype?.parentType || id.split('_')[0] || '';
  const fb = MEMETIC_PARENT_FALLBACK_ENGINE[parent];
  return fb ? [fb] : [];
}

/** First line for compact subtitles (e.g. integrated map). */
export function getFirstMemeticLineForEngine(archetype) {
  const lines = getMemeticDisplayLinesForEngine(archetype);
  return lines[0] || '';
}
