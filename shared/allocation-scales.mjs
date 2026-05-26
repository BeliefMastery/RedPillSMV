/**
 * Coupled allocation slider math (integer tenths of a percent).
 * @see docs/V3_ARCHITECTURE_REPLICATION_GUIDE.md §11
 */

export const ALLOCATION_PRECISION = 10;
export const DEFAULT_ALLOCATION_TARGET = 100 * ALLOCATION_PRECISION;

export function sumWeights(weights) {
  if (!weights || typeof weights !== "object") return 0;
  return Object.values(weights).reduce((a, b) => a + (Number(b) || 0), 0);
}

export function parseAllocationPercentInput(displayPercent) {
  const n = Number(displayPercent);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * ALLOCATION_PRECISION));
}

export function formatAllocationPercent(weightUnits, targetSum = DEFAULT_ALLOCATION_TARGET) {
  const t = targetSum || DEFAULT_ALLOCATION_TARGET;
  const pct = (weightUnits / t) * 100;
  return Math.round(pct * 10) / 10;
}

export function createEmptyWeights(memberIds, targetSum = DEFAULT_ALLOCATION_TARGET) {
  const ids = Array.isArray(memberIds) ? memberIds : [];
  const n = ids.length;
  if (n === 0) return {};
  const each = Math.round(targetSum / n);
  const out = {};
  let used = 0;
  for (let i = 0; i < n - 1; i++) {
    out[ids[i]] = each;
    used += each;
  }
  out[ids[n - 1]] = targetSum - used;
  return out;
}

export function isValidAllocationAnswer(answer, targetSum = DEFAULT_ALLOCATION_TARGET) {
  if (!answer?.weights) return false;
  return sumWeights(answer.weights) === targetSum;
}

function splitEvenly(ids, budget) {
  const list = [...ids].sort();
  const n = list.length;
  if (n === 0 || budget <= 0) return {};
  const out = {};
  const ideal = budget / n;
  const floors = list.map((id) => Math.floor(ideal));
  const fracs = list.map((id, i) => ({ id, frac: ideal - floors[i] }));
  let assigned = 0;
  list.forEach((id, i) => {
    out[id] = floors[i];
    assigned += floors[i];
  });
  let leftover = budget - assigned;
  fracs.sort((a, b) => b.frac - a.frac || a.id.localeCompare(b.id));
  for (let i = 0; leftover > 0; i++) {
    const id = fracs[i % n].id;
    out[id]++;
    leftover--;
  }
  return out;
}

function splitProportionalDeltaSpread(ids, prior, budget) {
  const list = [...ids];
  const out = {};
  list.forEach((id) => {
    out[id] = 0;
  });
  if (budget <= 0) return out;

  const S = list.reduce((s, id) => s + Math.max(0, prior[id] || 0), 0);
  if (S <= 0) return splitEvenly(list, budget);

  let remaining = budget;
  const n = list.length;

  if (remaining >= n) {
    const sorted = [...list].sort(
      (a, b) => (prior[a] || 0) - (prior[b] || 0) || a.localeCompare(b)
    );
    for (const id of sorted) {
      if (remaining < n) break;
      out[id] += 1;
      remaining -= 1;
    }
  }

  for (let u = 0; u < remaining; u++) {
    let winner = list[0];
    let best = -1;
    for (const id of list) {
      const score = (prior[id] || 0) / (out[id] + 1);
      if (score > best || (score === best && id < winner)) {
        best = score;
        winner = id;
      }
    }
    out[winner] += 1;
  }
  return out;
}

function applyStagnationGuard(out, prior, activeOthers, delta) {
  if (Math.abs(delta) < Math.max(2, activeOthers.length)) return out;

  const stuck = () =>
    activeOthers.filter((j) => (prior[j] || 0) >= 1 && out[j] === prior[j]);

  let stuckMembers = stuck();
  let guard = 0;
  while (stuckMembers.length > 0 && guard < 200) {
    let maxMover = activeOthers[0];
    let maxChange = 0;
    for (const j of activeOthers) {
      const ch = Math.abs((out[j] || 0) - (prior[j] || 0));
      if (ch > maxChange) {
        maxChange = ch;
        maxMover = j;
      }
    }
    if (maxChange < 1) break;

    const recipient = [...stuckMembers].sort(
      (a, b) => (prior[b] || 0) - (prior[a] || 0) || a.localeCompare(b)
    )[0];

    if (delta > 0) {
      out[maxMover] = (out[maxMover] || 0) + 1;
      out[recipient] = Math.max(0, (out[recipient] || 0) - 1);
    } else {
      out[maxMover] = Math.max(0, (out[maxMover] || 0) - 1);
      out[recipient] = (out[recipient] || 0) + 1;
    }
    guard++;
    stuckMembers = stuck();
  }
  return out;
}

export function redistributeOnChange(changedId, newValue, weights, targetSum, allIds) {
  const T = targetSum || DEFAULT_ALLOCATION_TARGET;
  const ids = Array.isArray(allIds) ? allIds : Object.keys(weights || {});
  const prior = {};
  ids.forEach((id) => {
    prior[id] = Math.max(0, Math.round(Number(weights?.[id]) || 0));
  });

  let clamped =
    typeof newValue === "number" && Number.isInteger(newValue)
      ? newValue
      : parseAllocationPercentInput(newValue);
  clamped = Math.max(0, Math.min(T, Math.round(clamped)));

  const others = ids.filter((id) => id !== changedId);
  const delta = clamped - (prior[changedId] || 0);
  const out = { ...prior, [changedId]: clamped };

  if (T - clamped <= 0) {
    others.forEach((id) => {
      out[id] = 0;
    });
    return out;
  }

  const activeOthers = others.filter((id) => (prior[id] || 0) > 0);
  const zeroOthers = others.filter((id) => (prior[id] || 0) === 0);

  if (activeOthers.length === 0) {
    if (delta > 0) {
      const even = splitEvenly(zeroOthers, T - clamped);
      Object.assign(out, even);
    } else {
      zeroOthers.forEach((id) => {
        out[id] = 0;
      });
    }
    return out;
  }

  if (delta === 0) {
    zeroOthers.forEach((id) => {
      out[id] = 0;
    });
    return out;
  }

  const budget = Math.abs(delta);
  const spread = splitProportionalDeltaSpread(activeOthers, prior, budget);

  if (delta > 0) {
    activeOthers.forEach((id) => {
      out[id] = Math.max(0, (prior[id] || 0) - (spread[id] || 0));
    });
  } else {
    activeOthers.forEach((id) => {
      out[id] = (prior[id] || 0) + (spread[id] || 0);
    });
  }
  zeroOthers.forEach((id) => {
    out[id] = 0;
  });

  applyStagnationGuard(out, prior, activeOthers, delta);
  return out;
}

export function normalizeAllocation(weights, targetSum = DEFAULT_ALLOCATION_TARGET) {
  const ids = Object.keys(weights || {});
  const sum = sumWeights(weights);
  if (sum === targetSum) return { ...weights };
  if (sum <= 0) return createEmptyWeights(ids, targetSum);
  const out = {};
  ids.forEach((id) => {
    out[id] = Math.round(((weights[id] || 0) / sum) * targetSum);
  });
  let drift = targetSum - sumWeights(out);
  const sorted = [...ids].sort();
  let i = 0;
  while (drift !== 0 && sorted.length > 0) {
    const id = sorted[i % sorted.length];
    if (drift > 0) {
      out[id]++;
      drift--;
    } else if (out[id] > 0) {
      out[id]--;
      drift++;
    }
    i++;
    if (i > sorted.length * targetSum) break;
  }
  return out;
}
