import { useEffect, useRef } from "react";
import EngineLayout from "./EngineLayout.jsx";
import EngineDomShell from "./EngineDomShell.jsx";
import QuestionFlow from "./QuestionFlow.jsx";
import ResultsHtmlBridge from "./ResultsHtmlBridge.jsx";
import { useEngineHost } from "./useEngineHost.js";

export default function QuestionnaireEngineView({
  engineId,
  label,
  lead,
  intro,
  resultsId,
  showSuiteGate,
}) {
  const { engine, phase, tick, ready, error, bump } = useEngineHost(engineId);
  const snapshot =
    ready && engine?.getQuestionSnapshot ? engine.getQuestionSnapshot() : null;
  const usesDom = engine?.usesDomQuestions?.() ?? true;

  useEffect(() => {
    if (!ready || !engine) return;
    const t = setTimeout(() => bump(), 100);
    return () => clearTimeout(t);
  }, [ready, engine]);

  if (error) {
    return (
      <EngineLayout label={label} lead={lead}>
        <p role="alert">Failed to load assessment: {error.message}</p>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout label={label} lead={lead}>
      <EngineDomShell
        engineId={engineId}
        resultsId={resultsId}
        showSuiteGate={showSuiteGate}
        intro={intro}
        engine={phase === "assessment" ? engine : null}
        questionTick={tick}
      />

      {phase === "assessment" && !usesDom && snapshot && !snapshot.domOnly && (
        <QuestionFlow
          key={tick}
          engine={engine}
          snapshot={snapshot}
          onAdvance={() => bump()}
        />
      )}

      {phase === "results" && <ResultsHtmlBridge engine={engine} resultsId={resultsId} />}
    </EngineLayout>
  );
}
