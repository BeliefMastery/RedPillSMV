import { notifyEngine, resolveEnginePhase } from "./spa-engine-external.js";
import {
  buildQuestionSnapshot,
  externalRenderQuestion,
} from "./spa-questionnaire-engine.js";
import {
  allocationAnswerFromWeights,
  valueAllocationFromAnswer,
} from "./questionnaire-allocation.mjs";
import {
  bindOptionSelectionUI,
  refreshOptionSelectionUI,
} from "./engine-option-selection.mjs";

export function attachDomQuestionSpaApi(engine) {
  engine.getPhase = () => resolveEnginePhase(engine);
  engine.getQuestionSnapshot = () => {
    const q = engine.questionSequence?.[engine.currentQuestionIndex];
    return buildQuestionSnapshot(engine, q);
  };
  engine.getSelectionModel = () => engine.getSelectionModel?.call(engine) ?? null;
  engine.usesDomQuestions = () => {
    const snap = engine.getQuestionSnapshot();
    return Boolean(snap?.domOnly || snap?.question?.type === "gender");
  };
  engine.setExternalQuestionMount = (el) => {
    engine._externalQuestionMount = el;
  };
  engine.setExternalResultsMount = (el) => {
    engine._externalResultsMount = el;
  };
  engine.startAssessmentFromExternal = () => {
    if (typeof engine.startAssessment === "function") {
      engine.startAssessment();
    }
  };
  engine.nextQuestionFromExternal = (value) => {
    if (typeof engine.submitCurrentAnswer === "function") {
      engine.submitCurrentAnswer(value);
      return;
    }
    if (typeof engine.handleNext === "function") {
      engine.handleNext(value);
      return;
    }
    if (typeof engine.nextQuestion === "function") {
      engine.nextQuestion(value);
    }
  };
  engine.prevQuestionFromExternal = (value) => {
    if (typeof engine.previousQuestion === "function") {
      engine.previousQuestion(value);
    } else if (typeof engine.prevQuestion === "function") {
      engine.prevQuestion(value);
    }
  };
  engine.hydrateResultsView = () => {
    if (typeof engine.renderResults === "function") {
      engine.renderResults();
    } else if (typeof engine.showResults === "function") {
      engine.showResults();
    }
  };
  engine.showResults = () => engine.hydrateResultsView();
  engine.resetAssessment = () => {
    if (typeof engine.reset === "function") engine.reset();
    else if (typeof engine.newAssessment === "function") engine.newAssessment();
  };
  engine.destroy = () => {
    engine._destroyed = true;
    if (typeof engine.cleanup === "function") engine.cleanup();
  };

  const origRender = engine.renderCurrentQuestion?.bind(engine);
  if (origRender) {
    engine.renderCurrentQuestion = function renderWithExternal() {
      const question = this.questionSequence?.[this.currentQuestionIndex];
      if (this.externalUI && question && externalRenderQuestion(this, question)) {
        const container = document.getElementById("questionContainer");
        if (container && this.usesDomQuestions()) {
          bindOptionSelectionUI(container);
          origRender();
          refreshOptionSelectionUI(container);
        }
        notifyEngine(this, "question");
        return;
      }
      return origRender();
    };
  }

  wrapPhaseNotify(engine);
}

function wrapPhaseNotify(engine) {
  if (!engine.ui || engine._phaseWrapped) return;
  const orig = engine.ui.transition.bind(engine.ui);
  engine.ui.transition = (state) => {
    engine._spaUiPhase = state;
    orig(state);
    if (engine.externalUI) {
      notifyEngine(engine, "phase", { phase: state });
    }
  };
  engine._phaseWrapped = true;
  engine._spaUiPhase = "idle";
}

export function applyAllocationToEngineAnswers(engine, question, answer) {
  const qid = question.id;
  if (question.type === "value_allocation" || question.type === "allocation") {
    const percents = valueAllocationFromAnswer(
      answer,
      question.allocationBuckets?.length || answer.ids?.length
    );
    engine.answers[qid] = {
      allocationPercents: percents,
      weights: answer.weights,
      sum: answer.sum,
    };
    if (engine.responses) {
      engine.responses[qid] = percents;
    }
    return;
  }
  engine.answers[qid] = answer;
}

export function allocationNextQuestion(engine, weights, question) {
  const answer = allocationAnswerFromWeights(
    weights,
    question.allocationMembers?.map((m) => m.id)
  );
  applyAllocationToEngineAnswers(engine, question, answer);
  engine.nextQuestionFromExternal(answer);
}
