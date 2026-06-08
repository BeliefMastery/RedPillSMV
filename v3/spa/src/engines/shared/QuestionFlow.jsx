import { useEffect, useState } from "react";
import AllocationSliders from "./AllocationSliders.jsx";
import { isValidAllocationAnswer } from "@site/shared/allocation-scales.mjs";
import { allocationNextQuestion } from "@site/shared/spa-questionnaire-host.js";

export default function QuestionFlow({ engine, snapshot, onAdvance }) {
  const { question } = snapshot;
  const [value, setValue] = useState(question.initialValue ?? 5);

  useEffect(() => {
    setValue(question.initialValue ?? 5);
  }, [question.id, question.initialValue]);

  useEffect(() => {
    if (engine) engine._pendingAnswer = value;
  }, [engine, value]);

  if (question.type === "allocation") {
    return (
      <div className="bm-question-flow">
        <AllocationSliders
          question={question}
          onSubmit={(weights) => {
            if (!isValidAllocationAnswer({ weights, sum: question.allocationTargetSum })) {
              return;
            }
            allocationNextQuestion(engine, weights, question);
            onAdvance?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bm-question-flow">
      {question.plainHint && <div className="bm-question-hint">{question.plainHint}</div>}
      <h2 className="bm-question-stem">{question.text}</h2>
      <div className="bm-scale-control">
        <input
          type="range"
          min={question.min ?? 0}
          max={question.max ?? 10}
          step={question.sliderStep ?? 1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <span className="bm-scale__value">{value}</span>
      </div>
    </div>
  );
}
