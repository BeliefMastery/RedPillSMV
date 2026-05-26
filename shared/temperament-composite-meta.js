/**
 * Weighted-composite position metadata for temperament report (UI + export).
 * Matches temperament-engine spectrum bands and population trend refs.
 */

/** Same refs as temperament-engine sliders / trend dots */
export const EXPECTED_GENDER_TRENDS = { man: 0.6, woman: 0.4 };

/**
 * Human-readable headline for the weighted composite (0–100: feminine → masculine).
 * The 40–60% band is treated as “balanced”: 40–50% is the feminine half, 50–60% the masculine half. Outside that band, copy reads feminine- or masculine-leaning.
 * @param {number} normalizedScore - 0..1
 * @returns {string}
 */
export function formatCompositePositionDescription(normalizedScore) {
  const pct = (Number(normalizedScore) || 0) * 100;
  if (pct < 40) {
    return 'Feminine-leaning (outside the 40–60% balanced band)';
  }
  if (pct < 50) {
    return 'Feminine side of balanced';
  }
  if (pct <= 60) {
    return 'Masculine side of balanced';
  }
  return 'Masculine-leaning (outside the 40–60% balanced band)';
}

/** Same band thresholds as temperament-engine getSpectrumBandKey */
export function getSpectrumBandKeyFromNormalized(normalizedDimScore) {
  const x = Math.min(1, Math.max(0, Number(normalizedDimScore) || 0));
  if (x < 13.33 / 100) return 'hyper_femme';
  if (x < 26.66 / 100) return 'strongly_femme';
  if (x < 40 / 100) return 'femme';
  if (x < 60 / 100) return 'balanced';
  if (x < 73.33 / 100) return 'masc';
  if (x < 86.66 / 100) return 'strongly_masc';
  return 'hyper_masc';
}

const BAND_SHORT = {
  hyper_femme: 'hyper-femme',
  strongly_femme: 'strongly femme',
  femme: 'femme',
  balanced: 'balanced',
  masc: 'masc',
  strongly_masc: 'strongly masc',
  hyper_masc: 'hyper-masc'
};

/**
 * @param {object} opts
 * @param {Record<string, { net?: number }>} opts.dimensionScores
 * @param {Record<string, number>} opts.dimensionWeights
 * @param {number} opts.normalizedScore - composite 0..1
 * @param {'man'|'woman'|string|undefined} opts.reportedGender
 * @param {number} opts.maleTrend
 * @param {number} opts.femaleTrend
 */
export function computeOverallPositionMeta({
  dimensionScores,
  dimensionWeights,
  normalizedScore,
  reportedGender,
  maleTrend,
  femaleTrend
}) {
  const expectedRef =
    reportedGender === 'man' ? maleTrend : reportedGender === 'woman' ? femaleTrend : null;
  const deltaToExpectedRef = expectedRef != null ? normalizedScore - expectedRef : null;

  let normBandKey = 'unknown';
  if (deltaToExpectedRef != null) {
    const ad = Math.abs(deltaToExpectedRef);
    if (ad <= 0.08) normBandKey = 'near_typical';
    else if (ad <= 0.15) normBandKey = 'modest';
    else if (ad <= 0.25) normBandKey = 'clear';
    else normBandKey = 'strong';
  }

  const entries = [];
  let sumW = 0;
  let sumWx = 0;
  Object.entries(dimensionScores || {}).forEach(([key, score]) => {
    if (typeof score?.net !== 'number') return;
    const w = typeof dimensionWeights?.[key] === 'number' ? dimensionWeights[key] : 1;
    const norm = (score.net + 1) / 2;
    sumW += w;
    sumWx += norm * w;
    entries.push({ key, norm, w });
  });

  const meanNorm = sumW > 0 ? sumWx / sumW : normalizedScore;
  let sumVar = 0;
  entries.forEach(({ norm, w }) => {
    sumVar += w * (norm - meanNorm) ** 2;
  });
  const compositeSpread = sumW > 0 ? Math.sqrt(sumVar / sumW) : 0;

  const sorted = [...entries].sort((a, b) => Math.abs(b.norm - 0.5) - Math.abs(a.norm - 0.5));
  const extremeHighlights = sorted.slice(0, 3).map(({ key, norm }) => ({
    key,
    norm,
    bandKey: getSpectrumBandKeyFromNormalized(norm)
  }));

  return {
    deltaToExpectedRef,
    normBandKey,
    compositeSpread,
    extremeHighlights,
    meanNorm,
    expectedRef
  };
}

