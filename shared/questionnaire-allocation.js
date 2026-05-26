import {
  DEFAULT_ALLOCATION_TARGET,
  createEmptyWeights,
  sumWeights,
} from "./allocation-scales.mjs";

export function mapQuestionForAllocation(question, opts = {}) {
  if (question.type === "allocation" && question.allocationMembers) {
    return question;
  }

  const members = [];
  const buckets =
    question.allocationBuckets ||
    question.options?.map((o, i) => ({
      key: o.id || o.key || `opt_${i}`,
      label: o.label || o.text || String(o),
      scaleAnchor: o.scaleAnchor,
      mapsTo: o.mapsTo,
      scores: o.scores,
    })) ||
    [];

  buckets.forEach((b, i) => {
    members.push({
      id: b.key || b.id || `m${i}`,
      label: b.label || b.text || String(b),
      hint: b.hint,
      mapsTo: b.mapsTo,
      scores: b.scores,
      scaleAnchor: b.scaleAnchor,
    });
  });

  return {
    ...question,
    type: "allocation",
    allocationMembers: members,
    allocationTargetSum: DEFAULT_ALLOCATION_TARGET,
  };
}

export function mapQuestionsForAllocation(questions, opts) {
  return (questions || []).map((q) =>
    q.type === "value_allocation" || opts?.convertMultiselect
      ? mapQuestionForAllocation(q, opts)
      : q
  );
}

export function weightsFromValueAllocation(percents, memberIds) {
  const ids = memberIds || [];
  const arr = Array.isArray(percents) ? percents : [];
  const n = ids.length || arr.length;
  if (n === 0) return createEmptyWeights(ids);

  const sum = arr.reduce((a, b) => a + (Number(b) || 0), 0);
  if (sum <= 100 && Math.max(...arr.map(Number), 0) <= 100) {
    const out = {};
    ids.forEach((id, i) => {
      out[id] = Math.round((Number(arr[i]) || 0) * 10);
    });
    if (sumWeights(out) !== DEFAULT_ALLOCATION_TARGET) {
      return normalizeLegacyPercents(out, ids);
    }
    return out;
  }
  const out = {};
  ids.forEach((id, i) => {
    out[id] = Math.round(Number(arr[i]) || 0);
  });
  return out;
}

function normalizeLegacyPercents(weights, ids) {
  const target = DEFAULT_ALLOCATION_TARGET;
  const sum = sumWeights(weights);
  if (sum === target) return weights;
  const out = {};
  ids.forEach((id) => {
    out[id] = Math.round(((weights[id] || 0) / (sum || 1)) * target);
  });
  let drift = target - sumWeights(out);
  let i = 0;
  while (drift !== 0 && ids.length) {
    const id = ids[i % ids.length];
    if (drift > 0) {
      out[id]++;
      drift--;
    } else if (out[id] > 0) {
      out[id]--;
      drift++;
    }
    i++;
  }
  return out;
}

export function weightsToAllocationPercents(weights, memberIds) {
  const ids = memberIds || Object.keys(weights || {});
  const total = DEFAULT_ALLOCATION_TARGET;
  return ids.map((id) => Math.round(((weights[id] || 0) / total) * 1000) / 10);
}

export function applyAllocationScores(scoresObj, question, answer) {
  const mapped = mapQuestionForAllocation(question);
  const target = answer?.sum || DEFAULT_ALLOCATION_TARGET;
  const weights = answer?.weights || {};
  mapped.allocationMembers.forEach((m) => {
    const w = weights[m.id] || 0;
    const share = w / target;
    if (m.scores && typeof m.scores === "object") {
      for (const [k, v] of Object.entries(m.scores)) {
        scoresObj[k] = (scoresObj[k] || 0) + v * share;
      }
    }
  });
  return scoresObj;
}

export function allocationAnswerFromWeights(weights, memberIds) {
  const ids = memberIds || Object.keys(weights);
  return {
    ids,
    weights: { ...weights },
    sum: DEFAULT_ALLOCATION_TARGET,
    version: "1.0",
    allocationPercents: weightsToAllocationPercents(weights, ids),
  };
}

export function valueAllocationFromAnswer(answer, bucketCount) {
  if (answer?.allocationPercents) return answer.allocationPercents;
  if (answer?.weights) {
    return weightsToAllocationPercents(
      answer.weights,
      answer.ids || Object.keys(answer.weights)
    );
  }
  return Array(bucketCount || 0).fill(0);
}
