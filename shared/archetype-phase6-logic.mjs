export const PHASE6_LOGIC_VERSION = 1;
export const MIN_SUBTYPE_NONZERO = 2;
export const MAX_WEIGHTED_DELTA_FOR_TIE = 0.0075;
export const MAX_PHASE2_DELTA_FOR_TIE = 0.9;
export const PHASE6_WEIGHT = 0.0045;

export function canonicalFamilyKeyFromNode(familyNodeId) {
  if (!familyNodeId) return '';
  return String(familyNodeId)
    .replace(/_family_female$/, '')
    .replace(/_family$/, '');
}

export function evaluatePhase6Decision(subclassDiagnostics) {
  const list = Array.isArray(subclassDiagnostics?.familyDiagnosticsTop3)
    ? subclassDiagnostics.familyDiagnosticsTop3
    : [];
  let lowSignal = false;
  let highTie = false;
  let triggerFamilyIds = [];

  list.forEach((f) => {
    const nonZero = Number(f?.nonZeroSubtypeCount) || 0;
    const weightedDelta = Number(f?.tiePressure?.weightedDelta);
    const phase2Delta = Number(f?.tiePressure?.phase2Delta);
    const isLowSignal = nonZero < MIN_SUBTYPE_NONZERO;
    const isHighTie =
      Number.isFinite(weightedDelta) && Number.isFinite(phase2Delta)
        ? weightedDelta <= MAX_WEIGHTED_DELTA_FOR_TIE && phase2Delta <= MAX_PHASE2_DELTA_FOR_TIE
        : false;

    if (isLowSignal || isHighTie) {
      triggerFamilyIds.push(f.familyId);
    }
    lowSignal = lowSignal || isLowSignal;
    highTie = highTie || isHighTie;
  });

  return {
    version: PHASE6_LOGIC_VERSION,
    shouldRun: lowSignal || highTie,
    reasons: {
      lowSignal,
      highTie
    },
    triggerFamilyIds: [...new Set(triggerFamilyIds)].filter(Boolean)
  };
}
