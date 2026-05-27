/**
 * Sexual Contract Index (SCI) + Polarity Collapse Signature (PCS).
 * Pure functions — browser + Node (.mjs).
 * @see docs/COLLAPSE_SEXUAL_CONTRACT_FRAMEWORK.md
 */

import {
  SEXUAL_CONTRACT_CALIBRATION_VERSION,
  SCI_WEIGHTS,
  PCS_WEIGHTS,
  CONTRACT_FRAGILITY_BANDS,
  POLARITY_COLLAPSE_BANDS,
  PCS_CONVERGENCE
} from './sexual-contract-config.mjs';
import { SEXUAL_CONTRACT_INVENTORY } from '../sexual-contract-data/inventory-questions.mjs';

export { SEXUAL_CONTRACT_CALIBRATION_VERSION };

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/** Likert 1–10 → 0–1 */
function likert01(v, reverse = false) {
  if (v == null || Number.isNaN(Number(v))) return null;
  let n = clamp01((Number(v) - 1) / 9);
  if (reverse) n = 1 - n;
  return n;
}

function meanDefined(vals) {
  const nums = vals.filter((v) => v != null && !Number.isNaN(v));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function bandFrom(value, bands) {
  for (const b of bands) {
    if (value >= b.min) return b;
  }
  return bands[bands.length - 1];
}

function fnv1aHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** @param {Record<string, number>} answers @param {string} group */
function inventoryGroupMean(answers, group) {
  const ids = SEXUAL_CONTRACT_INVENTORY.filter((q) => q.group === group).map((q) => q.id);
  const vals = ids.map((id) => {
    const q = SEXUAL_CONTRACT_INVENTORY.find((x) => x.id === id);
    return likert01(answers[id], q?.reverseScore);
  });
  return meanDefined(vals);
}

/** Polarity dimension net score → 0–1 masculine-leaning normalized */
function dimNorm(dimensionScores, key) {
  const net = dimensionScores?.[key]?.net;
  if (typeof net !== 'number') return null;
  return clamp01((net + 1) / 2);
}

/** @param {Record<string, number>} answers @param {Record<string, number>} polarityAnswers question id → raw likert */
function polarityAnswerMean(answers, ids, reverseIds = []) {
  const vals = ids.map((id) => likert01(answers[id], reverseIds.includes(id)));
  return meanDefined(vals);
}

/**
 * @param {object} input
 * @param {'male'|'female'|null} [input.gender]
 * @param {Record<string, number>} [input.inventoryAnswers]
 * @param {Record<string, { net: number }>} [input.dimensionScores]
 * @param {Record<string, number>} [input.polarityAnswers]
 * @param {Record<string, number>} [input.attractionResponses]
 * @param {{ clusters?: Record<string, number> }} [input.smv]
 * @param {{ id?: string }} [input.primaryArchetype]
 * @param {number} [input.relationshipDirectionStrain] 0–1 optional
 */
export function computeSexualContractIndex(input = {}) {
  const {
    gender = null,
    inventoryAnswers = {},
    dimensionScores = {},
    polarityAnswers = {},
    attractionResponses = {},
    smv = {},
    primaryArchetype = {},
    relationshipDirectionStrain = null
  } = input;

  const inv = inventoryAnswers;

  const subIndices = {
    osrExposure: meanDefined([
      inventoryGroupMean(inv, 'osrExposure'),
      gender === 'male' && typeof attractionResponses.sci_osr_1 === 'number'
        ? likert01(attractionResponses.sci_osr_1)
        : null,
      gender === 'female' && typeof attractionResponses.sci_osr_1 === 'number'
        ? likert01(attractionResponses.sci_osr_1)
        : null
    ]),
    hypergamyLoad: meanDefined([
      inventoryGroupMean(inv, 'hypergamyLoad'),
      dimNorm(dimensionScores, 'hypergamy_and_choice') != null
        ? 1 - dimNorm(dimensionScores, 'hypergamy_and_choice')
        : null
    ]),
    transactionalDominance: meanDefined([
      inventoryGroupMean(inv, 'transactionalDominance'),
      typeof attractionResponses.sci_tx_1 === 'number' ? likert01(attractionResponses.sci_tx_1) : null
    ]),
    householdingOrientation: meanDefined([
      inventoryGroupMean(inv, 'householdingOrientation'),
      typeof attractionResponses.sci_hh_1 === 'number' ? likert01(attractionResponses.sci_hh_1) : null,
      typeof smv?.clusters?.reproductiveConfidence === 'number'
        ? smv.clusters.reproductiveConfidence / 100
        : null
    ]),
    consequenceInsulation: meanDefined([
      inventoryGroupMean(inv, 'consequenceInsulation'),
      dimNorm(dimensionScores, 'consequence_insulation') != null
        ? 1 - dimNorm(dimensionScores, 'consequence_insulation')
        : null,
      typeof attractionResponses.sci_ins_1 === 'number' ? likert01(attractionResponses.sci_ins_1) : null
    ]),
    civilizationROI: meanDefined([
      inventoryGroupMean(inv, 'civilizationROI'),
      typeof attractionResponses.sci_roi_1 === 'number'
        ? 1 - likert01(attractionResponses.sci_roi_1)
        : null,
      typeof attractionResponses.sci_roi_2 === 'number' ? likert01(attractionResponses.sci_roi_2) : null
    ])
  };

  Object.keys(subIndices).forEach((k) => {
    if (subIndices[k] != null) subIndices[k] = clamp01(subIndices[k]);
  });

  const w = SCI_WEIGHTS;
  let contractFragility =
    (subIndices.osrExposure ?? 0.5) * w.osrExposure +
    (subIndices.hypergamyLoad ?? 0.5) * w.hypergamyLoad +
    (subIndices.transactionalDominance ?? 0.5) * w.transactionalDominance +
    (subIndices.consequenceInsulation ?? 0.5) * w.consequenceInsulation -
    (subIndices.householdingOrientation ?? 0.5) * w.householdingOrientation -
    (subIndices.civilizationROI ?? 0.5) * w.civilizationROI +
    0.35;
  contractFragility = clamp01(contractFragility);

  const initiativePref =
    gender === 'female'
      ? dimNorm(dimensionScores, 'preferred_dynamics') != null
        ? 1 - dimNorm(dimensionScores, 'preferred_dynamics')
        : polarityAnswerMean(polarityAnswers, ['int_dyn_1'], ['int_dyn_1'])
      : dimNorm(dimensionScores, 'preferred_dynamics') ??
        polarityAnswerMean(polarityAnswers, ['int_dyn_1']);

  const necessityContext = meanDefined([
    inventoryGroupMean(inv, 'directorCompensation'),
    polarityAnswerMean(polarityAnswers, ['pcs_dir_1', 'pcs_dir_2', 'pcs_dir_3']),
    typeof relationshipDirectionStrain === 'number' ? relationshipDirectionStrain : null
  ]);

  const pcsSub = {
    masculineProposalAbsent: clamp01(
      meanDefined([
        inventoryGroupMean(inv, 'masculineProposalAbsent'),
        gender === 'male' ? polarityAnswerMean(polarityAnswers, ['pcs_mpa_1', 'pcs_mpa_2']) : null,
        gender === 'male' && initiativePref != null ? 1 - initiativePref : null,
        gender === 'male' && smv?.clusters?.coalitionRank != null
          ? 1 - smv.clusters.coalitionRank / 100
          : null,
        /omega|gamma/i.test(primaryArchetype?.id || '') ? 0.65 : null
      ]) ?? 0.5
    ),
    directorCompensation: clamp01(
      meanDefined([
        inventoryGroupMean(inv, 'directorCompensation'),
        gender === 'female' ? necessityContext : null,
        polarityAnswerMean(polarityAnswers, ['pcs_dir_1', 'pcs_dir_2', 'pcs_dir_3'])
      ]) ?? 0.5
    ),
    beautifulOnesWithdrawal: clamp01(
      meanDefined([
        inventoryGroupMean(inv, 'beautifulOnesWithdrawal'),
        gender === 'male' ? polarityAnswerMean(polarityAnswers, ['pcs_bo_1']) : null,
        gender === 'male' && dimNorm(dimensionScores, 'aesthetic_orientation') != null
          ? 1 - dimNorm(dimensionScores, 'aesthetic_orientation')
          : null,
        gender === 'male' && initiativePref != null && dimNorm(dimensionScores, 'aesthetic_orientation') != null
          ? (1 - initiativePref) * (1 - dimNorm(dimensionScores, 'aesthetic_orientation'))
          : null
      ]) ?? 0.5
    ),
    behavioralSinkRisk: clamp01(
      meanDefined([
        inventoryGroupMean(inv, 'behavioralSinkRisk'),
        subIndices.transactionalDominance,
        subIndices.civilizationROI != null ? 1 - subIndices.civilizationROI : null,
        1 - (subIndices.householdingOrientation ?? 0.5)
      ]) ?? 0.5
    )
  };

  const pw = PCS_WEIGHTS;
  const polarityCollapse = clamp01(
    pcsSub.masculineProposalAbsent * pw.masculineProposalAbsent +
      pcsSub.directorCompensation * pw.directorCompensation +
      pcsSub.beautifulOnesWithdrawal * pw.beautifulOnesWithdrawal +
      pcsSub.behavioralSinkRisk * pw.behavioralSinkRisk
  );

  const fragilityBand = bandFrom(contractFragility, CONTRACT_FRAGILITY_BANDS);
  const collapseBand = bandFrom(polarityCollapse, POLARITY_COLLAPSE_BANDS);

  const convergence = evaluateCollapseConvergence({
    gender,
    subIndices,
    pcsSub,
    polarityCollapse,
    necessityContext,
    initiativePref
  });

  const hashPayload = JSON.stringify({
    v: SEXUAL_CONTRACT_CALIBRATION_VERSION,
    gender,
    inv: Object.keys(inv).sort().map((k) => [k, inv[k]]),
    arch: primaryArchetype?.id || '',
    frag: Math.round(contractFragility * 1000)
  });

  return {
    version: SEXUAL_CONTRACT_CALIBRATION_VERSION,
    subIndices,
    pcsSub,
    contractFragility,
    contractFragilityBand: fragilityBand.band,
    contractFragilityLabel: fragilityBand.label,
    polarityCollapse,
    polarityCollapseBand: collapseBand.band,
    polarityCollapseLabel: collapseBand.label,
    convergence,
    inputsHash: fnv1aHash(hashPayload)
  };
}

/** @param {object} ctx */
export function evaluateCollapseConvergence(ctx) {
  const {
    gender,
    subIndices = {},
    pcsSub = {},
    polarityCollapse = 0,
    necessityContext = null,
    initiativePref = null
  } = ctx;
  const c = PCS_CONVERGENCE;
  const ins = subIndices.consequenceInsulation ?? 0;
  const nec = necessityContext ?? pcsSub.directorCompensation ?? 0;

  if (
    gender === 'female' &&
    initiativePref != null &&
    initiativePref > 0.6 &&
    nec < c.suppressIfNecessityBelow
  ) {
    return { showCollapseFraming: false, reason: 'authentic_initiative_preference' };
  }

  const director =
    ins >= c.insulationMin &&
    pcsSub.directorCompensation >= c.directorCompensationMin &&
    nec >= c.necessityMin;

  const beautifulOnes =
    pcsSub.beautifulOnesWithdrawal >= c.beautifulOnesMin &&
    pcsSub.masculineProposalAbsent >= 0.5;

  const sink =
    pcsSub.behavioralSinkRisk >= c.behavioralSinkMin &&
    (subIndices.transactionalDominance ?? 0) >= 0.5 &&
    (subIndices.civilizationROI ?? 0.5) <= 0.45;

  const utopianCollapse =
    polarityCollapse >= c.polarityCollapseMin && ins >= c.insulationMin;

  return {
    showCollapseFraming: director || beautifulOnes || sink || utopianCollapse,
    directorNecessity: director,
    beautifulOnesPattern: beautifulOnes,
    behavioralSinkPattern: sink,
    utopianInsulationCollapse: utopianCollapse
  };
}

/**
 * Build input bundle from suite localStorage snapshots (browser).
 * @param {object} opts
 * @param {() => string|null} [opts.readStorage]
 */
export function buildSexualContractInputFromSuite(opts = {}) {
  const read =
    opts.readStorage ||
    ((key) => {
      try {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    });

  const parseProgress = (raw) => {
    if (!raw) return null;
    try {
      const p = JSON.parse(raw);
      return p?.data ?? p;
    } catch {
      return null;
    }
  };

  const arch = parseProgress(read('archetype-assessment:progress'));
  const pol = parseProgress(read('temperament-assessment:progress'));
  const attRaw = read('attraction-assessment-results');
  let att = null;
  try {
    att = attRaw ? JSON.parse(attRaw) : null;
  } catch {
    att = null;
  }
  let inv = null;
  try {
    inv = JSON.parse(read('sexual-contract-inventory:v1') || 'null');
  } catch {
    inv = null;
  }

  const gender =
    arch?.gender === 'female' || arch?.gender === 'male'
      ? arch.gender
      : att?.currentGender || null;

  return {
    gender,
    inventoryAnswers: inv?.answers || {},
    dimensionScores: pol?.analysisData?.dimensionScores || {},
    polarityAnswers: pol?.analysisData?.answers || pol?.answers || {},
    attractionResponses: att?.responses || {},
    smv: att?.smv || {},
    primaryArchetype: arch?.analysisData?.primaryArchetype || {}
  };
}

/** @param {number} delusionIndex @param {object} sci */
export function applySciDelusionBoost(delusionIndex, sci) {
  if (!sci?.subIndices) return delusionIndex;
  const osr = sci.subIndices.osrExposure ?? 0;
  const hyp = sci.subIndices.hypergamyLoad ?? 0;
  if (osr < 0.55 || hyp < 0.55) return delusionIndex;
  const boost = Math.round(((osr + hyp) / 2 - 0.5) * 30);
  return Math.min(100, delusionIndex + Math.max(0, Math.min(15, boost)));
}

/** Tier 3: capped cluster deltas from contract fragility */
export function clusterDeltasFromSci(sci, cap = 2) {
  if (!sci || sci.contractFragility == null) {
    return { coalitionRank: 0, reproductiveConfidence: 0, axisOfAttraction: 0, riskCost: 0 };
  }
  const f = sci.contractFragility - 0.5;
  const d = Math.max(-cap, Math.min(cap, f * cap * 2));
  return {
    coalitionRank: -d * 0.5,
    reproductiveConfidence: -d,
    axisOfAttraction: d * 0.3,
    riskCost: d * 0.8
  };
}
