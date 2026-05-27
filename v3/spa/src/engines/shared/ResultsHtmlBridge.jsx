import { useEffect, useRef } from "react";

export default function ResultsHtmlBridge({ engine, resultsId = "resultsContainer" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!engine) return;
    engine.setExternalResultsMount?.(ref.current);
    const section = document.getElementById(resultsId);
    if (section && ref.current) {
      section.classList.remove("hidden");
      if (
        ref.current !== section &&
        !ref.current.contains(section) &&
        !section.contains(ref.current)
      ) {
        ref.current.appendChild(section);
      }
    }
    engine.hydrateResultsView?.();
    return () => engine.setExternalResultsMount?.(null);
  }, [engine, resultsId]);

  return <div ref={ref} className="bm-results-bridge" />;
}
