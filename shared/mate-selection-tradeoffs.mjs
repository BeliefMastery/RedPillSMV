/**
 * Women’s mate-selection desired-partner postures and trade-off framing.
 * Narrative + tension prioritization only — does not rescale SMV cluster weights.
 */

export const FORCED_PRIORITIZATION_LEAD =
  'You cannot optimize for every variable simultaneously. Extreme career drive trades spontaneous leisure; high-energy emotional attunement can trade straightforward pragmatic problem-solving. Long-term compatibility is less about a flawless archetype than which trade-offs you can live with—and which ones quietly build resentment.';

export const FALSE_DICHOTOMY_NOTES = [
  {
    id: 'ambition_vs_family',
    title: 'Ambition vs. Family',
    body: 'Highly successful people often have limited time, but ambition is not mutually exclusive with engaged parenting—it usually requires hyper-strict boundary setting and intentionality.'
  },
  {
    id: 'providers_and_equality',
    title: 'Providers and Equality',
    body: 'A partner can take pride in being the primary financial provider while still holding deeply egalitarian values on autonomy, decision-making, and mutual respect.'
  },
  {
    id: 'leaders_vs_collaboration',
    title: 'Leaders vs. Collaboration',
    body: 'A strong leader in life or work is not inherently a dictator at home. True leadership often looks like active listening, not refusing input.'
  }
];

/** Axes used for tension ranking (narrative prioritization). */
export const TRADEOFF_AXES = {
  lead_vs_direction: {
    id: 'lead_vs_direction',
    label: 'Lead vs being directed',
    conflictHint: 'Wanting charge without yielding instruction rights creates chronic friction.'
  },
  provision_vs_framework: {
    id: 'provision_vs_framework',
    label: 'Classic provision vs modern egalitarian frame',
    conflictHint: 'Classic provider roles rarely sit cleanly inside a fully modernist feminist household script.'
  },
  equality_vs_prompting: {
    id: 'equality_vs_prompting',
    label: '50/50 equality vs managerial prompting',
    conflictHint: 'Egalitarian preference without shared load often becomes constant direction and resentment.'
  },
  soul_vs_breadwinning: {
    id: 'soul_vs_breadwinning',
    label: 'Creative/spiritual depth vs breadwinning',
    conflictHint: 'Feeling-attuned creative partners often need someone else to stabilize material load.'
  },
  domestic_vs_ambition: {
    id: 'domestic_vs_ambition',
    label: 'Domestic devotion vs external ambition',
    conflictHint: 'Hands-on domestic parenting intensity usually trades relentless outside-world drive.'
  },
  freedom_vs_focus: {
    id: 'freedom_vs_focus',
    label: 'Unbound optimism vs contained focus',
    conflictHint: 'Free-spirit energy rarely delivers laser attention or absolute containment.'
  },
  looks_vs_investment: {
    id: 'looks_vs_investment',
    label: 'Visual excellence vs mirrored investment',
    conflictHint: 'Exceptional looks without mirrored investment often feel extractive over time.'
  },
  status_vs_attention: {
    id: 'status_vs_attention',
    label: 'Unbounded achievement vs external attention competition',
    conflictHint: 'Top-tier unbound success usually brings constant competition from outside attention.'
  }
};

/**
 * Eight desired partner postures for women’s mate selection.
 * Soft maps to Alpha–Phi / Attraction pillars — not a replacement taxonomy.
 */
