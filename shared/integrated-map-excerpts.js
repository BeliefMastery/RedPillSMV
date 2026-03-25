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
import { ensurePeriod, softenNarrativeTone, summarizeBehavioralAccent } from './archetype-narrative-utils.js';

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

function buildGameExecutionLine(gender) {
  const base = 'Game execution here means social calibration + frame stability + escalation judgment + logistics follow-through.';
  if (gender === 'male') {
    return `${base} In this model it is integrated within existing Axis signals (especially performance/status and humour), not scored as a separate pillar.`;
  }
  if (gender === 'female') {
    return `${base} In this model it is integrated within existing Axis signals (especially personality and risk-cost dynamics), not scored as a separate pillar.`;
  }
  return `${base} It is integrated within existing Axis signals, not scored as a separate pillar.`;
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
 * @returns {{ title: string, subtitle?: string, qualities: { intro?: string, bullets: string[] }, narrative?: string, concerns: { bullets: string[] }, orientation: { bullets: string[] }, href: string, hrefLabel: string }}
 */
export function buildArchetypeLayer(ad) {
  const p = ad?.primaryArchetype;
  const href = 'archetype.html';
  const hrefLabel = 'Open full archetype report';
  if (!p?.id) {
    return {
      title: 'Red-Pill Archetype',
      qualities: { bullets: [] },
      concerns: { bullets: [] },
      orientation: { bullets: [] },
      href,
      hrefLabel
    };
  }

  const optimizationCopy = ARCHETYPE_OPTIMIZATION?.[p.id] || null;
  const traitsSummary = summarizeArchetypeTraits(p);

  let qualitiesIntro = takeSentences(p.description || '', 3);
  if (p.explanation) {
    const ex = takeSentences(p.explanation, 2);
    qualitiesIntro = qualitiesIntro ? `${qualitiesIntro} ${ex}` : ex;
  }
  const qualitiesBullets = (Array.isArray(p.behavioralTraits) ? p.behavioralTraits : [])
    .slice(0, 5)
    .map(capitalizeTrait)
    .filter(Boolean);

  const rawBrutal = String(BRUTAL_TRUTHS?.[p.id]?.narrative || p.archetypalNarrative || '').trim();
  const narrative = rawBrutal
    ? summarizeBehavioralAccent(softenNarrativeTone(rawBrutal), 2)
    : '';

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

  const orientation = [];
  orientation.push('Significance: this archetype profile shows your default social strategy and where it helps or limits access to the outcomes you want.');
  if (optimizationCopy?.optimizationStrategy) {
    let line = `Within-archetype strategy: ${ensurePeriod(optimizationCopy.optimizationStrategy)}`;
    if (traitsSummary) line += ` Leverage your strengths: ${traitsSummary}.`;
    orientation.push(line);
  } else if (p.growthEdge) {
    let line = `Within-archetype strategy: ${ensurePeriod(p.growthEdge)}`;
    if (traitsSummary) line += ` Leverage your strengths: ${traitsSummary}.`;
    orientation.push(line);
  } else if (traitsSummary) {
    orientation.push(`Leverage your strengths: ${traitsSummary}.`);
  }
  orientation.push('Action: treat this as a calibration map, not identity destiny; use one concrete behavioral change cycle and re-test later.');

  const subtitle = p.socialRole ? String(p.socialRole).trim() : '';

  return {
    title: `Red-Pill Archetype — ${p.name || 'Primary pattern'}`,
    subtitle,
    qualities: { intro: qualitiesIntro || undefined, bullets: qualitiesBullets },
    narrative: narrative || undefined,
    concerns: { bullets: concerns },
    orientation: { bullets: orientation },
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
      qualities: { bullets: [] },
      concerns: { bullets: [] },
      orientation: { bullets: [] },
      href,
      hrefLabel
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

  const orientation = [];
  if (ad.contextSensitivity?.detected && ad.contextSensitivity?.message) {
    orientation.push(String(ad.contextSensitivity.message).trim());
  }
  if (TEMPERAMENT_REPORT_TIER2_PARAS[2]) {
    orientation.push(TEMPERAMENT_REPORT_TIER2_PARAS[2]);
  }
  orientation.push('Use this map to read where polarity supports or blocks intimacy, then calibrate habits and partner-fit choices accordingly.');

  const reportedGender = ad.gender;
  const title = temperamentTitleExplicit(cat, reportedGender, interp.label);

  return {
    title,
    subtitle: undefined,
    qualities: {
      intro: interp.description ? String(interp.description).trim() : undefined,
      bullets: [...characteristics, ...(variationFirst ? [`Variation: ${variationFirst}`] : [])]
    },
    narrative: undefined,
    concerns: { bullets: concerns },
    orientation: { bullets: orientation },
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
      qualities: { bullets: [] },
      concerns: { bullets: [] },
      orientation: { bullets: [] },
      href,
      hrefLabel
    };
  }

  const qualitiesBullets = [];
  const overall = typeof smv.overall === 'number' ? smv.overall : 0;
  const goal = snap?.preferences?.relationship_goal;
  const accessLine = buildAccessPrinciple({
    goal,
    gender,
    hasDelusionFlag: Boolean(smv?.delusionBand && smv.delusionBand !== 'low')
  });
  const gameLine = buildGameExecutionLine(gender);
  const interpretation = getSMVInterpretation(overall);

  let smvPrimaryRead = '';
  let subtitle = '';
  if (gender === 'male' && smv.badBoyGoodGuy?.label) {
    const label = smv.badBoyGoodGuy.label;
    smvPrimaryRead = label;
    subtitle = smv.marketPosition ? `Market band: ${String(smv.marketPosition).trim()}` : '';
    const expl = getQualificationExplanation(label, 'badBoyGoodGuy');
    if (expl) qualitiesBullets.push(expl);
  } else if (gender === 'female' && smv.keeperSweeper?.label) {
    const ks = smv.keeperSweeper;
    smvPrimaryRead = ks.label;
    subtitle = [
      smv.marketPosition ? `Market band: ${String(smv.marketPosition).trim()}` : '',
      ks.desc ? ks.desc : ''
    ]
      .filter(Boolean)
      .join(' — ');
    const expl = getQualificationExplanation(ks.label, 'keeperSweeper');
    if (expl) qualitiesBullets.push(expl);
  } else {
    smvPrimaryRead = smv.marketPosition ? String(smv.marketPosition).trim() : '';
  }

  if (smv.levelClassification) {
    const levelExpl = getQualificationExplanation(smv.levelClassification, 'developmentalLevel');
    if (levelExpl) qualitiesBullets.push(levelExpl);
  }

  const concerns = [];
  if (smv.delusionBand && smv.delusionBand !== 'low') {
    concerns.push(getDelusionWarning(smv.delusionBand));
  }
  if (smv.recommendation?.warning) {
    concerns.push(String(smv.recommendation.warning).trim());
  }

  const orientation = [];
  const rec = smv.recommendation || {};
  if (rec.priority) orientation.push(String(rec.priority).trim());
  if (rec.strategic) orientation.push(String(rec.strategic).trim());

  (rec.weakestGuidance || []).slice(0, 2).forEach((w) => {
    if (w.meaning) {
      orientation.push(`Weakest area — ${w.label}: ${String(w.meaning).trim()}`);
    }
    (w.actions || []).slice(0, 2).forEach((a) => orientation.push(String(a).trim()));
  });

  (rec.tactical || []).slice(0, 4).forEach((t) => orientation.push(String(t).trim()));

  if (smv.targetMarket?.realistic) {
    orientation.push(`Realistic target: ${String(smv.targetMarket.realistic).trim()}`);
  }
  if (smv.targetMarket?.aspirational) {
    orientation.push(`Aspirational: ${String(smv.targetMarket.aspirational).trim()}`);
  }

  // Explicit meaning -> why -> what to do framing.
  const meaningLine = smvPrimaryRead
    ? `Meaning: your current SMV read is ${smvPrimaryRead}. ${interpretation}`
    : `Meaning: ${interpretation}`;
  const whyLine = hasFamilyIntent(goal)
    ? 'Why this matters: better positioning improves access to both desired intimacy and stable long-term pairing where family/reproduction is part of your intent.'
    : 'Why this matters: better positioning improves access to desired intimacy and increases your room to select, not just accept.';
  const actionLine = rec.strategic
    ? `What to do next: ${String(rec.strategic).trim()}`
    : 'What to do next: focus on the first weak area with one consistent habit upgrade at a time.';

  const clarityIntro = [accessLine, gameLine, meaningLine, whyLine, actionLine].join(' ');

  const pathNote =
    gender === 'male' ? 'Male SMV path' : gender === 'female' ? 'Female SMV path' : '';
  const goalNote = relationshipGoalLabel(goal);
  const title = smvPrimaryRead
    ? `Sexual Market Value — ${smvPrimaryRead}`
    : 'Sexual Market Value';
  const subtitleFinal = [subtitle, pathNote, goalNote ? `Goal: ${goalNote}` : ''].filter(Boolean).join(' · ') || undefined;

  return {
    title,
    subtitle: subtitleFinal,
    qualities: { intro: clarityIntro, bullets: qualitiesBullets },
    narrative: undefined,
    concerns: { bullets: concerns },
    orientation: { bullets: orientation },
    href,
    hrefLabel
  };
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
  const pick = (layer) => layer?.concerns?.bullets?.[0];
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
