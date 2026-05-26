/**
 * Archetype layering: state modifiers, lifecycle hints, and expression resolution
 * on top of primary identification — not new archetype families.
 * Phase A: heuristics from profileDecisiveness + sigma-family scores only.
 */

export const ARCHETYPE_LAYERING_VERSION = 1;

/** @typedef {'high'|'moderate'|'low'} LayerConfidence */

/**
 * @param {Record<string, { weighted?: number }>|null|undefined} scores
 * @param {string|null|undefined} gender
 */
function weighted(scores, id) {
  if (!scores || !id) return 0;
  return Math.max(0, Number(scores[id]?.weighted) || 0);
}

/**
 * @param {Record<string, { weighted?: number }>|null|undefined} scores
 * @param {string|null|undefined} gender
 */
function sigmaFamilyBundleWeighted(scores, gender) {
  const isFemale = gender === 'female';
  const ids = isFemale
    ? ['sigma_female', 'sigma_feminist_female', 'sigma_lambda', 'dark_sigma_zeta_female', 'omega_female', 'dark_omega_female']
    : ['sigma', 'sigma_kappa', 'sigma_lambda', 'dark_sigma_zeta', 'omega', 'dark_omega'];
  let sum = 0;
  for (const id of ids) {
    sum += weighted(scores, id);
  }
  return { ids, sum };
}

/**
 * @param {Record<string, { weighted?: number }>|null|undefined} scores
 * @param {string|null|undefined} gender
 */
function darkSigmaZetaWeighted(scores, gender) {
  const id = gender === 'female' ? 'dark_sigma_zeta_female' : 'dark_sigma_zeta';
  return weighted(scores, id);
}

/**
 * @param {object} opts
 * @param {Record<string, { weighted?: number }>|null|undefined} opts.archetypeScores
 * @param {object|null|undefined} opts.profileDecisiveness
 * @param {{ id?: string }|null|undefined} opts.primaryArchetype
 * @param {string|null|undefined} opts.primaryFamilyId
 * @param {string|null|undefined} opts.gender
 * @param {object|null|undefined} opts.subclassDiagnostics
 */
export function computeArchetypeLayering({
  archetypeScores,
  profileDecisiveness: d,
  primaryArchetype,
  primaryFamilyId,
  gender,
  subclassDiagnostics: _diag
}) {

  /** @type {{ level: 'high'|'low'|'mixed', confidence: LayerConfidence, basis: string[] }} */
  let expressionResolution = {
    level: 'mixed',
    confidence: 'low',
    basis: ['default_mixed']
  };

  if (d) {
    if (d.familyBand === 'sharp' && !d.subtypeBlurry && (d.subtypeMargin == null || d.subtypeMargin >= 0.012)) {
      expressionResolution = {
        level: 'high',
        confidence: 'moderate',
        basis: ['familyBand_sharp', 'subtype_margin_clear']
      };
    } else if (d.familyBand === 'sharp' && d.subtypeBlurry) {
      expressionResolution = {
        level: 'mixed',
        confidence: 'moderate',
        basis: ['familyBand_sharp', 'subtype_blurry']
      };
    } else if (d.familyBand === 'very_competitive') {
      expressionResolution = {
        level: 'mixed',
        confidence: 'moderate',
        basis: ['familyBand_very_competitive', `clusterMargin_${Number(d.clusterMargin).toFixed(4)}`]
      };
    } else {
      expressionResolution = {
        level: 'low',
        confidence: 'moderate',
        basis: ['familyBand_competitive', 'under_articulated_family_boundary']
      };
    }
  }

  /** @type {{ phase: 'exploratory'|'consolidation'|'recalibration'|'unspecified', confidence: LayerConfidence, basis: string[] }} */
  let lifecycle = {
    phase: 'unspecified',
    confidence: 'low',
    basis: ['no_lifecycle_items_phase_a']
  };

  if (d) {
    const tVal = d.transitionLikelihoodToRunnerUp?.value;
    if (typeof tVal === 'number') {
      if (d.familyBand !== 'sharp' && tVal >= 0.45) {
        lifecycle = {
          phase: 'recalibration',
          confidence: 'low',
          basis: ['transition_likelihood_high', `familyBand_${d.familyBand}`]
        };
      } else if (d.familyBand === 'sharp' && tVal < 0.15) {
        lifecycle = {
          phase: 'consolidation',
          confidence: 'moderate',
          basis: ['transition_likelihood_low', 'familyBand_sharp']
        };
      } else if (d.familyBand === 'very_competitive' || d.familyBand === 'competitive') {
        lifecycle = {
          phase: 'exploratory',
          confidence: 'low',
          basis: ['competitive_family_zone', `transition_${tVal.toFixed(2)}`]
        };
      }
    }
  }

  const stateModifiers = [];
  const dsz = darkSigmaZetaWeighted(archetypeScores, gender);
  const { sum: sigmaBundle } = sigmaFamilyBundleWeighted(archetypeScores, gender);
  const pid = primaryArchetype?.id ? String(primaryArchetype.id) : '';
  const inSigmaOrOmegaContext =
    primaryFamilyId === 'sigma_family' ||
    primaryFamilyId === 'sigma_family_female' ||
    primaryFamilyId === 'omega_family' ||
    primaryFamilyId === 'omega_family_female' ||
    /dark_sigma_zeta/i.test(pid);

  if (
    inSigmaOrOmegaContext &&
    sigmaBundle > 1e-6 &&
    dsz >= 0.35 * sigmaBundle &&
    dsz >= 0.6
  ) {
    stateModifiers.push({
      id: 'system_rejection_shadow_sigma',
      label: 'Strong shadow Sigma–Zeta signal (system-rejection lane within the taxonomy)',
      confidence: dsz >= 0.5 * sigmaBundle ? 'moderate' : 'low',
      basis: ['dark_sigma_zeta_weight_share', `dsz_${dsz.toFixed(3)}`, `sigma_family_sum_${sigmaBundle.toFixed(3)}`]
    });
  }

  return {
    version: ARCHETYPE_LAYERING_VERSION,
    stateModifiers,
    lifecycle,
    expressionResolution,
    computedAt: 'phase_a_heuristics'
  };
}