export const POSTURE_FAMILIES = {
  leader: {
    id: 'leader',
    title: 'The Leader',
    desireLine: 'If you want someone to take charge, don’t expect him to follow your instructions.',
    costLine: 'Directive lead implies you yield day-to-day instruction rights more often than you keep them.',
    conflictAxes: ['lead_vs_direction'],
    archetypeIds: ['alpha', 'alpha_xi', 'alpha_rho'],
    familyIds: ['alpha'],
    attractionPillars: [],
    relationshipPoints: ['core-values', 'communication-styles', 'energy-dynamics', 'mutual-support']
  },
  traditional_provider: {
    id: 'traditional_provider',
    title: 'The Traditional Provider',
    desireLine: 'If you want a classic provider, don’t expect a modern feminist framework.',
    costLine: 'Primary provision pride often comes with clearer role expectations than a fully interchangeable script.',
    conflictAxes: ['provision_vs_framework'],
    archetypeIds: ['delta', 'beta_nu'],
    familyIds: ['delta', 'beta'],
    attractionPillars: [],
    relationshipPoints: ['financial-compatibility', 'core-values', 'lifestyle-compatibility', 'mutual-support']
  },
  egalitarian: {
    id: 'egalitarian',
    title: 'The Egalitarian',
    desireLine: 'If you want a feminist partner, be prepared to split everything 50/50—or accept having to constantly prompt and direct him.',
    costLine: 'Ideological equality without shared load becomes managerial prompting and quiet contempt.',
    conflictAxes: ['equality_vs_prompting'],
    archetypeIds: ['beta_kappa'],
    familyIds: ['beta'],
    attractionPillars: [],
    relationshipPoints: ['core-values', 'mutual-support', 'financial-compatibility', 'communication-styles']
  },
  spiritually_attuned_artist: {
    id: 'spiritually_attuned_artist',
    title: 'The Spiritually Attuned Artist',
    desireLine: 'If you want a soul who is creative, spiritual, and deeply in touch with feelings, be prepared to handle the breadwinning.',
    costLine: 'Depth of feeling and creative/spiritual attunement often trades pragmatic resource generation.',
    conflictAxes: ['soul_vs_breadwinning'],
    archetypeIds: ['gamma_theta', 'sigma_lambda'],
    familyIds: ['gamma', 'sigma'],
    attractionPillars: [],
    relationshipPoints: ['financial-compatibility', 'energy-dynamics', 'lifestyle-compatibility', 'emotional-intelligence']
  },
  domestic_anchor: {
    id: 'domestic_anchor',
    title: 'The Domestic Anchor',
    desireLine: 'If you want a partner thoroughly devoted to domestic tasks and hands-on parenting, don’t expect relentless external ambition.',
    costLine: 'Deep household and parenting devotion usually trades status-chasing external drive.',
    conflictAxes: ['domestic_vs_ambition'],
    archetypeIds: ['delta_mu'],
    familyIds: ['delta'],
    attractionPillars: [],
    relationshipPoints: ['lifestyle-compatibility', 'mutual-support', 'energy-dynamics', 'core-values']
  },
  free_spirit: {
    id: 'free_spirit',
    title: 'The Free Spirit',
    desireLine: 'If you want an unbound optimist, don’t expect laser-focused attention or absolute containment of energy.',
    costLine: 'Optimistic unbound energy rarely delivers tight focus, predictability, or contained attention.',
    conflictAxes: ['freedom_vs_focus'],
    archetypeIds: ['sigma', 'gamma'],
    familyIds: ['sigma', 'gamma'],
    attractionPillars: [],
    relationshipPoints: ['energy-dynamics', 'lifestyle-compatibility', 'personal-boundaries', 'communication-styles']
  },
  visually_striking: {
    id: 'visually_striking',
    title: 'The Visually Striking',
    desireLine: 'If you want someone exceptionally handsome and fit, you need to mirror that investment—or risk feeling used.',
    costLine: 'Elite looks without mirrored investment often read as asymmetric extraction over time.',
    conflictAxes: ['looks_vs_investment'],
    archetypeIds: [],
    familyIds: [],
    attractionPillars: ['physicalGenetic'],
    relationshipPoints: ['sexual-compatibility', 'lifestyle-compatibility', 'energy-dynamics']
  },
  unbound_high_achiever: {
    id: 'unbound_high_achiever',
    title: 'The Unbound High-Achiever',
    desireLine: 'If you want top-tier professional success without traditional or religious boundaries, be prepared for constant competition from external attention.',
    costLine: 'Unbounded elite achievement usually invites outside attention you must compete with for focus and loyalty.',
    conflictAxes: ['status_vs_attention'],
    archetypeIds: ['sigma', 'phi'],
    familyIds: ['sigma', 'phi'],
    attractionPillars: ['performanceStatus', 'radActivity'],
    relationshipPoints: ['lifestyle-compatibility', 'energy-dynamics', 'trust-reliability', 'sexual-compatibility']
  }
};

