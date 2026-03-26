/**
 * Structured excerpts for integrated-map (mirrors report language; no percentile/weight noise).
 */
import { ARCHETYPES, ARCHETYPE_OPTIMIZATION } from '../archetype-data/archetypes.js';
import BRUTAL_TRUTHS from '../archetype-data/BRUTAL-TRUTH.js';
import { TEMPERAMENT_SCORING } from '../temperament-data/temperament-scoring.js';
import { TEMPERAMENT_DIMENSIONS } from '../temperament-data/temperament-dimensions.js';
import { INTIMATE_DYNAMICS } from '../temperament-data/intimate-dynamics.js';
import { ATTRACTION_RESPONSIVENESS } from '../temperament-data/attraction-responsiveness.js';
import { TEMPERAMENT_REPORT_TIER2_PARAS } from '../temperament-data/temperament-report-copy.js';
import {
  getQualificationExplanation,
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

/** Strip trailing “(modifier)” style subcategory titles from integrated-map SMV lines. */
function stripIntegratedMapModifierTitle(s) {
  return String(s || '')
    .replace(/\s*\([^)]*\bmodifier\b[^)]*\)\s*$/i, '')
    .trim();
}

/** One-line delusion copy for integrated-map “costs” (full warnings stay in attraction report). */
function integratedMapDelusionCostLine(band) {
  if (band === 'severe') return 'Severe standards–market mismatch.';
  if (band === 'high') return 'Standards ahead of market signal—adjust or upgrade.';
  return 'Moderate mismatch—recalibrate expectations or signal.';
}

/** Hard cap for compressed report paragraphs (word-safe). */
function clipIntegratedMapText(s, maxLen) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1);
  const lastSp = cut.lastIndexOf(' ');
  return `${lastSp > 35 ? cut.slice(0, lastSp) : cut}…`;
}

/** SMV “Where it costs”: short, capped; one weakest subcategory; tight Radical Activity line. */
function buildAttractionCostsConcise(smv, rec, gender) {
  const bits = [];
  if (smv.delusionBand && smv.delusionBand !== 'low') {
    bits.push(integratedMapDelusionCostLine(smv.delusionBand));
  }
  if (rec.warning) {
    const w1 = takeSentences(String(rec.warning).trim(), 1);
    bits.push(clipIntegratedMapText(w1, 110));
  }
  const w = (rec.weakestGuidance || [])[0];
  if (w) {
    const lab = stripIntegratedMapModifierTitle(String(w.label || '').trim());
    const mean = clipIntegratedMapText(takeSentences(String(w.meaning || '').trim(), 1), 95);
    if (lab && mean) {
      const labN = normalizeForDedupe(lab);
      const meanN = normalizeForDedupe(mean);
      // Avoid bullets like “Competence: Competence”.
      if (labN && meanN && labN === meanN) bits.push(lab);
      else bits.push(`${lab}: ${mean}`);
    }
    else if (mean) bits.push(mean);
  }
  const rad = smv.subcategories?.axisOfAttraction?.radActivity;
  if (gender === 'male' && typeof rad === 'number' && rad < 40) {
    bits.push(
      "'Radical Activity' is low— behaviour outside of romance and work is absent or looks low status."
    );
  }
  const safeBits = bits.filter(Boolean);
  const joined = safeBits.join(' ');
  const text = clipIntegratedMapText(joined, 320);
  return { bits: safeBits, text };
}

function getTemperamentDimensionMeta(dimKey) {
  return (
    TEMPERAMENT_DIMENSIONS[dimKey] ||
    INTIMATE_DYNAMICS[dimKey] ||
    ATTRACTION_RESPONSIVENESS[dimKey] ||
    null
  );
}

