// Temperament Analyzer Engine - Version 2.1
// Maps position on masculine-feminine temperament spectrum
// Enhanced with lazy loading, error handling, and debug reporting

import { loadDataModule, setDebugReporter } from './shared/data-loader.js';
import { createDebugReporter } from './shared/debug-reporter.js';
import { ErrorHandler, DataStore, DOMUtils, SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport, buildTemperamentSynthesisPlainParagraphs } from './shared/export-utils.js';
import { reportGenderGlyphHtml } from './shared/report-gender-glyph.js';
import {
  TEMPERAMENT_REPORT_TIER1_PARAS,
  TEMPERAMENT_REPORT_SPECTRUM_NOTE,
  TEMPERAMENT_REPORT_TIER2_SUMMARY,
  TEMPERAMENT_REPORT_TIER2_PARAS
} from './temperament-data/temperament-report-copy.js';
import { getDimensionNormativeClarifier } from './shared/temperament-normative-clarifier.js';
import { EngineUIController } from './shared/engine-ui-controller.js';
import { showConfirm, showAlert } from './shared/confirm-modal.js';
import { EXPECTED_GENDER_TRENDS, formatCompositePositionDescription } from './shared/temperament-composite-meta.js';
import { getStageGateState, getSuiteSnapshots, getArchetypeGenderForSuite } from './shared/suite-completion.js';
import { applyArchetypePolarityCalibration } from './shared/archetype-polarity-calibration.mjs';

// Data modules - will be loaded lazily
let TEMPERAMENT_DIMENSIONS, INTIMATE_DYNAMICS;
let ATTRACTION_RESPONSIVENESS, TEMPERAMENT_SCORING;

const GENDER_QUESTION = {
  id: 'p1_gender',
  type: 'gender',
  question: 'What is your gender?',
  options: [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' }
  ]
};

// Cross-polarity: respondent scores significantly beyond their gender's typical range
// toward the opposite pole (e.g. man more feminine than avg woman, woman more masculine than avg man).
const CROSS_POLARITY_THRESHOLD = 0.12;

/**
 * Progress v3: removed redundant p1_orientation_* block (duplicated temperament-dimensions.js items).
 * QA mapping: p1_1→log_1, p1_2→ach_2, p1_3→prov_1, p1_4→ctrl_1, p1_5→ctrl_3, p1_6→ctrl_4, p1_7→dir_1.
 */
const TEMPERAMENT_PROGRESS_SCHEMA_VERSION = 3;

/**
 * Map a response to [-1, 1]: +1 = full emphasis on poleLabels.high, -1 = full on poleLabels.low.
 * Equivalent to legacy 0–10 slider (5 → 0, 10 → +1, 0 → -1).
 */
function getTemperamentPolarityNormalizedAnswer(answer) {
  if (answer && typeof answer === 'object' && answer.type === 'value_allocation' && Array.isArray(answer.allocationPercents) && answer.allocationPercents.length >= 2) {
    const left = Math.max(0, Math.min(100, Number(answer.allocationPercents[0]) || 0));
    const right = Math.max(0, Math.min(100, Number(answer.allocationPercents[1]) || 0));
    const sum = left + right;
    if (sum <= 0) return 0;
    return (right - left) / sum;
  }
  if (typeof answer === 'number' && !Number.isNaN(answer)) {
    const clamped = Math.max(0, Math.min(10, answer));
    return (clamped - 5) / 5;
  }
  return 0;
}

// Single spectrum 0–100 (normalized 0–1): feminine pole 0 → masculine pole 100
// Bands: 0–13.33 Hyper-femme, 13.33–26.66 Strongly Femme, 26.66–40 Femme, 40–60 Balanced,
// 60–73.33 Masc, 73.33–86.66 Strongly Masc, 86.66–100 Hyper-masc
function getSpectrumBandKey(normalizedDimScore) {
  const x = Math.min(1, Math.max(0, Number(normalizedDimScore) || 0));
  if (x < 13.33 / 100) return 'hyper_femme';
  if (x < 26.66 / 100) return 'strongly_femme';
  if (x < 40 / 100) return 'femme';
  if (x < 60 / 100) return 'balanced';
  if (x < 73.33 / 100) return 'masc';
  if (x < 86.66 / 100) return 'strongly_masc';
  return 'hyper_masc';
}

const SPECTRUM_BAND_LABELS = {
  hyper_femme: 'Hyper-femme',
  strongly_femme: 'Strongly Femme',
  femme: 'Femme',
  balanced: 'Balanced',
  masc: 'Masc',
  strongly_masc: 'Strongly Masc',
  hyper_masc: 'Hyper-masc'
};

/** Feminine → masculine display order for grouped dimension breakdown */
const SPECTRUM_BAND_DISPLAY_ORDER = [
  'hyper_femme',
  'strongly_femme',
  'femme',
  'balanced',
  'masc',
  'strongly_masc',
  'hyper_masc'
];

function formatMagnetDimensionPreview(names, maxShown = 3) {
  if (!names || names.length === 0) return '';
  if (names.length <= maxShown) return names.join(', ');
  return `${names.slice(0, maxShown).join(', ')}, +${names.length - maxShown} more`;
}

/** Comma-separated HTML titles with pole bias; entries must be `{ key }` (dimension id). */
function formatMagnetDimensionPreviewHtml(dimensionEntries, maxShown, engine) {
  if (!dimensionEntries || dimensionEntries.length === 0) return '';
  const n = maxShown != null ? maxShown : 3;
  const slice = dimensionEntries.slice(0, n);
  const parts = slice.map((d) => {
    const net = engine.analysisData?.dimensionScores?.[d.key]?.net;
    const norm = typeof net === 'number' ? (net + 1) / 2 : 0.5;
    return engine.getDimensionTitleHtml(d.key, norm);
  });
  let out = parts.join(', ');
  if (dimensionEntries.length > n) {
    out += `, +${dimensionEntries.length - n} more`;
  }
  return out;
}

/** Badge colours: feminine (violet) → balanced (slate) → masculine (blue). */
const SPECTRUM_BADGE_COLORS = {
  hyper_femme: { bg: '#6a1b9a', fg: '#fff' },
  strongly_femme: { bg: '#8e24aa', fg: '#fff' },
  femme: { bg: '#ab47bc', fg: '#fff' },
  balanced: { bg: '#546e7a', fg: '#fff' },
  masc: { bg: '#1e88e5', fg: '#fff' },
  strongly_masc: { bg: '#1565c0', fg: '#fff' },
  hyper_masc: { bg: '#0d47a1', fg: '#fff' }
};

function getSpectrumBandLabel(bandKey) {
  return SPECTRUM_BAND_LABELS[bandKey] || SPECTRUM_BAND_LABELS.balanced;
}

function getSpectrumBandBadgeColors(bandKey) {
  return SPECTRUM_BADGE_COLORS[bandKey] || SPECTRUM_BADGE_COLORS.balanced;
}

function isRemovedTemperamentOpeningId(id) {
  return typeof id === 'string' && id.startsWith('p1_orientation');
}

/**
 * Filter legacy opening ids from saved sequences and remap the current index for resume.
 * @returns {{ ids: string[], currentQuestionIndex: number, hadLegacy: boolean }}
 */
function stripRemovedTemperamentOpeningsFromProgress(rawIds, rawIndex) {
  const ids = Array.isArray(rawIds) ? [...rawIds] : [];
  const hadLegacy = ids.some(isRemovedTemperamentOpeningId);
  const filtered = ids.filter((id) => !isRemovedTemperamentOpeningId(id));
  const idx = Math.max(0, Number(rawIndex) || 0);
  if (!hadLegacy) {
    const max = Math.max(0, filtered.length - 1);
    return { ids: filtered, currentQuestionIndex: Math.min(idx, max), hadLegacy: false };
  }
  let mapped;
  const idAt = ids[idx];
  if (idAt != null && !isRemovedTemperamentOpeningId(idAt)) {
    mapped = ids.slice(0, idx + 1).filter((x) => !isRemovedTemperamentOpeningId(x)).length - 1;
  } else {
    let j = idx;
    while (j < ids.length && isRemovedTemperamentOpeningId(ids[j])) {
      j += 1;
    }
    if (j < ids.length) {
      mapped = ids.slice(0, j + 1).filter((x) => !isRemovedTemperamentOpeningId(x)).length - 1;
    } else {
      mapped = Math.max(0, filtered.length - 1);
    }
  }
  const max = Math.max(0, filtered.length - 1);
  return { ids: filtered, currentQuestionIndex: Math.max(0, Math.min(mapped, max)), hadLegacy: true };
}

function purgeLegacyTemperamentOpeningAnswers(answers) {
  if (!answers || typeof answers !== 'object') return;
  Object.keys(answers).forEach((k) => {
    if (isRemovedTemperamentOpeningId(k)) delete answers[k];
  });
}

function purgeLegacyTemperamentOrientationDimension(analysisData) {
  if (!analysisData) return;
  if (analysisData.dimensionScores && analysisData.dimensionScores.temperament_orientation) {
    delete analysisData.dimensionScores.temperament_orientation;
  }
  if (analysisData.dimensionDisplayNames && analysisData.dimensionDisplayNames.temperament_orientation) {
    delete analysisData.dimensionDisplayNames.temperament_orientation;
  }
}

/** How to read + spectrum caveat + Tier 2 `<details>` (static copy only). */
function buildTemperamentReportEducationHtml() {
  let block = `<div class="info-box panel-brand-left temperament-report-primer" style="margin: 1rem 0 0; text-align: left;">`;
  block += `<h4 style="margin-top:0;color:var(--brand);font-size:0.95rem;">How to Read This Report</h4>`;
  TEMPERAMENT_REPORT_TIER1_PARAS.forEach(p => {
    block += `<p style="margin:0.55rem 0 0;color:var(--muted);font-size:0.92rem;line-height:1.65;">${SecurityUtils.sanitizeHTML(p)}</p>`;
  });
  block += `<p style="margin:0.55rem 0 0;color:var(--muted);font-size:0.88rem;line-height:1.6;font-style:italic;">${SecurityUtils.sanitizeHTML(TEMPERAMENT_REPORT_SPECTRUM_NOTE)}</p>`;
  block += `<details class="temperament-plasticity-details" style="margin: 0.9rem 0 0;"><summary style="cursor:pointer;color:var(--brand);font-weight:600;font-size:0.9rem;">${SecurityUtils.sanitizeHTML(TEMPERAMENT_REPORT_TIER2_SUMMARY)}</summary><div style="margin-top:0.65rem;">`;
  TEMPERAMENT_REPORT_TIER2_PARAS.forEach(p => {
    block += `<p style="margin:0.45rem 0 0;color:var(--muted);font-size:0.88rem;line-height:1.62;">${SecurityUtils.sanitizeHTML(p)}</p>`;
  });
  block += '</div></details></div>';
  return block;
}