/** Pairs that commonly conflict when co-selected without prioritization. */
export const POSTURE_CONFLICT_PAIRS = [
  { a: 'leader', b: 'egalitarian', axis: 'lead_vs_direction', weight: 0.95 },
  { a: 'traditional_provider', b: 'egalitarian', axis: 'provision_vs_framework', weight: 0.92 },
  { a: 'spiritually_attuned_artist', b: 'traditional_provider', axis: 'soul_vs_breadwinning', weight: 0.88 },
  { a: 'spiritually_attuned_artist', b: 'unbound_high_achiever', axis: 'soul_vs_breadwinning', weight: 0.85 },
  { a: 'domestic_anchor', b: 'unbound_high_achiever', axis: 'domestic_vs_ambition', weight: 0.9 },
  { a: 'free_spirit', b: 'leader', axis: 'freedom_vs_focus', weight: 0.8 },
  { a: 'free_spirit', b: 'unbound_high_achiever', axis: 'freedom_vs_focus', weight: 0.82 },
  { a: 'visually_striking', b: 'spiritually_attuned_artist', axis: 'looks_vs_investment', weight: 0.55 },
  { a: 'visually_striking', b: 'domestic_anchor', axis: 'looks_vs_investment', weight: 0.5 }
];

export const LEARN_INTRO = {
  title: 'Mate-selection trade-offs',
  lead: 'A forced-prioritization frame for women selecting long-term partners: each desired posture carries a predictable cost. Use it to name trade-offs early—before quiet resentment does.',
  disclaimer:
    'Descriptive selection framing only—not moral judgment, destiny, or therapy. Human beings rarely fit two-dimensional boxes; these pairings highlight common friction points and prioritization pressure.'
};

export const POSTURE_PREFERENCE_OPTIONS = Object.values(POSTURE_FAMILIES).map((p) => ({
  value: p.id,
  label: p.title
}));

export const TRADEOFF_REFUSE_OPTIONS = [
  { value: 'none', label: 'None yet — still clarifying' },
  { value: 'lead_vs_direction', label: 'Being directed / losing day-to-day instruction rights' },
  { value: 'provision_vs_framework', label: 'Non-egalitarian household frame with a classic provider' },
  { value: 'equality_vs_prompting', label: 'Having to prompt and manage a “50/50” partner' },
  { value: 'soul_vs_breadwinning', label: 'Carrying primary breadwinning for a creative/spiritual partner' },
  { value: 'domestic_vs_ambition', label: 'Limited external ambition for deep domestic devotion' },
  { value: 'freedom_vs_focus', label: 'Diffuse attention / unbound energy without containment' },
  { value: 'looks_vs_investment', label: 'Mirroring high looks/fitness investment myself' },
  { value: 'status_vs_attention', label: 'Competing with outside attention around high achievers' }
];

function normalizePostureIds(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(',').map((s) => s.trim());
  return [...new Set(arr.map((id) => String(id).trim()).filter((id) => POSTURE_FAMILIES[id]))];
}

function normalizeMaleFamilyId(raw) {
  if (!raw) return '';
  let id = String(raw).trim().toLowerCase();
  if (id.endsWith('_female')) id = id.slice(0, -7);
  if (id.endsWith('_family')) id = id.slice(0, -7);
  const base = id.split('_')[0];
  const known = ['alpha', 'beta', 'gamma', 'delta', 'sigma', 'omega', 'phi'];
  if (known.includes(base)) return base;
  if (known.includes(id)) return id;
  return '';
}

function postureMatchesMaleFamily(posture, maleFamilyId) {
  if (!maleFamilyId || !posture) return false;
  if ((posture.familyIds || []).includes(maleFamilyId)) return true;
  return (posture.archetypeIds || []).some((aid) => {
    const fam = normalizeMaleFamilyId(aid);
    return fam === maleFamilyId || aid === maleFamilyId;
  });
}

function goalModifier(axisId, relationshipGoal) {
  const g = String(relationshipGoal || '').toLowerCase();
  const nesting = g === 'marriage' || g === 'family';
  const casual = g === 'casual';
  if (nesting) {
    if (axisId === 'domestic_vs_ambition' || axisId === 'provision_vs_framework' || axisId === 'soul_vs_breadwinning') {
      return 1.15;
    }
    if (axisId === 'freedom_vs_focus' || axisId === 'status_vs_attention') return 1.08;
  }
  if (casual) {
    if (axisId === 'looks_vs_investment' || axisId === 'freedom_vs_focus' || axisId === 'status_vs_attention') {
      return 1.12;
    }
  }
  if (g === 'ltr' && (axisId === 'lead_vs_direction' || axisId === 'equality_vs_prompting')) return 1.08;
  return 1;
}

function mismatchBoost(delusionBand) {
  const b = String(delusionBand || '').toLowerCase();
  if (b === 'severe' || b === 'high') return 1;
  if (b === 'moderate' || b === 'elevated') return 0.5;
  return 0;
}

