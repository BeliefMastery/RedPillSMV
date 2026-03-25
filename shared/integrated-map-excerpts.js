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
    "This is about who you can attract, keep, and choose — how often outcomes happen on your terms, not only by luck.";
  if (hasFamilyIntent(goal)) {
    return `${intimacy} For long-term intent, it also affects access to stable pairing and family outcomes.`;
  }
  if (hasDelusionFlag) {
    return `${intimacy} A wide standards-to-signal gap usually reduces leverage first, then confidence and selection quality.`;
  }
  if (gender === 'male' || gender === 'female') {
    return `${intimacy} Without leverage, selection is limited — you end up reacting more than choosing.`;
  }
  return intimacy;
}

function trimTrailingPunctuation(s) {
  return String(s || '').trim().replace(/[.!?]+$/g, '').trim();
}

function characteristicToDirectStatement(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  let t = s
    .replace(/^Often shows\s+/i, '')
    .replace(/^Often expresses\s+/i, '')
    .replace(/^Tends to express\s+/i, '')
    .replace(/^Tends to\s+/i, '')
    .replace(/^Shows preference toward\s+/i, '')
    .replace(/^Shows preference for\s+/i, '')
    .replace(/^Shows preference\s+/i, '')
    .replace(/^Shows\s+/i, '')
    .trim();

  // Convert common “noun phrase” fragments into a direct sentence.
  // If it already starts with “You”, keep it.
  if (/^you\b/i.test(t)) return ensurePeriod(t);

  // A few low-risk normalizations for readability.
  t = t
    .replace(/\bboth structure and flow\b/i, 'moving between structure and flow')
    .replace(/\bboth provision and nurture capacities\b/i, 'both provision and nurture')
    .replace(/\bmoderate sensitivity\b/i, 'balanced sensitivity')
    .replace(/\btake lead or follow as needed\b/i, 'lead or follow as needed');

  // If it’s still a fragment, wrap it.
  return ensurePeriod(`You can ${trimTrailingPunctuation(t)}`);
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

function stripFillerPhrases(text) {
  let s = String(text || '').trim();
  if (!s) return '';
  s = s
    .replace(/\bTends to\b/gi, '')
    .replace(/\bOften shows\b/gi, '')
    .replace(/\bOften expresses\b/gi, '')
    .replace(/\bThis means\b/gi, '')
    .replace(/\bSMV here means\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function safeSentence(text) {
  const s = stripFillerPhrases(text);
  return ensurePeriod(trimTrailingPunctuation(s));
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

  const meaning = safeSentence(
    p.name
      ? 'You operate on your own terms and avoid structured hierarchies. You prefer autonomy over status positioning.'
      : (takeSentences(qualitiesIntro || '', 1) || 'You operate on your own terms and avoid structured hierarchies.')
  );

  const helps = safeSentence('You’re hard to control, think for yourself, and adapt quickly without relying on group approval.');

  const costs = safeSentence(
    optimizationCopy?.likelyBlindSpot || p.stressResponse
      ? 'You stay out of visible hierarchies, which also means fewer opportunities, less recognition, and reduced influence. Independence turns into isolation when exposure is blocked.'
      : 'You stay out of visible hierarchies, which can mean fewer opportunities, less recognition, and reduced influence.'
  );

  const nextMoveCandidates = [];

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

  const rawCharacteristics = (interp.characteristics || []).slice(0, 4);
  const directStatements = rawCharacteristics
    .map(characteristicToDirectStatement)
    .map((x) => trimTrailingPunctuation(x))
    .filter(Boolean);
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

  const meaning = safeSentence('You can move between structure and flow, logic and emotion, depending on the situation.');

  const helps = safeSentence(
    'You read people well and adjust easily. This makes you socially flexible and able to connect across different dynamics.'
  );

  const costs =
    concerns[0]
    ? safeSentence('Your lack of a dominant edge can make you feel undefined. In attraction, this weakens polarity — people don’t clearly feel your direction or role.')
    : (variationFirst ? safeSentence('Your lack of a dominant edge can make you feel undefined. In attraction, this weakens polarity — people don’t clearly feel your direction or role.') : safeSentence('Your lack of a dominant edge can make you feel undefined, which can soften polarity in attraction.'));

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

  const frameMeaning = safeSentence('You can get dates and connection, but not consistently on your terms. Outcomes vary, and you’re often reacting instead of selecting.');

  const frameHelps = safeSentence('You’re not locked out — small improvements will directly increase your options and control.');

  const frameCosts = (() => {
    const w = (rec.weakestGuidance || [])[0];
    const label = w?.label ? String(w.label).trim() : '';
    if (label) {
      return safeSentence(`Primary Constraint — ${label}. Right now, your capability is not clearly signaled. Competence is what makes people rely on you, respect you, and choose you with intent.`);
    }
    return safeSentence('You risk being chosen for stability or provision rather than desire. That caps attraction and long-term satisfaction.');
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
  const title = 'Sexual Market Value — Inconsistent Leverage';
  const subtitleFinal = [subtitle, pathNote, goalNote ? `Goal: ${goalNote}` : ''].filter(Boolean).join(' · ') || undefined;

  return {
    title,
    subtitle: subtitleFinal,
    frame: {
      meaning: frameMeaning,
      helps: frameHelps,
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

  const cat = pd?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;
  const tempDesc = interp?.description ? takeSentences(interp.description, 1) : (interp?.label ? String(interp.label).trim() : '');

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

  // Summary: no stitched “you operate from… and…” phrasing; translate into lived tension.
  const archLine = archetypeName
    ? `You run an independent path and avoid being placed inside hierarchies. That gives you freedom, but it also keeps you out of arenas where status, visibility, and opportunity compound.`
    : `You protect autonomy and resist being placed inside hierarchies. That gives you freedom, but it can also reduce visibility and opportunity.`;

  const tempLine = tempDesc
    ? `You can shift between structure and flow, which makes you adaptable, but it can also blur your edge — people don’t always know what role you occupy.`
    : `Your expression is adaptable across contexts, which helps you fit, but can blur your direction when attraction needs clarity.`;

  const smvLine = smv
    ? `In dating, you’re getting inconsistent results. You can access connection, but not reliably on your terms — which increases the chance you’re chosen more for stability than desire.`
    : `In dating, outcomes can become circumstance-driven rather than choice-driven when leverage is inconsistent.`;

  const fastestShift = weakestLabel
    ? `The fastest shift comes from building visible competence and tightening your direction — so others can read you clearly and respond accordingly.`
    : `The fastest shift comes from building visible competence and tightening your direction — so others can read you clearly and respond accordingly.`;

  // Optional subtle hooks if present, but never as stitched meta labels.
  const blind = blindSpot ? trimTrailingPunctuation(String(blindSpot).trim()) : '';
  const strategy = withinStrategy ? trimTrailingPunctuation(String(withinStrategy).trim()) : '';
  const extra = dedupeKeepOrder(
    [
      blind ? `This works until it doesn’t: ${blind}.` : '',
      strategy ? `This gives you leverage when you apply it consistently: ${strategy}.` : '',
      smvPrimaryRead ? `Market read: outcomes currently align with an “${smvPrimaryRead}” pattern (${trimTrailingPunctuation(interpretation)}).` : ''
    ],
    1
  );

  return [archLine, tempLine, smvLine, fastestShift, ...extra].filter(Boolean).join(' ');
}

export function buildNextMoveCandidates(archetypeSnap, polaritySnap, attractionSnap) {
  // Fixed universal priority actions for the combined page (kept concise, de-duplicated).
  return dedupeKeepOrder(
    [
      'Build visible competence — pick one domain and prove it (results, certification, or output people can see).',
      'Increase physical presence — strength, posture, and movement change how you’re read instantly.',
      'State intent earlier — stop adapting to situations and start directing them.'
    ],
    3
  );
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

export function buildPatternConvergenceParagraph(archetypeLayer, polarityLayer, attractionLayer) {
  const aCosts = String(archetypeLayer?.frame?.costs || '').trim();
  const pCosts = String(polarityLayer?.frame?.costs || '').trim();
  const mCosts = String(attractionLayer?.frame?.costs || '').trim();

  // Keep it short, synthetic, and non-redundant.
  const parts = [
    'Your independence keeps you out of hierarchies where visibility and opportunity compound.',
    'Your balanced temperament softens your edge — you can adapt, but direction isn’t always felt.',
    'Your current competence signal isn’t strong enough to override either, so outcomes become inconsistent.'
  ];

  // If we have concrete cost lines, use at most one as a “mirror” hook.
  const hook = dedupeKeepOrder([aCosts, pCosts, mCosts], 1)[0];
  if (hook) {
    parts.push(`This works until it doesn’t: ${trimTrailingPunctuation(hook)}.`);
  }

  return parts.join(' ');
}
