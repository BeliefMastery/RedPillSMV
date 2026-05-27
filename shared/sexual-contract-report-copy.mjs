/**
 * Report copy for SCI/PCS (shared across engines).
 */

/** @param {object} sci @param {'male'|'female'|null} gender */
export function getContractRead(smv, sci, gender) {
  if (!sci) return null;
  const frag = sci.contractFragility ?? 0;
  const tx = sci.subIndices?.transactionalDominance ?? 0;
  const hh = sci.subIndices?.householdingOrientation ?? 0;
  const bb = smv?.badBoyGoodGuy;
  const ks = smv?.keeperSweeper;

  if (gender === 'male' && bb) {
    const bad = (bb.badBoyPercentile ?? 50) / 100;
    const good = (bb.goodGuyPercentile ?? 50) / 100;
    if (bad > 0.55 && good < 0.45 && frag > 0.5) {
      return {
        label: 'Transactional-dominant market read',
        detail:
          'High initiation attraction with weak manner/provision signals under elevated contract fragility—short-term access may dominate over householder positioning.'
      };
    }
    if (good > 0.55 && hh > 0.5 && frag < 0.45) {
      return {
        label: 'Householder-viable read',
        detail:
          'Provision and coalition signals align with householding orientation—long-term contract remains plausible if approach and direction stay active.'
      };
    }
  }
  if (gender === 'female' && ks && tx > 0.55 && frag > 0.5) {
    return {
      label: 'Attention-leverage read',
      detail:
        'Market position may favor short-term optimization over pair-bond consolidation when transactional dominance and contract strain co-occur.'
    };
  }
  if (frag >= 0.55) {
    return {
      label: sci.contractFragilityLabel || 'Elevated contract fragility',
      detail:
        'Sexual economy reads tilt toward transactional access and away from stable householding under your reported context.'
    };
  }
  return null;
}

/** @param {object} sci */
export function getPolarityCollapseCopy(sci) {
  if (!sci?.convergence?.showCollapseFraming) return null;
  const parts = [];
  if (sci.convergence.directorNecessity) {
    parts.push(
      'Initiation or direction may reflect compensatory leadership under abdicated masculine proposal—not necessarily authentic preference to lead.'
    );
  }
  if (sci.convergence.beautifulOnesPattern) {
    parts.push(
      'Withdrawal-without-approach pattern: high self-presentation paired with low initiative or coalition risk (Beautiful Ones phase read).'
    );
  }
  if (sci.convergence.behavioralSinkPattern) {
    parts.push(
      'Behavioral sink risk: short-term interaction optimization with weakened legacy or householding binds.'
    );
  }
  if (sci.convergence.utopianInsulationCollapse) {
    parts.push(
      'Utopian insulation / polarity collapse: consequence removal plus structural compensation rather than clean complementary polarity.'
    );
  }
  if (!parts.length) return null;
  return {
    title: sci.polarityCollapseLabel || 'Polarity collapse context',
    detail: parts.join(' ')
  };
}

/** @param {string} band */
export function getContractFragilityCopy(band) {
  const map = {
    severe:
      'Contract fragility is severe: householding ROI may read near zero—surplus labor, legacy defense, and long-term pair bonds are structurally de-prioritized in your reported context.',
    high:
      'Contract fragility is elevated: transactional or ambiguous access may outperform stable householding in your current market read.',
    moderate:
      'Moderate contract strain: mixed incentives between short-term access and long-term householding—direction and initiation choices matter.',
    low:
      'Relatively stable contract orientation: householding signals remain viable relative to purely transactional optimization.'
  };
  return map[band] || map.moderate;
}

/** Grid label → householding thesis one-liner */
export function getGridHouseholdingNote(label) {
  const notes = {
    Situationship: 'Ambiguous contract—high attraction without clear householding trajectory.',
    'Resource Compromise': 'Synthetic-householder substitute—provision without desire alignment.',
    'Bad Boy Fun Time (Short Term)': 'Transactional pole dominant—apex pull without manner/provision contract.',
    'Friend zone': 'Householding signals without initiation attraction—contract half missing.',
    'Prince Charming (Ideal Long Term)': 'Dual contract viability—attraction and provision aligned for householding.',
    'Husband zone': 'Strong householder read with solid attraction—perpetual proposal viable.'
  };
  return notes[label] || '';
}
