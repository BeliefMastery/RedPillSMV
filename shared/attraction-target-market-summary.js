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

function clampPct(v) {
  return Math.max(0, Math.min(100, v));
}

function computePartnerRange(overall, isMale) {
  const center = clampPct(typeof overall === 'number' ? overall : 0);
  const halfSpan = isMale
    ? center < 40
      ? 12
      : center < 60
        ? 11
        : center < 80
          ? 10
          : 9
    : center < 40
      ? 11
      : center < 60
        ? 10
        : center < 80
          ? 9
          : 8;
  let min = Math.round(clampPct(center - halfSpan));
  let max = Math.round(clampPct(center + halfSpan));
  if (max - min < 8) {
    if (min <= 4) max = Math.min(100, min + 8);
    else min = Math.max(0, max - 8);
  }
  return { partnerRangeMin: min, partnerRangeMax: max };
}

export function partnerRangeSublineFromOverall(overall) {
  const o = typeof overall === 'number' ? overall : 0;
  if (o < 30) {
    return '(Raising partner tier from here requires major self-improvement across SMV drivers. Target the weakest points identified in the report below for greatest impact.)';
  }
  if (o < 40) {
    return '(Securing relationships above marked range is achievable, but requires disciplined improvements across multiple core categories in this report.)';
  }
  if (o < 50) {
    return '(Securing relationships above marked range is achievable but will require focused self-improvement in the categories identified in this report)';
  }
  if (o < 60) {
    return '(Progress beyond the marked range is realistic with consistent optimization of your weakest high-impact categories.)';
  }
  if (o < 70) {
    return '(Reaching beyond the upper end of this range usually takes sustained optimization of demonstrated strengths.)';
  }
  if (o < 80) {
    return '(Extending above this marked range is most often driven by consistency, selectivity, and stronger execution in top leverage categories.)';
  }
  if (o < 90) {
    return '(Elite leverage and selectivity expand access above the marked range.)';
  }
  return '(Elite leverage and disciplined selectivity enable access to the top tier; outcomes are constrained more by standards and fit than baseline access.)';
}

/**
 * @param {number} overall - SMV overall percentile 0–100 (for men, callers may pass age-adjusted leverage from `male-age-gap.js` while keeping headline SMV elsewhere)
 * @param {boolean} isMale
 * @returns {{ realistic: string, aspirational: string, realisticOptionsPct: string, potentialMateCore: string, potentialMateSubline: string, partnerRangeMin: number, partnerRangeMax: number }}
 */
export function computeTargetMarketSummary(overall, isMale) {
  const o = typeof overall === 'number' ? overall : 0;
  const m = {
    realistic: '',
    aspirational: '',
    realisticOptionsPct: '',
    potentialMateCore: '',
    ...computePartnerRange(o, isMale)
  };
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
  m.potentialMateSubline = partnerRangeSublineFromOverall(o);
  return m;
}