/**
 * Temperament Engine - Analyzes masculine-feminine temperament spectrum
 */
export class TemperamentEngine {
  /**
   * Initialize the temperament engine
   */
  constructor() {
    this.currentPhase = 1;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.questionSequence = [];
    this.phase1Results = null; // Preliminary orientation results
    this.analysisData = {
      timestamp: new Date().toISOString(),
      phase1Results: null,
      dimensionScores: {},
      overallTemperament: null,
      variationAnalysis: {},
      allAnswers: {},
      questionSequence: []
    };
    this.baseSectionTitleText = null;
    
    // Initialize debug reporter
    this.debugReporter = createDebugReporter('TemperamentEngine');
    setDebugReporter(this.debugReporter);
    this.debugReporter.markInitialized();
    
    // Initialize data store
    this.dataStore = new DataStore('temperament-assessment', '1.0.0');

    this.ui = new EngineUIController({
      idle: {
        show: ['#introSection', '#actionButtonsSection'],
        hide: ['#questionnaireSection', '#resultsSection']
      },
      assessment: {
        show: ['#questionnaireSection'],
        hide: ['#introSection', '#actionButtonsSection', '#resultsSection']
      },
      results: {
        show: ['#resultsSection'],
        hide: ['#introSection', '#actionButtonsSection', '#questionnaireSection']
      }
    });

    this.init();
  }

  /**
   * Initialize the engine
   */
  init() {
    const gate = getStageGateState();
    this.applyPolaritySuiteGateUI(gate);
    this.attachEventListeners();
    Promise.resolve(this.loadStoredData()).then(() => {
      if (this.shouldAutoGenerateSample()) {
        this.generateSampleReport();
      }
    }).catch(error => {
      this.debugReporter.logError(error, 'init');
    });
  }

  /**
   * Inline prerequisite copy above action buttons; dim buttons while locked (still clickable for showAlert).
   * @param {{ polarityUnlocked: boolean, polarityBlockMessage: string }} gate
   */
  applyPolaritySuiteGateUI(gate) {
    const inline = document.getElementById('suiteStageGateInline');
    const msgEl = document.getElementById('suiteStageGateInlineMessage');
    const wrap = document.getElementById('actionButtonsWrap');
    const sample = document.getElementById('generateSampleReport');
    const start = document.getElementById('startAssessment');
    const descId = 'suiteStageGateInlineMessage';

    if (!gate.polarityUnlocked) {
      if (inline) inline.hidden = false;
      if (msgEl) msgEl.textContent = gate.polarityBlockMessage;
      if (wrap) wrap.classList.add('suite-action-locked');
      if (sample) {
        sample.setAttribute('aria-disabled', 'true');
        sample.setAttribute('aria-describedby', descId);
      }
      if (start) {
        start.setAttribute('aria-disabled', 'true');
        start.setAttribute('aria-describedby', descId);
      }
    } else {
      if (inline) inline.hidden = true;
      if (wrap) wrap.classList.remove('suite-action-locked');
      if (sample) {
        sample.removeAttribute('aria-disabled');
        sample.removeAttribute('aria-describedby');
      }
      if (start) {
        start.removeAttribute('aria-disabled');
        start.removeAttribute('aria-describedby');
      }
    }
  }

  /**
   * Load temperament data modules asynchronously
   * @returns {Promise<void>}
   */
  async loadTemperamentData() {
    // Require every module — a partial failed load can leave dims set while
    // attraction/scoring stay undefined; early-returning then breaks scoring.
    if (
      TEMPERAMENT_DIMENSIONS &&
      INTIMATE_DYNAMICS &&
      ATTRACTION_RESPONSIVENESS &&
      TEMPERAMENT_SCORING?.dimensionWeights &&
      TEMPERAMENT_SCORING?.thresholds &&
      TEMPERAMENT_SCORING?.interpretation
    ) {
      return;
    }

    try {
      // Load dimensions data
      const dimensionsModule = await loadDataModule(
        './temperament-data/temperament-dimensions.js',
        'Temperament Dimensions'
      );
      TEMPERAMENT_DIMENSIONS = dimensionsModule.TEMPERAMENT_DIMENSIONS;

      // Load intimate dynamics data
      const dynamicsModule = await loadDataModule(
        './temperament-data/intimate-dynamics.js',
        'Intimate Dynamics'
      );
      INTIMATE_DYNAMICS = dynamicsModule.INTIMATE_DYNAMICS;

      // Load attraction responsiveness data
      const attractionModule = await loadDataModule(
        './temperament-data/attraction-responsiveness.js',
        'Attraction Responsiveness'
      );
      ATTRACTION_RESPONSIVENESS = attractionModule.ATTRACTION_RESPONSIVENESS;

      // Load scoring data
      const scoringModule = await loadDataModule(
        './temperament-data/temperament-scoring.js',
        'Temperament Scoring'
      );
      TEMPERAMENT_SCORING = scoringModule.TEMPERAMENT_SCORING;

      if (!INTIMATE_DYNAMICS || typeof INTIMATE_DYNAMICS !== 'object') {
        throw new Error('Intimate dynamics module did not export INTIMATE_DYNAMICS');
      }
      if (!ATTRACTION_RESPONSIVENESS || typeof ATTRACTION_RESPONSIVENESS !== 'object') {
        throw new Error('Attraction responsiveness module did not export ATTRACTION_RESPONSIVENESS');
      }
      if (!TEMPERAMENT_SCORING?.dimensionWeights || !TEMPERAMENT_SCORING?.thresholds) {
        throw new Error('Temperament scoring module missing dimensionWeights or thresholds');
      }
    } catch (error) {
      this.debugReporter.logError(error, 'loadTemperamentData');
      ErrorHandler.showUserError('Failed to load assessment data. Please refresh the page.');
      throw error;
    }
  }

  applySuiteGenderFromArchetypeIfNeeded() {
    const suiteG = getArchetypeGenderForSuite();
    if (suiteG !== 'male' && suiteG !== 'female') return;
    const opt = GENDER_QUESTION.options.find(
      (o) => (suiteG === 'male' && o.value === 'man') || (suiteG === 'female' && o.value === 'woman')
    );
    if (!opt) return;
    this.answers[GENDER_QUESTION.id] = { value: opt.value, label: opt.label };
    this.analysisData.gender = opt.value;
    this.analysisData.genderLabel = opt.label;
  }

  collectDeepMappingQuestions() {
    const out = [];
    Object.keys(TEMPERAMENT_DIMENSIONS || {}).forEach((dimKey) => {
      const dimension = TEMPERAMENT_DIMENSIONS[dimKey];
      if (!dimension?.questions) return;
      dimension.questions.forEach((q) => {
        out.push({
          id: q.id,
          type: 'dimension',
          dimension: dimKey,
          dimensionName: dimension.name,
          dimensionSpectrumLabel: dimension.spectrumLabel,
          question: q.question,
          description: dimension.description,
          masculineWeight: q.masculineWeight,
          feminineWeight: q.feminineWeight,
          poleLabels: q.poleLabels
        });
      });
    });
    Object.keys(INTIMATE_DYNAMICS || {}).forEach((catKey) => {
      const category = INTIMATE_DYNAMICS[catKey];
      if (!category?.questions) return;
      category.questions.forEach((q) => {
        out.push({
          id: q.id,
          type: 'intimate',
          category: catKey,
          categoryName: category.name,
          dimensionSpectrumLabel: category.spectrumLabel,
          question: q.question,
          description: category.description,
          masculineWeight: q.masculineWeight,
          feminineWeight: q.feminineWeight,
          poleLabels: q.poleLabels
        });
      });
    });
    Object.keys(ATTRACTION_RESPONSIVENESS || {}).forEach((catKey) => {
      const category = ATTRACTION_RESPONSIVENESS[catKey];
      if (!category?.questions) return;
      category.questions.forEach((q) => {
        out.push({
          id: q.id,
          type: 'attraction',
          category: catKey,
          categoryName: category.name,
          dimensionSpectrumLabel: category.spectrumLabel,
          question: q.question,
          description: category.description,
          masculineWeight: q.masculineWeight,
          feminineWeight: q.feminineWeight,
          selectionStandard: q.selectionStandard,
          poleLabels: q.poleLabels
        });
      });
    });
    return out;
  }

  buildDeepQuestionByIdMap() {
    return new Map(this.collectDeepMappingQuestions().map((q) => [q.id, q]));
  }

  async materializeQuestionSequence(ids) {
    await this.loadTemperamentData();
    const deepMap = this.buildDeepQuestionByIdMap();
    return ids
      .map((id) => {
        if (id === GENDER_QUESTION.id) return GENDER_QUESTION;
        return deepMap.get(id) || null;
      })
      .filter(Boolean);
  }

  /**
   * Gender, then shuffled deep mapping (intimate + attraction + core dimensions).
   */
  async buildAssessmentSequence() {
    await this.loadTemperamentData();
    this.currentPhase = 1;
    this.currentQuestionIndex = 0;
    const deep = this.collectDeepMappingQuestions();
    deep.sort(() => Math.random() - 0.5);
    this.questionSequence = [GENDER_QUESTION, ...deep];
    this.applySuiteGenderFromArchetypeIfNeeded();
    this.debugReporter.recordQuestionCount(this.questionSequence.length);
  }

  async buildPhase1Sequence() {
    await this.buildAssessmentSequence();
  }

  async buildPhase2Sequence() {
    await this.buildAssessmentSequence();
  }