/**
 * Detect mutually expensive posture co-selections.
 * @param {string[]|string} desiredPostureIds
 * @returns {{ a: string, b: string, axis: string, weight: number, message: string }[]}
 */
export function detectPostureConflicts(desiredPostureIds) {
  const ids = normalizePostureIds(desiredPostureIds);
  if (ids.length < 2) return [];
  const set = new Set(ids);
  const out = [];
  for (const pair of POSTURE_CONFLICT_PAIRS) {
    if (set.has(pair.a) && set.has(pair.b)) {
      const pa = POSTURE_FAMILIES[pair.a];
      const pb = POSTURE_FAMILIES[pair.b];
      const axis = TRADEOFF_AXES[pair.axis];
      out.push({
        a: pair.a,
        b: pair.b,
        axis: pair.axis,
        weight: pair.weight,
        message: `${pa.title} + ${pb.title}: ${axis?.conflictHint || 'These desires pull in opposite directions—prioritize explicitly.'}`
      });
    }
  }
  return out.sort((x, y) => y.weight - x.weight);
}

/**
 * Rank which trade-off bullets to surface (narrative only).
 * priority = w_stated × w_family × w_goal × (1 + 0.25 × mismatchBoost)
 *
 * @param {{
 *   desiredPostureIds?: string[]|string,
 *   refuseAxisId?: string,
 *   maleFamilyId?: string,
 *   relationshipGoal?: string,
 *   delusionBand?: string,
 *   limit?: number
 * }} input
 */
export function rankTradeoffTensions(input = {}) {
  const desired = normalizePostureIds(input.desiredPostureIds);
  const maleFamilyId = normalizeMaleFamilyId(input.maleFamilyId);
  const refuseAxisId = String(input.refuseAxisId || '').trim();
  const limit = Math.max(1, Math.min(Number(input.limit) || 3, 6));
  const mBoost = mismatchBoost(input.delusionBand);
  const conflicts = detectPostureConflicts(desired);

  /** @type {Map<string, { axis: string, weight: number, bullet: string, postureIds: string[], title: string }>} */
  const byAxis = new Map();

  const bump = (axisId, weight, bullet, postureIds, title) => {
    if (!TRADEOFF_AXES[axisId] || weight <= 0) return;
    const prev = byAxis.get(axisId);
    if (!prev || weight > prev.weight) {
      byAxis.set(axisId, {
        axis: axisId,
        weight,
        bullet,
        postureIds: [...new Set(postureIds.filter(Boolean))],
        title: title || TRADEOFF_AXES[axisId].label
      });
    }
  };

  const postureList =
    desired.length > 0 ? desired.map((id) => POSTURE_FAMILIES[id]).filter(Boolean) : Object.values(POSTURE_FAMILIES);

  for (const posture of postureList) {
    const stated = desired.length ? 1 : 0.35;
    const familyHit = maleFamilyId && postureMatchesMaleFamily(posture, maleFamilyId) ? 1.2 : maleFamilyId ? 0.75 : 1;
    for (const axisId of posture.conflictAxes || []) {
      const g = goalModifier(axisId, input.relationshipGoal);
      let w = stated * familyHit * g * (1 + 0.25 * mBoost);
      if (refuseAxisId && refuseAxisId === axisId) w *= 1.35;
      bump(axisId, w, posture.desireLine, [posture.id], posture.title);
    }
  }

  for (const c of conflicts) {
    const g = goalModifier(c.axis, input.relationshipGoal);
    let w = c.weight * 1.15 * g * (1 + 0.25 * mBoost);
    if (refuseAxisId && refuseAxisId === c.axis) w *= 1.25;
    bump(c.axis, w, c.message, [c.a, c.b], TRADEOFF_AXES[c.axis]?.label);
  }

  if (refuseAxisId && TRADEOFF_AXES[refuseAxisId] && !byAxis.has(refuseAxisId)) {
    bump(
      refuseAxisId,
      0.9 * (1 + 0.25 * mBoost),
      TRADEOFF_AXES[refuseAxisId].conflictHint,
      desired,
      TRADEOFF_AXES[refuseAxisId].label
    );
  }

  const ranked = [...byAxis.values()].sort((a, b) => b.weight - a.weight).slice(0, limit);

  let falseDichotomy = null;
  if (conflicts.length || ranked.some((r) => r.weight >= 0.85)) {
    if (ranked.some((r) => r.axis === 'domestic_vs_ambition' || r.axis === 'status_vs_attention')) {
      falseDichotomy = FALSE_DICHOTOMY_NOTES.find((n) => n.id === 'ambition_vs_family');
    } else if (ranked.some((r) => r.axis === 'provision_vs_framework' || r.axis === 'equality_vs_prompting')) {
      falseDichotomy = FALSE_DICHOTOMY_NOTES.find((n) => n.id === 'providers_and_equality');
    } else if (ranked.some((r) => r.axis === 'lead_vs_direction')) {
      falseDichotomy = FALSE_DICHOTOMY_NOTES.find((n) => n.id === 'leaders_vs_collaboration');
    } else {
      falseDichotomy = FALSE_DICHOTOMY_NOTES[0];
    }
  }

  return {
    tensions: ranked,
    conflicts,
    falseDichotomy,
    forcedPrioritizationLead: FORCED_PRIORITIZATION_LEAD,
    desiredPostureIds: desired
  };
}

