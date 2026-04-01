/**
 * Male age vs stated partner-age preferences: delusion contribution, pool narrative adjustment, access band.
 * Headline SMV percentiles stay unchanged; this module only feeds preferences-layer math and display copy.
 *
 * gapYounger = yourAge - target_age_max (positive ⇒ your oldest acceptable partner is younger than you are).
 * valueLeverage blends overall SMV with axis and coalition so high value offsets the same gap.
 */

/**
 * @param {{ overall?: number, clusters?: Record<string, number> }} smv
 * @returns {number}
 */
export function maleValueLeverage(smv) {
  const overall = typeof smv?.overall === 'number' ? smv.overall : 50;
  const axis = typeof smv?.clusters?.axisOfAttraction === 'number' ? smv.clusters.axisOfAttraction : 50;
  const coalition = typeof smv?.clusters?.coalitionRank === 'number' ? smv.clusters.coalitionRank : 50;
  return 0.45 * overall + 0.35 * axis + 0.2 * coalition;
}

/**
 * @param {Record<string, number|string|undefined>} preferences
 * @param {{ overall?: number, clusters?: Record<string, number> }} smv
 * @returns {{
 *   gapYounger: number,
 *   gapOlder: number,
 *   leverage: number,
 *   ageDelusionContribution: number,
 *   effectiveOverall: number,
 *   effectiveOverallAdjust: number,
 *   accessBand: 'favorable'|'mixed'|'strained',
 *   poolStrain: number
 * }}
 */
export function maleAgeGapContext(preferences, smv) {
  const age = Number(preferences?.age);
  const tmax = Number(preferences?.target_age_max);
  const tmin = Number(preferences?.target_age_min);
  const ageN = Number.isFinite(age) ? age : 25;
  const tmaxN = Number.isFinite(tmax) ? tmax : ageN;
  const tminN = Number.isFinite(tmin) ? tmin : 18;

  const gapYounger = ageN - tmaxN;
  const gapOlder = tminN - ageN;

  const leverage = maleValueLeverage(smv);
  const toleranceYears = 5;
  const rawYoungerPressure =
    gapYounger <= toleranceYears ? 0 : Math.min(50, (gapYounger - toleranceYears) * 3.5);
  const buffer = Math.max(0, (leverage - 50) * 1.05);
  let ageDelusionContribution = Math.max(0, Math.min(48, rawYoungerPressure - buffer));

  if (gapOlder > 10) {
    ageDelusionContribution += Math.min(10, (gapOlder - 10) * 1.2);
  }

  const poolStrain = Math.max(0, rawYoungerPressure - buffer * 0.92);
  const effectiveOverallAdjust = -Math.min(20, poolStrain * 0.48);
  const overallBase = typeof smv?.overall === 'number' ? smv.overall : 50;
  const effectiveOverall = Math.max(0, Math.min(100, overallBase + effectiveOverallAdjust));

  let accessBand = 'favorable';
  if (poolStrain >= 20 && leverage < 54) accessBand = 'strained';
  else if (gapYounger > 16 && leverage < 62) accessBand = 'strained';
  else if (poolStrain >= 9 && leverage < 60) accessBand = 'mixed';
  else if (gapYounger > 10 && leverage < 58) accessBand = 'mixed';

  return {
    gapYounger,
    gapOlder,
    leverage: Math.round(leverage * 10) / 10,
    ageDelusionContribution: Math.round(ageDelusionContribution * 10) / 10,
    effectiveOverall: Math.round(effectiveOverall * 10) / 10,
    effectiveOverallAdjust: Math.round(effectiveOverallAdjust * 10) / 10,
    accessBand,
    poolStrain: Math.round(poolStrain * 10) / 10
  };
}
