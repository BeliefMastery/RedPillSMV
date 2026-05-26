/**
 * Static report copy for Attraction / SMV (shared by attraction-engine.js and integrated-map).
 */

/** @param {string} _clusterId @param {boolean} _male */
export function getClusterSummary(_clusterId, _male) {
  return '';
}

/** Reframe developmental level as opportunity to reorient one stage higher (not a fixed label). */
export function getDevelopmentalOpportunity(currentLabel) {
  const order = [
    'Survival Mode (Basic Needs Focus)',
    'Egocentric (Reactive/Impulsive)',
    'Conformist (Rule-Following)',
    'Achievement-Oriented (Rational/Strategic)',
    'Integral/Holistic (High Integration)'
  ];
  const nextDescriptions = {
    'Survival Mode (Basic Needs Focus)': 'Egocentric — start to act from immediate wants and impulses while still securing basics.',
    'Egocentric (Reactive/Impulsive)': 'Conformist — begin to follow norms and consider stability and belonging, not only short-term gain.',
    'Conformist (Rule-Following)': 'Achievement-Oriented — shift toward goals, strategy, and rational choice; rule-conscious and achievement-driven.',
    'Achievement-Oriented (Rational/Strategic)': 'Integral/Holistic — integrate multiple perspectives and act from a coherent worldview; mature decision-making.',
    'Integral/Holistic (High Integration)': 'You\'re at the highest integration; continue to deepen and sustain this level.'
  };
  const idx = order.indexOf(currentLabel);
  if (idx === -1) return '';
  if (idx === order.length - 1) {
    const apex = nextDescriptions[currentLabel] || '';
    return apex
      ? `Your responses suggest you're operating as ${currentLabel}. ${apex}`
      : '';
  }
  const nextLabel = order[idx + 1];
  const toward = nextDescriptions[currentLabel] || nextLabel;
  return `Your responses suggest you're operating as ${currentLabel}. An opportunity to improve quality of life may be accessible through adjusting consciousness toward: ${toward}`;
}

/** Brief explanations for qualifications — respondent may not know the terms */
export function getQualificationExplanation(label, type) {
  const keeperSweeper = {
    Keepers: 'Men you attract are likely to invest in you for the long term: they\'d commit to and prioritise you.',
    Sleepers: 'The middle zone — men are open to you but not fully committed; they\'d consider you but may not prioritise you.',
    Sweepers: 'Men you attract are likely to treat you with less investment: they\'ll engage casually or de-prioritise you relative to women they see as higher value.'
  };
  const badBoyGoodGuy = {
    'Prince Charming (Ideal Long Term)': 'Women are likely to see you as ideal long-term: high on both manner/provision and attraction.',
    'Husband zone': 'Women see you as strong long-term material: high manner/provision and solid attraction.',
    'Friend zone': 'Women tend to value you for your provision and reliability but don\'t feel the attraction; they keep you around without romantic intent.',
    'Good Situationship': 'Upper-mid on manner/provision, high attraction; the relationship is ambiguous but has good foundations and could move toward commitment.',
    Situationship: 'Moderate manner/provision, high attraction; women are drawn to you but don\'t see clear commitment; they engage without fully investing long-term.',
    'Bad Situationship': 'Lower-mid on manner/provision, high attraction; women engage but see weak foundations; the relationship is ambiguous and unlikely to deepen.',
    'Good Settling': 'Upper-mid on both axes; women accept you as "good enough" — the match is workable but not exciting.',
    Settling: 'Moderate on both axes; women may accept but not be excited; you\'re often read as "good enough" rather than a strong match.',
    'Bad Settling': 'Lower-mid on manner/provision, moderate attraction; women may be with you primarily for what you provide — they\'re settling for provision rather than desire.',
    'Comfortable Compromise': 'Upper-mid provision, low attraction; women may be with you for what you provide; the compromise feels acceptable.',
    'Resource Compromise': 'Moderate provision, low attraction; women may be with you primarily for what you provide.',
    'Last Resort': 'Lower-mid provision, low attraction; women are barely engaged; the relationship is fragile.',
    'Bad Boy Fun Time (Short Term)': 'Women are attracted short-term but don\'t see you as long-term material; high attraction, low manner/provision signal.',
    '... Mistake': 'Women may engage for fun but typically don\'t see it lasting; low provision, moderate attraction.',
    'Invisible/Ghost or Creep': 'Women are most likely to categorise you as invisible or threatening; they tend to avoid or disengage.'
  };
  if (type === 'keeperSweeper') return keeperSweeper[label] || '';
  if (type === 'badBoyGoodGuy') return badBoyGoodGuy[label] || '';
  if (type === 'developmentalLevel') return getDevelopmentalOpportunity(label);
  return '';
}

export function getSMVInterpretation(smv) {
  if (smv >= 80) return 'You currently read as high-access: strong optionality, stronger selectivity leverage, and easier entry into desired intimacy lanes.';
  if (smv >= 60) return 'You currently read as above-average access: with focused optimization you can widen quality and consistency of intimacy outcomes.';
  if (smv >= 40) return 'You currently read as mid-access: outcomes are mixed, and targeted improvement increases who you can access and retain.';
  return 'You currently read as constrained access: improvement is mostly about opening practical access to intimacy and stronger partner selection outcomes.';
}

export function getDelusionWarning(band) {
  if (band === 'severe') return 'SEVERE MISMATCH: Expectations dramatically out of alignment with market value.';
  if (band === 'high') return 'SIGNIFICANT MISMATCH: Standards exceed market position. Adjust or improve.';
  return 'MODERATE MISMATCH: Some recalibration needed.';
}

/** @param {'favorable'|'mixed'|'strained'} band */
export function getMaleYoungerPartnerAccessCopy(band) {
  if (band === 'strained') {
    return {
      title: 'Younger-partner access: strained',
      detail:
        'Your stated partner age window sits far below your age relative to your composite leverage; that usually tightens who will reciprocate. Closing the gap takes visible status, attraction, and coalition strength—or narrowing the age band you optimize for.'
    };
  }
  if (band === 'mixed') {
    return {
      title: 'Younger-partner access: mixed',
      detail:
        'There is some tension between your age and the ages you said you want. Strong axis and coalition signals can still buy runway here; if those are only moderate, expect more friction or smaller pools than the raw percentile line suggests.'
    };
  }
  return {
    title: 'Younger-partner access: favorable',
    detail:
      'Given your stated ages and your blend of overall, attraction, and coalition signals, pursuing partners in that window is broadly plausible.'
  };
}