/**
 * @param {ReturnType<typeof computeArchetypeLayering>|null|undefined} layer
 * @param {string} [primaryName]
 */
export function getArchetypeLayeringCalloutCopy(layer, primaryName = 'your primary archetype') {
  if (!layer) return null;

  const lines = [];

  const exp = layer.expressionResolution;
  if (exp?.level === 'high') {
    lines.push(
      `**Expression resolution:** relatively *high* for this run — family and subtype boundaries are fairly sharp. That usually means the profile reads cleanly; it does not mean the pattern is fixed forever.`
    );
  } else if (exp?.level === 'low') {
    lines.push(
      `**Expression resolution:** *low* in model terms — several families sit close together, so the read is more like an undifferentiated or “NPC-adjacent” **signal strength** issue: the table is not adding a new archetype, it is flagging that answers did not separate cleanly.`
    );
  } else {
    lines.push(
      `**Expression resolution:** *mixed* — some structure shows through, but family and/or subtype boundaries are soft in places (confidence: ${exp?.confidence || 'low'}).`
    );
  }

  const life = layer.lifecycle;
  if (life?.phase && life.phase !== 'unspecified') {
    const phaseLabel =
      life.phase === 'recalibration'
        ? 'recalibration / transition pressure'
        : life.phase === 'consolidation'
          ? 'consolidation'
          : 'exploratory / open posture';
    lines.push(
      `**Lifecycle hint (soft):** reads toward *${phaseLabel}* relative to competing families — **not** a life-stage label and **not** a replacement for **${primaryName}** (confidence: ${life.confidence}).`
    );
  } else {
    lines.push(
      `**Lifecycle hint:** not inferred beyond family competition in this pass — optional future items could refine this.`
    );
  }

  if (layer.stateModifiers?.length) {
    layer.stateModifiers.forEach((m) => {
      lines.push(`**State modifier (${m.confidence} confidence):** ${m.label}.`);
    });
  } else {
    lines.push(
      `**State modifiers:** none flagged from scores alone (e.g. grief, ideological stance, or “post-wall” narratives are **not** inferred without dedicated items).`
    );
  }

  return {
    title: 'Profile layering (context)',
    lines,
    footnote:
      'This block describes overlays on top of your primary archetype. It does not change which archetype was selected or re-label you as a new “type.”'
  };
}

/**
 * @param {ReturnType<typeof computeArchetypeLayering>|null|undefined} layer
 */
export function formatArchetypeLayeringExportLine(layer) {
  if (!layer) return '';
  const parts = [
    `Layering v${layer.version}`,
    `expression=${layer.expressionResolution?.level} (${layer.expressionResolution?.confidence})`,
    `lifecycle=${layer.lifecycle?.phase} (${layer.lifecycle?.confidence})`
  ];
  if (layer.stateModifiers?.length) {
    parts.push(`modifiers=${layer.stateModifiers.map((m) => m.id).join(',')}`);
  } else {
    parts.push('modifiers=none');
  }
  return parts.join(' · ');
}

/**
 * @param {ReturnType<typeof computeArchetypeLayering>|null|undefined} layer
 */
function stripInlineEmphasisForExport(s) {
  return String(s)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1');
}

export function formatArchetypeLayeringExportParagraph(layer) {
  if (!layer) return '';
  const copy = getArchetypeLayeringCalloutCopy(layer, 'the primary result');
  if (!copy) return '';
  const parts = [...copy.lines, copy.footnote].filter(Boolean).map(stripInlineEmphasisForExport);
  return parts.join(' ');
}
