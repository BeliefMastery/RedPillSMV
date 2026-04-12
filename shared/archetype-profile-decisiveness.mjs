/**
 * Reading stability: how separated the top archetype cluster is from the runner-up,
 * using summed weighted scores per cluster (parent + subtypes). Versioned thresholds for tuning.
 *
 * v3 calibration: sharper "clear lead" bar + family transition-likelihood matrix so
 * competitive / very-competitive copy can express consolidation-vs-transition trajectory.
 * Values use the same scale as engine `weighted` (post phaseWeights).
 *
 * Callers must pass the loaded `ARCHETYPES` map from the engine (do not import archetypes.js
 * here: this package is CommonJS for Node while archetypes.js is ESM syntax-only).
 */
export const PROFILE_DECISIVENESS_VERSION = 3;

/** Both required for "sharp". Raised in v2 so ~0.028 margin / ~1.38 ratio reads competitive. */
const SHARP_MIN_MARGIN = 0.028;
const SHARP_MIN_RATIO = 1.4;
const VERY_COMPETITIVE_MARGIN = 0.016;
const VERY_COMPETITIVE_RATIO = 1.18;
const SUBTYPE_BLURRY_THRESHOLD = 0.012;

/**
 * Family-level transition likelihood matrix (draft v1).
 * Values: 0..1 where higher means more plausible primary-family drift over time.
 * These are directional tendencies, not deterministic outcomes.
 */
const FAMILY_TRANSITION_LIKELIHOODS = {
  alpha: { alpha: 1, beta: 0.06, gamma: 0.15, delta: 0.32, sigma: 0.18, omega: 0.03, phi: 0.12 },
  beta: { alpha: 0.44, beta: 1, gamma: 0.35, delta: 0.58, sigma: 0.2, omega: 0.16, phi: 0.08 },
  gamma: { alpha: 0.4, beta: 0.2, gamma: 1, delta: 0.46, sigma: 0.36, omega: 0.14, phi: 0.14 },
  delta: { alpha: 0.34, beta: 0.18, gamma: 0.16, delta: 1, sigma: 0.16, omega: 0.07, phi: 0.12 },
  sigma: { alpha: 0.18, beta: 0.08, gamma: 0.34, delta: 0.16, sigma: 1, omega: 0.14, phi: 0.12 },
  omega: { alpha: 0.05, beta: 0.36, gamma: 0.16, delta: 0.38, sigma: 0.18, omega: 1, phi: 0.06 },
  phi: { alpha: 0.14, beta: 0.06, gamma: 0.12, delta: 0.14, sigma: 0.12, omega: 0.04, phi: 1 }
};

function canonicalFamilyId(clusterId) {
  if (!clusterId) return '';
  const lower = String(clusterId).toLowerCase();
  if (lower.endsWith('_female')) return lower.replace('_female', '');
  return lower;
}

function transitionLikelihoodLabel(value) {
  if (value >= 0.45) return 'high';
  if (value >= 0.25) return 'moderate';
  if (value >= 0.1) return 'low';
  return 'very_low';
}

function transitionLikelihoodBetween(fromFamilyId, toFamilyId) {
  const from = canonicalFamilyId(fromFamilyId);
  const to = canonicalFamilyId(toFamilyId);
  if (!from || !to) return { value: 0.2, label: 'low' };
  const value = FAMILY_TRANSITION_LIKELIHOODS?.[from]?.[to];
  if (typeof value !== 'number') return { value: 0.2, label: 'low' };
  return { value, label: transitionLikelihoodLabel(value) };
}

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
  const winnerCanonical = canonicalFamilyId(first[0]);
  const second = sorted.find(([cid], idx) => idx > 0 && canonicalFamilyId(cid) !== winnerCanonical) || null;
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
    transitionLikelihoodToRunnerUp: transitionLikelihoodBetween(clusterWinnerId, clusterSecondId),
    familyBand,
    subtypeTopId,
    subtypeSecondId,
    subtypeMargin,
    subtypeBlurry
  };
}

function nearestOtherGroupName(d, archetypes) {
  if (!d?.clusterSecondId || !archetypes?.[d.clusterSecondId]?.name) return '';
  if (canonicalFamilyId(d.clusterSecondId) === canonicalFamilyId(d.clusterWinnerId)) return '';
  return String(archetypes[d.clusterSecondId].name).trim();
}

/**
 * Stability copy should name the same “competing” patterns readers see as secondary/tertiary when those
 * sit in a different cluster than the primary. Rollup-only second place sums every subtype in a cluster,
 * so e.g. Beta can rank second on combined mass while no Beta subtype appears in the top-three slots.
 *
 * @returns {{ otherName: string, competitorClusterId: string|null }}
 */