/**
 * Preference-block questions for female Attraction path (append to FEMALE_PREFERENCE_QUESTIONS).
 */
export function getFemalePosturePreferenceQuestions() {
  return [
    {
      id: 'desired_partner_postures',
      text: 'Which partner postures are you optimizing for? (select up to 2)',
      type: 'multiselect',
      maxSelected: 2,
      required: true,
      options: POSTURE_PREFERENCE_OPTIONS,
      helpText:
        'Each posture carries a predictable trade-off. Selecting conflicting postures surfaces prioritization pressure in your report—preferences do not reweight SMV math.'
    },
    {
      id: 'tradeoff_refuse',
      text: 'Which trade-off are you least willing to live with?',
      type: 'select',
      required: true,
      options: TRADEOFF_REFUSE_OPTIONS
    }
  ];
}

/**
 * Build narrative HTML fragments for Attraction standards section (caller sanitizes).
 */
export function buildFemalePostureStandardsParts(preferences = {}, opts = {}) {
  const desired = normalizePostureIds(preferences.desired_partner_postures);
  const refuse = preferences.tradeoff_refuse;
  const ranked = rankTradeoffTensions({
    desiredPostureIds: desired,
    refuseAxisId: refuse && refuse !== 'none' ? refuse : '',
    relationshipGoal: preferences.relationship_goal,
    delusionBand: opts.delusionBand,
    limit: 3
  });
  const parts = [];
  for (const id of desired) {
    const p = POSTURE_FAMILIES[id];
    if (p) parts.push(`${p.title}: ${p.desireLine}`);
  }
  for (const c of ranked.conflicts.slice(0, 2)) {
    parts.push(`Prioritization tension — ${c.message}`);
  }
  if (refuse && refuse !== 'none' && TRADEOFF_AXES[refuse]) {
    parts.push(`Hard line you named: ${TRADEOFF_AXES[refuse].conflictHint}`);
  }
  if (ranked.falseDichotomy) {
    parts.push(`False dichotomy check — ${ranked.falseDichotomy.title}: ${ranked.falseDichotomy.body}`);
  }
  return { parts, ranked };
}

/**
 * Archetype report block for female assessors (plain objects; caller renders HTML).
 */
export function buildFemaleArchetypeTradeoffBlock(opts = {}) {
  const ranked = rankTradeoffTensions({
    desiredPostureIds: opts.desiredPostureIds,
    refuseAxisId: opts.refuseAxisId,
    maleFamilyId: opts.maleFamilyId,
    relationshipGoal: opts.relationshipGoal,
    delusionBand: opts.delusionBand,
    limit: 3
  });
  const bullets = ranked.tensions.map((t) => t.bullet);
  if (!bullets.length) {
    bullets.push(FORCED_PRIORITIZATION_LEAD);
  }
  return {
    title: 'Partner posture trade-offs',
    lead: 'Mate selection is forced prioritization: desired partner postures carry predictable costs. Clarify which trade-offs you can live with.',
    bullets,
    falseDichotomy: ranked.falseDichotomy,
    learnHref: '#/learn/mate-selection-tradeoffs'
  };
}

/**
 * Extra archetypal-pressure bullets keyed by relationship compatibility point.
 */
