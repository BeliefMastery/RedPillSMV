const DEFAULT_HINTS = {
  hasSeenSliderHint: false,
  hasSeenAllocationHint: false,
  hasSeenDualSliderHint: false
};

export function buildProgressSnapshot({
  phaseIndex = 1,
  phaseTotal = 1,
  questionIndexInPhase = 1,
  questionTotalInPhase = 1,
  overallQuestionIndex = 1,
  overallQuestionTotal = 1
} = {}) {
  const safePhaseTotal = Math.max(1, Number(phaseTotal) || 1);
  const safePhaseIndex = Math.max(1, Math.min(safePhaseTotal, Number(phaseIndex) || 1));
  const safePhaseQuestionTotal = Math.max(1, Number(questionTotalInPhase) || 1);
  const safePhaseQuestionIndex = Math.max(1, Math.min(safePhaseQuestionTotal, Number(questionIndexInPhase) || 1));
  const safeOverallQuestionTotal = Math.max(1, Number(overallQuestionTotal) || 1);
  const safeOverallQuestionIndex = Math.max(1, Math.min(safeOverallQuestionTotal, Number(overallQuestionIndex) || 1));
  return {
    phaseIndex: safePhaseIndex,
    phaseTotal: safePhaseTotal,
    questionIndexInPhase: safePhaseQuestionIndex,
    questionTotalInPhase: safePhaseQuestionTotal,
    overallQuestionIndex: safeOverallQuestionIndex,
    overallQuestionTotal: safeOverallQuestionTotal,
    phasePercent: (safePhaseQuestionIndex / safePhaseQuestionTotal) * 100,
    overallPercent: (safeOverallQuestionIndex / safeOverallQuestionTotal) * 100
  };
}

export function applyProgressSnapshotToDom({
  snapshot,
  progressBarId,
  phaseLabelId,
  questionLabelId
}) {
  if (!snapshot) return;
  const progressBar = progressBarId ? document.getElementById(progressBarId) : null;
  if (progressBar) {
    progressBar.style.width = `${snapshot.overallPercent}%`;
  }
  const phaseLabel = phaseLabelId ? document.getElementById(phaseLabelId) : null;
  if (phaseLabel) {
    phaseLabel.textContent = `Phase ${snapshot.phaseIndex} of ${snapshot.phaseTotal}`;
  }
  const questionLabel = questionLabelId ? document.getElementById(questionLabelId) : null;
  if (questionLabel) {
    questionLabel.textContent = `Question ${snapshot.questionIndexInPhase} of ${snapshot.questionTotalInPhase}`;
  }
}

export function smoothScrollQuestionTop(containerId = 'questionContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function attachRangeTouchGuard(rangeInput) {
  if (!rangeInput || rangeInput.dataset.touchGuardAttached === 'true') return;
  rangeInput.dataset.touchGuardAttached = 'true';
  let startX = 0;
  let startY = 0;
  let startValue = rangeInput.value;
  let suppress = false;

  rangeInput.addEventListener('touchstart', (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    startValue = rangeInput.value;
    suppress = false;
  }, { passive: true });

  rangeInput.addEventListener('touchmove', (event) => {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);
    if (dy > dx + 10) {
      suppress = true;
      rangeInput.value = startValue;
    }
  }, { passive: true });

  rangeInput.addEventListener('input', () => {
    if (!suppress) return;
    rangeInput.value = startValue;
  });
}

export function loadHintFlags(storageKey) {
  if (!storageKey) return { ...DEFAULT_HINTS };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { ...DEFAULT_HINTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_HINTS, ...(parsed || {}) };
  } catch {
    return { ...DEFAULT_HINTS };
  }
}

export function persistHintFlags(storageKey, flags) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ ...DEFAULT_HINTS, ...(flags || {}) }));
  } catch {
    // no-op
  }
}

export function evaluateMidAssessment({
  scoreMap = {},
  minimumAnswers = 8,
  answeredCount = 0,
  confidenceGap = 0.12
} = {}) {
  const entries = Object.entries(scoreMap).filter(([, value]) => Number.isFinite(value));
  if (entries.length < 2 || answeredCount < minimumAnswers) {
    return { ready: false, definitive: false, top: null, runnerUp: null, confidence: 0 };
  }
  entries.sort((a, b) => b[1] - a[1]);
  const [top, topScore] = entries[0];
  const [runnerUp, runnerScore] = entries[1];
  const denom = Math.max(1, Math.abs(topScore) + Math.abs(runnerScore));
  const gap = topScore - runnerScore;
  const confidence = gap / denom;
  return {
    ready: true,
    definitive: confidence >= confidenceGap,
    top,
    runnerUp,
    confidence
  };
}

export function prioritizeQuestionsForTopCandidates(questions, topCandidateKeys = []) {
  if (!Array.isArray(questions) || questions.length <= 2 || !Array.isArray(topCandidateKeys) || topCandidateKeys.length === 0) {
    return Array.isArray(questions) ? questions : [];
  }
  const keys = new Set(topCandidateKeys);
  const scored = questions.map((question, idx) => {
    const optionTags = (question.options || []).flatMap((opt) => opt.archetypes || []);
    const overlap = optionTags.reduce((sum, key) => sum + (keys.has(key) ? 1 : 0), 0);
    return { question, idx, overlap };
  });
  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return a.idx - b.idx;
  });
  return scored.map((entry) => entry.question);
}
