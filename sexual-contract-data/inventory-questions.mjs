/**
 * Optional context inventory — attitudes only, not medical or voting history.
 * Feeds SCI/PCS via shared/sexual-contract-index.mjs
 */

const SCALE = [1, 3, 5, 7, 10];

/** @typedef {{ id: string, group: string, text: string, reverseScore?: boolean, gender?: 'male'|'female'|'both' }} InventoryQuestion */

/** @type {InventoryQuestion[]} */
export const SEXUAL_CONTRACT_INVENTORY = [
  // OSR
  { id: 'inv_osr_1', group: 'osrExposure', gender: 'both', text: 'In my local dating pool, finding reciprocal long-term commitment feels harder than finding casual attention.' },
  { id: 'inv_osr_2', group: 'osrExposure', gender: 'both', text: 'Competition for mates in my environment feels intense relative to the quality of stable pairings available.' },
  // Hypergamy load
  { id: 'inv_hyp_1', group: 'hypergamyLoad', gender: 'both', text: 'I filter partners strongly toward top-tier status, genetics, or resources—even when compatible average options exist.' },
  { id: 'inv_hyp_2', group: 'hypergamyLoad', gender: 'both', text: 'Settling for a partner who is "good enough" but not aspirational feels unacceptable more often than not.' },
  // Transactional
  { id: 'inv_tx_1', group: 'transactionalDominance', gender: 'both', text: 'Short-term or ambiguous access (attention, situationships, monetized access) often outperforms long-term contracts in my market.' },
  { id: 'inv_tx_2', group: 'transactionalDominance', gender: 'both', text: 'I optimize for present intimacy or attention outcomes more than multi-year household stability.' },
  // Householding
  { id: 'inv_hh_1', group: 'householdingOrientation', gender: 'both', text: 'I am willing to trade sustained labor, protection, or exclusivity for a stable long-term household contract.' },
  { id: 'inv_hh_2', group: 'householdingOrientation', gender: 'both', text: 'Building something for the next generation (family, legacy, community) materially motivates my daily effort.' },
  // Consequence insulation
  { id: 'inv_ins_1', group: 'consequenceInsulation', gender: 'both', text: 'I rely on state programs, institutions, or collective safety nets more than a partner for long-term economic security.' },
  { id: 'inv_ins_2', group: 'consequenceInsulation', gender: 'both', text: 'Reproductive or commitment risks feel manageable without a dedicated householder partner in the picture.' },
  // Civilization ROI
  { id: 'inv_roi_1', group: 'civilizationROI', gender: 'male', text: 'I would work substantially beyond survival needs to defend a legacy worth passing on.' },
  { id: 'inv_roi_2', group: 'civilizationROI', gender: 'both', text: 'If pair-bond prospects were weak, I would still invest surplus effort in building durable wealth or community.' },
  { id: 'inv_roi_3', group: 'civilizationROI', gender: 'both', text: 'I often operate at "hedonic minimum"—enough work to survive and access short-term reward, not to build.' },
  // PCS — masculine proposal absent
  { id: 'inv_mpa_1', group: 'masculineProposalAbsent', gender: 'male', text: 'Even when attracted, I avoid approach, leadership, or stating where a connection is going.' },
  { id: 'inv_mpa_2', group: 'masculineProposalAbsent', gender: 'both', text: 'Future direction in relationships feels secure only when I (or my partner) explicitly set the path—waiting for lead feels stagnant.' },
  { id: 'inv_mpa_3', group: 'masculineProposalAbsent', gender: 'male', text: 'I invest heavily in self-presentation but rarely take social risk to initiate with people I want.' },
  // PCS — director compensation (necessity)
  { id: 'inv_dir_1', group: 'directorCompensation', gender: 'female', text: 'I initiate or direct connection because waiting for masculine lead feels like stagnation—not because I prefer leading.' },
  { id: 'inv_dir_2', group: 'directorCompensation', gender: 'female', text: 'I feel more secure when I control the pace and direction of dating, even if I would enjoy being led in an ideal world.' },
  { id: 'inv_dir_3', group: 'directorCompensation', gender: 'both', text: 'I make the first move primarily to escape uncertainty about whether anything will happen at all.' },
  // PCS — beautiful ones withdrawal
  { id: 'inv_bo_1', group: 'beautifulOnesWithdrawal', gender: 'male', text: 'My grooming, fitness, or online presentation is high, but I withdraw from mating competition and approach.' },
  { id: 'inv_bo_2', group: 'beautifulOnesWithdrawal', gender: 'both', text: 'I prefer optimizing how I look over taking leadership or coalition risks in social hierarchies.' },
  // PCS — behavioral sink
  { id: 'inv_sink_1', group: 'behavioralSinkRisk', gender: 'both', text: 'My relationship history skews toward short-term optimization over bonds I would defend for decades.' },
  { id: 'inv_sink_2', group: 'behavioralSinkRisk', gender: 'both', text: 'Skills for courtship, householding, or parenting feel weaker in my cohort than skills for self-branding or consumption.' }
];

export const INVENTORY_SCALE = SCALE;

/** Questions visible for respondent gender. */
export function getInventoryQuestionsForGender(gender) {
  const g = gender === 'female' ? 'female' : gender === 'male' ? 'male' : null;
  return SEXUAL_CONTRACT_INVENTORY.filter((q) => {
    if (!q.gender || q.gender === 'both') return true;
    if (!g) return true;
    return q.gender === g;
  });
}