/**
 * Plain-language norm distance (requires gender for “typical for men/women”).
 */
export function formatNormDistanceSentence({
  reportedGender,
  deltaToExpectedRef,
  normBandKey,
  maleTrend,
  femaleTrend
}) {
  if (reportedGender !== 'man' && reportedGender !== 'woman') {
    return 'Population trend references apply when gender is man or woman.';
  }
  if (deltaToExpectedRef == null) return '';

  const genderNoun = reportedGender === 'man' ? 'men' : 'women';
  const refPct = ((reportedGender === 'man' ? maleTrend : femaleTrend) * 100).toFixed(0);
  const absPct = (Math.abs(deltaToExpectedRef) * 100).toFixed(1);
  const dir =
    deltaToExpectedRef > 0
      ? 'more masculine-leaning than the typical reference'
      : 'more feminine-leaning than the typical reference';

  if (normBandKey === 'near_typical') {
    return `Near the population reference for ${genderNoun} on this weighted average (trend dot ~${refPct}% on the spectrum)—within about ${absPct} percentage points of that anchor.`;
  }
  if (normBandKey === 'modest') {
    return `Modestly ${dir} for ${genderNoun} than the trend dot (~${refPct}%)—about ${absPct} points on the 0–100 scale.`;
  }
  if (normBandKey === 'clear') {
    return `Clearly ${dir} for ${genderNoun} than the trend dot (~${refPct}%)—about ${absPct} points on the scale.`;
  }
  if (normBandKey === 'strong') {
    return `Strongly ${dir} for ${genderNoun} than the trend dot (~${refPct}%)—about ${absPct} points on the scale.`;
  }
  return '';
}

export function formatSpreadSentence(compositeSpread, extremeHighlights, nameForKey) {
  const spreadPct = Math.round((compositeSpread || 0) * 100);
  const tier = compositeSpread < 0.12 ? 'tight' : compositeSpread < 0.2 ? 'moderate' : 'wide';
  const tierLabel =
    tier === 'tight'
      ? 'tight — dimensions mostly agree with the average'
      : tier === 'moderate'
        ? 'moderate — some dimensions pull away from the centre'
        : 'wide — the average can look “middle” while several dimensions sit in stronger bands';

  let line = `Dimension-to-dimension spread is ${tierLabel} (typical spread ~${spreadPct}% of the scale width). Overall averages compress toward the middle; hyper or strong poles usually appear on specific dimensions, not in this single number.`;

  if (extremeHighlights && extremeHighlights.length) {
    const parts = extremeHighlights.map((h) => {
      const label = nameForKey ? nameForKey(h.key) : h.key;
      const band = BAND_SHORT[h.bandKey] || h.bandKey;
      return `${label} (${band})`;
    });
    line += ` Furthest from mid-spectrum on this map: ${parts.join('; ')}.`;
  }
  return line;
}

/**
 * Recompute meta when loading saved analysis without `overallPositionMeta` (additive field).
 * @param {object} data - analysisData-like
 * @param {Record<string, number>} dimensionWeights - TEMPERAMENT_SCORING.dimensionWeights
 */
export function ensureOverallPositionMeta(data, dimensionWeights) {
  if (data?.overallPositionMeta && data?.overallTemperament) return data.overallPositionMeta;
  const ot = data?.overallTemperament;
  const ds = data?.dimensionScores;
  if (!ot || typeof ot.normalizedScore !== 'number' || !ds || !dimensionWeights) return null;
  return computeOverallPositionMeta({
    dimensionScores: ds,
    dimensionWeights,
    normalizedScore: ot.normalizedScore,
    reportedGender: data.gender,
    maleTrend: EXPECTED_GENDER_TRENDS.man,
    femaleTrend: EXPECTED_GENDER_TRENDS.woman
  });
}
