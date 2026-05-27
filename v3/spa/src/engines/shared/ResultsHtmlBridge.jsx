import { useEffect, useRef } from "react";

export default function ResultsHtmlBridge({ engine, resultsId = "resultsContainer" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!engine) return;
    engine.setExternalResultsMount?.(ref.current);
    engine.hydrateResultsView?.();
    return () => engine.setExternalResultsMount?.(null);
  }, [engine, resultsId]);

  return <div ref={ref} className="bm-results-bridge" aria-live="polite" />;
}
