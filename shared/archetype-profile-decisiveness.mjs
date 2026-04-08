/**
 * Profile decisiveness: how separated the top archetype *family* is from the runner-up,
 * using summed weighted scores per cluster (parent + subtypes). Versioned thresholds for tuning.
 *
 * v2 calibration: sharper "clear lead" bar (SHARP_* raised) so near-tie family totals read
 * competitive, not sharp. Tune using saved `profileDecisiveness` snapshots; values use the
 * same scale as engine `weighted` (post phaseWeights).
 *
 * Callers must pass the loaded `ARCHETYPES` map from the engine (do not import archetypes.js
 * here: this package is CommonJS for Node while archetypes.js is ESM syntax-only).
 */
export const PROFILE_DECISIVENESS_VERSION = 2;

/** Both required for "sharp". Raised in v2 so ~0.028 margin / ~1.38 ratio reads competitive. */
const SHARP_MIN_MARGIN = 0.028;
const SHARP_MIN_RATIO = 1.4;
const VERY_COMPETITIVE_MARGIN = 0.016;
const VERY_COMPETITIVE_RATIO = 1.18;
const SUBTYPE_BLURRY_THRESHOLD = 0.012;

function resolveClusterId(archId, archetypes) {
  const meta = archetypes?.[archId];
  if (!meta) return archId;
  if (meta.parentType) return meta.parentType;
  return archId;
}

/**
 * @param {Record<string, { weighted?: number, phase2?: number }>} archetypeScores
 * @param {Record<string, object>} archetypes taxonomy map (required)
 */
export function computeProfileDecisiveness(archetypeScores, archetypes) {
  if (!archetypes || typeof archetypes !== 'object') {
    return {
      version: PROFILE_DECISIVENESS_VERSION,
      clusterWinnerId: null,
      clusterSecondId: null,
      clusterWinnerWeighted: 0,
      clusterSecondWeighted: 0,
      clusterMargin: 0,
      clusterRatio: 1,
      familyBand: 'competitive',
      subtypeTopId: null,
      subtypeSecondId: null,
      subtypeMargin: null,
      subtypeBlurry: false
    };
  }
  const scores = archetypeScores || {};
  const clusterTotals = new Map();

  for (const [archId, row] of Object.entries(scores)) {
    const w = Number(row?.weighted) || 0;
    const cid = resolveClusterId(archId, archetypes);
    clusterTotals.set(cid, (clusterTotals.get(cid) || 0) + w);
  }

  const sorted = [...clusterTotals.entries()].sort((a, b) => b[1] - a[1]);
  const first = sorted[0] || ['', 0];
  const second = sorted[1] || null;
  const w1 = first[1];
  const w2 = second ? second[1] : 0;
  const clusterWinnerId = first[0] || null;
  const clusterSecondId = second ? second[0] : null;
  const clusterMargin = w1 - w2;
  const eps = 1e-9;
  const clusterRatio = w2 >= eps ? w1 / w2 : w1 > eps ? 999 : 1;

  let familyBand = 'competitive';
  if (clusterMargin >= SHARP_MIN_MARGIN && clusterRatio >= SHARP_MIN_RATIO) {
    familyBand = 'sharp';
  } else if (clusterMargin < VERY_COMPETITIVE_MARGIN || clusterRatio < VERY_COMPETITIVE_RATIO) {
    familyBand = 'very_competitive';
  }

  const parent = clusterWinnerId ? archetypes?.[clusterWinnerId] : null;
  const subtypes = parent?.subtypes;
  let subtypeTopId = null;
  let subtypeSecondId = null;
  let subtypeMargin = null;

  if (Array.isArray(subtypes) && subtypes.length >= 2) {
    const ranked = subtypes
      .map((id) => ({
        id,
        weighted: Number(scores[id]?.weighted) || 0,
        phase2: Number(scores[id]?.phase2) || 0
      }))
      .sort((a, b) => {
        if (b.weighted !== a.weighted) return b.weighted - a.weighted;
        return b.phase2 - a.phase2;
      });
    subtypeTopId = ranked[0]?.id ?? null;
    subtypeSecondId = ranked[1]?.id ?? null;
    if (ranked[0] && ranked[1]) {
      subtypeMargin = ranked[0].weighted - ranked[1].weighted;
    }
  }

  const subtypeBlurry =
    familyBand === 'sharp' && subtypeMargin != null && subtypeMargin < SUBTYPE_BLURRY_THRESHOLD;

  return {
    version: PROFILE_DECISIVENESS_VERSION,
    clusterWinnerId,
    clusterSecondId,
    clusterWinnerWeighted: w1,
    clusterSecondWeighted: w2,
    clusterMargin,
    clusterRatio,
    familyBand,
    subtypeTopId,
    subtypeSecondId,
    subtypeMargin,
    subtypeBlurry
  };
}

const BAND_BODY = {
  sharp: 'Strong lead: the top archetype family is clearly ahead.',
  competitive: 'Moderate lead: primary fits best here, but other families are still close.',
  very_competitive:
    'Close race: top two families score similarly—read secondary and tertiary as important too.'
};

/**
 * Plain-text strings for the report callout (sanitize in the engine when building HTML).
 * Keeps body to definition + one band sentence; optional third line for subtype blur only.
 * @param {ReturnType<typeof computeProfileDecisiveness>} d
 * (Does not name runner-up family: that summed #2 can differ from secondary’s line-level family.)
 */
export function getProfileDecisivenessCalloutCopy(d) {
  if (!d) return null;

  const bandLine = BAND_BODY[d.familyBand] || BAND_BODY.competitive;

  const lines = [
    'Top two families by summed subtype scores. Secondary/tertiary rank individual archetype lines—order can differ.',
    bandLine
  ];

  if (d.subtypeBlurry) {
    lines.push('Subtype separation is also small—nuance is less certain than the family lead.');
  }

  return {
    title: 'Result clarity',
    lines,
    footnote:
      'Model scores only. Family totals and line rankings are separate steps in the engine—both are valid, but not interchangeable.'
  };
}

export function formatProfileDecisivenessExportLine(d) {
  if (!d) return '';
  const bandLabel =
    d.familyBand === 'sharp'
      ? 'Sharp'
      : d.familyBand === 'very_competitive'
        ? 'Very competitive'
        : 'Competitive';
  return `Profile decisiveness: ${bandLabel} (family margin ${d.clusterMargin.toFixed(4)}, ratio ${d.clusterRatio.toFixed(3)})`;
}
