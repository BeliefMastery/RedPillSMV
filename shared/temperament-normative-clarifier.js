/**
 * Graded normative clarifier for temperament dimension rows (UI + export).
 * Combines distance from gender reference dots with spectrum extremity (hyper/strongly).
 */

/** Defaults match temperament-engine EXPECTED_GENDER_TRENDS */
export const DEFAULT_MALE_POPULATION_TREND = 0.6;
export const DEFAULT_FEMALE_POPULATION_TREND = 0.4;

const BAND_INTENSITY = {
  hyper_femme: 5,
  strongly_femme: 4,
  femme: 2,
  balanced: 0,
  masc: 2,
  strongly_masc: 4,
  hyper_masc: 5
};

const GRADE_WORDS = ['', 'Slightly', 'Moderately', 'Clearly', 'Strongly', 'Extremely'];

/**
 * @param {object} opts
 * @param {'man'|'woman'|string} opts.reportedGender
 * @param {number} opts.normalizedDimScore - 0..1
 * @param {number} [opts.maleTrend]
 * @param {number} [opts.femaleTrend]
 * @param {string} opts.spectrumBand - hyper_femme | strongly_femme | femme | balanced | masc | strongly_masc | hyper_masc
 * @returns {string}
 */
export function getDimensionNormativeClarifier({
  reportedGender,
  normalizedDimScore,
  maleTrend = DEFAULT_MALE_POPULATION_TREND,
  femaleTrend = DEFAULT_FEMALE_POPULATION_TREND,
  spectrumBand
}) {
  if (reportedGender !== 'man' && reportedGender !== 'woman') return '';

  const expectedRef = reportedGender === 'man' ? maleTrend : femaleTrend;
  const deltaToExpected = normalizedDimScore - expectedRef;
  const absDelta = Math.abs(deltaToExpected);

  const genderNoun = reportedGender === 'man' ? 'males' : 'women';
  const emphasisLean = normalizedDimScore >= 0.5 ? 'masculine-leaning' : 'feminine-leaning';

  if (absDelta <= 0.08) {
    return `Near typical for ${genderNoun}.`;
  }

  const fromDelta = gradeFromAbsDelta(absDelta);
  const fromBand = BAND_INTENSITY[spectrumBand] ?? 0;
  let grade = Math.max(fromDelta, fromBand);
  grade = Math.min(5, Math.max(1, grade));

  const word = GRADE_WORDS[grade] || 'Moderately';
  let out = `${word} more ${emphasisLean} than typical for ${genderNoun}.`;

  if (spectrumBand === 'hyper_femme' || spectrumBand === 'hyper_masc') {
    out += ' This dimension sits at the hyper end of the spectrum.';
  }

  return out;
}

function gradeFromAbsDelta(absDelta) {
  if (absDelta <= 0.08) return 0;
  if (absDelta <= 0.15) return 1;
  if (absDelta <= 0.22) return 2;
  if (absDelta <= 0.3) return 3;
  if (absDelta <= 0.4) return 4;
  return 5;
}