function resolveReportAlignedRunnerUp(d, archetypes, primaryArch, secondaryArch, tertiaryArch) {
  const primaryCanon = primaryArch?.id
    ? canonicalFamilyId(resolveClusterId(primaryArch.id, archetypes))
    : canonicalFamilyId(d.clusterWinnerId);

  for (const arch of [secondaryArch, tertiaryArch]) {
    if (!arch?.id || !archetypes?.[arch.id]) continue;
    const cCluster = resolveClusterId(arch.id, archetypes);
    if (!cCluster) continue;
    if (canonicalFamilyId(cCluster) === primaryCanon) continue;
    const name = String(archetypes[arch.id].name || '').trim();
    if (name) return { otherName: name, competitorClusterId: cCluster };
  }

  return {
    otherName: nearestOtherGroupName(d, archetypes),
    competitorClusterId: d.clusterSecondId
  };
}

/**
 * Text after "transition pressure toward *other* is **{label}**," — keyed by matrix band (low / moderate / high).
 * @param {{ label?: string }} transition
 */
function transitionPressureOutcomeTail(transition, primaryPatternName, other) {
  const lab = transition?.label;
  if (lab === 'very_low' || lab === 'low') {
    return `so you are most likely deepening into **${primaryPatternName}**.`;
  }
  if (lab === 'high' || lab === 'very_high') {
    return `which suggests a transition toward *${other}*.`;
  }
  if (lab === 'moderate') {
    return `which suggests variability under conditions—your archetype may lean either way depending on context, circumstance, and triggers.`;
  }
  return `so you are most likely deepening into **${primaryPatternName}**.`;
}

/**
 * Plain-text strings for the report callout (sanitize in the engine when building HTML).
 * `archetypes` is optional; names nearest runner-up cluster (clusterSecondId) for competitive and very-competitive copy.
 * @param {ReturnType<typeof computeProfileDecisiveness>} d
 * @param {Record<string, object>} [archetypes]
 * @param {string} [primaryPatternName]
 * @param {{ primary?: { id?: string }, secondary?: { id?: string }, tertiary?: { id?: string } } | null} [reportSlots] When set, prefer secondary/tertiary (first different cluster from primary) for named competitor vs rollup-only second cluster.
 */
export function getProfileDecisivenessCalloutCopy(
  d,
  archetypes,
  primaryPatternName = 'your primary pattern',
  reportSlots = null
) {
  if (!d) return null;

  const { otherName: other, competitorClusterId } = reportSlots
    ? resolveReportAlignedRunnerUp(
        d,
        archetypes,
        reportSlots.primary,
        reportSlots.secondary,
        reportSlots.tertiary
      )
    : { otherName: nearestOtherGroupName(d, archetypes), competitorClusterId: d.clusterSecondId };

  const transition =
    d.clusterWinnerId && competitorClusterId
      ? transitionLikelihoodBetween(d.clusterWinnerId, competitorClusterId)
      : d.transitionLikelihoodToRunnerUp ??
        transitionLikelihoodBetween(d.clusterWinnerId, d.clusterSecondId);
  const transitionLabel = transition.label.replace('_', ' ');

  const subtypeBoundaryText = (() => {
    if (!d.subtypeBlurry) return '';
    const topSubtypeName = d.subtypeTopId && archetypes?.[d.subtypeTopId]?.name
      ? String(archetypes[d.subtypeTopId].name).trim()
      : '';
    const secondSubtypeName = d.subtypeSecondId && archetypes?.[d.subtypeSecondId]?.name
      ? String(archetypes[d.subtypeSecondId].name).trim()
      : '';
    if (topSubtypeName && secondSubtypeName) {
      return `Within **${primaryPatternName}**, scores for *${topSubtypeName}* and *${secondSubtypeName}* are still close; a small shift in answers could change which subtype ranks first.`;
    }
    return `Within **${primaryPatternName}**, subtype scores are still close; a small shift in answers could change which subtype ranks first.`;
  })();

  let lines = [];

  if (d.familyBand === 'sharp') {
    lines = [
      `Your profile is strongly anchored in **${primaryPatternName}**. The gap to the next-most-likely archetype pattern is large; you are likely permanently entrenched in **${primaryPatternName}**.`
    ];
  } else if (d.familyBand === 'very_competitive') {
    lines = [
      other
        ? `Your primary archetype is highly competitive between **${primaryPatternName}** and *${other}*. A small answer shift can change your primary; the transition pressure toward *${other}* is **${transitionLabel}**, ${transitionPressureOutcomeTail(transition, primaryPatternName, other)}`
        : `Your primary archetype is still wide open. A small answer shift can change your primary—treat this reading as a snapshot, not a fixed label.`
    ];
  } else {
    lines = [
      other
        ? `Your result centers on **${primaryPatternName}** with *${other}* still competing. Transition pressure toward *${other}* is **${transitionLabel}**, ${transitionPressureOutcomeTail(transition, primaryPatternName, other)}`
        : `You are consolidating around **${primaryPatternName}** with no single runner-up pattern standing out clearly.`
    ];
  }

  if (subtypeBoundaryText) lines.push(subtypeBoundaryText);

  return {
    title: 'Stability of this reading',
    lines,
    footnote: null
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
  return `Reading stability: ${bandLabel} (separation margin ${d.clusterMargin.toFixed(4)}, top-two score ratio ${d.clusterRatio.toFixed(3)})`;
}
