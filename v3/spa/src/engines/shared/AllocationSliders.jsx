import { useMemo, useState } from "react";
import {
  DEFAULT_ALLOCATION_TARGET,
  formatAllocationPercent,
  isValidAllocationAnswer,
  parseAllocationPercentInput,
  redistributeOnChange,
} from "@site/shared/allocation-scales.mjs";

export default function AllocationSliders({ question, onSubmit }) {
  const memberIds = useMemo(
    () => question.allocationMembers.map((m) => m.id),
    [question.allocationMembers]
  );
  const targetSum = question.allocationTargetSum || DEFAULT_ALLOCATION_TARGET;

  const [weights, setWeights] = useState(() => ({ ...question.allocationWeights }));
  const [snapFive, setSnapFive] = useState(false);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = isValidAllocationAnswer({ weights, sum: targetSum }, targetSum);

  const handleEqualize = () => {
    const count = memberIds.length;
    if (!count) return;
    const base = Math.floor((targetSum / count) * 10) / 10;
    const next = {};
    let running = 0;
    memberIds.forEach((id, idx) => {
      if (idx === count - 1) {
        next[id] = Math.round((targetSum - running) * 10) / 10;
      } else {
        next[id] = base;
        running += base;
      }
    });
    setWeights(next);
  };

  return (
    <div className="bm-allocation-flow">
      <h2 className="bm-question-stem">{question.text}</h2>
      {question.plainHint && <div className="bm-question-hint">{question.plainHint}</div>}
      <div className="bm-allocation-toolbar">
        <button
          type="button"
          className={`v3-btn v3-btn--sm ${snapFive ? "v3-btn--primary" : "v3-btn--outline"}`}
          onClick={() => setSnapFive((s) => !s)}
          aria-pressed={snapFive}
        >
          {snapFive ? "Snap: 5%" : "Snap: Fine"}
        </button>
        <button
          type="button"
          className="v3-btn v3-btn--sm v3-btn--outline"
          onClick={handleEqualize}
        >
          Equalize split
        </button>
      </div>
      <div className="bm-allocation-grid">
        {question.allocationMembers.map((m) => (
          <div key={m.id} className="bm-allocation-row">
            <label>
              <span className="bm-allocation-label">{m.label}</span>
              <input
                type="range"
                min={0}
                max={targetSum}
                step={snapFive ? 5 : 0.1}
                value={formatAllocationPercent(weights[m.id] || 0, targetSum)}
                onChange={(e) => {
                  const raw = parseAllocationPercentInput(e.target.value);
                  const val = snapFive ? Math.round(raw / 5) * 5 : raw;
                  setWeights((prev) =>
                    redistributeOnChange(
                      m.id,
                      val,
                      prev,
                      targetSum,
                      memberIds
                    )
                  );
                }}
              />
            </label>
            <span className="bm-allocation-pct">{formatAllocationPercent(weights[m.id] || 0, targetSum)}%</span>
          </div>
        ))}
      </div>
      <p className={`bm-allocation-sum${valid ? " bm-allocation-sum--ok" : ""}`}>
        Total: {formatAllocationPercent(total, targetSum)}%
      </p>
      <button
        type="button"
        className="v3-btn v3-btn--primary"
        disabled={!valid}
        onClick={() => onSubmit(weights)}
      >
        Next
      </button>
    </div>
  );
}
