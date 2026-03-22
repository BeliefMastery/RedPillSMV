// Temperament Analyzer Engine - Version 2.1
// Maps position on masculine-feminine temperament spectrum
// Enhanced with lazy loading, error handling, and debug reporting

import { loadDataModule, setDebugReporter } from './shared/data-loader.js';
import { createDebugReporter } from './shared/debug-reporter.js';
import { ErrorHandler, DataStore, DOMUtils, SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport } from './shared/export-utils.js';
import {
  TEMPERAMENT_REPORT_TIER1_PARAS,
  TEMPERAMENT_REPORT_SPECTRUM_NOTE,
  TEMPERAMENT_REPORT_TIER2_SUMMARY,
  TEMPERAMENT_REPORT_TIER2_PARAS
} from './temperament-data/temperament-report-copy.js';
import { EngineUIController } from './shared/engine-ui-controller.js';
import { showConfirm, showAlert } from './shared/confirm-modal.js';

// Data modules - will be loaded lazily
let TEMPERAMENT_DIMENSIONS, INTIMATE_DYNAMICS;
let ATTRACTION_RESPONSIVENESS, TEMPERAMENT_SCORING;
let PHASE_1_ORIENTATION_QUESTIONS;

const GENDER_QUESTION = {
  id: 'p1_gender',
  type: 'gender',
  question: 'What is your gender?',
  options: [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' }
  ]
};

const EXPECTED_GENDER_TRENDS = {
  man: 0.6,
  woman: 0.4
};

// Cross-polarity: respondent scores significantly beyond their gender's typical range
// toward the opposite pole (e.g. man more feminine than avg woman, woman more masculine than avg man).
const CROSS_POLARITY_THRESHOLD = 0.12;

