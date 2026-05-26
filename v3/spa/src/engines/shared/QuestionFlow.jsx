import { useState } from "react";
import AllocationSliders from "./AllocationSliders.jsx";
import { isValidAllocationAnswer } from "@site/shared/allocation-scales.mjs";
import { allocationNextQuestion } from "@site/shared/spa-questionnaire-host.js";

export default function QuestionFlow({ engine, snapshot, onAdvance }) {
  const { question, currentIndex, totalQuestions } = snapshot;
  const [value, setValue] = useState(question.initialValue ?? 5);

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
      <div className="bm-progress">
        <div
          className="bm-progress__fill"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>
      <p className="bm-progress__text">
        Question {currentIndex + 1} of {totalQuestions}
      </p>
      {question.plainHint && <div className="bm-question-hint">{question.plainHint}</div>}
      <h2 className="bm-question-stem">{question.text}</h2>
      <input
        type="range"
        min={question.min ?? 0}
        max={question.max ?? 10}
        step={question.sliderStep ?? 1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <span className="bm-scale__value">{value}</span>
      <div className="bm-question-nav">
        <button
          type="button"
          className="v3-btn v3-btn--outline"
          onClick={() => engine.prevQuestionFromExternal?.()}
        >
          Previous
        </button>
        <button
          type="button"
          className="v3-btn v3-btn--primary"
          onClick={() => {
            engine.nextQuestionFromExternal?.(value);
            onAdvance?.();
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
