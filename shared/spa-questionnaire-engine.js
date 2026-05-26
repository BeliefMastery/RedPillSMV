import {
  DEFAULT_ALLOCATION_TARGET,
  createEmptyWeights,
  formatAllocationPercent,
} from "./allocation-scales.mjs";
import {
  mapQuestionForAllocation,
  weightsFromValueAllocation,
  weightsToAllocationPercents,
} from "./questionnaire-allocation.js";

export function buildQuestionSnapshot(engine, question) {
  if (!question) return null;

  const currentIndex = engine.currentQuestionIndex ?? 0;
  const totalQuestions = engine.questionSequence?.length ?? 0;

  if (question.type === "allocation" || question.type === "value_allocation") {
    const mapped = mapQuestionForAllocation(question);
    const memberIds = mapped.allocationMembers.map((m) => m.id);
    let weights = engine.answers?.[question.id]?.weights;
    if (!weights && question.type === "value_allocation") {
      const percents =
        engine.answers?.[question.id]?.allocationPercents ||
        question.allocationPercents;
      weights = weightsFromValueAllocation(percents, memberIds);
    }
    if (!weights || sumWeightsObj(weights) === 0) {
      weights = createEmptyWeights(memberIds);
    }
    const allocationWeights = {};
    memberIds.forEach((id) => {
      allocationWeights[id] = weights[id] ?? 0;
    });
    return {
      question: {
        id: question.id,
        type: "allocation",
        text: question.text || question.question,
        plainHint: question.hint || question.plainHint,
        badge: question.badge,
        allocationMembers: mapped.allocationMembers,
        allocationWeights,
        allocationTargetSum: DEFAULT_ALLOCATION_TARGET,
      },
      currentIndex,
      totalQuestions,
    };
  }

  if (
    question.type === "scaled" ||
    question.type === "likert" ||
    question.type === "slider"
  ) {
    const initial =
      engine.answers?.[question.id] ??
      question.initialValue ??
      question.defaultValue ??
      5;
    return {
      question: {
        id: question.id,
        type: "scaled",
        text: question.text || question.question,
        plainHint: question.hint || question.plainHint,
        clinicalAnchor: question.clinicalAnchor,
        badge: question.badge,
        initialValue: Number(initial) || 0,
        sliderStep: question.sliderStep ?? 1,
        min: question.min ?? 0,
        max: question.max ?? 10,
      },
      currentIndex,
      totalQuestions,
    };
  }

  return {
    question: {
      id: question.id,
      type: question.type,
      text: question.text || question.question,
    },
    currentIndex,
    totalQuestions,
    domOnly: true,
  };
}

function sumWeightsObj(w) {
  return Object.values(w || {}).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function externalRenderQuestion(engine, question) {
  if (!engine.externalUI) return false;
  const snap = buildQuestionSnapshot(engine, question);
  if (snap?.domOnly) {
    notifyDomQuestion(engine);
    return true;
  }
  if (snap && (snap.question.type === "allocation" || snap.question.type === "scaled")) {
    notifyQuestion(engine, snap);
    return true;
  }
  notifyDomQuestion(engine);
  return true;
}

function notifyQuestion(engine, snapshot) {
  engine._lastSnapshot = snapshot;
  engine.onNotify?.("question", snapshot);
}

function notifyDomQuestion(engine) {
  engine.onNotify?.("question", { dom: true });
}

export function formatAllocationLabels(weights, targetSum = DEFAULT_ALLOCATION_TARGET) {
  const labels = {};
  for (const [id, w] of Object.entries(weights || {})) {
    labels[id] = formatAllocationPercent(w, targetSum);
  }
  return labels;
}
