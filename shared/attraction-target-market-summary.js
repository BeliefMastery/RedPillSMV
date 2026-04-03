/**
 * Realistic / aspirational target copy and compact UI fields for the attraction report.
 * @param {string} aspirational
 * @returns {string}
 */
export function mateQualityPhraseFromAspirational(aspirational) {
  let t = String(aspirational || '').trim();
  t = t.replace(/\s*\(only with major self-improvement\)\s*$/i, '');
  t = t.replace(/\s+with optimization\s*$/i, '');
  t = t.replace(/\s+with improvement\s*$/i, '');
  if (!t) return 'See strategic recommendations';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * @param {number} overall - SMV overall percentile 0–100 (for men, callers may pass age-adjusted leverage from `male-age-gap.js` while keeping headline SMV elsewhere)
 * @param {boolean} isMale
 * @returns {{ realistic: string, aspirational: string, realisticOptionsPct: string, potentialMateCore: string, potentialMateSubline: string }}
 */
export function computeTargetMarketSummary(overall, isMale) {
  const o = typeof overall === 'number' ? overall : 0;
  const m = { realistic: '', aspirational: '', realisticOptionsPct: '', potentialMateCore: '' };
  if (isMale) {
    if (o >= 80) {
      m.realistic = 'Top 20-30% of women (7-9/10 range)';
      m.aspirational = 'Top 10% possible';
      m.realisticOptionsPct = 'top 20–30%';
    } else if (o >= 60) {
      m.realistic = 'Top 40-60% of women (5-7/10 range)';
      m.aspirational = 'Top 30% with optimization';
      m.realisticOptionsPct = 'top 40–60%';
    } else if (o >= 40) {
      m.realistic = 'Average to below average (4-6/10)';
      m.aspirational = 'Top 50% with improvement';
      m.realisticOptionsPct = 'mid-tier (~50%)';
    } else {
      m.realistic = 'Bottom 40%';
      m.aspirational = 'Average (only with major self-improvement)';
      m.realisticOptionsPct = 'bottom 40%';
    }
  } else {
    if (o >= 80) {
      m.realistic = 'Top 10-20% of men';
      m.aspirational = 'Top 5% accessible';
      m.realisticOptionsPct = 'top 10–20%';
    } else if (o >= 60) {
      m.realistic = 'Top 30-50% of men';
      m.aspirational = 'Top 20% with optimization';
      m.realisticOptionsPct = 'top 30–50%';
    } else if (o >= 40) {
      m.realistic = 'Average men';
      m.aspirational = 'Above average possible';
      m.realisticOptionsPct = 'average (~50%)';
    } else {
      m.realistic = 'Below average';
      m.aspirational = 'Average with improvement';
      m.realisticOptionsPct = 'below average (~40%)';
    }
  }
  m.potentialMateCore = mateQualityPhraseFromAspirational(m.aspirational);
  if (o < 40) {
    m.potentialMateCore = 'Achievable';
  }
  let mateSuffix = '(requires major self-improvement)';
  if (o >= 80) mateSuffix = '(with elite leverage and selectivity)';
  else if (o >= 60) mateSuffix = '(with sustained optimization)';
  else if (o >= 40) mateSuffix = '(requires focused self-improvement)';
  m.potentialMateSubline = `Potential Mate Quality achievable is: ${m.potentialMateCore} ${mateSuffix}.`;
  return m;
}
