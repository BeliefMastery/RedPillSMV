/**
 * Legacy-compatible DOM shell expected by *-engine.js (IDs and sections).
 */
import { useEffect } from "react";
import { bindEngineShellControls } from "@site/shared/spa-questionnaire-host.js";

export default function EngineDomShell({
  intro,
  resultsId = "resultsContainer",
  showSuiteGate = false,
  engineId,
  engine = null,
  questionTick = 0,
  phase = "idle",
  renderQuestions = false,
  reactQuestion = null,
  progressPercent = null,
  progressLabel = null,
  showShellNav = true,
}) {
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const gates = await import("@site/shared/suite-nav-gates.js");
      if (cancelled) return;
      gates.initSuiteNavGates();
      if (showSuiteGate) gates.applySuiteStartGateHints();
    };
    void refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("redpill-premium-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("redpill-premium-changed", refresh);
    };
  }, [showSuiteGate, engineId]);

  useEffect(() => {
    bindEngineShellControls(engine);
  }, [engine]);

  useEffect(() => {
    if (!engine || !renderQuestions) return;
    const container = document.getElementById("questionContainer");
    if (!container) return;
    engine.setExternalQuestionMount?.(container);
    if (typeof engine.renderCurrentQuestion === "function") {
      engine.renderCurrentQuestion();
    }
    return () => {
      engine.setExternalQuestionMount?.(null);
    };
  }, [engine, questionTick, renderQuestions]);

  const gateTitle =
    engineId === "polarity"
      ? "Polarity is locked"
      : engineId === "attraction"
        ? "Attraction is locked"
        : "Assessment is locked";

  const showIdle = phase === "idle";
  const showAssessment = phase === "assessment";
  const showResults = phase === "results";

  return (
    <div className="bm-engine-content section-inner minimal-section">
      <div className={showIdle ? undefined : "hidden"}>{intro}</div>

      {showSuiteGate && (
        <div id="suiteStageGateInline" className="suite-stage-gate-inline" hidden aria-live="polite">
          <p className="suite-stage-gate-inline-title">{gateTitle}</p>
          <p id="suiteStageGateInlineMessage" className="suite-stage-gate-inline-msg" />
          <p className="suite-stage-gate-inline-links">
            <a
              className="btn btn-primary btn-small"
              id="suiteStageGateInlineCtaPrimary"
              href="#/engines/archetype"
            >
              Go to Archetype assessment
            </a>
            <a
              className="btn btn-secondary btn-small"
              id="suiteStageGateInlineCtaSecondary"
              href="#/engines/polarity"
              hidden
            >
              Go to Polarity assessment
            </a>
            <a className="suite-stage-gate-inline-back" href="#/">
              Back to home
            </a>
          </p>
        </div>
      )}

      <section
        className={`content-section${showIdle ? "" : " hidden"}`}
        id="actionButtonsSection"
      >
        <div className="action-buttons" id="actionButtonsWrap">
          <button type="button" className="btn btn-secondary" id="generateSampleReport">
            Generate Sample Report
          </button>
          <button type="button" className="btn btn-primary" id="startAssessment">
            Begin assessment
          </button>
        </div>
        {engineId === "attraction" || engineId === "polarity" ? (
          <div id="androidPremiumPaywall" className="android-premium-paywall" hidden />
        ) : null}
      </section>

      <section
        className={`questionnaire-section${showAssessment ? " active" : " hidden"}`}
        id="questionnaireSection"
      >
        <header className="bm-questionnaire-head">
          <div className="progress-bar">
            <div
              className="progress-fill"
              id="progressBar"
              style={
                progressPercent != null
                  ? { width: `${Math.min(100, Math.max(0, progressPercent))}%` }
                  : undefined
              }
            />
          </div>
          <div className="progress-text">
            <span id="phaseIndicator" />
            <span id="questionCounter">
              {progressLabel || null}
            </span>
          </div>
        </header>

        <div className="bm-questionnaire-body">
          <div id="questionContainer">{reactQuestion}</div>
        </div>

        <footer className="bm-questionnaire-footer">
          {showShellNav && (
            <div className="navigation-buttons">
              <button type="button" className="btn btn-secondary" id="prevQuestion">
                Previous
              </button>
              <button type="button" className="btn btn-primary" id="nextQuestion">
                Next
              </button>
            </div>
          )}
          <button type="button" className="bm-abandon-link" id="abandonAssessment">
            Abandon assessment
          </button>
        </footer>
      </section>

      <section
        className={`results-section${showResults ? " active" : " hidden"}`}
        id={resultsId}
      >
        <div id="resultsContent" />
        <div className="export-section">
          <h3>Save results</h3>
          <p>Save a readable HTML report for AI-assisted review, printing, or PDF export.</p>
          <div className="action-buttons">
            <button type="button" className="btn btn-save" id="saveResults">
              Save results
            </button>
            <button type="button" className="btn btn-secondary" id="newAssessment">
              New Assessment
            </button>
          </div>
        </div>
        <div id="debug-report" hidden />
      </section>
    </div>
  );
}
