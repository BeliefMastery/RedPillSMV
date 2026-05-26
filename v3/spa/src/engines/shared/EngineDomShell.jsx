/**
 * Legacy-compatible DOM shell expected by *-engine.js (IDs and sections).
 */
export default function EngineDomShell({
  intro,
  resultsId = "resultsContainer",
  showSuiteGate = false,
  engineId,
}) {
  return (
    <div className="bm-engine-content section-inner minimal-section">
      {intro}

      {showSuiteGate && (
        <div id="suiteStageGateInline" className="suite-stage-gate-inline" hidden>
          <p id="suiteStageGateInlineMessage" />
          <div id="suiteStageGateInlineCta" />
        </div>
      )}

      <section className="content-section" id="actionButtonsSection">
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

      <section className="questionnaire-section hidden" id="questionnaireSection">
        <div className="progress-bar">
          <div className="progress-fill" id="progressBar" />
        </div>
        <div className="progress-text">
          <span id="phaseIndicator" />
          <span id="questionCounter" />
        </div>
        <div id="questionContainer" />
        <div className="navigation-buttons">
          <button type="button" className="btn btn-secondary" id="prevQuestion">
            Previous
          </button>
          <button type="button" className="btn btn-primary" id="nextQuestion">
            Next
          </button>
        </div>
        <div className="abandon-link">
          <button type="button" className="btn btn-secondary" id="abandonAssessment">
            Abandon Assessment
          </button>
        </div>
      </section>

      <section className={`results-section hidden`} id={resultsId}>
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
