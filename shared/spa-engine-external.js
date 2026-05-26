/**
 * externalUI flags and legacy boot gate for SPA-hosted engines.
 */

export function applyExternalUIOptions(engine, options = {}) {
  engine.externalUI = Boolean(options.externalUI);
  engine.onNotify =
    typeof options.onNotify === "function" ? options.onNotify : () => {};
  engine._externalQuestionMount = null;
  engine._externalResultsMount = null;
}

export function notifyEngine(engine, event, payload) {
  if (engine.externalUI && engine.onNotify) {
    engine.onNotify(event, payload);
  }
}

export function shouldBootLegacyEngine() {
  return document.body?.dataset?.bmLegacyPage === "true";
}

export function resolveEnginePhase(engine) {
  if (engine.currentStage === "results" || engine.currentPhase === "results") {
    return "results";
  }
  const phase = engine.currentPhase;
  if (phase === "idle" || phase === 0 || phase === "0") return "idle";
  if (
    typeof phase === "number" &&
    phase >= 0 &&
    phase < 1 &&
    !engine.questionSequence?.length
  ) {
    return "idle";
  }
  if (engine.ui?.config?.results?.show) {
    const resultsSel = engine.ui.config.results.show[0];
    if (resultsSel) {
      const el = document.querySelector(resultsSel);
      if (el && !el.classList.contains("hidden")) return "results";
    }
  }
  if (engine.questionSequence?.length > 0 || phase === "assessment") {
    return "assessment";
  }
  if (typeof phase === "number" && phase > 0) return "assessment";
  return "idle";
}
