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
  const { engine, phase, tick, ready, error, bump, setPhase } = useEngineHost(engineId);
  const snapshot =
    ready && engine?.getQuestionSnapshot ? engine.getQuestionSnapshot() : null;
  const usesDom = engine?.usesDomQuestions?.() ?? true;
  const reactSnapshot =
    phase === "assessment" && !usesDom && snapshot && !snapshot.domOnly ? snapshot : null;
  const isAllocation = reactSnapshot?.question?.type === "allocation";
  const progressPercent = reactSnapshot
    ? ((reactSnapshot.currentIndex + 1) / Math.max(reactSnapshot.totalQuestions, 1)) * 100
    : null;
  const progressLabel = reactSnapshot
    ? `Question ${reactSnapshot.currentIndex + 1} of ${reactSnapshot.totalQuestions}`
    : null;

  useEffect(() => {
    if (!ready || !engine) return;
    const t = setTimeout(() => bump(), 100);
    return () => clearTimeout(t);
  }, [ready, engine]);

  useEffect(() => {
    if (!ready || !engine?.getPhase) return;
    setPhase(engine.getPhase());
  }, [ready, engine, tick, setPhase]);

  if (error) {
    return (
      <EngineLayout label={label} lead={lead} phase="idle">
        <div className="page-error-fallback surface" role="alert">
          <h2 className="v3-hero-title">Assessment failed to load</h2>
          <p className="v3-muted">{error.message}</p>
          {error.stack && (
            <details className="page-error-reporter__details">
              <summary>Technical detail</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
          <p className="v3-muted">Open the browser console (F12) for details.</p>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout label={label} lead={lead} phase={phase}>
      <EngineDomShell
        engineId={engineId}
        resultsId={resultsId}
        showSuiteGate={showSuiteGate}
        intro={intro}
        phase={phase}
        engine={ready ? engine : null}
        questionTick={tick}
        renderQuestions={phase === "assessment" && usesDom}
        reactQuestion={
          reactSnapshot ? (
            <QuestionFlow
              key={tick}
              engine={engine}
              snapshot={reactSnapshot}
              onAdvance={() => bump()}
            />
          ) : null
        }
        progressPercent={progressPercent}
        progressLabel={progressLabel}
        showShellNav={!isAllocation}
      />

      {phase === "results" && <ResultsHtmlBridge engine={engine} resultsId={resultsId} />}
    </EngineLayout>
  );
}
