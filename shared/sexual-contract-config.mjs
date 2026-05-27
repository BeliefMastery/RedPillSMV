/**
 * Sexual Contract Index (SCI) + Polarity Collapse Signature (PCS) calibration.
 * @see docs/COLLAPSE_SEXUAL_CONTRACT_FRAMEWORK.md
 */

export const SEXUAL_CONTRACT_CALIBRATION_VERSION = 1;

/** SCI composite weights (must sum to ~1 for positive terms; negatives subtract). */
export const SCI_WEIGHTS = {
  osrExposure: 0.18,
  hypergamyLoad: 0.16,
  transactionalDominance: 0.2,
  householdingOrientation: 0.18,
  consequenceInsulation: 0.16,
  civilizationROI: 0.12
};

/** PCS composite weights. */
export const PCS_WEIGHTS = {
  masculineProposalAbsent: 0.3,
  directorCompensation: 0.25,
  beautifulOnesWithdrawal: 0.25,
  behavioralSinkRisk: 0.2
};

/** Report bands */
export const CONTRACT_FRAGILITY_BANDS = [
  { min: 0.72, band: 'severe', label: 'Severe contract fragility' },
  { min: 0.55, band: 'high', label: 'Elevated contract fragility' },
  { min: 0.38, band: 'moderate', label: 'Moderate contract strain' },
  { min: 0, band: 'low', label: 'Relatively stable contract orientation' }
];

export const POLARITY_COLLAPSE_BANDS = [
  { min: 0.72, band: 'severe', label: 'Utopian insulation / polarity collapse' },
  { min: 0.55, band: 'high', label: 'Elevated polarity collapse signals' },
  { min: 0.38, band: 'moderate', label: 'Partial collapse compensation' },
  { min: 0, band: 'low', label: 'No collapse pattern detected' }
];

/** Thresholds for convergence matrix (show collapse framing). */
export const PCS_CONVERGENCE = {
  insulationMin: 0.55,
  polarityCollapseMin: 0.65,
  directorCompensationMin: 0.58,
  beautifulOnesMin: 0.6,
  behavioralSinkMin: 0.62,
  necessityMin: 0.55,
  /** High initiate preference alone below this → suppress collapse framing */
  suppressIfNecessityBelow: 0.45
};

/** Capped SMV cluster nudge from SCI (Tier 3). */
export const SEXUAL_CONTRACT_CLUSTER_DELTA_CAP = 2;

/** Delusion index multiplier when SCI osr + hypergamy elevated. */
export const SCI_DELUSION_BOOST_MAX = 15;

export const SEXUAL_CONTRACT_STORAGE_KEY = 'sexual-contract-inventory:v1';