  attachEventListeners() {
    const startBtn = document.getElementById('startAssessment');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAssessment());
    }

    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    const prevBtn = document.getElementById('prevQuestion');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevQuestion());
    }

    const saveResultsBtn = document.getElementById('saveResults');
    if (saveResultsBtn) {
      saveResultsBtn.addEventListener('click', () => this.saveResults());
    }

    const newAssessmentBtn = document.getElementById('newAssessment');
    if (newAssessmentBtn) {
      newAssessmentBtn.addEventListener('click', () => this.resetAssessment());
    }

    const abandonBtn = document.getElementById('abandonAssessment');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', async () => {
        if (await showConfirm('Are you sure you want to abandon this assessment? All progress will be lost.')) {
          this.resetAssessment();
        }
      });
    }

    const sampleBtn = document.getElementById('generateSampleReport');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.generateSampleReport());
    }
  }

  shouldAutoGenerateSample() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('sample')) return false;
    const value = params.get('sample');
    if (value === null || value === '' || value === '1' || value === 'true') return true;
    return false;
  }

  getEmptyAnalysisData() {
    return {
      timestamp: new Date().toISOString(),
      phase1Results: null,
      dimensionScores: {},
      overallTemperament: null,
      variationAnalysis: {},
      allAnswers: {},
      questionSequence: []
    };
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  answerQuestionForSample(question) {
    if (!question) return;
    if (question.type === 'gender') {
      const suiteG = getArchetypeGenderForSuite();
      if (suiteG === 'male' || suiteG === 'female') {
        const option = question.options.find(
          (o) => (suiteG === 'male' && o.value === 'man') || (suiteG === 'female' && o.value === 'woman')
        );
        if (option) {
          this.answers[question.id] = option;
          this.analysisData.gender = option.value;
          this.analysisData.genderLabel = option.label;
        }
        return;
      }
      const option = question.options[Math.floor(Math.random() * question.options.length)];
      this.answers[question.id] = option;
      this.analysisData.gender = option.value;
      this.analysisData.genderLabel = option.label;
      return;
    }
    if (question.type === 'three_point') {
      const option = question.options[Math.floor(Math.random() * question.options.length)];
      this.answers[question.id] = option;
      return;
    }
    if (question.type === 'value_allocation') {
      const left = this.getRandomInt(0, 100);
      this.answers[question.id] = {
        type: 'value_allocation',
        allocationPercents: [left, 100 - left]
      };
      return;
    }
    if (question.type === 'dimension' || question.type === 'intimate' || question.type === 'attraction') {
      const left = this.getRandomInt(0, 100);
      this.answers[question.id] = { type: 'value_allocation', allocationPercents: [left, 100 - left] };
      return;
    }
    const value = this.getRandomInt(0, 10);
    this.answers[question.id] = value;
  }

  async generateSampleReport() {
    const gate = getStageGateState();
    if (!gate.polarityUnlocked) {
      void showAlert(gate.polarityBlockMessage);
      return;
    }
    try {
      await this.loadTemperamentData();
      this.currentPhase = 1;
      this.currentQuestionIndex = 0;
      this.answers = {};
      this.questionSequence = [];
      this.phase1Results = null;
      this.analysisData = this.getEmptyAnalysisData();

      await this.buildAssessmentSequence();
      this.questionSequence.forEach((q) => this.answerQuestionForSample(q));
      this.calculateResults();
      this.ui.transition('results');
      await this.renderResults();
    } catch (error) {
      this.debugReporter.logError(error, 'generateSampleReport');
      ErrorHandler.showUserError('Failed to generate sample report. Please try again.');
    }
  }

  async startAssessment() {
    const gate = getStageGateState();
    if (!gate.polarityUnlocked) {
      void showAlert(gate.polarityBlockMessage);
      return;
    }
    const introSection = document.getElementById('introSection');
    const actionButtonsSection = document.getElementById('actionButtonsSection');
    const questionnaireSection = document.getElementById('questionnaireSection');

    if (introSection) introSection.classList.add('hidden');
    if (actionButtonsSection) actionButtonsSection.classList.add('hidden');
    this.setReportHeaderState(false);
    this.ui.transition('assessment');

    this.currentPhase = 1;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.phase1Results = null;
    this.analysisData = this.getEmptyAnalysisData();
    if (this.dataStore) this.dataStore.clear('progress');

    await this.buildPhase1Sequence();
    this.renderCurrentQuestion();
    this.updateProgress();
    this.saveProgress();
  }

  /**
   * Render the current question
   */
  renderCurrentQuestion() {
    const renderStart = performance.now();
    const questionContainer = document.getElementById('questionContainer');
    
    if (!questionContainer) {
      ErrorHandler.showUserError('Question container not found. Please refresh the page.');
      return;
    }

    try {
      if (this.currentQuestionIndex >= this.questionSequence.length) {
        this.calculateResults();
        void this.renderResults().catch(err => {
          this.debugReporter.logError(err, 'renderCurrentQuestion → renderResults');
          ErrorHandler.showUserError('Failed to display results. Try refreshing the page.');
        });
        return;
      }

    const currentQ = this.questionSequence[this.currentQuestionIndex];
    
    if (currentQ.type === 'gender') {
      this.renderGenderQuestion(currentQ);
      // Scroll to question after rendering
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    if (currentQ.type === 'three_point') {
      this.renderThreePointQuestion(currentQ);
      // Scroll to question after rendering
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    if (currentQ.type === 'value_allocation') {
      this.renderPhase1DualAllocationQuestion(currentQ);
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    this.renderDeepMappingDualAllocationQuestion(currentQ);
    // Scroll to question after rendering
    setTimeout(() => {
      questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    } catch (error) {
      this.debugReporter.logError(error, 'renderCurrentQuestion');
      ErrorHandler.showUserError('Failed to render question. Please refresh the page.');
    }
  }

  renderGenderQuestion(question) {
    const questionContainer = document.getElementById('questionContainer');
    this.applySuiteGenderFromArchetypeIfNeeded();
    const currentAnswer = this.answers[question.id];
    const suiteLocked = getArchetypeGenderForSuite() === 'male' || getArchetypeGenderForSuite() === 'female';

    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
          <span class="question-stage">Profile</span>
        </div>
        <h3 class="question-text">${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        ${
          suiteLocked
            ? `<p class="form-help suite-gender-lock-notice" role="status">Gender matches your completed <strong>Modern Archetype Identification</strong> assessment and cannot be changed here, so suite results stay on one respondent path.</p>`
            : ''
        }
        <div class="three-point-options${suiteLocked ? ' suite-gender-options--locked' : ''}">
          ${question.options
            .map((option, index) => {
              const isSel = currentAnswer && currentAnswer.value === option.value;
              const dis = suiteLocked && !isSel ? 'disabled aria-disabled="true"' : '';
              return `
            <label class="three-point-option ${isSel ? 'selected' : ''}${suiteLocked && !isSel ? ' suite-gender-option--disabled' : ''}">
              <input
                type="radio"
                name="question_${question.id}"
                value="${index}"
                data-option-data='${JSON.stringify(option).replace(/'/g, "&apos;")}'
                ${isSel ? 'checked' : ''}
                ${dis}
              />
              <span class="option-text">${SecurityUtils.sanitizeHTML(option.label || '')}</span>
            </label>`;
            })
            .join('')}
        </div>
        <p class="question-help">This helps us contextualize your results and selection criteria standards.</p>
      </div>
    `);

    if (!suiteLocked) {
      const inputs = document.querySelectorAll(`input[name="question_${question.id}"]`);
      inputs.forEach((input) => {
        input.addEventListener('change', (e) => {
          const optionData = JSON.parse(e.target.dataset.optionData);
          this.answers[question.id] = optionData;
          this.analysisData.gender = optionData.value;
          this.analysisData.genderLabel = optionData.label;

          document.querySelectorAll('.three-point-option').forEach((opt) => {
            opt.classList.remove('selected');
          });
          e.target.closest('label').classList.add('selected');

          this.saveProgress();
        });
      });
    }

    this.updateProgress();
    this.updateNavigationButtons();
  }

  renderThreePointQuestion(question) {
    const questionContainer = document.getElementById('questionContainer');
    const currentAnswer = this.answers[question.id];
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
          <span class="question-stage">Orientation</span>
        </div>
        <h3 class="question-text">${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="three-point-options">
          ${question.options.map((option, index) => `
            <label class="three-point-option ${currentAnswer && currentAnswer.text === option.text ? 'selected' : ''}">
              <input 
                type="radio" 
                name="question_${question.id}" 
                value="${index}"
                data-option-data='${JSON.stringify(option).replace(/'/g, "&apos;")}'
                ${currentAnswer && currentAnswer.text === option.text ? 'checked' : ''}
              />
              <span class="option-text">${SecurityUtils.sanitizeHTML(option.text || '')}</span>
            </label>
          `).join('')}
        </div>
        <div class="temperament-tip">
          <strong>Tip:</strong> Answer based on what feels most natural to you, not what you think you "should" be.
        </div>
      </div>
    `);
    
    // Attach event listeners
    const inputs = document.querySelectorAll(`input[name="question_${question.id}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const optionData = JSON.parse(e.target.dataset.optionData);
        this.answers[question.id] = optionData;
        
        // Update visual selection
        document.querySelectorAll('.three-point-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        e.target.closest('label').classList.add('selected');
        
        this.saveProgress();
      });
    });
    
    this.updateProgress();
    this.updateNavigationButtons();
  }

  renderPhase1DualAllocationQuestion(question) {
    this.renderLinkedDualPoleQuestion(question, {
      stageLabel: 'Orientation',
      leftLabel: question.options?.[0]?.text || 'Left pole',
      rightLabel: question.options?.[2]?.text || 'Right pole'
    });
  }

  renderDeepMappingDualAllocationQuestion(question) {
    const low = question.poleLabels?.low || 'One side';
    const high = question.poleLabels?.high || 'Other side';
    this.renderLinkedDualPoleQuestion(question, {
      stageLabel: 'Mapping',
      leftLabel: low,
      rightLabel: high,
      categoryLine: question.dimensionSpectrumLabel || question.dimensionName || question.categoryName || '',
      description: question.description || ''
    });
  }

  renderLinkedDualPoleQuestion(question, opts) {
    const questionContainer = document.getElementById('questionContainer');
    const idSuffix = String(question.id || 'q').replace(/[^a-zA-Z0-9_-]/g, '_');
    const saved = this.answers[question.id];
    const savedLeft = Array.isArray(saved?.allocationPercents) ? Number(saved.allocationPercents[0]) : null;
    const leftPct = Number.isFinite(savedLeft) ? Math.max(0, Math.min(100, Math.round(savedLeft))) : 50;
    const rightPct = 100 - leftPct;
    const categoryLine = opts.categoryLine
      ? `<p class="description">${SecurityUtils.sanitizeHTML(opts.categoryLine)}</p>`
      : '';
    const descLine = opts.description
      ? `<p class="description temperament-description">${SecurityUtils.sanitizeHTML(opts.description)}</p>`
      : '';

    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block temperament-linked-sliders">
        <div class="question-header">
          <span class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
          <span class="question-stage">${SecurityUtils.sanitizeHTML(opts.stageLabel || 'Mapping')}</span>
        </div>
        ${categoryLine}
        ${descLine}
        <h3 class="question-text">${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="scale-container scale-container--stacked">
          <div class="scale-input">
            <div class="temperament-slider-row-head">
              <span>${SecurityUtils.sanitizeHTML(opts.leftLabel || '')}</span>
              <strong id="dm_pct_left_${idSuffix}">${leftPct}%</strong>
            </div>
            <input type="range" min="0" max="100" value="${leftPct}" class="slider" id="dm_slider_left_${idSuffix}" step="1">
            <div class="scale-labels">
              <span>Not important</span>
              <span>Very important</span>
            </div>
          </div>
          <div class="scale-input">
            <div class="temperament-slider-row-head">
              <span>${SecurityUtils.sanitizeHTML(opts.rightLabel || '')}</span>
              <strong id="dm_pct_right_${idSuffix}">${rightPct}%</strong>
            </div>
            <input type="range" min="0" max="100" value="${rightPct}" class="slider" id="dm_slider_right_${idSuffix}" step="1">
            <div class="scale-labels">
              <span>Not important</span>
              <span>Very important</span>
            </div>
          </div>
        </div>
      </div>
    `);

    const leftSlider = document.getElementById(`dm_slider_left_${idSuffix}`);
    const rightSlider = document.getElementById(`dm_slider_right_${idSuffix}`);
    const leftPctEl = document.getElementById(`dm_pct_left_${idSuffix}`);
    const rightPctEl = document.getElementById(`dm_pct_right_${idSuffix}`);
    const syncAnswer = (leftValue, origin) => {
      const left = Math.max(0, Math.min(100, Math.round(Number(leftValue) || 0)));
      const right = 100 - left;
      if (leftPctEl) leftPctEl.textContent = `${left}%`;
      if (rightPctEl) rightPctEl.textContent = `${right}%`;
      if (leftSlider && origin !== 'left') leftSlider.value = String(left);
      if (rightSlider && origin !== 'right') rightSlider.value = String(right);
      this.answers[question.id] = {
        type: 'value_allocation',
        allocationPercents: [left, right]
      };
      this.saveProgress();
    };

    if (leftSlider) leftSlider.oninput = (event) => syncAnswer(event.target.value, 'left');
    if (rightSlider) rightSlider.oninput = (event) => {
      const rightValue = Math.max(0, Math.min(100, Math.round(Number(event.target.value) || 0)));
      syncAnswer(100 - rightValue, 'right');
    };
    syncAnswer(leftPct, 'init');

    this.updateProgress();
    this.updateNavigationButtons();
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      const totalQuestions = this.questionSequence.length || 1;
      const currentProgress = this.currentQuestionIndex + 1;
      const progress = (currentProgress / totalQuestions) * 100;
      progressFill.style.width = `${progress}%`;
    }

    const questionCount = document.getElementById('questionCount');
    if (questionCount) {
      const remaining = this.questionSequence.length - this.currentQuestionIndex;
      questionCount.textContent = `${remaining} question${remaining !== 1 ? 's' : ''} remaining`;
    }
  }

  nextQuestion() {
    const currentQ = this.questionSequence[this.currentQuestionIndex];

    if (this.answers[currentQ.id] === undefined) {
      if (currentQ.type === 'gender') {
        ErrorHandler.showUserError('Please select your gender to continue.');
        return;
      }
      if (
        currentQ.type === 'value_allocation' ||
        currentQ.type === 'dimension' ||
        currentQ.type === 'intimate' ||
        currentQ.type === 'attraction'
      ) {
        this.answers[currentQ.id] = { type: 'value_allocation', allocationPercents: [50, 50] };
      } else if (currentQ.options && currentQ.options.length > 0) {
        this.answers[currentQ.id] = currentQ.options[Math.floor(currentQ.options.length / 2)];
      }
    }

    if (this.currentQuestionIndex < this.questionSequence.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
      this.saveProgress();
    } else {
      this.calculateResults();
      void this.renderResults().catch(err => {
        this.debugReporter.logError(err, 'nextQuestion → renderResults');
        ErrorHandler.showUserError('Failed to display results. Try refreshing the page.');
      });
    }
  }

  captureLinkedDualAnswerForQuestion(question) {
    if (!question?.id) return;
    const idSuffix = String(question.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const leftSlider = document.getElementById(`dm_slider_left_${idSuffix}`);
    if (leftSlider) {
      const left = Math.max(0, Math.min(100, Math.round(Number(leftSlider.value) || 0)));
      this.answers[question.id] = { type: 'value_allocation', allocationPercents: [left, 100 - left] };
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      const currentQ = this.questionSequence[this.currentQuestionIndex];
      if (
        currentQ &&
        (currentQ.type === 'value_allocation' ||
          currentQ.type === 'dimension' ||
          currentQ.type === 'intimate' ||
          currentQ.type === 'attraction')
      ) {
        this.captureLinkedDualAnswerForQuestion(currentQ);
      }
      this.currentQuestionIndex--;
      this.renderCurrentQuestion();
      this.saveProgress();
    }
  }

  calculateResults() {
    if (!TEMPERAMENT_SCORING?.dimensionWeights || !TEMPERAMENT_SCORING?.thresholds) {
      this.debugReporter.logError(
        new Error('TEMPERAMENT_SCORING not loaded — refresh the page or complete data load.'),
        'calculateResults'
      );
      ErrorHandler.showUserError('Assessment data did not load completely. Please refresh the page.');
      return;
    }

    this.analysisData.dimensionScores = {};

    const dimensionGroups = {};
    const defaultAllocation = { type: 'value_allocation', allocationPercents: [50, 50] };

    this.questionSequence.forEach((q) => {
      if (q.type === 'gender') return;
      const groupKey = q.dimension || q.category || 'other';
      if (!dimensionGroups[groupKey]) {
        dimensionGroups[groupKey] = [];
      }
      let ans = this.answers[q.id];
      if (ans === undefined) {
        ans =
          q.type === 'value_allocation' || q.type === 'dimension' || q.type === 'intimate' || q.type === 'attraction'
            ? defaultAllocation
            : 5;
      }
      dimensionGroups[groupKey].push({ question: q, answer: ans });
    });

    let totalMasculineScore = 0;
    let totalFeminineScore = 0;
    let totalWeight = 0;

    const genderAnswer = this.answers[GENDER_QUESTION.id];
    if (!this.analysisData.gender && genderAnswer?.value) {
      this.analysisData.gender = genderAnswer.value;
    }
    const reportedGender = this.analysisData.gender;

    const dimensionWeights = TEMPERAMENT_SCORING.dimensionWeights;
    Object.keys(dimensionGroups).forEach((groupKey) => {
      const group = dimensionGroups[groupKey];
      const dimWeight = dimensionWeights[groupKey] || 1.0;
      let groupMasculine = 0;
      let groupFeminine = 0;
      let groupWeight = 0;

      group.forEach(({ question, answer }) => {
        const normalizedAnswer = getTemperamentPolarityNormalizedAnswer(answer);

        let masculineWeight = Number(question.masculineWeight);
        let feminineWeight = Number(question.feminineWeight);
        if (groupKey === 'selection_criteria' && question.selectionStandard && (reportedGender === 'man' || reportedGender === 'woman')) {
          const aligns =
            (reportedGender === 'woman' && question.selectionStandard === 'female') ||
            (reportedGender === 'man' && question.selectionStandard === 'male');
          if (!aligns) {
            const originalMasculine = masculineWeight;
            masculineWeight = feminineWeight;
            feminineWeight = originalMasculine;
          }
        }

        const masculineContribution = normalizedAnswer * masculineWeight;
        const feminineContribution = normalizedAnswer * feminineWeight;

        groupMasculine += masculineContribution * dimWeight;
        groupFeminine += feminineContribution * dimWeight;
        groupWeight += dimWeight;
      });

      const avgMasculine = groupWeight > 0 ? groupMasculine / groupWeight : 0;
      const avgFeminine = groupWeight > 0 ? groupFeminine / groupWeight : 0;

      const netDim = avgMasculine - avgFeminine;
      this.analysisData.dimensionScores[groupKey] = {
        masculine: avgMasculine,
        feminine: avgFeminine,
        net: netDim,
        masculineDecimal: Number(avgMasculine.toFixed(4)),
        feminineDecimal: Number(avgFeminine.toFixed(4)),
        netDecimal: Number(netDim.toFixed(4))
      };

      // Apply dimension weight once per dimension (not per question), so importance
      // weights control contribution rather than question count (e.g. intimate
      // categories with 6 questions shouldn't dominate core dimensions with 4)
      totalMasculineScore += avgMasculine * dimWeight;
      totalFeminineScore += avgFeminine * dimWeight;
      totalWeight += dimWeight;
    });

    // Calculate overall temperament
    const overallMasculine = totalWeight > 0 ? totalMasculineScore / totalWeight : 0;
    const overallFeminine = totalWeight > 0 ? totalFeminineScore / totalWeight : 0;
    const overallNet = overallMasculine - overallFeminine;

    // Normalize to 0-1 scale (where 1 = highly masculine, 0 = highly feminine)
    const rawNormalizedScore = Math.max(0, Math.min(1, (overallNet + 1) / 2));
    const archSnap = getSuiteSnapshots().archetype;
    const polarityCal = applyArchetypePolarityCalibration(archSnap, rawNormalizedScore);
    const normalizedScore = polarityCal.adjustedNormalizedScore;
    this.analysisData.suiteCalibration = {
      source: 'archetype',
      version: polarityCal.version,
      delta: polarityCal.delta,
      rawNormalizedScore: polarityCal.rawNormalizedScore,
      cluster: polarityCal.cluster
    };

    // Determine temperament category
    let temperamentCategory = 'balanced';
    const thresholds = TEMPERAMENT_SCORING.thresholds;
    
    if (normalizedScore >= thresholds.highly_masculine) {
      temperamentCategory = 'highly_masculine';
    } else if (normalizedScore >= thresholds.predominantly_masculine) {
      temperamentCategory = 'predominantly_masculine';
    } else if (normalizedScore >= thresholds.balanced_masculine) {
      temperamentCategory = 'balanced_masculine';
    } else if (normalizedScore >= thresholds.balanced) {
      temperamentCategory = 'balanced';
    } else if (normalizedScore >= thresholds.balanced_feminine) {
      temperamentCategory = 'balanced_feminine';
    } else if (normalizedScore >= thresholds.predominantly_feminine) {
      temperamentCategory = 'predominantly_feminine';
    } else {
      temperamentCategory = 'highly_feminine';
    }

    this.analysisData.overallTemperament = {
      category: temperamentCategory,
      normalizedScore,
      masculineScore: overallMasculine,
      feminineScore: overallFeminine,
      netScore: overallNet,
      normalizedScoreDecimal: Number(normalizedScore.toFixed(4)),
      masculineScoreDecimal: Number(overallMasculine.toFixed(4)),
      feminineScoreDecimal: Number(overallFeminine.toFixed(4)),
      netScoreDecimal: Number(overallNet.toFixed(4))
    };

    const interpSnap = TEMPERAMENT_SCORING?.interpretation?.[temperamentCategory];
    this.analysisData.temperamentInterpretation = interpSnap
      ? {
          label: interpSnap.label || '',
          description: interpSnap.description || '',
          characteristics: Array.isArray(interpSnap.characteristics) ? [...interpSnap.characteristics] : [],
          variations: interpSnap.variations || ''
        }
      : null;

    // Cross-polarity: detect when respondent scores significantly beyond typical gender range
    const maleTrend = EXPECTED_GENDER_TRENDS.man;
    const femaleTrend = EXPECTED_GENDER_TRENDS.woman;
    const isMaleCrossPolarity = reportedGender === 'man' && normalizedScore < (femaleTrend - CROSS_POLARITY_THRESHOLD);
    const isFemaleCrossPolarity = reportedGender === 'woman' && normalizedScore > (maleTrend + CROSS_POLARITY_THRESHOLD);
    this.analysisData.crossPolarityDetected = isMaleCrossPolarity || isFemaleCrossPolarity;
    if (this.analysisData.crossPolarityDetected) {
      this.analysisData.crossPolarityNote = isMaleCrossPolarity
        ? 'Significantly more feminine-leaning than the average woman; consider partner polarity fit.'
        : 'Significantly more masculine-leaning than the average man; consider partner polarity fit.';
    }

    // Analyze variation
    this.analyzeVariation();

    // Include all raw answers
    this.analysisData.allAnswers = { ...this.answers };
    this.analysisData.questionSequence = this.questionSequence.map(q => {
      const dimKey = q.dimension || q.category;
      const name = dimKey ? this.getDimensionDisplayName(dimKey) : (q.dimensionName || q.categoryName);
      return {
        id: q.id,
        question: q.question,
        type: q.type,
        dimension: dimKey,
        name
      };
    });
    this.analysisData.dimensionDisplayNames = {};
    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      this.analysisData.dimensionDisplayNames[dimKey] = this.getDimensionDisplayName(dimKey);
    });
  }

  analyzeVariation() {
    // Identify dimensions with high internal spread (used for context-sensitivity flag)
    this.analysisData.variationAnalysis = {
      highVariationDimensions: []
    };

    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      const score = this.analysisData.dimensionScores[dimKey];
      const variation = Math.abs(score.masculine) + Math.abs(score.feminine);
      
      if (variation > 0.5) {
        this.analysisData.variationAnalysis.highVariationDimensions.push({
          dimension: dimKey,
          variation: variation,
          scores: score
        });
      }
    });
    
    // Calculate context sensitivity flag
    const variationCount = this.analysisData.variationAnalysis.highVariationDimensions.length;
    const totalDimensions = Object.keys(this.analysisData.dimensionScores).length;
    const variationRatio = totalDimensions > 0 ? variationCount / totalDimensions : 0;
    
    // If variation exceeds threshold (more than 40% of dimensions show high variation)
    if (variationRatio > 0.4) {
      this.analysisData.contextSensitivity = {
        detected: true,
        variationRatio: variationRatio,
        message: 'Context-responsive temperament: High variation across dimensions indicates adaptability rather than confusion. Expression tends to shift based on partner, season, safety, and life phase.'
      };
    } else {
      this.analysisData.contextSensitivity = {
        detected: false,
        variationRatio: variationRatio
      };
    }
  }
  
  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
    }
    
    if (nextBtn) {
      nextBtn.textContent = this.currentQuestionIndex === this.questionSequence.length - 1 ? 'Finish Assessment' : 'Next';
    }
  }

  /**
   * Resolve dimension/category key to a human-readable display name.
   * Prefers spectrumLabel (e.g. "Receiving pleasure vs Giving pleasure") when present; otherwise sequence name or title-cased key.
   */
  getDimensionDisplayName(dimKey) {
    const dim = (TEMPERAMENT_DIMENSIONS && TEMPERAMENT_DIMENSIONS[dimKey])
      || (INTIMATE_DYNAMICS && INTIMATE_DYNAMICS[dimKey])
      || (ATTRACTION_RESPONSIVENESS && ATTRACTION_RESPONSIVENESS[dimKey]);
    // Distinct heading for intimate arousal vs connection-context pursuit (both "Being pursued vs Pursuing" on the axis line)
    if (dimKey === 'arousal_and_responsiveness' && dim?.name && dim?.spectrumLabel) {
      return `${dim.name}: ${dim.spectrumLabel}`;
    }
    if (dim?.spectrumLabel) return dim.spectrumLabel;
    const fromSeq = this.questionSequence.find(q => (q.dimension || q.category) === dimKey);
    const name = fromSeq?.dimensionName || fromSeq?.categoryName;
    if (name && name !== dimKey) return name;
    return (dimKey || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Convert a normalised dimension score (0–1) into a plain-English statement
   * relative to the gender-specific norm dot, using dimension-specific pole language when available.
   */
  getDimensionLabel(dimKey, normalizedDimScore, reportedGender, maleTrend, femaleTrend) {
    const dim = (TEMPERAMENT_DIMENSIONS && TEMPERAMENT_DIMENSIONS[dimKey])
      || (INTIMATE_DYNAMICS && INTIMATE_DYNAMICS[dimKey])
      || (ATTRACTION_RESPONSIVENESS && ATTRACTION_RESPONSIVENESS[dimKey]);
    const masculineLabel = dim?.masculinePoleLabel || 'structured and directive';
    const feminineLabel = dim?.femininePoleLabel || 'fluid and receptive';

    if (reportedGender !== 'man' && reportedGender !== 'woman') {
      const pos = normalizedDimScore;
      if (pos > 0.65) return `Sits toward the more ${masculineLabel} end of this dimension.`;
      if (pos < 0.35) return `Sits toward the more ${feminineLabel} end of this dimension.`;
      return 'Sits near the midpoint of this dimension.';
    }

    const ref = reportedGender === 'man' ? maleTrend : femaleTrend;
    const genderLabel = reportedGender === 'man' ? 'men' : 'women';
    const delta = normalizedDimScore - ref;

    const intensity = 1 - Math.exp(-Math.abs(delta) / 0.15);

    const nearThreshold = 0.20;
    if (Math.abs(delta) < 0.04) {
      return `Closely matches the typical expression for ${genderLabel}.`;
    }

    let adverb;
    if (intensity < nearThreshold) adverb = 'slightly';
    else if (intensity < 0.55) adverb = 'moderately';
    else if (intensity < 0.80) adverb = 'notably';
    else adverb = 'markedly';

    const cap = adverb.charAt(0).toUpperCase() + adverb.slice(1);
    const person = reportedGender === 'man' ? 'man' : 'woman';
    if (delta > 0) {
      return `${cap} more ${masculineLabel} than the average ${person}.`;
    }
    return `${cap} more ${feminineLabel} than the average ${person}.`;
  }

  /**
   * Short pole-lean label for grouped dimension breakdown (spectrum "A vs B" → winning side).
   */
  getDimensionDescriptorCompact(dimKey, normalizedDimScore) {
    const dim = (TEMPERAMENT_DIMENSIONS && TEMPERAMENT_DIMENSIONS[dimKey])
      || (INTIMATE_DYNAMICS && INTIMATE_DYNAMICS[dimKey])
      || (ATTRACTION_RESPONSIVENESS && ATTRACTION_RESPONSIVENESS[dimKey]);
    const label = dim?.spectrumLabel || '';
    const parts = label.split(/\s+vs\s+/i);
    if (parts.length >= 2) {
      const femSide = parts[0].trim();
      const mascSide = parts.slice(1).join(' vs ').trim();
      const x = normalizedDimScore;
      if (x > 0.52) return mascSide.length > 52 ? `${mascSide.slice(0, 49)}…` : mascSide;
      if (x < 0.48) return femSide.length > 52 ? `${femSide.slice(0, 49)}…` : femSide;
      return 'Near midpoint on this axis';
    }
    const masculineLabel = dim?.masculinePoleLabel || 'structured';
    const feminineLabel = dim?.femininePoleLabel || 'receptive';
    if (normalizedDimScore > 0.52) return masculineLabel.length > 52 ? `${masculineLabel.slice(0, 49)}…` : masculineLabel;
    if (normalizedDimScore < 0.48) return feminineLabel.length > 52 ? `${feminineLabel.slice(0, 49)}…` : feminineLabel;
    return 'Near midpoint on this axis';
  }

  /**
   * HTML for a spectrum fragment "A vs B": underline A if feminine-leaning, B if masculine-leaning; balanced = no mark.
   */
  getSpectrumLabelPoleBiasHtml(spectrumPart, normalizedDimScore, dimKey) {
    const label = spectrumPart || '';
    const parts = label.split(/\s+vs\s+/i);
    if (parts.length >= 2) {
      const fem = SecurityUtils.sanitizeHTML(parts[0].trim());
      const masc = SecurityUtils.sanitizeHTML(parts.slice(1).join(' vs ').trim());
      const vs = ' vs ';
      const x = normalizedDimScore;
      if (x > 0.52) return `${fem}${vs}<span class="dimension-pole-bias">${masc}</span>`;
      if (x < 0.48) return `<span class="dimension-pole-bias">${fem}</span>${vs}${masc}`;
      return `${fem}${vs}${masc}`;
    }
    const dim = dimKey
      ? (TEMPERAMENT_DIMENSIONS && TEMPERAMENT_DIMENSIONS[dimKey])
        || (INTIMATE_DYNAMICS && INTIMATE_DYNAMICS[dimKey])
        || (ATTRACTION_RESPONSIVENESS && ATTRACTION_RESPONSIVENESS[dimKey])
      : null;
    const masculineLabel = dim?.masculinePoleLabel || '';
    const feminineLabel = dim?.femininePoleLabel || '';
    const x = normalizedDimScore;
    if (x > 0.52 && masculineLabel) {
      return `<span class="dimension-pole-bias">${SecurityUtils.sanitizeHTML(masculineLabel)}</span>`;
    }
    if (x < 0.48 && feminineLabel) {
      return `<span class="dimension-pole-bias">${SecurityUtils.sanitizeHTML(feminineLabel)}</span>`;
    }
    return SecurityUtils.sanitizeHTML(label || feminineLabel || masculineLabel || '');
  }

  /**
   * Full dimension title for breakdown: optional "Category — spectrum" or "Category: spectrum" with pole bias on the spectrum side.
   */
  getDimensionTitleHtml(dimKey, normalizedDimScore) {
    const rawDisplay = this.getDimensionDisplayName(dimKey);
    const emSep = ' — ';
    if (rawDisplay.includes(emSep)) {
      const i = rawDisplay.indexOf(emSep);
      const prefix = rawDisplay.slice(0, i).trim();
      const spectrumPart = rawDisplay.slice(i + emSep.length).trim();
      return `${SecurityUtils.sanitizeHTML(prefix)}${emSep}${this.getSpectrumLabelPoleBiasHtml(spectrumPart, normalizedDimScore, dimKey)}`;
    }
    const colonSep = ': ';
    const ci = rawDisplay.indexOf(colonSep);
    if (ci > 0 && /\s+vs\s+/i.test(rawDisplay.slice(ci + colonSep.length))) {
      const prefix = rawDisplay.slice(0, ci).trim();
      const spectrumPart = rawDisplay.slice(ci + colonSep.length).trim();
      return `${SecurityUtils.sanitizeHTML(prefix)}${colonSep}${this.getSpectrumLabelPoleBiasHtml(spectrumPart, normalizedDimScore, dimKey)}`;
    }
    return this.getSpectrumLabelPoleBiasHtml(rawDisplay, normalizedDimScore, dimKey);
  }

  /**
   * Returns a hex colour for the temperament-anomaly badge by extremity (yellow → amber → red).
   * @param {number} normalizedDimScore - dimension score in [0,1]
   * @param {string} reportedGender - 'man' | 'woman'
   * @param {number} maleTrend - male norm in [0,1]
   * @param {number} femaleTrend - female norm in [0,1]
   * @returns {string} hex colour
   */
  getAnomalySeverityColor(normalizedDimScore, reportedGender, maleTrend, femaleTrend) {
    let extremity = 0;
    if (reportedGender === 'man') {
      const boundary = femaleTrend - CROSS_POLARITY_THRESHOLD;
      extremity = Math.max(0, boundary - normalizedDimScore);
    } else if (reportedGender === 'woman') {
      const boundary = maleTrend + CROSS_POLARITY_THRESHOLD;
      extremity = Math.max(0, normalizedDimScore - boundary);
    }
    if (extremity <= 0.1) return '#b8860b';   // dark goldenrod (yellow)
    if (extremity <= 0.2) return '#cc7a00';   // amber
    return '#b71c1c';                         // red
  }

  /**
   * Render assessment results
   */
  async renderResults() {
    try {
      await this.loadTemperamentData(); // Ensure data is loaded
      
      const questionnaireSection = document.getElementById('questionnaireSection');
      const resultsSection = document.getElementById('resultsSection');
      this.setReportHeaderState(true);
      this.ui.transition('results');

      const container = document.getElementById('temperamentResults');
      if (!container) {
        ErrorHandler.showUserError('Results container not found.');
        return;
      }

      const temperament = this.analysisData.overallTemperament;
      if (!temperament?.category) {
        ErrorHandler.showUserError('Results are incomplete. Finish the assessment or clear saved progress and try again.');
        return;
      }
      const interpretation = TEMPERAMENT_SCORING?.interpretation?.[temperament.category];
      if (!interpretation) {
        ErrorHandler.showUserError('Could not load profile interpretation. Please refresh the page.');
        return;
      }
      if (!this.analysisData.temperamentInterpretation) {
        this.analysisData.temperamentInterpretation = {
          label: interpretation.label || '',
          description: interpretation.description || '',
          characteristics: Array.isArray(interpretation.characteristics) ? [...interpretation.characteristics] : [],
          variations: interpretation.variations || ''
        };
      }
      const genderAnswer = this.answers[GENDER_QUESTION.id];
      const genderValue = typeof genderAnswer === 'string' ? genderAnswer : genderAnswer?.value;
      if (!this.analysisData.gender && genderValue) {
        this.analysisData.gender = genderValue;
      }
    const reportedGender = this.analysisData.gender;
    const maleTrend = EXPECTED_GENDER_TRENDS.man;
    const femaleTrend = EXPECTED_GENDER_TRENDS.woman;
    const score = typeof temperament.normalizedScore === 'number' ? temperament.normalizedScore : 0.5;

    const isMaleCrossPolarity = reportedGender === 'man' && score < (femaleTrend - CROSS_POLARITY_THRESHOLD);
    const isFemaleCrossPolarity = reportedGender === 'woman' && score > (maleTrend + CROSS_POLARITY_THRESHOLD);

    const anomalousDimensions = [];
    const stronglyAlignedDimensions = [];
    const stronglyMascBandNames = [];
    const hypermascBandNames = [];
    const stronglyFemmeBandNames = [];
    const hyperfemmeBandNames = [];
    const femmeBandNames = [];
    const stronglyMascBandKeys = [];
    const hypermascBandKeys = [];
    const stronglyFemmeBandKeys = [];
    const hyperfemmeBandKeys = [];
    const femmeBandKeys = [];
    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      const dimScore = this.analysisData.dimensionScores[dimKey];
      const normalizedDimScore = (dimScore.net + 1) / 2;
      const spectrumBand = getSpectrumBandKey(normalizedDimScore);
      const isDimAnomalous = (reportedGender === 'man' && normalizedDimScore < (femaleTrend - CROSS_POLARITY_THRESHOLD)) ||
                            (reportedGender === 'woman' && normalizedDimScore > (maleTrend + CROSS_POLARITY_THRESHOLD));
      const isManMagnet = reportedGender === 'man' && (spectrumBand === 'strongly_masc' || spectrumBand === 'hyper_masc');
      const isWomanMagnet = reportedGender === 'woman' && (spectrumBand === 'hyper_femme' || spectrumBand === 'strongly_femme' || spectrumBand === 'femme');
      const isDimStronglyAligned = isManMagnet || isWomanMagnet;
      if (isDimAnomalous) {
        const dimName = this.getDimensionDisplayName(dimKey);
        anomalousDimensions.push({ key: dimKey, name: dimName });
      }
      if (isDimStronglyAligned) {
        const dimName = this.getDimensionDisplayName(dimKey);
        stronglyAlignedDimensions.push({ key: dimKey, name: dimName, band: spectrumBand });
        if (reportedGender === 'man') {
          if (spectrumBand === 'hyper_masc') {
            hypermascBandNames.push(dimName);
            hypermascBandKeys.push(dimKey);
          } else {
            stronglyMascBandNames.push(dimName);
            stronglyMascBandKeys.push(dimKey);
          }
        } else {
          if (spectrumBand === 'hyper_femme') {
            hyperfemmeBandNames.push(dimName);
            hyperfemmeBandKeys.push(dimKey);
          } else if (spectrumBand === 'strongly_femme') {
            stronglyFemmeBandNames.push(dimName);
            stronglyFemmeBandKeys.push(dimKey);
          } else {
            femmeBandNames.push(dimName);
            femmeBandKeys.push(dimKey);
          }
        }
      }
    });

    this.analysisData.anomalousDimensionKeys = anomalousDimensions.map(d => d.key);
    this.analysisData.anomalousDimensionNames = anomalousDimensions.map(d => d.name);
    this.analysisData.stronglyAlignedDimensionKeys = stronglyAlignedDimensions.map(d => d.key);
    this.analysisData.stronglyAlignedDimensionNames = stronglyAlignedDimensions.map(d => d.name);
    if (reportedGender === 'man') {
      this.analysisData.stronglyMascBandDimensionNames = stronglyMascBandNames;
      this.analysisData.hypermascBandDimensionNames = hypermascBandNames;
      this.analysisData.stronglyMascBandDimensionKeys = stronglyMascBandKeys;
      this.analysisData.hypermascBandDimensionKeys = hypermascBandKeys;
      this.analysisData.stronglyFemmeBandDimensionNames = [];
      this.analysisData.hyperfemmeBandDimensionNames = [];
      this.analysisData.femmeBandDimensionNames = [];
      this.analysisData.stronglyFemmeBandDimensionKeys = [];
      this.analysisData.hyperfemmeBandDimensionKeys = [];
      this.analysisData.femmeBandDimensionKeys = [];
    } else {
      this.analysisData.stronglyMascBandDimensionNames = [];
      this.analysisData.hypermascBandDimensionNames = [];
      this.analysisData.stronglyMascBandDimensionKeys = [];
      this.analysisData.hypermascBandDimensionKeys = [];
      this.analysisData.stronglyFemmeBandDimensionNames = stronglyFemmeBandNames;
      this.analysisData.hyperfemmeBandDimensionNames = hyperfemmeBandNames;
      this.analysisData.femmeBandDimensionNames = femmeBandNames;
      this.analysisData.stronglyFemmeBandDimensionKeys = stronglyFemmeBandKeys;
      this.analysisData.hyperfemmeBandDimensionKeys = hyperfemmeBandKeys;
      this.analysisData.femmeBandDimensionKeys = femmeBandKeys;
    }

    let polarityFailureAlertHtml = '';
    let polarityStrongAlignmentAlertHtml = '';
    const hasOverallCrossPolarity = isMaleCrossPolarity || isFemaleCrossPolarity;
    const hasHyperMascRisk = hypermascBandNames.length > 0;
    const hasHyperFemmeRisk = hyperfemmeBandNames.length > 0;
    if (hasOverallCrossPolarity || anomalousDimensions.length > 0 || hasHyperMascRisk || hasHyperFemmeRisk) {
      const direction = (hasOverallCrossPolarity ? isMaleCrossPolarity : reportedGender === 'man')
        ? 'more feminine-leaning than typical'
        : 'more masculine-leaning than typical';
      let whatMeans = '';
      if (hasOverallCrossPolarity && anomalousDimensions.length === 0) {
        whatMeans = `Your overall temperament expression is ${direction} for your gender.`;
      } else if (anomalousDimensions.length > 0) {
        whatMeans = `You express ${direction} in ${anomalousDimensions.length === 1 ? 'one dimension' : anomalousDimensions.length + ' dimensions'}: <strong>${anomalousDimensions.map(d => d.name).join(', ')}</strong>.`;
        if (hasOverallCrossPolarity) whatMeans = `Your overall expression is ${direction}. At the dimension level, this shows particularly in: <strong>${anomalousDimensions.map(d => d.name).join(', ')}</strong>.`;
      } else if (hasHyperMascRisk || hasHyperFemmeRisk) {
        whatMeans = 'You show high-intensity polarity spikes that can increase both attraction pull and instability risk if partner complement is weak.';
      }
      const hyperHazardBlurb = (() => {
        if (reportedGender === 'man' && hasHyperMascRisk) {
          return `
          <h4 style="margin-top: 0.75rem; margin-bottom: 0.35rem;">Hyper-state concern</h4>
          <p><strong>Hyper-masc risk:</strong> Strong directional intensity can become emotionally neglectful, rigid, or over-controlling without steady complementary feminine-leaning balance.</p>`;
        }
        if (reportedGender === 'woman' && hasHyperFemmeRisk) {
          return `
          <h4 style="margin-top: 0.75rem; margin-bottom: 0.35rem;">Hyper-state concern</h4>
          <p><strong>Hyper-femme risk:</strong> Strong emotional intensity can become anxious, chaotic, or over-merged without stabilising complementary masculine-leaning structure.</p>`;
        }
        if (hasHyperMascRisk || hasHyperFemmeRisk) {
          return `
          <h4 style="margin-top: 0.75rem; margin-bottom: 0.35rem;">Hyper-state concern</h4>
          <p><strong>Intensity risk:</strong> Hyper-pole expression can heighten attraction and volatility together when complementary balance is missing.</p>`;
        }
        return '';
      })();
      const polarityConsiderationBlurb = anomalousDimensions.length > 0 ? `
          <h4 style="margin-top: 0.75rem; margin-bottom: 0.35rem;">Temperament anomaly (by dimension)</h4>
          <p><strong>What it is:</strong> These rows sit outside typical range for your reported context—useful for partner fit, not a character verdict.</p>
          <p><strong>If partner is mismatched:</strong> Same pole with a weak opposite flattens tension and attraction here; an opposite pole at <strong>similar strength</strong> restores polarity.</p>
          <p><strong>What restores it:</strong> Complementary opposite at matched intensity or intentional calibration—often worth exploring with stress, history, and context in view.</p>` : '';
      polarityFailureAlertHtml = `
        <div class="polarity-failure-alert panel-brand-left">
          <h3 class="polarity-failure-alert-title">Potential Polarity Failure — Partner Fit Consideration</h3>
          <p><strong>What this means:</strong> ${whatMeans}</p>
          <p><strong>Partner-fit angle:</strong> Polarity leans on opposite poles at roughly matched strength. Without that complement in these areas, flow and attraction thin; a fitting opposite restores clarity. This flags fit, not a final label.</p>
          ${polarityConsiderationBlurb}
          ${hyperHazardBlurb}
        </div>
      `;
    }

    if (stronglyAlignedDimensions.length > 0) {
      const complementLabel = reportedGender === 'man' ? 'feminine-leaning' : 'masculine-leaning';
      if (reportedGender === 'man') {
        const strongMascDims = stronglyAlignedDimensions.filter(d => d.band === 'strongly_masc');
        const hyperMascDims = stronglyAlignedDimensions.filter(d => d.band === 'hyper_masc');
        const magnetTitle =
          strongMascDims.length && hyperMascDims.length
            ? 'Polarity Magnetism — Strongly Masc &amp; Hyper-masc'
            : hyperMascDims.length
              ? 'Polarity Magnetism — Hyper-masc'
              : 'Polarity Magnetism — Strongly Masc';
        let whatMeansBody = '';
        if (strongMascDims.length) {
          const preview = formatMagnetDimensionPreviewHtml(strongMascDims, 3, this);
          whatMeansBody += `<p><strong>Strongly Masc (${strongMascDims.length}):</strong> ${preview}</p>`;
        }
        if (hyperMascDims.length) {
          const preview = formatMagnetDimensionPreviewHtml(hyperMascDims, 3, this);
          whatMeansBody += `<p><strong>Hyper-masc (${hyperMascDims.length}):</strong> ${preview}</p>`;
        }
        polarityStrongAlignmentAlertHtml = `
        <div class="polarity-strongly-aligned-alert panel-brand-left">
          <h3 class="polarity-strongly-aligned-alert-title">${magnetTitle}</h3>
          ${whatMeansBody}
          <p style="margin-top:0.65rem;"><strong>Partner-fit:</strong> Pull is strongest on these axes—in each title above, the emphasized fragment is the masculine side of that dimension where you lean. It lands when a partner holds the complementary ${complementLabel} side with enough strength. Weak complement reads as strain or over-functioning.</p>
        </div>
      `;
      } else {
        const femmeDims = stronglyAlignedDimensions.filter(d => d.band === 'femme');
        const strongFemmeDims = stronglyAlignedDimensions.filter(d => d.band === 'strongly_femme');
        const hyperFemmeDims = stronglyAlignedDimensions.filter(d => d.band === 'hyper_femme');
        const magnetPieces = [];
        if (hyperFemmeDims.length) magnetPieces.push('Hyper-femme');
        if (strongFemmeDims.length) magnetPieces.push('Strongly Femme');
        if (femmeDims.length) magnetPieces.push('Femme');
        const magnetTitle =
          magnetPieces.length === 3
            ? 'Polarity Magnetism — Hyper-femme, Strongly Femme &amp; Femme'
            : magnetPieces.length === 2
              ? `Polarity Magnetism — ${magnetPieces.join(' &amp; ')}`
              : magnetPieces.length === 1
                ? `Polarity Magnetism — ${magnetPieces[0]}`
                : 'Polarity Magnetism — Feminine pole';
        let whatMeansBody = '';
        if (hyperFemmeDims.length) {
          const preview = formatMagnetDimensionPreviewHtml(hyperFemmeDims, 3, this);
          whatMeansBody += `<p><strong>Hyper-femme (${hyperFemmeDims.length}):</strong> ${preview}</p>`;
        }
        if (strongFemmeDims.length) {
          const preview = formatMagnetDimensionPreviewHtml(strongFemmeDims, 3, this);
          whatMeansBody += `<p><strong>Strongly Femme (${strongFemmeDims.length}):</strong> ${preview}</p>`;
        }
        if (femmeDims.length) {
          const preview = formatMagnetDimensionPreviewHtml(femmeDims, 3, this);
          whatMeansBody += `<p><strong>Femme (${femmeDims.length}):</strong> ${preview}</p>`;
        }
        polarityStrongAlignmentAlertHtml = `
        <div class="polarity-strongly-aligned-alert panel-brand-left">
          <h3 class="polarity-strongly-aligned-alert-title">${magnetTitle}</h3>
          ${whatMeansBody}
          <p style="margin-top:0.65rem;"><strong>Partner-fit:</strong> Pull is strongest on these axes—in each title above, the emphasized fragment is the feminine side of that dimension where you lean. It lands when a partner holds the complementary ${complementLabel} side with enough strength. Weak complement reads as strain or over-functioning.</p>
        </div>
      `;
      }
    }

    const anomalousKeys = new Set(anomalousDimensions.map(d => d.key));
    const stronglyAlignedKeys = new Set(stronglyAlignedDimensions.map(d => d.key));
    const groupedByBand = {};
    SPECTRUM_BAND_DISPLAY_ORDER.forEach(b => { groupedByBand[b] = []; });
    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      const dimScore = this.analysisData.dimensionScores[dimKey];
      const normalizedDimScore = (dimScore.net + 1) / 2;
      const band = getSpectrumBandKey(normalizedDimScore);
      groupedByBand[band].push({ dimKey, normalizedDimScore });
    });

    const crossPolarityClass = (reportedGender === 'man' && score < (femaleTrend - CROSS_POLARITY_THRESHOLD)) || (reportedGender === 'woman' && score > (maleTrend + CROSS_POLARITY_THRESHOLD)) ? ' cross-polarity-notable' : '';
    const synthesisParagraphs = buildTemperamentSynthesisPlainParagraphs(this.analysisData);
    if (this.analysisData.temperamentInterpretation) {
      this.analysisData.temperamentInterpretation.synthesisParagraphs = synthesisParagraphs;
    }
    const aggregatePatternsHtml =
      (interpretation.characteristics || []).length > 0
        ? `<div class="temperament-patterns temperament-patterns-aggregate">
            <h4>Aggregate themes (average across dimensions)</h4>
            <ul>
              ${(interpretation.characteristics || []).map(char => `<li>${SecurityUtils.sanitizeHTML(char || '')}</li>`).join('')}
            </ul>
          </div>`
        : '';
    const variationNoteHtml = interpretation.variations
      ? `<div class="temperament-variation-note" style="margin-top:0.75rem;"><p style="font-size:0.9rem;color:var(--muted);margin:0;"><strong>Note:</strong> ${SecurityUtils.sanitizeHTML(interpretation.variations)}</p></div>`
      : '';
    const synthesisSectionHtml = `
        <div class="temperament-profile-synthesis panel-brand-left">
          <h3 class="temperament-profile-synthesis-title">Reading your profile together</h3>
          ${synthesisParagraphs.map(p => `<p style="margin:0 0 0.65rem;line-height:1.55;">${SecurityUtils.sanitizeHTML(p)}</p>`).join('')}
          ${aggregatePatternsHtml}
          ${variationNoteHtml}
        </div>`;

    const compositeBadgeText = formatCompositePositionDescription(temperament.normalizedScore);
    const compositeBadgeAria = SecurityUtils.sanitizeHTML(compositeBadgeText).replace(/"/g, '&quot;');
    const temperamentHeaderSuiteHtml = `
      <div class="results-header temperament-report-header-suite${crossPolarityClass}">
        ${reportGenderGlyphHtml(reportedGender)}
        <h2 class="suite-results-main-title">Your Temperament Analysis:</h2>
        <div class="temperament-composite-chart-suite">
          <div class="temperament-composite-badge-wrap temperament-composite-badge-wrap--lead primary-result-badge-wrap">
            <p class="primary-result-label">Primary Result</p>
            <div class="temperament-composite-badge primary-result-badge" role="status" aria-label="${compositeBadgeAria}">
              ${SecurityUtils.sanitizeHTML(compositeBadgeText)}
            </div>
          </div>
          <div class="temperament-spectrum-large">
            <div class="temperament-trend-dot temperament-trend-male" style="left: ${maleTrend * 100}%;" title="Expected trend for males"></div>
            <div class="temperament-trend-dot temperament-trend-female" style="left: ${femaleTrend * 100}%;" title="Expected trend for females"></div>
            <div class="temperament-marker temperament-marker-large" style="left: ${temperament.normalizedScore * 100}%;"></div>
          </div>
          <div class="temperament-spectrum-labels">
            <span>Feminine-leaning</span>
            <span>Mid</span>
            <span>Masculine-leaning</span>
          </div>
          <div class="temperament-trend-legend">
            <span><span class="temperament-trend-dot temperament-trend-female"></span> Expected trend for females</span>
            <span><span class="temperament-trend-dot temperament-trend-male"></span> Expected trend for males</span>
          </div>
        </div>
      </div>`;

    let html = temperamentHeaderSuiteHtml;
    if (this.analysisData.contextSensitivity && this.analysisData.contextSensitivity.detected) {
      html += `
        <div class="info-box info-box-accent panel-brand-left">
          <p>
            <strong>Context-Responsive Temperament:</strong> ${this.analysisData.contextSensitivity.message}
          </p>
        </div>
      `;
    }
    html += buildTemperamentReportEducationHtml();

    html += '<div class="dimension-breakdown">';
    html += '<h3>Dimension Breakdown</h3>';

    const dimScores = this.analysisData.dimensionScores || {};
    const domainKeys = [];
    const pushKeysInOrder = (obj) => {
      if (!obj) return;
      Object.keys(obj).forEach((k) => domainKeys.push(k));
    };
    pushKeysInOrder(TEMPERAMENT_DIMENSIONS);
    pushKeysInOrder(INTIMATE_DYNAMICS);
    pushKeysInOrder(ATTRACTION_RESPONSIVENESS);

    const orderedKeys = [];
    const seen = new Set();
    for (const k of domainKeys) {
      if (!seen.has(k) && typeof dimScores[k]?.net === 'number') {
        orderedKeys.push(k);
        seen.add(k);
      }
    }
    const unknownKeys = Object.keys(dimScores)
      .filter((k) => typeof dimScores[k]?.net === 'number' && !seen.has(k))
      .sort((a, b) => a.localeCompare(b));
    orderedKeys.push(...unknownKeys);

    html += '<ul class="dimension-band-list" style="list-style:none;padding-left:0;margin:0;">';
    orderedKeys.forEach((dimKey) => {
      const dimScore = dimScores[dimKey];
      if (!dimScore || typeof dimScore.net !== 'number') return;
      const normalizedDimScore = (dimScore.net + 1) / 2;
      const dimensionTitleHtml = this.getDimensionTitleHtml(dimKey, normalizedDimScore);
      const rowSpectrumBand = getSpectrumBandKey(normalizedDimScore);
      const rowBandLabel = getSpectrumBandLabel(rowSpectrumBand);
      const { bg: specBg, fg: specFg } = getSpectrumBandBadgeColors(rowSpectrumBand);
      const spectrumBadgeHtml = ` <span class="polarity-spectrum-badge" style="background:${specBg};color:${specFg};" title="Spectrum position (${(normalizedDimScore * 100).toFixed(0)}%)">${SecurityUtils.sanitizeHTML(rowBandLabel)}</span>`;
      const isAnomalous = anomalousKeys.has(dimKey);
      const isStronglyAligned = stronglyAlignedKeys.has(dimKey);
      const anomalyColor = isAnomalous ? this.getAnomalySeverityColor(normalizedDimScore, reportedGender, maleTrend, femaleTrend) : null;
      const anomalyBadgeHtml = isAnomalous && anomalyColor
        ? ` <span class="polarity-notable-badge" style="background:${anomalyColor};color:#fff;">Temperament anomaly</span>`
        : (isAnomalous ? ' <span class="polarity-notable-badge">Temperament anomaly</span>' : '');

      const compact = this.getDimensionDescriptorCompact(dimKey, normalizedDimScore);
      const fullDetailLabel = this.getDimensionLabel(dimKey, normalizedDimScore, reportedGender, maleTrend, femaleTrend);
      const fullDetailTitle = SecurityUtils.sanitizeHTML(fullDetailLabel).replace(/"/g, '&quot;');

      const clarifierSentence = getDimensionNormativeClarifier({
        reportedGender,
        normalizedDimScore,
        maleTrend,
        femaleTrend,
        spectrumBand: rowSpectrumBand
      });

      html += `
      <li class="dimension-item${isAnomalous ? ' dimension-polarity-notable' : ''}${isStronglyAligned ? ' dimension-polarity-strongly-aligned' : ''}" style="margin-bottom:1rem;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.35rem;margin-bottom:0.35rem;" class="dimension-title-row">
          <span class="dimension-display-title">${dimensionTitleHtml}</span>${spectrumBadgeHtml}${anomalyBadgeHtml}
        </div>
        <div class="dimension-spectrum">
          <div class="temperament-trend-dot temperament-trend-male" style="left: ${maleTrend * 100}%;"></div>
          <div class="temperament-trend-dot temperament-trend-female" style="left: ${femaleTrend * 100}%;"></div>
          <div class="dimension-marker" style="left: ${normalizedDimScore * 100}%;"></div>
        </div>
        <p class="dimension-score-text dimension-score-text-compact" style="margin:0.35rem 0 0;font-size:0.9rem;color:var(--muted);line-height:1.5;" title="${fullDetailTitle}">
          ${SecurityUtils.sanitizeHTML(compact)}
        </p>
        ${clarifierSentence ? `<p style="margin:0.25rem 0 0;color:var(--muted);font-size:0.85rem;line-height:1.45;">${SecurityUtils.sanitizeHTML(clarifierSentence)}</p>` : ''}
      </li>`;
    });
    html += '</ul>';

    html += '</div>';
    html += polarityFailureAlertHtml;
    html += polarityStrongAlignmentAlertHtml;
    html += synthesisSectionHtml;

    html += `
      <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; margin-top: 2rem; border-left: 4px solid var(--accent);">
        <p style="margin: 0;"><strong style="color: var(--accent);">Explore further:</strong> Polarity sits between identity and outcome — it shapes both. <a href="archetype.html">Modern Archetype Identification</a> reveals the deeper patterns behind your expression; <a href="relationship.html">Relationships</a> shows where polarity mismatch creates strain; <a href="attraction.html">Attraction &amp; Status</a> connects your polarity to selection dynamics and market reality.</p>
      </div>
    `;

      // Sanitize HTML before rendering - all dynamic content is already sanitized above
      SecurityUtils.safeInnerHTML(container, html);
      this.saveProgress();
      
      // Display debug report if in development mode
      if (window.location.search.includes('debug=true')) {
        this.debugReporter.displayReport('debug-report');
      }
    } catch (error) {
      this.debugReporter.logError(error, 'renderResults');
      ErrorHandler.showUserError('Failed to render results. Please refresh the page.');
    }
  }

  /**
   * Save results: produces a readable HTML report document recording report details (primary export action).
   */
  saveResults() {
    const html = generateReadableReport(this.analysisData, 'temperament-analysis', 'Polarity Position Mapping');
    downloadFile(html, `temperament-report-${Date.now()}.html`, 'text/html');
  }

  /**
   * Save assessment progress to storage
   */
  saveProgress() {
    try {
      const progressData = {
        progressSchemaVersion: TEMPERAMENT_PROGRESS_SCHEMA_VERSION,
        currentPhase: this.currentPhase,
        currentQuestionIndex: this.currentQuestionIndex,
        questionSequenceIds: (this.questionSequence || []).map((q) => q.id),
        answers: this.answers,
        phase1Results: this.phase1Results,
        analysisData: this.analysisData,
        timestamp: new Date().toISOString()
      };
      this.dataStore.save('progress', progressData);
    } catch (error) {
      this.debugReporter.logError(error, 'saveProgress');
    }
  }

  /**
   * Load stored assessment progress
   * @returns {Promise<void>}
   */
  async loadStoredData() {
    try {
      const gate = getStageGateState();
      if (!gate.polarityUnlocked) return;
      const data = this.dataStore.load('progress');
      if (!data) return;

      this.currentPhase = data.currentPhase || 1;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.answers = data.answers || {};
      this.phase1Results = data.phase1Results || null;
      this.analysisData = data.analysisData || this.analysisData;
      this.applySuiteGenderFromArchetypeIfNeeded();

      // PRIORITY: If we have completed results, show report immediately on revisit
      if (this.analysisData && this.analysisData.overallTemperament) {
        await this.loadTemperamentData();
        this.ui.transition('results');
        await this.renderResults();
        return;
      }
      
      if (data.questionSequenceIds?.length) {
        purgeLegacyTemperamentOpeningAnswers(this.answers);
        purgeLegacyTemperamentOrientationDimension(this.analysisData);
        const stripped = stripRemovedTemperamentOpeningsFromProgress(
          data.questionSequenceIds,
          data.currentQuestionIndex
        );
        this.currentQuestionIndex = stripped.currentQuestionIndex;
        this.questionSequence = await this.materializeQuestionSequence(stripped.ids);
        this.currentPhase = 1;
      } else {
        await this.buildAssessmentSequence();
      }
      if (this.questionSequence.length && this.currentQuestionIndex >= this.questionSequence.length) {
        this.currentQuestionIndex = Math.max(0, this.questionSequence.length - 1);
      }

      if (this.currentQuestionIndex > 0 && this.currentQuestionIndex < this.questionSequence.length) {
        const introSection = document.getElementById('introSection');
        const actionButtonsSection = document.getElementById('actionButtonsSection');
        const questionnaireSection = document.getElementById('questionnaireSection');
        if (introSection) introSection.classList.add('hidden');
        if (actionButtonsSection) actionButtonsSection.classList.add('hidden');
        if (questionnaireSection) questionnaireSection.classList.add('active');
        this.renderCurrentQuestion();
      }
    } catch (error) {
      this.debugReporter.logError(error, 'loadStoredData');
      ErrorHandler.showUserError('Failed to load saved progress.');
    }
  }

  async clearAllCachedData() {
    if (await showConfirm('Are you sure you want to clear all cached data? This will clear all saved progress.')) {
      sessionStorage.removeItem('temperamentProgress');
      this.resetAssessment();
      await showAlert('All cached data has been cleared.');
    }
  }

  resetAssessment() {
    this.currentPhase = 1;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.phase1Results = null;
    this.analysisData = {
      timestamp: new Date().toISOString(),
      phase1Results: null,
      dimensionScores: {},
      overallTemperament: null,
      variationAnalysis: {},
      allAnswers: {},
      questionSequence: []
    };
    
    if (this.dataStore) this.dataStore.clear('progress');
    sessionStorage.removeItem('temperamentProgress');
    
    const introSection = document.getElementById('introSection');
    const actionButtonsSection = document.getElementById('actionButtonsSection');
    const questionnaireSection = document.getElementById('questionnaireSection');
    const resultsSection = document.getElementById('resultsSection');
    const temperamentResults = document.getElementById('temperamentResults');
    if (temperamentResults) temperamentResults.innerHTML = '';

    if (introSection) introSection.classList.remove('hidden');
    if (actionButtonsSection) actionButtonsSection.classList.remove('hidden');
    this.setReportHeaderState(false);
    this.ui.transition('idle');
    
    void this.buildAssessmentSequence();
  }

  setReportHeaderState(isReport) {
    const heading = document.querySelector('.section-title-btn');
    const lead = document.querySelector('.assessment-lead');

    if (heading) {
      if (!this.baseSectionTitleText) {
        this.baseSectionTitleText = heading.textContent.trim().replace(/\s*: REPORT$/, '');
      }
      if (isReport) {
        if (!heading.textContent.trim().endsWith(': REPORT')) {
          heading.textContent = `${this.baseSectionTitleText}: REPORT`;
        }
      } else {
        heading.textContent = this.baseSectionTitleText;
      }
    }

    if (lead) {
      lead.classList.toggle('hidden', Boolean(isReport));
    }
  }
}

// Initialize when DOM is ready
// Initialize engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.temperamentEngine = new TemperamentEngine();
  });
} else {
  window.temperamentEngine = new TemperamentEngine();
}

