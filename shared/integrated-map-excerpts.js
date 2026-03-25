/**
 * Structured excerpts for integrated-map (mirrors report language; no percentile/weight noise).
 */
import { ARCHETYPES, ARCHETYPE_OPTIMIZATION } from '../archetype-data/archetypes.js';
import BRUTAL_TRUTHS from '../archetype-data/BRUTAL-TRUTH.js';
import { TEMPERAMENT_SCORING } from '../temperament-data/temperament-scoring.js';
import { TEMPERAMENT_REPORT_TIER2_PARAS } from '../temperament-data/temperament-report-copy.js';
import {
  getQualificationExplanation,
  getDelusionWarning,
  getSMVInterpretation
} from './attraction-report-copy.js';
import { ensurePeriod } from './archetype-narrative-utils.js';

function takeSentences(text, maxCount) {
  if (!text) return '';
  const sentences = String(text).match(/[^.!?]+[.!?]*/g) || [];
  const parts = (sentences.length ? sentences : [String(text)])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, maxCount);
  return parts.join(' ').trim();
}

function capitalizeTrait(t) {
  const text = String(t ?? '').trim();
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function summarizeArchetypeTraits(archetype) {
  const traits = Array.isArray(archetype?.behavioralTraits) ? archetype.behavioralTraits.slice(0, 4) : [];
  if (!traits.length) return '';
  return traits.map(capitalizeTrait).filter(Boolean).join(', ');
}

function relationshipGoalLabel(goal) {
  const g = String(goal || '').trim().toLowerCase();
  if (g === 'casual') return 'casual / short-term';
  if (g === 'ltr') return 'long-term';
  if (g === 'marriage') return 'marriage';
  if (g === 'family') return 'marriage + children';
  return '';
}

function hasFamilyIntent(goal) {
  const g = String(goal || '').trim().toLowerCase();
  return g === 'family' || g === 'marriage';
}

function buildAccessPrinciple({ goal, gender, hasDelusionFlag }) {
  const intimacy =
    'SMV here means practical access to desired intimacy outcomes: who engages, who stays, and how much leverage you have in selecting instead of only reacting.';
  if (hasFamilyIntent(goal)) {
    return `${intimacy} In this context it also speaks to access to stable long-term pairing and, where desired, a viable reproduction path.`;
  }
  if (hasDelusionFlag) {
    return `${intimacy} A wide standards-to-signal gap usually limits access first, then confidence and selection quality.`;
  }
  if (gender === 'male' || gender === 'female') {
    return `${intimacy} Improvement is optional, but without access there is little room to choose outcomes intentionally.`;
  }
  return intimacy;
}

function normalizeForDedupe(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeKeepOrder(items, maxCount = 3) {
  const out = [];
  const seen = [];
  for (const raw of items || []) {
    const s = String(raw || '').trim();
    if (!s) continue;
    const ns = normalizeForDedupe(s);
    if (!ns) continue;
    // Simple redundancy check: treat as duplicate if one string includes the other.
    const isDup = seen.some((prev) => ns.includes(prev) || prev.includes(ns));
    if (isDup) continue;
    out.push(s);
    seen.push(ns);
    if (out.length >= maxCount) break;
  }
  return out;
}

function cleanActionText(action) {
  const s = String(action || '').trim();
  // Remove obvious labels so the action reads cleanly in a combined list.
  return s
    .replace(/^What to do next:\s*/i, '')
    .replace(/^Action:\s*/i, '')
    .replace(/^Weakest area\s*—\s*[^:]+:\s*/i, '')
    .trim();
}

/** Explicit temperament headline: category + biological sex context (unplugged polarity framing). */
export function temperamentTitleExplicit(category, reportedGender, labelFallback = '') {
  const respondent =
    reportedGender === 'woman' ? 'female respondent' : reportedGender === 'man' ? 'male respondent' : 'respondent';
  const prefix = 'Temperament';

  const mapMan = {
    highly_feminine: `${prefix} — Strongly feminine-leaning expression (${respondent})`,
    predominantly_feminine: `${prefix} — Predominantly feminine-leaning expression (${respondent})`,
    balanced_feminine: `${prefix} — Balanced toward the feminine pole (${respondent})`,
    balanced: `${prefix} — Balanced masculine–feminine expression (${respondent})`,
    balanced_masculine: `${prefix} — Balanced with a masculine lean (${respondent})`,
    predominantly_masculine: `${prefix} — Predominantly masculine-leaning expression (${respondent})`,
    highly_masculine: `${prefix} — Strongly masculine-leaning expression (${respondent})`
  };
  const mapWoman = {
    highly_masculine: `${prefix} — Strongly masculine-leaning expression (${respondent})`,
    predominantly_masculine: `${prefix} — Predominantly masculine-leaning expression (${respondent})`,
    balanced_masculine: `${prefix} — Balanced toward the masculine pole (${respondent})`,
    balanced: `${prefix} — Balanced masculine–feminine expression (${respondent})`,
    balanced_feminine: `${prefix} — Balanced with a feminine lean (${respondent})`,
    predominantly_feminine: `${prefix} — Predominantly feminine-leaning expression (${respondent})`,
    highly_feminine: `${prefix} — Strongly feminine-leaning expression (${respondent})`
  };

  if (reportedGender === 'man' && category && mapMan[category]) return mapMan[category];
  if (reportedGender === 'woman' && category && mapWoman[category]) return mapWoman[category];
  if (labelFallback) return `${prefix} — ${labelFallback} (${respondent})`;
  return `${prefix} — Unplugged polarity map`;
}

/**
 * @returns {{ title: string, subtitle?: string, frame: { meaning: string, helps: string, costs: string }, nextMoveCandidates?: string[], href: string, hrefLabel: string }}
 */
export function buildArchetypeLayer(ad) {
  const p = ad?.primaryArchetype;
  const href = 'archetype.html';
  const hrefLabel = 'Open full archetype report';
  if (!p?.id) {
    return {
      title: 'Red-Pill Archetype',
      frame: { meaning: 'Archetype data is incomplete.', helps: '', costs: '' },
      href,
      hrefLabel,
      nextMoveCandidates: []
    };
  }

  const optimizationCopy = ARCHETYPE_OPTIMIZATION?.[p.id] || null;
  const traitsSummary = summarizeArchetypeTraits(p);

  let qualitiesIntro = takeSentences(p.description || '', 3);
  if (p.explanation) {
    const ex = takeSentences(p.explanation, 2);
    qualitiesIntro = qualitiesIntro ? `${qualitiesIntro} ${ex}` : ex;
  }
  // Bulleted traits and deeper narrative live in the full archetype report; the combined card stays concise.

  const concerns = [];
  if (optimizationCopy?.likelyBlindSpot) {
    concerns.push(`Likely blind spot: ${ensurePeriod(optimizationCopy.likelyBlindSpot)}`);
  } else if (p.stressResponse) {
    concerns.push(`Likely blind spot: ${ensurePeriod(p.stressResponse)}`);
  }

  const shadows = ad?.phase3Results?.shadowIndicators;
  if (Array.isArray(shadows)) {
    shadows.slice(0, 2).forEach((sh) => {
      const id = sh.id || sh;
      const name = sh.name || ARCHETYPES?.[id]?.name || id;
      const desc = takeSentences(ARCHETYPES?.[id]?.description || '', 1);
      concerns.push(desc ? `${name}: ${desc}` : `${name}: pattern to explore under stress (see full report).`);
    });
  }

  const withinStrategyRaw = optimizationCopy?.optimizationStrategy || p.growthEdge || '';
  const withinStrategy = withinStrategyRaw ? ensurePeriod(String(withinStrategyRaw).trim()) : '';

  const meaning = takeSentences(qualitiesIntro || '', 2) || 'This archetype reflects default social strategy patterns.';

  const helps = withinStrategy
    ? (traitsSummary ? `${withinStrategy} Leverage your strengths: ${traitsSummary}.` : withinStrategy)
    : (traitsSummary ? `Leverage your strengths: ${traitsSummary}.` : 'Leverage your strengths consistently and choose environments that reward your default approach.');

  const costs = (concerns[0] ? ensurePeriod(String(concerns[0]).trim()) : (p.stressResponse ? ensurePeriod(String(p.stressResponse).trim()) : 'Your default strategy can become a blind spot under pressure.')) || '';

  const nextMoveCandidates = dedupeKeepOrder(
    [
      withinStrategy ? withinStrategy : '',
      'Treat this as a calibration map, not identity destiny: use one concrete behavioral change cycle and re-test later.'
    ],
    4
  ).map(cleanActionText);

  const subtitle = p.socialRole ? String(p.socialRole).trim() : '';

  return {
    title: `Red-Pill Archetype — ${p.name || 'Primary pattern'}`,
    subtitle,
    frame: { meaning, helps, costs },
    nextMoveCandidates,
    href,
    hrefLabel
  };
}

/**
 * @returns {same shape as buildArchetypeLayer}
 */
export function buildPolarityLayer(ad) {
  const href = 'temperament.html';
  const hrefLabel = 'Open full polarity report';
  const cat = ad?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;

  if (!interp) {
    return {
      title: 'Temperament — Polarity map',
      frame: { meaning: 'Polarity data is incomplete.', helps: '', costs: '' },
      href,
      hrefLabel,
      nextMoveCandidates: []
    };
  }

  const characteristics = (interp.characteristics || []).slice(0, 4).map(capitalizeTrait).filter(Boolean);
  const variationFirst = takeSentences(interp.variations || '', 1);

  const concerns = [];
  if (ad.crossPolarityDetected && ad.crossPolarityNote) {
    concerns.push(String(ad.crossPolarityNote).trim());
  }
  const names = ad.anomalousDimensionNames;
  if (Array.isArray(names) && names.length) {
    concerns.push(
      `Dimensions flagged for partner-fit consideration: ${names.join(', ')}.`
    );
  }

  const meaning = takeSentences(interp.description || '', 2) || `Your polarity expresses as ${capitalizeTrait(interp.label || cat || 'a distinct temperament pattern')}.`;

  const helps = characteristics.length
    ? `You tend to express ${characteristics.slice(0, 3).join(', ')}, which helps you connect by balancing structure and flow to the situation.`
    : "This temperament profile helps you calibrate your expression so you don't overcommit to one way of being.";

  const costs =
    concerns[0]
    ? ensurePeriod(String(concerns[0]).trim())
    : (variationFirst ? ensurePeriod(`Variation matters: ${variationFirst}.`) : 'Without a clear dominant edge, partner-fit can require more calibration by context.');

  const nextMoveCandidates = dedupeKeepOrder(
    [
      ad.contextSensitivity?.detected && ad.contextSensitivity?.message ? String(ad.contextSensitivity.message).trim() : '',
      'Use this map to read where polarity supports or blocks intimacy, then calibrate habits and partner-fit choices accordingly.'
    ],
    4
  ).map(cleanActionText);

  const reportedGender = ad.gender;
  const title = temperamentTitleExplicit(cat, reportedGender, interp.label);

  return {
    title,
    subtitle: undefined,
    frame: { meaning, helps, costs },
    nextMoveCandidates,
    href,
    hrefLabel
  };
}

/**
 * @param {{ smv: object, currentGender: string }} snap
 */
export function buildAttractionLayer(snap) {
  const href = 'attraction.html';
  const hrefLabel = 'Open full attraction report';
  const smv = snap?.smv;
  const gender = snap?.currentGender;

  if (!smv) {
    return {
      title: 'Sexual Market Value',
      frame: { meaning: 'SMV data is incomplete.', helps: '', costs: '' },
      href,
      hrefLabel,
      nextMoveCandidates: []
    };
  }

  const overall = typeof smv.overall === 'number' ? smv.overall : 0;
  const goal = snap?.preferences?.relationship_goal;
  const accessLine = buildAccessPrinciple({
    goal,
    gender,
    hasDelusionFlag: Boolean(smv?.delusionBand && smv.delusionBand !== 'low')
  });
  const interpretation = getSMVInterpretation(overall);

  let smvPrimaryRead = '';
  let subtitle = '';
  if (gender === 'male' && smv.badBoyGoodGuy?.label) {
    const label = smv.badBoyGoodGuy.label;
    smvPrimaryRead = label;
    subtitle = smv.marketPosition ? `Market band: ${String(smv.marketPosition).trim()}` : '';
    // The qualification explanation is used in full reports; for this combined card we keep it concise.
  } else if (gender === 'female' && smv.keeperSweeper?.label) {
    const ks = smv.keeperSweeper;
    smvPrimaryRead = ks.label;
    subtitle = [
      smv.marketPosition ? `Market band: ${String(smv.marketPosition).trim()}` : '',
      ks.desc ? ks.desc : ''
    ]
      .filter(Boolean)
      .join(' — ');
  } else {
    smvPrimaryRead = smv.marketPosition ? String(smv.marketPosition).trim() : '';
  }

  const concerns = [];
  if (smv.delusionBand && smv.delusionBand !== 'low') {
    concerns.push(getDelusionWarning(smv.delusionBand));
  }
  if (smv.recommendation?.warning) {
    concerns.push(String(smv.recommendation.warning).trim());
  }

  const rec = smv.recommendation || {};

  const frameMeaning = smvPrimaryRead
    ? `Your SMV read is ${smvPrimaryRead}. ${interpretation}`
    : interpretation;

  const frameHelps = hasFamilyIntent(goal)
    ? `${accessLine} In this context it also speaks to access to stable long-term pairing.`
    : accessLine;

  const frameCosts = concerns[0]
    ? ensurePeriod(String(concerns[0]).trim())
    : (() => {
      const w = (rec.weakestGuidance || [])[0];
      if (w?.meaning && w?.label) return ensurePeriod(`Weakest lever — ${String(w.label).trim()}: ${String(w.meaning).trim()}.`);
      return 'The trade-off: leverage depends on whether your weakest area gets upgraded consistently.';
    })();

  const weakestGuidanceActions = (rec.weakestGuidance || [])
    .flatMap((w) => w.actions || [])
    .map(cleanActionText);

  const tacticalActions = (rec.tactical || []).map(cleanActionText);

  const nextMoveCandidates = dedupeKeepOrder(
    [
      ...(weakestGuidanceActions || []),
      ...(tacticalActions || [])
    ],
    6
  );

  const pathNote =
    gender === 'male' ? 'Male SMV path' : gender === 'female' ? 'Female SMV path' : '';
  const goalNote = relationshipGoalLabel(goal);
  const title = smvPrimaryRead
    ? `Sexual Market Value — ${smvPrimaryRead}`
    : 'Sexual Market Value';
  const subtitleFinal = [subtitle, pathNote, goalNote ? `Goal: ${goalNote}` : ''].filter(Boolean).join(' · ') || undefined;

  const gameShort =
    gender === 'male'
      ? 'Game execution signals are integrated within existing Axis signals (especially performance/status and humour).'
      : gender === 'female'
        ? 'Game execution signals are integrated within existing Axis signals (especially personality and risk-cost dynamics).'
        : 'Game execution signals are integrated within existing Axis signals.';

  return {
    title,
    subtitle: subtitleFinal,
    frame: {
      meaning: frameMeaning,
      helps: `${frameHelps} ${gameShort}`.trim(),
      costs: frameCosts
    },
    nextMoveCandidates,
    href,
    hrefLabel
  };
}

export function buildCurrentPatternSummary(archetypeSnap, polaritySnap, attractionSnap) {
  const ad = archetypeSnap?.analysisData || {};
  const pd = polaritySnap?.analysisData || {};
  const smv = attractionSnap?.smv;
  const gender = attractionSnap?.currentGender;

  const archPrimary = ad?.primaryArchetype;
  const archetypeName = archPrimary?.name || 'your archetype lead';
  const optimizationCopy = archPrimary?.id ? ARCHETYPE_OPTIMIZATION?.[archPrimary.id] || null : null;
  const withinStrategy = optimizationCopy?.optimizationStrategy || archPrimary?.growthEdge || '';
  const blindSpot = optimizationCopy?.likelyBlindSpot || archPrimary?.stressResponse || '';
  const traitsSummary = summarizeArchetypeTraits(archPrimary);

  const cat = pd?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;
  const tempDesc = interp?.description ? takeSentences(interp.description, 1) : (interp?.label ? String(interp.label).trim() : '');
  const variationFirst = takeSentences(interp?.variations || '', 1);

  let smvPrimaryRead = '';
  let interpretation = '';
  if (smv) {
    const overall = typeof smv.overall === 'number' ? smv.overall : 0;
    interpretation = getSMVInterpretation(overall);
    if (gender === 'male' && smv.badBoyGoodGuy?.label) smvPrimaryRead = smv.badBoyGoodGuy.label;
    else if (gender === 'female' && smv.keeperSweeper?.label) smvPrimaryRead = smv.keeperSweeper.label;
    else smvPrimaryRead = smv.marketPosition ? String(smv.marketPosition).trim() : '';
  }

  const rec = smv?.recommendation || {};
  const weakest = (rec.weakestGuidance || [])[0];
  const weakestLabel = weakest?.label ? String(weakest.label).trim() : '';

  const archStrategyLine = withinStrategy
    ? ensurePeriod(String(withinStrategy).trim())
    : (traitsSummary ? `You tend to leverage: ${traitsSummary}.` : `You default to a ${archetypeName} pattern that avoids being managed by external hierarchy.`);

  const blindLine = blindSpot ? ensurePeriod(String(blindSpot).trim()) : '';
  const tempLine = [
    tempDesc ? `Your temperament expresses: ${tempDesc}.` : '',
    variationFirst ? `Variation can make your expression swing across contexts: ${variationFirst}` : ''
  ].filter(Boolean).join(' ');

  const weakestLine = weakestLabel ? `Most improvement comes from upgrading ${weakestLabel} with one consistent habit cycle.` : 'Most improvement comes from upgrading your first weak area with one consistent habit cycle.';

  // Keep it as one paragraph for readability.
  return [
    `You operate from a ${archetypeName} social strategy: ${archStrategyLine}`,
    blindLine ? `and your likely blind spot shows up as: ${blindLine}` : '',
    tempLine,
    smvPrimaryRead ? `In your current dating outcomes, your SMV read is ${smvPrimaryRead} (${interpretation}).` : smv ? `In your current dating outcomes, your SMV read is captured by this access profile (${interpretation}).` : '',
    weakestLine
  ].filter(Boolean).join(' ');
}

export function buildNextMoveCandidates(archetypeSnap, polaritySnap, attractionSnap) {
  const archLayer = buildArchetypeLayer(archetypeSnap?.analysisData || {});
  const polLayer = buildPolarityLayer(polaritySnap?.analysisData || {});
  const attLayer = buildAttractionLayer(attractionSnap || {});

  const candidates = [
    ...(archLayer.nextMoveCandidates || []),
    ...(polLayer.nextMoveCandidates || []),
    ...(attLayer.nextMoveCandidates || [])
  ];

  return dedupeKeepOrder(candidates, 3).map(cleanActionText).filter(Boolean);
}

export function buildHeroFragments(archetypeSnap, polaritySnap, attractionSnap) {
  const ad = archetypeSnap?.analysisData;
  const pd = polaritySnap?.analysisData;
  const smv = attractionSnap?.smv;
  const gender = attractionSnap?.currentGender;

  const primaryName = ad?.primaryArchetype?.name || 'your archetype lead';
  const cat = pd?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;
  const polarityExplicit = temperamentTitleExplicit(cat, pd?.gender, interp?.label || '');

  let smvHeadline = '';
  if (gender === 'male' && smv?.badBoyGoodGuy?.label) {
    smvHeadline = smv.badBoyGoodGuy.label;
  } else if (gender === 'female' && smv?.keeperSweeper?.label) {
    const ks = smv.keeperSweeper;
    smvHeadline = ks.desc ? `${ks.label} — ${ks.desc}` : ks.label;
  } else if (smv?.marketPosition) {
    smvHeadline = String(smv.marketPosition).trim();
  } else {
    smvHeadline = 'your SMV read';
  }

  const marketBand = smv?.marketPosition ? String(smv.marketPosition).trim() : '';

  return { primaryName, polarityExplicit, smvHeadline, marketBand, assessmentGender: gender };
}

export function buildCrossIntegrationBullets(archetypeLayer, polarityLayer, attractionLayer) {
  const out = [];
  const pick = (layer) => layer?.frame?.costs || layer?.frame?.meaning || '';
  const a = pick(archetypeLayer);
  const p = pick(polarityLayer);
  const m = pick(attractionLayer);
  if (a) out.push(a);
  if (p) out.push(p);
  if (m) out.push(m);
  if (out.length === 0) {
    out.push(
      'Red-pill archetype, temperament / polarity, and sexual market value are separate lenses — tension between them is normal, and each lens affects access in different ways.'
    );
  }
  if (out.length < 3) {
    out.push(
      'Re-run any assessment after major life changes; this view is a snapshot of what is saved on this device.'
    );
  }
  return out;
}
