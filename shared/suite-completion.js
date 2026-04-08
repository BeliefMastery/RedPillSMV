/**
 * Suite completion: reads localStorage the same way each assessment engine does.
 *
 * Archetype complete: archetype-assessment:progress → data.analysisData.primaryArchetype
 * Attraction complete: attraction-assessment-results → smv + currentGender
 * Polarity complete: temperament-assessment:progress → data.analysisData.overallTemperament
 */

const ATTRACTION_RESULTS_KEY = 'attraction-assessment-results';

/** @param {string|null} raw localStorage value */
export function parseDataStoreProgress(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const payload = JSON.parse(raw);
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data;
    }
    return payload;
  } catch {
    return null;
  }
}

function readLocalStorage(key) {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function normalizeGender(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'male' || v === 'man') return 'male';
  if (v === 'female' || v === 'woman') return 'female';
  return null;
}

/**
 * Gender from the Archetype assessment (source of truth for the suite).
 * Polarity uses man/woman in answers; Attraction uses male/female — map at call sites.
 * @returns {'male'|'female'|null}
 */
export function getArchetypeGenderForSuite() {
  const archRaw = readLocalStorage('archetype-assessment:progress');
  const archData = parseDataStoreProgress(archRaw);
  return normalizeGender(archData?.gender || archData?.analysisData?.gender);
}

/** @returns {{
 * archetype: boolean,
 * attraction: boolean,
 * polarity: boolean,
 * allThree: boolean,
 * genders: { archetype: 'male'|'female'|null, attraction: 'male'|'female'|null, polarity: 'male'|'female'|null },
 * sameRespondentGender: boolean,
 * mismatch: boolean
 * }} */
export function getSuiteCompletion() {
  const archRaw = readLocalStorage('archetype-assessment:progress');
  const archData = parseDataStoreProgress(archRaw);
  const archetype = Boolean(archData?.analysisData?.primaryArchetype);
  const archetypeGender = normalizeGender(archData?.gender || archData?.analysisData?.gender);

  let attraction = false;
  let attractionGender = null;
  try {
    const attRaw = readLocalStorage(ATTRACTION_RESULTS_KEY);
    if (attRaw) {
      const d = JSON.parse(attRaw);
      attraction = Boolean(d?.smv && d?.currentGender);
      attractionGender = normalizeGender(d?.currentGender);
    }
  } catch {
    attraction = false;
    attractionGender = null;
  }

  const tempRaw = readLocalStorage('temperament-assessment:progress');
  const tempData = parseDataStoreProgress(tempRaw);
  const polarity = Boolean(tempData?.analysisData?.overallTemperament);
  const polarityGender = normalizeGender(tempData?.analysisData?.gender);

  const allThree = archetype && attraction && polarity;
  const completeGenders = [archetypeGender, attractionGender, polarityGender].filter(Boolean);
  const sameRespondentGender = allThree && completeGenders.length === 3 && new Set(completeGenders).size === 1;
  const mismatch = allThree && !sameRespondentGender;

  return {
    archetype,
    attraction,
    polarity,
    allThree,
    genders: {
      archetype: archetypeGender,
      attraction: attractionGender,
      polarity: polarityGender
    },
    sameRespondentGender,
    mismatch
  };
}

/**
 * Sequential suite unlock: Polarity after Archetype; Attraction after Archetype + Polarity.
 * Relationship assessment is independent (not part of this chain).
 * @returns {{
 *   archetypeComplete: boolean,
 *   polarityComplete: boolean,
 *   attractionComplete: boolean,
 *   polarityUnlocked: boolean,
 *   attractionUnlocked: boolean,
 *   polarityBlockReason: string|null,
 *   attractionBlockReason: string|null,
 *   polarityBlockMessage: string,
 *   attractionBlockMessage: string
 * }}
 */
export function getStageGateState() {
  const c = getSuiteCompletion();
  const archetypeComplete = c.archetype;
  const polarityComplete = c.polarity;
  const attractionComplete = c.attraction;

  const polarityUnlocked = archetypeComplete;
  const attractionUnlocked = archetypeComplete && polarityComplete;

  let polarityBlockReason = null;
  let polarityBlockMessage = '';
  if (!polarityUnlocked) {
    polarityBlockReason = 'needs_archetype';
    polarityBlockMessage =
      'Complete Modern Archetype Identification first. Polarity uses your archetype profile for calibration.';
  }

  let attractionBlockReason = null;
  let attractionBlockMessage = '';
  if (!attractionUnlocked) {
    if (!archetypeComplete) {
      attractionBlockReason = 'needs_archetype';
      attractionBlockMessage =
        'Complete Modern Archetype Identification first, then Polarity Position Mapping. Attraction folds both into your market read.';
    } else {
      attractionBlockReason = 'needs_polarity';
      attractionBlockMessage =
        'Complete Polarity Position Mapping first. Attraction calibrates Sexual Market Value using your archetype and polarity results.';
    }
  }

  return {
    archetypeComplete,
    polarityComplete,
    attractionComplete,
    polarityUnlocked,
    attractionUnlocked,
    polarityBlockReason,
    attractionBlockReason,
    polarityBlockMessage,
    attractionBlockMessage
  };
}

/**
 * Raw snapshots for integrated map (null if that leg incomplete).
 * @returns {{
 *   archetype: object|null,
 *   attraction: object|null,
 *   polarity: object|null
 * }}
 */
export function getSuiteSnapshots() {
  const c = getSuiteCompletion();
  const out = { archetype: null, attraction: null, polarity: null };

  if (c.archetype) {
    const archData = parseDataStoreProgress(readLocalStorage('archetype-assessment:progress'));
    if (archData?.analysisData) {
      out.archetype = {
        analysisData: archData.analysisData,
        gender: archData.gender || archData.analysisData?.gender,
        normalizedGender: c.genders.archetype
      };
    }
  }

  if (c.attraction) {
    try {
      const d = JSON.parse(readLocalStorage(ATTRACTION_RESULTS_KEY) || '{}');
      out.attraction = {
        smv: d.smv,
        currentGender: d.currentGender,
        normalizedGender: c.genders.attraction,
        preferences: d.preferences || {},
        savedAt: d.savedAt
      };
    } catch {
      out.attraction = null;
    }
  }

  if (c.polarity) {
    const tempData = parseDataStoreProgress(readLocalStorage('temperament-assessment:progress'));
    if (tempData?.analysisData) {
      out.polarity = {
        analysisData: tempData.analysisData,
        normalizedGender: c.genders.polarity
      };
    }
  }

  return out;
}
