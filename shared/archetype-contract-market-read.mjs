/**
 * Static contract-market reads for archetype spread rows (thesis-informed overlay).
 * @see docs/COLLAPSE_SEXUAL_CONTRACT_FRAMEWORK.md
 */

const BY_ID = {
  alpha_male: 'Apex pull under OSR; householding requires grounded perpetual proposal, not volatility.',
  beta_nu: 'Primary householder archetype—civilization ROI anchor when pair-bond remains viable.',
  beta_male: 'Householding candidate when provision rises; vulnerable to synthetic-householder substitution.',
  gamma_male: 'Observer/outsider—withdrawal risk without coalition; can mimic Beautiful Ones pattern.',
  omega_male: 'Unmated underclass risk—low legacy ROI unless approach and direction rebuild.',
  dark_alpha_male: 'Transactional-dominant volatile pull—destabilizes householding contract.',
  dark_omega: 'Behavioral sink / destructive collapse vector—zero householding bind.',
  sigma_male: 'Autonomy niche—householding optional; withdrawal can read as non-participation.'
};

const BY_CLUSTER = {
  Alpha: 'High apex leverage; householding depends on directed proposal, not attention alone.',
  Beta: 'Householding-oriented cluster when provision and loyalty signals converge.',
  Gamma: 'Intellectual withdrawal—high analysis, low approach; Beautiful Ones risk if paired with grooming focus.',
  Delta: 'Competence householder—stable contract when rank and reliability visible.',
  Sigma: 'Outside contract—legacy optional; collapse read if paired with insulation.',
  Omega: 'Bare-branch risk—requires rebuild of approach, coalition, and civilization ROI.',
  Phi: 'Transcendent niche—outside typical sexual contract economics.'
};

export function getContractMarketRead(archetypeId, clusterKey) {
  if (archetypeId && BY_ID[archetypeId]) return BY_ID[archetypeId];
  if (clusterKey && BY_CLUSTER[clusterKey]) return BY_CLUSTER[clusterKey];
  return 'Contract read varies with OSR, hypergamy load, and householding vs transactional balance in your context inventory.';
}
