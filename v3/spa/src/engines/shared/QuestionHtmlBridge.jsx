import { useEffect, useRef } from "react";

export default function QuestionHtmlBridge({ engine, tick }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!engine || !ref.current) return;
    engine.setExternalQuestionMount?.(ref.current);
    if (typeof engine.renderCurrentQuestion === "function") {
      engine.renderCurrentQuestion();
    }
    return () => {
      engine.setExternalQuestionMount?.(null);
    };
  }, [engine, tick]);

  return <div ref={ref} className="bm-results-bridge" aria-live="polite" />;
}