/** Lowercase first character for inline quality phrases. */
function phraseToShortQuality(raw) {
  const t = String(raw || '').trim();
  if (!t) return '';
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/**
 * Plain “quality” wording for a dimension (not the full spectrum label).
 * Spectrum labels list feminine-leaning pole first, masculine-leaning second, on the 0–1 normalized scale.
 */
function spectrumQualityPhrase(dimKey, normalizedDimScore) {
  const dim = getTemperamentDimensionMeta(dimKey);
  if (!dim) return '';
  const label = dim.spectrumLabel;
  if (label && /\bvs\.?\b/i.test(label)) {
    const parts = label.split(/\bvs\.?\b/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const femSide = parts[0];
      const mascSide = parts[1];
      if (normalizedDimScore >= 0.55) return phraseToShortQuality(mascSide);
      if (normalizedDimScore <= 0.45) return phraseToShortQuality(femSide);
    }
  }
  const masc = dim.masculinePoleLabel ? String(dim.masculinePoleLabel).replace(/^oriented to\s+/i, '').trim() : '';
  const fem = dim.femininePoleLabel ? String(dim.femininePoleLabel).replace(/^oriented to\s+/i, '').trim() : '';
  if (masc && fem) {
    if (normalizedDimScore >= 0.55) return phraseToShortQuality(masc);
    if (normalizedDimScore <= 0.45) return phraseToShortQuality(fem);
  }
  return '';
}

/**
 * Emphasized pole-side trait text for a dimension.
 * @param {string} dimKey
 * @param {'masc'|'fem'|'auto'} side
 * @param {number} [normalizedDimScore]
 */
function getEmphasizedPoleTrait(dimKey, side = 'auto', normalizedDimScore) {
  const dim = getTemperamentDimensionMeta(dimKey);
  if (!dim) return '';
  const label = String(dim.spectrumLabel || '').trim();
  const fromScore =
    typeof normalizedDimScore === 'number'
      ? (normalizedDimScore >= 0.5 ? 'masc' : 'fem')
      : 'masc';
  const resolved = side === 'auto' ? fromScore : side;

  if (label && /\bvs\.?\b/i.test(label)) {
    const parts = label.split(/\bvs\.?\b/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const fem = phraseToShortQuality(parts[0]);
      const masc = phraseToShortQuality(parts.slice(1).join(' vs '));
      return resolved === 'fem' ? fem : masc;
    }
  }
  const masc = dim.masculinePoleLabel ? phraseToShortQuality(String(dim.masculinePoleLabel).replace(/^oriented to\s+/i, '').trim()) : '';
  const fem = dim.femininePoleLabel ? phraseToShortQuality(String(dim.femininePoleLabel).replace(/^oriented to\s+/i, '').trim()) : '';
  return resolved === 'fem' ? (fem || masc) : (masc || fem);
}

function hyperHazardSummary(ad, reportedGender) {
  const hasHyperMasc = (Array.isArray(ad.hypermascBandDimensionKeys) ? ad.hypermascBandDimensionKeys.length : 0) > 0;
  const hasHyperFemme = (Array.isArray(ad.hyperfemmeBandDimensionKeys) ? ad.hyperfemmeBandDimensionKeys.length : 0) > 0;
  if (reportedGender === 'man' && hasHyperMasc) {
    return 'Hyper-masc spikes can overrun attunement and read as neglectful or controlling when partner complement is weak.';
  }
  if (reportedGender === 'woman' && hasHyperFemme) {
    return 'Hyper-femme spikes can tip into anxiety or chaotic emotional cycling when stabilising complement is weak.';
  }
  if (hasHyperMasc && hasHyperFemme) {
    return 'Hyper spikes raise both pull and instability risk; without balancing complement, intensity can collapse into control or chaos.';
  }
  return '';
}

/** Strongest leaned qualities from saved dimension scores (for integrated map copy). */
function buildTopQualityPhrases(analysisData, max = 4) {
  const scores = analysisData?.dimensionScores;
  if (!scores || typeof scores !== 'object') return [];
  const entries = Object.entries(scores)
    .map(([key, v]) => {
      const net = v && typeof v.net === 'number' ? v.net : 0;
      const norm = (net + 1) / 2;
      return { key, norm, extremity: Math.abs(norm - 0.5) };
    })
    .filter((x) => (x.norm <= 0.45 || x.norm >= 0.55) && x.extremity >= 0.06)
    .sort((a, b) => b.extremity - a.extremity);
  const out = [];
  for (const { key, norm } of entries) {
    const q = spectrumQualityPhrase(key, norm);
    if (q) out.push(q);
    if (out.length >= max) break;
  }
  return dedupeKeepOrder(out, max);
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
  const canon = ARCHETYPES?.[p.id] || null;
  const subtitle = p.socialRole ? String(p.socialRole).trim() : '';

  let qualitiesIntro = takeSentences(p.description || '', 3);
  if (p.explanation) {
    const ex = takeSentences(p.explanation, 2);
    qualitiesIntro = qualitiesIntro ? `${qualitiesIntro} ${ex}` : ex;
  }

  // Avoid repeating the same “keyword” trait bundle shown in the subtitle/social-role line.
  // If the earliest sentences overlap strongly with subtitle tokens, start meaning after them.
  const subtitleTokens = subtitle
    ? new Set(
        normalizeForDedupe(subtitle)
          .split(' ')
          .map((t) => t.trim())
          .filter((t) => t.length >= 4)
      )
    : new Set();

  const qualitiesSentences = String(qualitiesIntro || '').match(/[^.!?]+[.!?]*/g) || [];
  // Be conservative: only treat a sentence as redundant when it shares at least
  // two of the subtitle keyword tokens (avoid chopping meaning for partial
  // lexical overlap).
  const requiredOverlap = subtitleTokens.size >= 2 ? 2 : 0;
  const picked = [];
  for (const s of qualitiesSentences) {
    if (picked.length >= 2) break;
    const sTokens = normalizeForDedupe(s)
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length >= 4);

    if (requiredOverlap > 0) {
      let overlap = 0;
      for (const tk of sTokens) {
        if (subtitleTokens.has(tk)) overlap += 1;
        if (overlap >= requiredOverlap) break;
      }
      if (overlap >= requiredOverlap) continue; // likely redundant with subtitle keyword bundle
    }
    picked.push(s.trim());
  }

  let meaningCore = picked.length ? picked.join(' ').trim() : '';
  if (!meaningCore) meaningCore = takeSentences(qualitiesIntro || '', 2);
  if (!meaningCore) meaningCore = takeSentences(canon?.description || '', 2);
  if (!meaningCore) meaningCore = 'Primary archetype loaded; open full report for detail.';
  const meaning = safeSentence(meaningCore);

  let helpsCore = '';
  // “Where it helps” should describe strengths/capacities, not action advice.
  if (traitsSummary) {
    helpsCore = `Your key strengths include ${traitsSummary}.`;
  } else if (p.description) {
    const descS = takeSentences(String(p.description || ''), 2);
    helpsCore = descS || '';
  } else if (p.explanation) {
    const expS = takeSentences(String(p.explanation || ''), 1);
    helpsCore = expS || '';
  }
  if (!helpsCore) helpsCore = 'This pattern brings a consistent set of strengths; the full report maps how those strengths hold under stress.';
  helpsCore = `${helpsCore} In practice, these strengths tend to create warmth, trust, and social ease when boundaries stay clear.`;
  const helps = safeSentence(helpsCore);

  const costClauses = [];
  // Prefer “brutal truth” as the limitation source; it contains the real failure mode.
  const brutalNarrative = String(BRUTAL_TRUTHS?.[p.id]?.narrative || '').trim();
  let chosenBrutalNorm = '';
  if (brutalNarrative) {
    const sents = brutalNarrative.match(/[^.!?]+[.!?]*/g) || [];
    const filtered = sents.filter((s) => /\b(the truth|truth)\b/i.test(s) || /\b(the cost|cost)\b/i.test(s) || /\bdeepest cost\b/i.test(s));
    const costSents = filtered.length ? filtered : sents;
    const chosen = costSents.slice(0, 2).join(' ').trim();
    if (chosen) {
      chosenBrutalNorm = normalizeForDedupe(chosen);
      costClauses.push(clipIntegratedMapText(chosen, 360));
    }
  }

  // Backfill with optimization blind spot / stress response when brutal truth is missing.
  if (!costClauses.length) {
    if (optimizationCopy?.likelyBlindSpot) {
      costClauses.push(clipIntegratedMapText(String(optimizationCopy.likelyBlindSpot).trim(), 260));
    } else if (p.stressResponse) {
      costClauses.push(clipIntegratedMapText(String(p.stressResponse).trim(), 260));
    }
  } else if (optimizationCopy?.likelyBlindSpot) {
    // If brutal truth exists, append one short “blind spot” clause for sharper mapping.
    const blind = String(optimizationCopy.likelyBlindSpot).trim();
    const blindNorm = normalizeForDedupe(blind);
    if (!chosenBrutalNorm || !(chosenBrutalNorm.includes(blindNorm) || blindNorm.includes(chosenBrutalNorm))) {
      costClauses.push(clipIntegratedMapText(blind, 170));
    }
  } else if (p.stressResponse) {
    costClauses.push(clipIntegratedMapText(String(p.stressResponse).trim(), 170));
  }

  const shadows = ad?.phase3Results?.shadowIndicators;
  if (Array.isArray(shadows) && shadows.length > 0) {
    const sh = shadows[0];
    const sid = sh.id || sh;
    const sname = sh.name || ARCHETYPES?.[sid]?.name || sid;
    const sdesc = takeSentences(ARCHETYPES?.[sid]?.description || '', 1);
    const shadowLine = sdesc
      ? `${sname}: ${sdesc}`
      : `${sname}: pattern to explore under stress (see full report).`;
    costClauses.push(clipIntegratedMapText(shadowLine, 150));
  }

  const costsText = costClauses.length
    ? costClauses.join(' ')
    : clipIntegratedMapText(
        'Pressure can amplify unhelpful patterns; the full report maps shadows, blind spots, and stress loops.',
        160
      );
  const costs = safeSentence(
    `${costsText} Weakness pattern: generosity without discernment can invite overreach, dependency, or one-sided dynamics.`
  );

  const nextMoveCandidates = [];

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
function buildPolarityStrengthsHelps(ad, reportedGender) {
  if (reportedGender === 'man') {
    const hypKeys = Array.isArray(ad.hypermascBandDimensionKeys) ? ad.hypermascBandDimensionKeys : [];
    const strKeys = Array.isArray(ad.stronglyMascBandDimensionKeys) ? ad.stronglyMascBandDimensionKeys : [];
    const hypTraits = dedupeKeepOrder(hypKeys.map((k) => getEmphasizedPoleTrait(k, 'masc')), 5);
    const strTraits = dedupeKeepOrder(strKeys.map((k) => getEmphasizedPoleTrait(k, 'masc')), 6);
    const parts = [];
    if (strTraits.length) parts.push(`Signal (Strongly Masc): ${strTraits.join(', ')}.`);
    if (hypTraits.length) parts.push(`Signal (Hyper-masc): ${hypTraits.join(', ')}.`);
    if (parts.length) parts.push('Implication: these spikes create stronger pull when matched by complementary feminine-leaning intensity.');
    return parts.join(' ');
  }
  if (reportedGender === 'woman') {
    const hypKeys = Array.isArray(ad.hyperfemmeBandDimensionKeys) ? ad.hyperfemmeBandDimensionKeys : [];
    const strKeys = Array.isArray(ad.stronglyFemmeBandDimensionKeys) ? ad.stronglyFemmeBandDimensionKeys : [];
    const hypTraits = dedupeKeepOrder(hypKeys.map((k) => getEmphasizedPoleTrait(k, 'fem')), 5);
    const strTraits = dedupeKeepOrder(strKeys.map((k) => getEmphasizedPoleTrait(k, 'fem')), 6);
    const parts = [];
    if (hypTraits.length) parts.push(`Signal (Hyper-femme): ${hypTraits.join(', ')}.`);
    if (strTraits.length) parts.push(`Signal (Strongly Femme): ${strTraits.join(', ')}.`);
    if (parts.length) parts.push('Implication: these spikes create stronger pull when matched by complementary masculine-leaning intensity.');
    return parts.join(' ');
  }
  return '';
}

function buildPolarityAnomalyCosts(ad) {
  const anomKeys = Array.isArray(ad.anomalousDimensionKeys) ? ad.anomalousDimensionKeys : [];
  if (!anomKeys.length) return '';
  const scores = ad?.dimensionScores || {};
  const anomalyTraits = dedupeKeepOrder(
    anomKeys.map((dimKey) => {
      const net = scores[dimKey] && typeof scores[dimKey].net === 'number' ? scores[dimKey].net : 0;
      const norm = (net + 1) / 2;
      return getEmphasizedPoleTrait(dimKey, 'auto', norm);
    }),
    8
  );
  if (!anomalyTraits.length) return '';
  return clipIntegratedMapText(
    `Anomaly traits: ${anomalyTraits.join(', ')}. These poles sit outside typical range; without opposite-pole match at similar strength, chemistry can flatten or destabilise.`,
    240
  );
}

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

  const reportedGender = ad.gender;
  const qualityPhrases = buildTopQualityPhrases(ad, 4);
  const desc = takeSentences(interp.description || '', 2);

  const meaningBullets = qualityPhrases.map((q) => capitalizeTrait(q)).slice(0, 4);
  const hasStrongSpike =
    ((Array.isArray(ad.stronglyMascBandDimensionKeys) ? ad.stronglyMascBandDimensionKeys.length : 0) > 0) ||
    ((Array.isArray(ad.hypermascBandDimensionKeys) ? ad.hypermascBandDimensionKeys.length : 0) > 0) ||
    ((Array.isArray(ad.stronglyFemmeBandDimensionKeys) ? ad.stronglyFemmeBandDimensionKeys.length : 0) > 0) ||
    ((Array.isArray(ad.hyperfemmeBandDimensionKeys) ? ad.hyperfemmeBandDimensionKeys.length : 0) > 0);
  const bridge = hasStrongSpike ? 'Composite sits near center; individual dimensions still show strong directional spikes.' : '';

  const meaningLead = meaningBullets.length
    ? `${desc} Qualities that lean clearest in your data. ${bridge}`.trim()
    : `${desc} ${bridge}`.trim();
  const meaning = safeSentence(meaningLead || interp.label || 'Polarity profile loaded.');

  // Strong/hyper emphasized pole traits only (underlined side only).
  let helpsBullets = [];
  if (reportedGender === 'man') {
    const hypKeys = Array.isArray(ad.hypermascBandDimensionKeys) ? ad.hypermascBandDimensionKeys : [];
    const strKeys = Array.isArray(ad.stronglyMascBandDimensionKeys) ? ad.stronglyMascBandDimensionKeys : [];
    helpsBullets = dedupeKeepOrder(
      [...strKeys, ...hypKeys]
        .map((k) => capitalizeTrait(getEmphasizedPoleTrait(k, 'masc')))
        .filter(Boolean),
      8
    );
  } else if (reportedGender === 'woman') {
    const hypKeys = Array.isArray(ad.hyperfemmeBandDimensionKeys) ? ad.hyperfemmeBandDimensionKeys : [];
    const strKeys = Array.isArray(ad.stronglyFemmeBandDimensionKeys) ? ad.stronglyFemmeBandDimensionKeys : [];
    helpsBullets = dedupeKeepOrder(
      [...strKeys, ...hypKeys]
        .map((k) => capitalizeTrait(getEmphasizedPoleTrait(k, 'fem')))
        .filter(Boolean),
      8
    );
  }

  const helpsLead = helpsBullets.length
    ? 'These spike traits are your clearest pull signals and create stronger attraction when complementary intensity is matched.'
    : 'No strongly emphasized poles in this snapshot; expression appears more blended across situations.';
  const helps = safeSentence(helpsLead);

  // Anomaly emphasized pole traits only (underlined side only).
  const anomalyKeys = Array.isArray(ad.anomalousDimensionKeys) ? ad.anomalousDimensionKeys : [];
  const scores = ad?.dimensionScores || {};
  const costsBullets = dedupeKeepOrder(
    anomalyKeys
      .map((dimKey) => {
        const net = scores?.[dimKey]?.net;
        const norm = typeof net === 'number' ? (net + 1) / 2 : 0.5;
        return capitalizeTrait(getEmphasizedPoleTrait(dimKey, 'auto', norm));
      })
      .filter(Boolean),
    10
  );

  const hyperHazard = hyperHazardSummary(ad, reportedGender);
  const costsLead = costsBullets.length
    ? 'These anomaly poles are the main friction points; without opposite-pole match at similar strength, chemistry can flatten, misattune, or destabilise over time.'
    : 'No anomaly flags in this snapshot.';
  const costs = safeSentence([costsLead, hyperHazard].filter(Boolean).join(' '));

  const nextMoveCandidates = dedupeKeepOrder(
    [
      ad.contextSensitivity?.detected && ad.contextSensitivity?.message ? String(ad.contextSensitivity.message).trim() : '',
      'Use this map to read where polarity supports or blocks intimacy, then calibrate habits and partner-fit choices accordingly.'
    ],
    4
  ).map(cleanActionText);

  const titleRaw = temperamentTitleExplicit(cat, reportedGender, interp.label);
  const title = String(titleRaw).replace(/\s*\((?:male|female) respondent\)\s*$/, '');

  return {
    title,
    subtitle: undefined,
    frame: { meaning, helps, costs, meaningBullets, helpsBullets, costsBullets },
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
  const overallR = Math.round(overall);
  const goal = snap?.preferences?.relationship_goal;
  const accessPrinciple = buildAccessPrinciple({
    goal,
    gender,
    hasDelusionFlag: Boolean(smv?.delusionBand && smv.delusionBand !== 'low')
  });
  const accessRead = getSMVInterpretation(overall);
  const marketBand = smv.marketPosition ? String(smv.marketPosition).trim() : 'not classified';
  const rec = smv.recommendation || {};

  const bbg = smv.badBoyGoodGuy;
  const ks = smv.keeperSweeper;
  const gridExpl =
    gender === 'male' && bbg?.label
      ? getQualificationExplanation(bbg.label, 'badBoyGoodGuy')
      : gender === 'female' && ks?.label
        ? getQualificationExplanation(ks.label, 'keeperSweeper')
        : '';

  const clusters = smv.clusters || {};
  const cr = typeof clusters.coalitionRank === 'number' ? clusters.coalitionRank : 0;
  const repro = typeof clusters.reproductiveConfidence === 'number' ? clusters.reproductiveConfidence : 0;
  const axis = typeof clusters.axisOfAttraction === 'number' ? clusters.axisOfAttraction : 0;

  const meaningParts = [
    `Overall sexual market value sits near the ${overallR}th percentile; market band reads as ${marketBand}.`,
    accessRead,
    gender === 'male' && bbg?.label ? `Likely categorisation: “${bbg.label}”.` : '',
    gender === 'female' && ks?.label
      ? `Likely treatment pattern: ${ks.label}${ks.desc ? ` — ${ks.desc}` : ''}.`
      : '',
    gridExpl,
    accessPrinciple
  ].filter(Boolean);

  // Keep the lead summary generic so bullets carry the specific signals.
  const frameMeaning = safeSentence('Your value (from this snapshot) is a composite of several signals; the clearest ones are below.');

  const strengthBits = [];
  if (cr >= 62) strengthBits.push('coalition rank among peers');
  if (repro >= 62) strengthBits.push('reproductive confidence signal');
  if (axis >= 62) strengthBits.push('attraction opportunity');
  if (gender === 'male' && bbg && bbg.goodGuyPercentile >= 65 && bbg.badBoyPercentile >= 65) {
    strengthBits.push('both provision-style signal and attraction axis read strong together');
  }
  const strategic = rec.strategic ? String(rec.strategic).trim() : '';
  const priority = rec.priority ? String(rec.priority).trim() : '';
  const helpsParts = [
    strategic,
    priority ? `Stated priority: ${priority}.` : '',
    strengthBits.length ? `Relative strengths: ${strengthBits.join('; ')}.` : ''
  ].filter(Boolean);
  const frameHelps = safeSentence(
    helpsParts.length
      ? 'Strongest where your leverage signals are clearest; these are the channels most likely to improve access, quality of matches, and retention.'
      : 'Leverage is uneven rather than absent; the full report breaks down clusters and weakest subcategories so you can prioritise upgrades.'
  );

  const costsObj = buildAttractionCostsConcise(smv, rec, gender);
  const frameCosts = safeSentence(
    costsObj?.bits?.length
      ? 'Constraints currently capping outcomes; left unchanged, they narrow optionality and increase mismatch risk.'
      : 'No major mismatch flags in this snapshot.'
  );
  const costsBullets = Array.isArray(costsObj?.bits) ? costsObj.bits : [];

  const weakestGuidanceActions = (rec.weakestGuidance || []).flatMap((w) => w.actions || []).map(cleanActionText);
  const tacticalActions = (rec.tactical || []).map(cleanActionText);
  const nextMoveCandidates = dedupeKeepOrder([...weakestGuidanceActions, ...tacticalActions], 6);

  const title = `Sexual Market Value — ~${overallR}th percentile · ${marketBand}`;
  let subtitle = '';
  if (gender === 'male' && bbg?.label) subtitle = bbg.label;
  else if (gender === 'female' && ks?.label) subtitle = ks.desc ? `${ks.label} — ${ks.desc}` : ks.label;

  return {
    title,
    subtitle: subtitle || undefined,
    frame: {
      meaning: frameMeaning,
      helps: frameHelps,
      costs: frameCosts,
      meaningBullets: meaningParts.filter(Boolean).slice(0, 6),
      helpsBullets: helpsParts.filter(Boolean).slice(0, 6),
      costsBullets: costsBullets.filter(Boolean).slice(0, 6)
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

  const archPrimary = ad?.primaryArchetype;
  const archetypeName = archPrimary?.name || 'your archetype lead';
  const cat = pd?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;
  // Summary is intentionally “label-light”; we only use temperament qualities (not the temperament label) here.

  const rec = smv?.recommendation || {};
  const archLine = archetypeName
    ? `You run an independent path and avoid being placed inside hierarchies. That gives you freedom, but it also keeps you out of arenas where status, visibility, and opportunity compound.`
    : `You protect autonomy and resist being placed inside hierarchies. That gives you freedom, but it can also reduce visibility and opportunity.`;

  const tempQualities = buildTopQualityPhrases(pd, 3);
  const tempLine = tempQualities.length
    ? `Clearest quality leans: ${tempQualities.join('; ')}.`
    : `Polarity data was thin in the saved snapshot; open the full polarity report for detail.`;

  const marketLine = smv
    ? (() => {
        const o = Math.round(smv.overall ?? 0);
        const mp = smv.marketPosition ? String(smv.marketPosition).trim() : '';
        const lever =
          (Array.isArray(rec.tactical) && rec.tactical[0]) ||
          rec.strategic ||
          'Target one visible signal upgrade and track response quality over a short cycle.';
        const risk =
          smv?.delusionBand && smv.delusionBand !== 'low'
            ? integratedMapDelusionCostLine(smv.delusionBand)
            : (typeof smv?.subcategories?.axisOfAttraction?.radActivity === 'number' &&
              smv.subcategories.axisOfAttraction.radActivity < 40
                ? 'Low out-of-domain activity signal can read low-status and narrow attraction pull.'
                : '');
        return [`Improvement lever: ${trimTrailingPunctuation(String(lever || ''))}.`, risk]
          .filter(Boolean)
          .join(' ');
      })()
    : `Attraction snapshot missing; complete the assessment for an SMV line in this summary.`;

  return {
    identity: [archLine, tempLine].filter(Boolean).join(' '),
    market: marketLine
  };
}

/**
 * One priority action per lens, derived from saved assessment data (not generic copy).
 * @param {{ analysisData?: object }} archetypeSnap
 * @param {{ analysisData?: object }} polaritySnap
 * @param {{ smv?: object, currentGender?: string, preferences?: object }} attractionSnap
 * @param {{ layers?: { archL?: object, polL?: object, attL?: object } }} [opts]
 */
export function buildNextMoveCandidates(archetypeSnap, polaritySnap, attractionSnap, opts = {}) {
  const ad = archetypeSnap?.analysisData || {};
  const pd = polaritySnap?.analysisData || {};
  const smv = attractionSnap?.smv;
  const gender = attractionSnap?.currentGender;
  const prefs = attractionSnap?.preferences || {};

  const archL = opts.layers?.archL ?? buildArchetypeLayer(ad);
  const polL = opts.layers?.polL ?? buildPolarityLayer(pd);
  const attL = opts.layers?.attL ?? buildAttractionLayer({ smv, currentGender: gender, preferences: prefs });

  const archPrimary = ad.primaryArchetype;
  const opt = archPrimary?.id ? ARCHETYPE_OPTIMIZATION?.[archPrimary.id] : null;
  let archText =
    (opt?.optimizationStrategy && String(opt.optimizationStrategy).trim()) ||
    (archPrimary?.growthEdge && String(archPrimary.growthEdge).trim()) ||
    '';
  if (!archText) {
    archText =
      'Take one concrete growth edge from your archetype report and rehearse it in a real social or work situation this week.';
  }
  archText = clipIntegratedMapText(cleanActionText(archText), 128);
  const move1 = `Archetype — ${ensurePeriod(archText)}`;

  let polText = '';
  if (pd.contextSensitivity?.detected && pd.contextSensitivity?.message) {
    polText = clipIntegratedMapText(cleanActionText(String(pd.contextSensitivity.message).trim()), 128);
  } else if (Array.isArray(pd.anomalousDimensionNames) && pd.anomalousDimensionNames.length) {
    const names = pd.anomalousDimensionNames.slice(0, 2).join(', ');
    polText = `Discuss or test partner fit around ${names}—you need opposite-pole complement or an explicit trade-off you accept.`;
  } else if (
    (pd.gender === 'man' &&
      ((pd.stronglyMascBandDimensionNames?.length || 0) > 0 || (pd.hypermascBandDimensionNames?.length || 0) > 0)) ||
    (pd.gender === 'woman' &&
      ((pd.stronglyFemmeBandDimensionNames?.length || 0) > 0 ||
        (pd.hyperfemmeBandDimensionNames?.length || 0) > 0 ||
        (pd.femmeBandDimensionNames?.length || 0) > 0))
  ) {
    polText =
      'Use your strongest polarity poles as a filter—confirm partners can meet complementary intensity, not just chemistry in the moment.';
  } else {
    const pn = (polL.nextMoveCandidates || []).filter(Boolean);
    polText = pn[0]
      ? cleanActionText(pn[0])
      : 'Pick one daily context to practise clear lead vs clear receive and watch how others respond.';
  }
  polText = clipIntegratedMapText(polText, 128);
  const move2 = `Polarity — ${ensurePeriod(polText)}`;

  const attCands = attL.nextMoveCandidates || [];
  let attText =
    attCands[0] ||
    (Array.isArray(smv?.recommendation?.tactical) && smv.recommendation.tactical[0]) ||
    (smv?.recommendation?.strategic && String(smv.recommendation.strategic).trim()) ||
    '';
  attText = attText
    ? clipIntegratedMapText(cleanActionText(String(attText)), 128)
    : clipIntegratedMapText(
        'Open your attraction results and execute one tactical item from Strategic Recommendations.',
        128
      );
  const move3 = `Market / SMV — ${ensurePeriod(attText)}`;

  return dedupeKeepOrder([move1, move2, move3], 3);
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

/**
 * How the three assessments compound: headline, then meaning / helps / costs from each layer, then an integration cue.
 * @param {{ analysisData?: object }} archetypeSnap
 * @param {{ analysisData?: object }} polaritySnap
 * @param {{ smv?: object, currentGender?: string, preferences?: object }} attractionSnap
 * @param {{ layers?: { archL?: object, polL?: object, attL?: object } }} [opts]
 */
export function buildPatternConvergenceParagraph(archetypeSnap, polaritySnap, attractionSnap, opts = {}) {
  const ad = archetypeSnap?.analysisData || {};
  const pd = polaritySnap?.analysisData || {};
  const smv = attractionSnap?.smv;
  const gender = attractionSnap?.currentGender;
  const prefs = attractionSnap?.preferences || {};

  const archL = opts.layers?.archL ?? buildArchetypeLayer(ad);
  const polL = opts.layers?.polL ?? buildPolarityLayer(pd);
  const attL = opts.layers?.attL ?? buildAttractionLayer({ smv, currentGender: gender, preferences: prefs });

  const archName = ad.primaryArchetype?.name || 'your archetype pattern';
  const secName = ad.secondaryArchetype?.name ? String(ad.secondaryArchetype.name).trim() : '';
  const archHeadline = secName ? `${archName} (secondary pull: ${secName})` : archName;

  const cat = pd?.overallTemperament?.category;
  const interp = cat ? TEMPERAMENT_SCORING?.interpretation?.[cat] : null;
  const tempLabel = interp?.label ? String(interp.label).trim() : 'your polarity profile';
  const smvReadRaw =
    gender === 'male' && smv?.badBoyGoodGuy?.label
      ? smv.badBoyGoodGuy.label
      : gender === 'female' && smv?.keeperSweeper?.label
        ? smv.keeperSweeper.label
        : smv?.marketPosition
          ? String(smv.marketPosition).trim()
          : 'your market band';
  const smvRead = clipIntegratedMapText(smvReadRaw, 56);
  const pct = smv?.overall != null ? Math.round(smv.overall) : null;

  const opener =
    pct != null
      ? `Three saved reports converge: Archetype (${archHeadline}) governs how you show up, Polarity (${tempLabel}) governs attraction fit and tension, and Attraction (~${pct}th percentile, “${smvRead}”) governs access and selection outcomes.`
      : `Three saved reports converge: Archetype (${archHeadline}) shapes behaviour, Polarity (${tempLabel}) shapes attraction fit, and Attraction (“${smvRead}”) shapes access and selection outcomes.`;

  const hasHyperHazard = Boolean(hyperHazardSummary(pd, pd?.gender));
  const hasAnom = Array.isArray(pd.anomalousDimensionNames) && pd.anomalousDimensionNames.length > 0;
  const hasSmvRisk = Boolean(smv?.delusionBand && smv.delusionBand !== 'low');
  const hasArchetypeFriction = Boolean(String(archL?.frame?.costs || '').trim());

  const mechanism = hasHyperHazard
    ? 'When archetype habits, polarity spikes, and market constraints align, response quality and retention improve; when they clash, magnetism can coexist with instability.'
    : 'When archetype habits, polarity fit, and market signal align, response quality and retention improve; when they clash, effort rises while outcomes flatten.';

  const frictionSignals = [];
  if (hasArchetypeFriction) frictionSignals.push('archetype limitation loops');
  if (hasAnom) frictionSignals.push('anomalous polarity dimensions');
  if (hasHyperHazard) frictionSignals.push('hyper-state instability risk');
  if (hasSmvRisk) frictionSignals.push('standards-to-signal mismatch');

  const synthesis = frictionSignals.length
    ? `Current friction concentrates around ${frictionSignals.join(', ')}; resolve the strongest one first to unlock leverage across the other two layers.`
    : 'Current layers are reasonably aligned; protect that alignment by keeping one behaviour change and one signal upgrade running in parallel.';

  const delusion = smv?.delusionBand && smv.delusionBand !== 'low';
  const overall = typeof smv?.overall === 'number' ? smv.overall : 50;
  let closer = '';
  if (delusion || overall < 42) {
    closer =
      'Integration cue: tighten standards realism and one visible SMV upgrade first—access and choice quality usually gate everything else.';
  } else if (hasAnom) {
    closer =
      'Integration cue: treat polarity partner-fit on flagged dimensions as primary—market upgrades rarely fix a pole mismatch you repeat.';
  } else if (overall < 58) {
    closer =
      'Integration cue: stack one credible signal upgrade with one polarity behaviour change so partners can read you consistently.';
  } else {
    closer =
      'Integration cue: your archetype habits still govern how you deploy strength—use polarity awareness so high SMV doesn’t read ambiguous in person.';
  }
  closer = clipIntegratedMapText(closer, 175);

  const assembled = [opener, mechanism, synthesis, closer]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return clipIntegratedMapText(assembled, 620);
}
