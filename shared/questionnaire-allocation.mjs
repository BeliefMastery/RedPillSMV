import {
  DEFAULT_ALLOCATION_TARGET,
  createEmptyWeights,
  formatAllocationPercent,
  parseAllocationPercentInput,
  redistributeOnChange,
  sumWeights,
} from "./allocation-scales.mjs";

/** @typedef {'left' | 'right'} DualPoleMemberId */

export const DUAL_POLE_MEMBER_IDS = ["left", "right"];

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

/**
 * Stable member ids for value_allocation questions (options / buckets).
 */
export function memberIdsFromQuestion(question, count) {
  const n = count ?? question.options?.length ?? question.allocationBuckets?.length ?? 0;
  const opts = question.options || question.allocationBuckets || [];
  return Array.from({ length: n }, (_, i) => {
    const o = opts[i];
    if (o && typeof o === "object") {
      return String(o.id ?? o.key ?? `opt_${i}`);
    }
    return `opt_${i}`;
  });
}

/**
 * Initial display % array (one decimal) for a question.
 */
export function displayPercentsFromQuestion(question, answers = {}) {
  const n = question.options?.length || question.allocationBuckets?.length || 0;
  if (n === 0) return [];
  const memberIds = memberIdsFromQuestion(question, n);
  const existing = answers[question.id]?.allocationPercents;
  if (Array.isArray(existing) && existing.length === n) {
    return existing.map((x) => formatAllocationPercentFromDisplay(Number(x) || 0));
  }
  const weights = createEmptyWeights(memberIds);
  return weightsToAllocationPercents(weights, memberIds);
}

function formatAllocationPercentFromDisplay(displayPercent) {
  const w = parseAllocationPercentInput(displayPercent);
  return formatAllocationPercent(w, DEFAULT_ALLOCATION_TARGET);
}

/**
 * Coupled rebalance on one slider drag; returns display % per member (§11).
 */
export function redistributeDisplayPercents(
  percents,
  memberIds,
  changedIndex,
  displayValue,
  targetSum = DEFAULT_ALLOCATION_TARGET
) {
  const ids = memberIds || [];
  const n = ids.length;
  if (n === 0) return [];
  const changedId = ids[changedIndex];
  if (changedId == null) return percents.slice();

  const weights = weightsFromValueAllocation(percents, ids);
  const newWeight = parseAllocationPercentInput(displayValue);

  const next = redistributeOnChange(changedId, newWeight, weights, targetSum, ids);
  return ids.map((id) => formatAllocationPercent(next[id] || 0, targetSum));
}

export function sumDisplayPercents(percents) {
  return (percents || []).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function isValidDisplayAllocation(percents, total = 100) {
  return Math.abs(sumDisplayPercents(percents) - total) < 0.05;
}

/**
 * Bind coupled allocation sliders under rootEl (§11.11).
 * @param {HTMLElement} rootEl
 * @param {object} opts
 * @param {string[]} opts.memberIds
 * @param {() => number[]} opts.getPercents
 * @param {(percents: number[]) => void} opts.setPercents
 * @param {string} [opts.sliderSelector]
 * @param {(index: number, percent: number, root: HTMLElement) => void} [opts.syncUi]
 * @param {(index: number, percent: number) => void} [opts.onInput]
 * @param {boolean} [opts.isLocked]
 */
export function attachAllocationSliders(rootEl, opts = {}) {
  if (!rootEl || opts.isLocked) return () => {};
  const memberIds = opts.memberIds || [];
  const selector = opts.sliderSelector || ".value-allocation-slider";
  const sliders = Array.from(rootEl.querySelectorAll(selector));

  const handlers = [];
  sliders.forEach((slider) => {
    const idx = Number(slider.dataset.allocIndex ?? slider.dataset.allocationIndex);
    if (!Number.isFinite(idx) || idx < 0 || idx >= memberIds.length) return;

    const onInput = () => {
      const prev = opts.getPercents();
      const next = redistributeDisplayPercents(prev, memberIds, idx, slider.value);
      opts.setPercents(next);
      if (opts.syncUi) {
        next.forEach((pct, i) => opts.syncUi(i, pct, rootEl));
      }
      if (opts.onInput) opts.onInput(idx, next[idx]);
    };

    slider.min = "0";
    slider.max = "100";
    slider.step = "0.1";
    slider.addEventListener("input", onInput);
    handlers.push({ slider, onInput });
  });

  return () => {
    handlers.forEach(({ slider, onInput }) => slider.removeEventListener("input", onInput));
  };
}