/** Tier 1 + Tier 2 educational block (static copy only). */
function buildTemperamentReportEducationHtml() {
  let block = `<div class="info-box panel-brand-left temperament-report-primer" style="margin: 1rem 0 0; text-align: left;">`;
  block += `<h4 style="margin-top:0;color:var(--brand);font-size:0.95rem;">Reading this report: polarity and couples</h4>`;
  TEMPERAMENT_REPORT_TIER1_PARAS.forEach(p => {
    block += `<p style="margin:0.55rem 0 0;color:var(--muted);font-size:0.92rem;line-height:1.65;">${SecurityUtils.sanitizeHTML(p)}</p>`;
  });
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
   * Load temperament data modules asynchronously
   * @returns {Promise<void>}
   */
  async loadTemperamentData() {
    // Require every module — a partial failed load can leave orientation+dims set while
    // attraction/scoring stay undefined; early-returning then breaks Phase 2 and scoring.
    if (
      PHASE_1_ORIENTATION_QUESTIONS &&
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
      // Load orientation questions
      const orientationModule = await loadDataModule(
        './temperament-data/temperament-orientation.js',
        'Orientation Questions'
      );
      PHASE_1_ORIENTATION_QUESTIONS = orientationModule.PHASE_1_ORIENTATION_QUESTIONS;

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

      const phase1Count = (PHASE_1_ORIENTATION_QUESTIONS?.length || 0) + 1;
      this.debugReporter.recordSection('Phase 1', phase1Count);
    } catch (error) {
      this.debugReporter.logError(error, 'loadTemperamentData');
      ErrorHandler.showUserError('Failed to load assessment data. Please refresh the page.');
      throw error;
    }
  }

  /**
   * Build Phase 1 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase1Sequence() {
    await this.loadTemperamentData();
    
    // Phase 1: Orientation Screening (7 quick questions)
    this.currentPhase = 1;
    this.currentQuestionIndex = 0;
    this.questionSequence = [GENDER_QUESTION, ...PHASE_1_ORIENTATION_QUESTIONS];
    this.debugReporter.recordQuestionCount(this.questionSequence.length);
  }

  /**
   * Analyze Phase 1 results and proceed to Phase 2
   * @returns {Promise<void>}
   */
  async analyzePhase1Results() {
    await this.loadTemperamentData();
    
    try {
      // Calculate preliminary orientation scores
      let totalMasculine = 0;
      let totalFeminine = 0;
      let totalWeight = 0;

      PHASE_1_ORIENTATION_QUESTIONS.forEach(question => {
        const answer = this.answers[question.id];
        if (answer && answer.mapsTo) {
          const weight = answer.mapsTo.weight || 1;
          totalMasculine += (answer.mapsTo.masculine || 0) * weight;
          totalFeminine += (answer.mapsTo.feminine || 0) * weight;
          totalWeight += weight;
        }
      });

      const avgMasculine = totalWeight > 0 ? totalMasculine / totalWeight : 0;
      const avgFeminine = totalWeight > 0 ? totalFeminine / totalWeight : 0;
      const net = avgMasculine - avgFeminine;
      const normalizedScore = (net + 2) / 4; // Normalize to 0-1 scale

      this.phase1Results = {
        masculine: avgMasculine,
        feminine: avgFeminine,
        net: net,
        normalizedScore: normalizedScore
      };

      this.analysisData.phase1Results = this.phase1Results;

      // Build Phase 2 sequence
      await this.buildPhase2Sequence();
    } catch (error) {
      this.debugReporter.logError(error, 'analyzePhase1Results');
      ErrorHandler.showUserError('Failed to analyze Phase 1 results. Please try again.');
    }
  }

  /**
   * Build Phase 2 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase2Sequence() {
    await this.loadTemperamentData();
    
    try {
      // Phase 2: Deep Mapping (all remaining questions)
      this.currentPhase = 2;
      this.currentQuestionIndex = 0;
      this.questionSequence = [];
      
      // Add questions from all dimension categories
      Object.keys(TEMPERAMENT_DIMENSIONS || {}).forEach(dimKey => {
      const dimension = TEMPERAMENT_DIMENSIONS[dimKey];
      if (!dimension?.questions) return;
      dimension.questions.forEach(q => {
        this.questionSequence.push({
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

    // Add intimate dynamics questions
    Object.keys(INTIMATE_DYNAMICS || {}).forEach(catKey => {
      const category = INTIMATE_DYNAMICS[catKey];
      if (!category?.questions) return;
      category.questions.forEach(q => {
        this.questionSequence.push({
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

    // Add attraction responsiveness questions
    Object.keys(ATTRACTION_RESPONSIVENESS || {}).forEach(catKey => {
      const category = ATTRACTION_RESPONSIVENESS[catKey];
      if (!category?.questions) return;
      category.questions.forEach(q => {
        this.questionSequence.push({
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

    // Shuffle questions to mitigate bias
    this.questionSequence.sort(() => Math.random() - 0.5);
    } catch (error) {
      this.debugReporter.logError(error, 'buildPhase2Sequence');
      ErrorHandler.showUserError('Failed to build Phase 2 sequence. Please try again.');
    }
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
    const value = this.getRandomInt(0, 10);
    this.answers[question.id] = value;
  }

  async generateSampleReport() {
    try {
      await this.loadTemperamentData();
      this.currentPhase = 1;
      this.currentQuestionIndex = 0;
      this.answers = {};
      this.questionSequence = [];
      this.phase1Results = null;
      this.analysisData = this.getEmptyAnalysisData();
      this.analysisData.intimateConsentGiven = true;

      await this.buildPhase1Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      await this.analyzePhase1Results();

      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      this.calculateResults();
      this.ui.transition('results');
      await this.renderResults();
    } catch (error) {
      this.debugReporter.logError(error, 'generateSampleReport');
      ErrorHandler.showUserError('Failed to generate sample report. Please try again.');
    }
  }

  async startAssessment() {
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
        if (this.currentPhase === 1) {
          this.analyzePhase1Results();
          this.showPhase1Feedback();
          return;
        } else {
          this.calculateResults();
          void this.renderResults().catch(err => {
            this.debugReporter.logError(err, 'renderCurrentQuestion → renderResults');
            ErrorHandler.showUserError('Failed to display results. Try refreshing the page.');
          });
          return;
        }
      }

    const currentQ = this.questionSequence[this.currentQuestionIndex];
    
    // Phase 1: Render gender prompt first
    if (this.currentPhase === 1 && currentQ.type === 'gender') {
      this.renderGenderQuestion(currentQ);
      // Scroll to question after rendering
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    // Phase 1: Render 3-point orientation questions
    if (this.currentPhase === 1 && currentQ.type === 'three_point') {
      this.renderThreePointQuestion(currentQ);
      // Scroll to question after rendering
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    // Phase 2: Check if entering intimate dynamics section and show consent gate
    if (this.currentPhase === 2 && currentQ.type === 'intimate' && !this.analysisData.intimateConsentGiven) {
      this.showIntimateConsentGate();
      // Scroll to question after rendering
      setTimeout(() => {
        questionContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    
    // Phase 2: Render slider-based questions (existing logic)
    this.renderSliderQuestion(currentQ);
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
    const currentAnswer = this.answers[question.id];

    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Phase ${this.currentPhase} - Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
          <span class="question-stage">Orientation</span>
        </div>
        <h3 class="question-text">${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="three-point-options">
          ${question.options.map((option, index) => `
            <label class="three-point-option ${currentAnswer && currentAnswer.value === option.value ? 'selected' : ''}">
              <input
                type="radio"
                name="question_${question.id}"
                value="${index}"
                data-option-data='${JSON.stringify(option).replace(/'/g, "&apos;")}'
                ${currentAnswer && currentAnswer.value === option.value ? 'checked' : ''}
              />
              <span class="option-text">${SecurityUtils.sanitizeHTML(option.label || '')}</span>
            </label>
          `).join('')}
        </div>
        <p class="question-help">This helps us contextualize your results and selection criteria standards.</p>
      </div>
    `);

    const inputs = document.querySelectorAll(`input[name="question_${question.id}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const optionData = JSON.parse(e.target.dataset.optionData);
        this.answers[question.id] = optionData;
        this.analysisData.gender = optionData.value;
        this.analysisData.genderLabel = optionData.label;

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

  renderThreePointQuestion(question) {
    const questionContainer = document.getElementById('questionContainer');
    const currentAnswer = this.answers[question.id];
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Phase ${this.currentPhase} - Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
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

  renderSliderQuestion(currentQ) {
    const questionContainer = document.getElementById('questionContainer');
    const savedAnswer = this.answers[currentQ.id] !== undefined ? this.answers[currentQ.id] : 5;

    let categoryInfo = '';
    const sectionLabel = currentQ.dimensionSpectrumLabel || currentQ.dimensionName || currentQ.categoryName;
    if (sectionLabel) {
      categoryInfo = `<p class="description">${SecurityUtils.sanitizeHTML(sectionLabel)}</p>`;
    }

    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        <div class="question-header">
          <span class="question-number">Phase ${this.currentPhase} - Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length}</span>
          <span class="question-stage">Deep Mapping</span>
        </div>
        ${categoryInfo}
        <h3>${SecurityUtils.sanitizeHTML(currentQ.question || '')}</h3>
        ${currentQ.description ? `<p class="description">${SecurityUtils.sanitizeHTML(currentQ.description)}</p>` : ''}
        <div class="scale-container">
          <div class="scale-input">
            <input type="range" min="0" max="10" value="${savedAnswer}" class="slider" id="questionSlider" step="1">
            <div class="scale-labels">
              <span>${currentQ.poleLabels ? SecurityUtils.sanitizeHTML(currentQ.poleLabels.low) + ' (0)' : 'Very Low / Minimal / Weak / Rare / Never (0-2)'}</span>
              <span>${currentQ.poleLabels ? 'Balanced / Both / Mixed (5)' : 'Moderate / Somewhat / Average / Sometimes (5-6)'}</span>
              <span>${currentQ.poleLabels ? SecurityUtils.sanitizeHTML(currentQ.poleLabels.high) + ' (10)' : 'Very High / Strong / Potent / Frequent / Always (9-10)'}</span>
            </div>
          </div>
          <span class="scale-value" id="sliderValue">${savedAnswer}</span>
        </div>
        <div class="temperament-tip">
          <strong>Tip:</strong> ${currentQ.poleLabels ? 'Position the slider toward the pole that feels more natural or authentic to you. 0 and 10 represent the two options in the question.' : 'Answer based on your authentic experience and preferences, not what you think you "should" be.'}
        </div>
      </div>
    `);

    const slider = document.getElementById('questionSlider');
    const sliderValueSpan = document.getElementById('sliderValue');
    if (slider && sliderValueSpan) {
      slider.oninput = (event) => {
        sliderValueSpan.textContent = event.target.value;
        this.answers[currentQ.id] = parseInt(event.target.value);
        this.saveProgress();
      };
    }

    this.updateProgress();
    this.updateNavigationButtons();
  }

  showPhase1Feedback() {
    const questionContainer = document.getElementById('questionContainer');
    if (!questionContainer || !this.phase1Results) return;
    
    const score = this.phase1Results.normalizedScore;
    let rangeLabel = '';
    let rangeDescription = '';
    
    if (score >= 0.7) {
      rangeLabel = 'Masculine-Leaning Range';
      rangeDescription = 'Your initial responses suggest a tendency toward masculine-leaning expression patterns. The detailed assessment will help clarify the specific dimensions and contexts where this shows up.';
    } else if (score >= 0.55) {
      rangeLabel = 'Balanced-Masculine Range';
      rangeDescription = 'Your initial responses suggest a balanced orientation with slight masculine-leaning tendencies. The detailed assessment will explore the nuances across different dimensions.';
    } else if (score >= 0.45) {
      rangeLabel = 'Balanced Range';
      rangeDescription = 'Your initial responses suggest a balanced temperament with flexibility across the spectrum. The detailed assessment will map how this expresses across different dimensions and contexts.';
    } else if (score >= 0.3) {
      rangeLabel = 'Balanced-Feminine Range';
      rangeDescription = 'Your initial responses suggest a balanced orientation with slight feminine-leaning tendencies. The detailed assessment will explore the nuances across different dimensions.';
    } else {
      rangeLabel = 'Feminine-Leaning Range';
      rangeDescription = 'Your initial responses suggest a tendency toward feminine-leaning expression patterns. The detailed assessment will help clarify the specific dimensions and contexts where this shows up.';
    }
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="transition-card panel text-center temperament-orientation-card">
        <h3 class="panel-title">Orientation Complete</h3>
        <div class="temperament-info-box panel-brand-left">
          <h4>${SecurityUtils.sanitizeHTML(rangeLabel)}</h4>
          <p>${SecurityUtils.sanitizeHTML(rangeDescription)}</p>
          <div class="temperament-spectrum">
            <div class="temperament-marker" style="left: ${score * 100}%;"></div>
          </div>
          <p class="temperament-spectrum-position">
            Preliminary Position: ${(score * 100).toFixed(0)}% on the spectrum
          </p>
        </div>
        <p class="panel-text">
          Now we'll explore the detailed dimensions to map your temperament expression across different contexts and relationships.
        </p>
        <button class="btn btn-primary" id="continueToPhase2">Continue to Detailed Assessment</button>
      </div>
    `);
    
    const continueBtn = document.getElementById('continueToPhase2');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.renderCurrentQuestion(); // Start Phase 2
      });
    }
    
    this.updateNavigationButtons();
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      // Calculate total progress across both phases
      const phase1Total = PHASE_1_ORIENTATION_QUESTIONS.length + 1;
      const phase2Total = this.currentPhase === 2 ? this.questionSequence.length : 
                         (Object.keys(TEMPERAMENT_DIMENSIONS || {}).reduce((sum, k) => sum + (TEMPERAMENT_DIMENSIONS[k]?.questions?.length || 0), 0) +
                          Object.keys(INTIMATE_DYNAMICS || {}).reduce((sum, k) => sum + (INTIMATE_DYNAMICS[k]?.questions?.length || 0), 0) +
                          Object.keys(ATTRACTION_RESPONSIVENESS || {}).reduce((sum, k) => sum + (ATTRACTION_RESPONSIVENESS[k]?.questions?.length || 0), 0));
      const totalQuestions = phase1Total + phase2Total;
      
      let currentProgress = 0;
      if (this.currentPhase === 1) {
        currentProgress = this.currentQuestionIndex + 1;
      } else {
        currentProgress = phase1Total + this.currentQuestionIndex + 1;
      }
      
      const progress = totalQuestions > 0 ? (currentProgress / totalQuestions) * 100 : 0;
      progressFill.style.width = `${progress}%`; // Progress bar width is dynamic, keep inline
    }
    
    const questionCount = document.getElementById('questionCount');
    if (questionCount) {
      const remaining = this.questionSequence.length - this.currentQuestionIndex;
      const phaseLabel = this.currentPhase === 1 ? ' (Orientation)' : ' (Deep Mapping)';
      questionCount.textContent = `${remaining} question${remaining !== 1 ? 's' : ''} remaining${phaseLabel}`;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentQuestionIndex === 0;
    }
    
    if (nextBtn) {
      nextBtn.textContent = this.currentQuestionIndex === this.questionSequence.length - 1 
        ? 'Complete Assessment' 
        : 'Next';
    }
  }

  nextQuestion() {
    const currentQ = this.questionSequence[this.currentQuestionIndex];
    
    // For Phase 1, ensure answer is saved
    if (this.currentPhase === 1) {
      if (this.answers[currentQ.id] === undefined) {
        if (currentQ.type === 'gender') {
          ErrorHandler.showUserError('Please select your gender to continue.');
          return;
        } else if (currentQ.options && currentQ.options.length > 0) {
          // Default to middle option if none selected
          this.answers[currentQ.id] = currentQ.options[Math.floor(currentQ.options.length / 2)];
        }
      }
    } else {
      // For Phase 2, default to 5 if slider not moved
      if (this.answers[currentQ.id] === undefined) {
        this.answers[currentQ.id] = 5;
      }
    }

    if (this.currentQuestionIndex < this.questionSequence.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
      this.saveProgress();
    } else {
      // End of current phase
      if (this.currentPhase === 1) {
        this.analyzePhase1Results().then(() => {
          this.showPhase1Feedback();
        }).catch(error => {
          this.debugReporter.logError(error, 'nextQuestion - Phase 1 completion');
        });
      } else {
        this.calculateResults();
        void this.renderResults().catch(err => {
          this.debugReporter.logError(err, 'nextQuestion → renderResults');
          ErrorHandler.showUserError('Failed to display results. Try refreshing the page.');
        });
      }
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      const currentQ = this.questionSequence[this.currentQuestionIndex];
      const slider = document.getElementById('questionSlider');
      if (slider && currentQ) {
        this.answers[currentQ.id] = parseInt(slider.value);
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

    // Calculate dimension scores (only from Phase 2 questions)
    this.analysisData.dimensionScores = {};
    
    // Group answers by dimension/category (exclude Phase 1 orientation questions)
    const dimensionGroups = {};
    
    this.questionSequence.forEach(q => {
      // Skip Phase 1 orientation questions
      if (q.id && q.id.startsWith('p1_orientation')) {
        return;
      }
      
      const groupKey = q.dimension || q.category || 'other';
      if (!dimensionGroups[groupKey]) {
        dimensionGroups[groupKey] = [];
      }
      dimensionGroups[groupKey].push({
        question: q,
        answer: this.answers[q.id] || 5
      });
    });

    // Calculate weighted scores for each dimension
    let totalMasculineScore = 0;
    let totalFeminineScore = 0;
    let totalWeight = 0;

    const genderAnswer = this.answers[GENDER_QUESTION.id];
    if (!this.analysisData.gender && genderAnswer?.value) {
      this.analysisData.gender = genderAnswer.value;
    }
    const reportedGender = this.analysisData.gender;

    const dimensionWeights = TEMPERAMENT_SCORING.dimensionWeights;
    Object.keys(dimensionGroups).forEach(groupKey => {
      const group = dimensionGroups[groupKey];
      const dimWeight = dimensionWeights[groupKey] || 1.0;
      let groupMasculine = 0;
      let groupFeminine = 0;
      let groupWeight = 0;

      group.forEach(({ question, answer }) => {
        // Normalize answer to -1 to 1 scale (0-10 becomes -1 to 1)
        const normalizedAnswer = (answer - 5) / 5;

        // Apply gender-aware selection criteria weighting
        let masculineWeight = question.masculineWeight;
        let feminineWeight = question.feminineWeight;
        if (groupKey === 'selection_criteria' && question.selectionStandard && (reportedGender === 'man' || reportedGender === 'woman')) {
          const aligns = (reportedGender === 'woman' && question.selectionStandard === 'female')
            || (reportedGender === 'man' && question.selectionStandard === 'male');
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

      this.analysisData.dimensionScores[groupKey] = {
        masculine: avgMasculine,
        feminine: avgFeminine,
        net: avgMasculine - avgFeminine
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
    const normalizedScore = Math.max(0, Math.min(1, (overallNet + 1) / 2));

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
      normalizedScore: normalizedScore,
      masculineScore: overallMasculine,
      feminineScore: overallFeminine,
      netScore: overallNet
    };

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
  
  showIntimateConsentGate() {
    const questionContainer = document.getElementById('questionContainer');
    if (!questionContainer) return;
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="transition-card panel text-center temperament-consent-card">
        <h3 class="panel-title">Intimate Dynamics Section</h3>
        <p class="panel-text">
          The next section explores intimate and attraction patterns. These questions help map how energy organizes in relational and intimate contexts. <strong>Skip any question that feels misaligned.</strong> Your responses are for pattern recognition, not judgment.
        </p>
        <div class="temperament-consent-actions">
          <button class="btn btn-primary" id="continueToIntimate">Continue</button>
          <button class="btn btn-secondary" id="skipIntimate">Skip This Section</button>
        </div>
      </div>
    `);
    
    const continueBtn = document.getElementById('continueToIntimate');
    const skipBtn = document.getElementById('skipIntimate');
    
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.analysisData.intimateConsentGiven = true;
        this.renderQuestionContent(this.questionSequence[this.currentQuestionIndex]);
        this.updateProgress();
        this.updateNavigationButtons();
      });
    }
    
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        // Skip all intimate questions
        while (this.currentQuestionIndex < this.questionSequence.length && 
               this.questionSequence[this.currentQuestionIndex].type === 'intimate') {
          this.currentQuestionIndex++;
        }
        this.analysisData.intimateConsentGiven = true;
        this.renderCurrentQuestion();
        this.updateProgress();
      });
    }
  }
  
  renderQuestionContent(question) {
    const questionContainer = document.getElementById('questionContainer');
    if (!questionContainer) return;
    
    const savedAnswer = this.answers[question.id] !== undefined ? this.answers[question.id] : 5;
    
    let categoryLabel = '';
    if (question.type === 'intimate') {
      categoryLabel = 'Intimate Dynamics';
    } else if (question.type === 'attraction') {
      categoryLabel = 'Attraction Responsiveness';
    } else {
      categoryLabel = question.dimensionSpectrumLabel || question.dimensionName || 'Behavioral Patterns';
    }
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        ${categoryLabel ? `<p class="stage-label">${SecurityUtils.sanitizeHTML(categoryLabel)}</p>` : ''}
        ${question.description ? `<p class="description temperament-description">${SecurityUtils.sanitizeHTML(question.description)}</p>` : ''}
        <h3 class="question-text">${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="scale-container">
          <div class="scale-input">
            <input type="range" min="0" max="10" value="${savedAnswer}" class="slider" id="questionSlider">
            <div class="scale-labels">
              <span>${question.poleLabels ? SecurityUtils.sanitizeHTML(question.poleLabels.low) + ' (0)' : 'Very Low / Minimal / Weak / Poor / Rare / Never (0-2)'}</span>
              <span>${question.poleLabels ? 'Balanced / Both / Mixed (5)' : 'Moderate / Somewhat / Average / Moderate / Sometimes (5-6)'}</span>
              <span>${question.poleLabels ? SecurityUtils.sanitizeHTML(question.poleLabels.high) + ' (10)' : 'Very High / Strong / Potent / Excellent / Frequent / Always (9-10)'}</span>
            </div>
          </div>
          <span class="scale-value" id="sliderValue">${savedAnswer}</span>
        </div>
        <p class="question-help">
          ${question.poleLabels ? 'Tip: Position the slider toward the pole that feels more natural or authentic to you.' : 'Tip: Rate the degree to which this pattern is present in your experience.'}
        </p>
      </div>
    `);
    
    const slider = document.getElementById('questionSlider');
    const sliderValueSpan = document.getElementById('sliderValue');
    if (slider && sliderValueSpan) {
      slider.oninput = (event) => {
        sliderValueSpan.textContent = event.target.value;
        this.answers[question.id] = parseInt(event.target.value);
        this.saveProgress();
      };
    }
    
    this.updateNavigationButtons();
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
      const genderAnswer = this.answers[GENDER_QUESTION.id];
      const genderValue = typeof genderAnswer === 'string' ? genderAnswer : genderAnswer?.value;
      if (!this.analysisData.gender && genderValue) {
        this.analysisData.gender = genderValue;
      }
      const genderLabel = (() => {
        if (!genderValue) return 'Not specified';
        const option = GENDER_QUESTION.options.find(opt => opt.value === genderValue);
        return option ? option.label : 'Not specified';
      })();
    const reportedGender = this.analysisData.gender;
    const maleTrend = EXPECTED_GENDER_TRENDS.man;
    const femaleTrend = EXPECTED_GENDER_TRENDS.woman;
    const score = typeof temperament.normalizedScore === 'number' ? temperament.normalizedScore : 0.5;

    let html = '';
    // Context sensitivity flag
    if (this.analysisData.contextSensitivity && this.analysisData.contextSensitivity.detected) {
      html += `
        <div class="info-box info-box-accent panel-brand-left">
          <p>
            <strong>Context-Responsive Temperament:</strong> ${this.analysisData.contextSensitivity.message}
          </p>
        </div>
      `;
    }

    const crossPolarityClass = (reportedGender === 'man' && score < (femaleTrend - CROSS_POLARITY_THRESHOLD)) || (reportedGender === 'woman' && score > (maleTrend + CROSS_POLARITY_THRESHOLD)) ? ' cross-polarity-notable' : '';
    html += `
      <div class="temperament-profile-card${crossPolarityClass}">
        <h2>Temperament Expression Profile</h2>
        <p class="temperament-assessment-context"><strong>Assessment context:</strong> Taken as ${SecurityUtils.sanitizeHTML(genderLabel)}.</p>
        <p class="temperament-variation-opening" style="color: var(--muted); font-size: 0.95rem; line-height: 1.65; margin: 0.75rem 0 0;">Variation across situations and life phases is normal; noticing where you lean helps you read friction and polarity with a partner—see below for how complementary poles (and similar <em>intensity</em> on opposite sides) relate to chemistry and support.</p>
        ${buildTemperamentReportEducationHtml()}
        <div class="temperament-profile-inner">
          <h3>${SecurityUtils.sanitizeHTML(interpretation.label || '')}</h3>
          <p>${SecurityUtils.sanitizeHTML(interpretation.description || '')}</p>
          
          <div class="temperament-patterns">
            <h4>Expression Patterns:</h4>
            <ul>
              ${(interpretation.characteristics || []).map(char => `<li>${SecurityUtils.sanitizeHTML(char || '')}</li>`).join('')}
            </ul>
          </div>
          
          <div class="temperament-variation-note">
            <p><strong>Note on Variation:</strong> ${SecurityUtils.sanitizeHTML(interpretation.variations || '')}</p>
          </div>
        </div>

        <div class="temperament-spectrum-container">
          <h4>Temperament Spectrum Position</h4>
          <div class="temperament-spectrum-large">
            <div class="temperament-trend-dot temperament-trend-male" style="left: ${maleTrend * 100}%;" title="Expected trend for males"></div>
            <div class="temperament-trend-dot temperament-trend-female" style="left: ${femaleTrend * 100}%;" title="Expected trend for females"></div>
            <div class="temperament-marker temperament-marker-large" style="left: ${temperament.normalizedScore * 100}%;"></div>
          </div>
          <div class="temperament-spectrum-labels">
            <span>Feminine-Leaning (0%)</span>
            <span>Balanced (50%)</span>
            <span>Masculine-Leaning (100%)</span>
          </div>
          <div class="temperament-trend-legend">
            <span><span class="temperament-trend-dot temperament-trend-male"></span> Expected trend for males</span>
            <span><span class="temperament-trend-dot temperament-trend-female"></span> Expected trend for females</span>
          </div>
          <p class="temperament-spectrum-position">
            Expression Position: ${(temperament.normalizedScore * 100).toFixed(1)}% on the spectrum
          </p>
          <p class="temperament-spectrum-context" style="color: var(--muted); font-size: 0.88rem; line-height: 1.6; margin: 0.75rem 0 0;">${SecurityUtils.sanitizeHTML(TEMPERAMENT_REPORT_SPECTRUM_NOTE)}</p>
        </div>
      </div>
    `;

    const isMaleCrossPolarity = reportedGender === 'man' && score < (femaleTrend - CROSS_POLARITY_THRESHOLD);
    const isFemaleCrossPolarity = reportedGender === 'woman' && score > (maleTrend + CROSS_POLARITY_THRESHOLD);

    // Collect anomalous (cross-polarity) dimensions for polarity failure alert
    const anomalousDimensions = [];
    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      const score = this.analysisData.dimensionScores[dimKey];
      const normalizedDimScore = (score.net + 1) / 2;
      const isDimAnomalous = (reportedGender === 'man' && normalizedDimScore < (femaleTrend - CROSS_POLARITY_THRESHOLD)) ||
                            (reportedGender === 'woman' && normalizedDimScore > (maleTrend + CROSS_POLARITY_THRESHOLD));
      if (isDimAnomalous) {
        const dimName = this.getDimensionDisplayName(dimKey);
        anomalousDimensions.push({ key: dimKey, name: dimName });
      }
    });

    // Persist for Save results / export
    this.analysisData.anomalousDimensionKeys = anomalousDimensions.map(d => d.key);
    this.analysisData.anomalousDimensionNames = anomalousDimensions.map(d => d.name);

    // Build polarity failure alert HTML (rendered below Dimension Breakdown)
    let polarityFailureAlertHtml = '';
    const hasOverallCrossPolarity = isMaleCrossPolarity || isFemaleCrossPolarity;
    if (hasOverallCrossPolarity || anomalousDimensions.length > 0) {
      const direction = (hasOverallCrossPolarity ? isMaleCrossPolarity : reportedGender === 'man')
        ? 'more feminine-leaning than typical'
        : 'more masculine-leaning than typical';
      const complement = reportedGender === 'man' ? 'masculine-leaning' : 'feminine-leaning';
      let whatMeans = '';
      if (hasOverallCrossPolarity && anomalousDimensions.length === 0) {
        whatMeans = `Your overall temperament expression is ${direction} for your gender.`;
      } else if (anomalousDimensions.length > 0) {
        whatMeans = `You express ${direction} in ${anomalousDimensions.length === 1 ? 'one dimension' : anomalousDimensions.length + ' dimensions'}: <strong>${anomalousDimensions.map(d => d.name).join(', ')}</strong>.`;
        if (hasOverallCrossPolarity) whatMeans = `Your overall expression is ${direction}. At the dimension level, this shows particularly in: <strong>${anomalousDimensions.map(d => d.name).join(', ')}</strong>.`;
      }
      const polarityConsiderationBlurb = anomalousDimensions.length > 0 ? `
          <h4 style="margin-top: 1rem; margin-bottom: 0.5rem;">What the &quot;Temperament anomaly&quot; dimensions mean</h4>
          <p>These dimensions can create a <strong>non-standard polarity dynamic</strong> or, depending on your partner, a <strong>polarity breakdown</strong>. The outcome depends on how your partner is placed:</p>
          <ul style="margin: 0.5rem 0 1rem 1.5rem;">
            <li><strong>Complementary opposite (matched intensity):</strong> Your partner leans the other way on this dimension with a <strong>similar degree of strength</strong>—the dynamic can work; polarity is restored even when both of you sit off the population average.</li>
            <li><strong>Shared polarity:</strong> Your partner occupies the same pole in this dimension with you—the relationship can still be functional but may show <strong>reduced hormonal leverage</strong> (less tension and attraction in this area).</li>
          </ul>
          <p>This is not inherently destabilizing but points to something worth investigating — often connected to trauma response, unhealed wounds, or context-dependent adaptation.</p>
          <p class="polarity-failure-ref" style="margin-bottom: 0;"><em>The dimensions highlighted above indicate where this applies.</em></p>` : '';
      polarityFailureAlertHtml = `
        <div class="polarity-failure-alert panel-brand-left">
          <h3 class="polarity-failure-alert-title">Potential Polarity Failure — Partner Fit Consideration</h3>
          <p><strong>What this means:</strong> ${whatMeans}</p>
          <p><strong>Relationship implication:</strong> Polarity—the complement between opposite poles at <strong>similar intensity</strong>—tends to support attraction and dynamic flow. If your partner does not occupy the <strong>opposite pole with enough matched strength</strong> (e.g. a ${complement} lean in these areas that is neither absent nor wildly mismatched in degree), polarity can degrade: reduced tension and attraction, or role confusion. A partner who naturally occupies the opposite pole at a fitting strength can restore polarity. This is not a verdict but an invitation to consider partner fit and intentional polarity calibration.</p>
          ${polarityConsiderationBlurb}
        </div>
      `;
    }

    // Dimension breakdown — anomalous dimensions get polarity-notable class to stand out
    html += '<div class="dimension-breakdown">';
    html += '<h3>Dimension Breakdown</h3>';
    const anomalousKeys = new Set(anomalousDimensions.map(d => d.key));
    if (anomalousKeys.size > 0) {
      html += '<p style="color: var(--muted); font-size: 0.95rem; margin: 0.5rem 0 1rem;">Dimensions marked with <strong>Temperament anomaly</strong> show a significant swing from typical gender norms; see the note below for how this can affect partner fit and what to explore.</p>';
    }

    Object.keys(this.analysisData.dimensionScores).forEach(dimKey => {
      const score = this.analysisData.dimensionScores[dimKey];
      const dimName = this.getDimensionDisplayName(dimKey);
      
      const netScore = score.net;
      const normalizedDimScore = (netScore + 1) / 2;
      const isAnomalous = anomalousKeys.has(dimKey);
      const anomalyColor = isAnomalous ? this.getAnomalySeverityColor(normalizedDimScore, reportedGender, maleTrend, femaleTrend) : null;
      const badgeHtml = isAnomalous && anomalyColor
        ? ` <span class="polarity-notable-badge" style="background:${anomalyColor};color:#fff;">Temperament anomaly</span>`
        : (isAnomalous ? ' <span class="polarity-notable-badge">Temperament anomaly</span>' : '');
      
      const selectionCriteriaNote = dimKey === 'selection_criteria' && (reportedGender === 'man' || reportedGender === 'woman')
        ? `<p style="color: var(--muted); margin: 0.35rem 0 0; font-size: 0.85rem;">Selection criteria adjusted for ${reportedGender === 'man' ? 'male' : 'female'} standards.</p>`
        : '';

      html += `
        <div class="dimension-item${isAnomalous ? ' dimension-polarity-notable' : ''}">
          <h4>${SecurityUtils.sanitizeHTML(dimName || '')}${badgeHtml}</h4>
          <div class="dimension-spectrum">
            <div class="temperament-trend-dot temperament-trend-male" style="left: ${maleTrend * 100}%;"></div>
            <div class="temperament-trend-dot temperament-trend-female" style="left: ${femaleTrend * 100}%;"></div>
            <div class="dimension-marker" style="left: ${normalizedDimScore * 100}%;"></div>
          </div>
          <p class="dimension-score-text">
            ${this.getDimensionLabel(dimKey, normalizedDimScore, reportedGender, maleTrend, femaleTrend)}
          </p>
          ${selectionCriteriaNote}
        </div>
      `;
    });
    
    html += '</div>';
    html += polarityFailureAlertHtml;

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
        currentPhase: this.currentPhase,
        currentQuestionIndex: this.currentQuestionIndex,
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
      const data = this.dataStore.load('progress');
      if (!data) return;

      this.currentPhase = data.currentPhase || 1;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.answers = data.answers || {};
      this.phase1Results = data.phase1Results || null;
      this.analysisData = data.analysisData || this.analysisData;

      // PRIORITY: If we have completed results, show report immediately on revisit
      if (this.analysisData && this.analysisData.overallTemperament) {
        await this.loadTemperamentData();
        this.ui.transition('results');
        await this.renderResults();
        return;
      }
      
      // Restore appropriate phase (in-progress only)
      if (this.currentPhase === 1) {
        await this.buildPhase1Sequence();
      } else if (this.currentPhase === 2) {
        this.phase1Results = data.phase1Results || null;
        await this.buildPhase2Sequence();
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

    if (introSection) introSection.classList.remove('hidden');
    if (actionButtonsSection) actionButtonsSection.classList.remove('hidden');
    this.setReportHeaderState(false);
    this.ui.transition('idle');
    
    this.buildPhase1Sequence();
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