export function getMatePosturePressureBullets(pointKey) {
  const map = {
    'core-values':
      'Desired partner postures (leader, provider, egalitarian, etc.) force value trade-offs—clarify which costs you accept before resentment accrues.',
    'financial-compatibility':
      'Provider vs egalitarian vs artist-breadwinner postures collide most often in money roles; name the household frame you can sustain.',
    'energy-dynamics':
      'Leader focus, free-spirit diffusion, and high-achiever mission energy create different day-to-day loads—optimize for one primary posture.',
    'lifestyle-compatibility':
      'Domestic-anchor devotion and unbound achievement rarely share the same weekly calendar without explicit boundary setting.',
    'mutual-support':
      'Egalitarian ideals without shared load become managerial prompting; classic provision without respect becomes quiet contempt.',
    'sexual-compatibility':
      'Visually striking and unbound high-achiever postures raise attention and investment asymmetry risks that show up in desire and loyalty.',
    'communication-styles':
      'Leaders who take charge are not the same as partners who take instruction—align on who directs what before conflict loops harden.',
    'trust-reliability':
      'Unbounded achievement without traditional boundaries often invites external attention competition; trust needs explicit containment agreements.'
  };
  const bullet = map[pointKey];
  return bullet ? [bullet] : [];
}

/**
 * Optional action-strategy lines for high-fit points.
 */
export function getMatePostureActionTips(pointKey) {
  const map = {
    'financial-compatibility':
      'Name whether you want classic provision, true 50/50, or you-as-breadwinner for a creative partner—then design money roles to match.',
    'energy-dynamics':
      'Pick the partner posture you will not renegotiate weekly (lead, nest, create, achieve) and stop optimizing the incompatible extras.',
    'lifestyle-compatibility':
      'Write down the leisure and ambition trade-off you can happily live with; treat the rest as non-goals.',
    'core-values':
      'Test early: does this person’s leadership, provision, or equality claim match how conflict and chores actually resolve?'
  };
  const tip = map[pointKey];
  return tip ? [tip] : [];
}

/**
 * Integrated-map excerpt for female respondents.
 */
export function buildMateSelectionTradeoffExcerpt(attractionSnap = {}, archetypeSnap = {}) {
  const gender = attractionSnap?.currentGender || archetypeSnap?.analysisData?.gender || archetypeSnap?.gender;
  if (gender !== 'female') return null;

  const prefs = attractionSnap?.preferences || attractionSnap?.smv?.preferences || {};
  const primary = archetypeSnap?.analysisData?.primaryArchetype || {};
  const maleFamilyHint = ''; // female assessor’s own archetype is not the partner map
  const ranked = rankTradeoffTensions({
    desiredPostureIds: prefs.desired_partner_postures,
    refuseAxisId: prefs.tradeoff_refuse && prefs.tradeoff_refuse !== 'none' ? prefs.tradeoff_refuse : '',
    maleFamilyId: maleFamilyHint,
    relationshipGoal: prefs.relationship_goal,
    delusionBand: attractionSnap?.smv?.delusionBand || attractionSnap?.delusionBand,
    limit: 3
  });

  const bullets = [];
  if (ranked.desiredPostureIds.length) {
    const labels = ranked.desiredPostureIds.map((id) => POSTURE_FAMILIES[id]?.title).filter(Boolean);
    if (labels.length) bullets.push(`Stated partner postures: ${labels.join('; ')}.`);
  }
  for (const t of ranked.tensions.slice(0, 2)) {
    bullets.push(t.bullet);
  }
  if (ranked.falseDichotomy) {
    bullets.push(`${ranked.falseDichotomy.title}: ${ranked.falseDichotomy.body}`);
  }
  if (!bullets.length) {
    bullets.push(FORCED_PRIORITIZATION_LEAD);
  }

  return {
    title: 'Mate-selection trade-offs',
    bullets,
    nextMove:
      'Clarify which partner-posture trade-off you can happily live with—and which one would build quiet resentment—then filter accordingly.',
    learnHref: '#/learn/mate-selection-tradeoffs'
  };
}

/** Learn-page section list. */
export function getMateSelectionLearnSections() {
  return [
    {
      id: 'postures',
      title: 'Desired partner postures',
      items: Object.values(POSTURE_FAMILIES).map((p) => [p.title, p.desireLine])
    },
    {
      id: 'false_dichotomies',
      title: 'False dichotomies',
      body: 'While these pairings highlight common friction points, human beings rarely fit neatly into two-dimensional boxes.',
      items: FALSE_DICHOTOMY_NOTES.map((n) => [n.title, n.body])
    },
    {
      id: 'forced_prioritization',
      title: 'Forced prioritization',
      body: FORCED_PRIORITIZATION_LEAD
    }
  ];
}

export function resolveMaleFamilyFromArchetype(archetype = {}) {
  return normalizeMaleFamilyId(archetype.familyType || archetype.parentType || archetype.id);
}
