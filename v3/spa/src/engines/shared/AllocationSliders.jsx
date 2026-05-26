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

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const valid = isValidAllocationAnswer({ weights, sum: targetSum }, targetSum);

  return (
    <div className="bm-allocation-flow">
      <h2 className="bm-question-stem">{question.text}</h2>
      {question.plainHint && <div className="bm-question-hint">{question.plainHint}</div>}
      <div className="bm-allocation-grid">
        {question.allocationMembers.map((m) => (
          <div key={m.id} className="bm-allocation-row">
            <label>
              {m.label}
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={formatAllocationPercent(weights[m.id] || 0, targetSum)}
                onChange={(e) => {
                  setWeights((prev) =>
                    redistributeOnChange(
                      m.id,
                      parseAllocationPercentInput(e.target.value),
                      prev,
                      targetSum,
                      memberIds
                    )
                  );
                }}
              />
            </label>
            <span>{formatAllocationPercent(weights[m.id] || 0, targetSum)}%</span>
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
