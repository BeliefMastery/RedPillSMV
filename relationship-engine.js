// Relationship Optimization Engine - Version 2.1
// Multi-Stage Progressive Analysis
// Enhanced with lazy loading, error handling, and debug reporting

import { loadDataModule, setDebugReporter } from './shared/data-loader.js';
import { createDebugReporter } from './shared/debug-reporter.js';
import { ErrorHandler, DataStore, DOMUtils, SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport } from './shared/export-utils.js';
import { EngineUIController } from './shared/engine-ui-controller.js';
import { showConfirm } from './shared/confirm-modal.js';
import {
  applyProgressSnapshotToDom,
  attachRangeTouchGuard,
  buildProgressSnapshot,
  evaluateMidAssessment,
  loadHintFlags,
  persistHintFlags,
  smoothScrollQuestionTop
} from './shared/questionnaire-ux.js';

// Data modules - will be loaded lazily
let COMPATIBILITY_POINTS, IMPACT_TIER_WEIGHTS, SCORING_THRESHOLDS, SEVERITY_TIERS;
let ACTION_STRATEGIES, ARCHETYPAL_INSIGHTS, ARCHETYPAL_PRESSURES_BY_POINT;
let STAGE_2_DOMAIN_QUESTIONS, STAGE_3_SCENARIO_QUESTIONS, RELATIONSHIP_DOMAINS;
let RELATIONSHIP_ANALYSIS_MODULES;
let VIABILITY_DIMENSIONS, getViabilityQuestions, getViabilityBand, VIABILITY_BAND_LABELS, VIABILITY_BAND_CONCLUSIONS;

/**
 * Relationship Engine - Optimizes relationship compatibility through multi-stage assessment
 */
export class RelationshipEngine {
  /**
   * Initialize the relationship engine
   */
  constructor() {
    this.currentStage = 1; // 1: Broad Assessment, 2: Domain Deep Dive, 3: Scenarios
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.questionSequence = [];
    this.weakestLinks = []; // Identified from Stage 1 (renamed to strain points in display)
    this.assessmentMode = 'both'; // 'conflict' | 'viability' | 'both' (default: full two-part flow)
    this.activePhase = 'conflict'; // when mode is 'both': 'conflict' | 'viability'
    this.viabilityScoresByDimension = {}; // filled after viability phase
    this.domainWeakAreas = {}; // Domain-specific weak areas from Stage 2
    this.crossDomainSpillover = {}; // Track cross-domain amplification
    this.stage2TransitionShown = false;
    this.stage3TransitionShown = false;
    this.groundingPauseShown = false;
    this.midAssessmentShown = false;
    this.instrumentation = {
      firstCheckpointQuestionIndex: null,
      continueFromCheckpoint: 0,
      finishFromCheckpoint: 0
    };
    this.analysisData = {
      timestamp: new Date().toISOString(),
      stage1Results: {},
      stage2Results: {},
      stage3Results: {},
      compatibilityScores: {},
      weakestLinks: [],
      actionStrategies: {},
      archetypalInsights: {},
      crossDomainSpillover: {}
    };
    this.baseSectionTitleText = null;
    this.hintStorageKey = 'relationship-assessment:ux-hints';
    this.hintFlags = loadHintFlags(this.hintStorageKey);
    this.midAssessmentShown = false;
    this.instrumentation = {
      firstCheckpointQuestionIndex: null,
      continueFromCheckpoint: 0,
      finishFromCheckpoint: 0
    };
    
    // Initialize debug reporter
    this.debugReporter = createDebugReporter('RelationshipEngine');
    setDebugReporter(this.debugReporter);
    this.debugReporter.markInitialized();
    
    // Initialize data store
    this.dataStore = new DataStore('relationship-assessment', '1.0.0');

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
   * Load relationship data modules asynchronously
   * @returns {Promise<void>}
   */
  async loadRelationshipData() {
    if (COMPATIBILITY_POINTS && RELATIONSHIP_DOMAINS && typeof getViabilityQuestions === 'function') {
      return; // Already loaded
    }

    try {
      // Load compatibility points data
      const compatibilityModule = await loadDataModule(
        './relationship-data/compatibility-points.js',
        'Compatibility Points'
      );
      COMPATIBILITY_POINTS = compatibilityModule.COMPATIBILITY_POINTS;
      IMPACT_TIER_WEIGHTS = compatibilityModule.IMPACT_TIER_WEIGHTS;
      SCORING_THRESHOLDS = compatibilityModule.SCORING_THRESHOLDS;
      SEVERITY_TIERS = compatibilityModule.SEVERITY_TIERS || [];

      // Load action strategies data
      const strategiesModule = await loadDataModule(
        './relationship-data/action-strategies.js',
        'Action Strategies'
      );
      ACTION_STRATEGIES = strategiesModule.ACTION_STRATEGIES;

      // Load archetypal insights data
      const insightsModule = await loadDataModule(
        './relationship-data/archetypal-insights.js',
        'Archetypal Insights'
      );
      ARCHETYPAL_INSIGHTS = insightsModule.ARCHETYPAL_INSIGHTS;
      ARCHETYPAL_PRESSURES_BY_POINT = insightsModule.ARCHETYPAL_PRESSURES_BY_POINT || {};

      // Load stage questions data
      const questionsModule = await loadDataModule(
        './relationship-data/stage-questions.js',
        'Stage Questions'
      );
      STAGE_2_DOMAIN_QUESTIONS = questionsModule.STAGE_2_DOMAIN_QUESTIONS;
      STAGE_3_SCENARIO_QUESTIONS = questionsModule.STAGE_3_SCENARIO_QUESTIONS;
      RELATIONSHIP_DOMAINS = questionsModule.RELATIONSHIP_DOMAINS;

      const modulesModule = await loadDataModule(
        './relationship-data/relationship-modules.js',
        'Relationship Analysis Modules'
      );
      RELATIONSHIP_ANALYSIS_MODULES = modulesModule.RELATIONSHIP_ANALYSIS_MODULES || [];

      const viabilityModule = await loadDataModule(
        './relationship-data/viability-assessment.js',
        'Viability Assessment'
      );
      VIABILITY_DIMENSIONS = viabilityModule.VIABILITY_DIMENSIONS || [];
      getViabilityQuestions = viabilityModule.getViabilityQuestions;
      getViabilityBand = viabilityModule.getViabilityBand;
      VIABILITY_BAND_LABELS = viabilityModule.VIABILITY_BAND_LABELS || {};
      VIABILITY_BAND_CONCLUSIONS = viabilityModule.VIABILITY_BAND_CONCLUSIONS || {};

      this.debugReporter.recordSection('Stage 1', Object.keys(COMPATIBILITY_POINTS || {}).length);
    } catch (error) {
      this.debugReporter.logError(error, 'loadRelationshipData');
      ErrorHandler.showUserError('Failed to load assessment data. Please refresh the page.');
      throw error;
    }
  }

  /**
   * Build Stage 1 question sequence
   * @returns {Promise<void>}
   */
  async buildStage1Sequence() {
    await this.loadRelationshipData();
    
    try {
      // Stage 1: Broad compatibility assessment (one question per compatibility point)
      this.questionSequence = [];
      this.currentStage = 1;
      
      Object.keys(COMPATIBILITY_POINTS).forEach(pointKey => {
        const point = COMPATIBILITY_POINTS[pointKey];
        
        // Use the first question as the primary assessment question
        if (point.questions && point.questions.length > 0) {
          this.questionSequence.push({
            id: `stage1_${pointKey}`,
            stage: 1,
            type: 'compatibility',
            point: pointKey,
            question: point.questions[0],
            description: point.description,
            name: point.name,
            impactTier: point.impactTier,
            weight: point.weight,
            tierWeight: IMPACT_TIER_WEIGHTS[point.impactTier] || 0.7
          });
        }
      });
      
      // Shuffle questions for a more dynamic experience
      this.questionSequence.sort(() => Math.random() - 0.5);
      
      this.debugReporter.recordQuestionCount(this.questionSequence.length);
    } catch (error) {
      this.debugReporter.logError(error, 'buildStage1Sequence');
      ErrorHandler.showUserError('Failed to build Stage 1 sequence. Please refresh the page.');
    }
  }


  showStage2Transition() {
    const container = document.getElementById('questionContainer');
    if (!container) return;
    
    this.stage2TransitionShown = true;
    
    SecurityUtils.safeInnerHTML(container, `
      <div class="transition-card panel text-center">
        <h3 class="panel-title">Transitioning to Domain Deep Dive</h3>
        <p class="panel-text">
          This stage explores expression patterns, not final causes. We're mapping how strain points manifest across relationship domains, not assigning root causes. Questions will focus on your experience: "I experience..." and "I find myself..."—not "They always..."
        </p>
        <button class="btn btn-primary" id="continueFromStage2Transition">Continue</button>
      </div>
    `);
    
    const continueBtn = document.getElementById('continueFromStage2Transition');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.renderQuestionContent(this.questionSequence[this.currentQuestionIndex]);
        this.updateProgressBar();
        this.updateNavigationButtons();
      });
    }
  }
  
  showStage3Transition() {
    const container = document.getElementById('questionContainer');
    if (!container) return;
    
    this.stage3TransitionShown = true;
    
    SecurityUtils.safeInnerHTML(container, `
      <div class="transition-card panel text-center">
        <h3 class="panel-title">Scenario-Based Reflection</h3>
        <p class="panel-text">
          <strong>As-Is Constraint:</strong> Respond as you typically do now, not how you wish you would. These scenarios focus on likely stressors rather than catastrophic situations. Be honest about your current patterns.
        </p>
        <button class="btn btn-primary" id="continueFromStage3Transition">Continue</button>
      </div>
    `);
    
    const continueBtn = document.getElementById('continueFromStage3Transition');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.renderQuestionContent(this.questionSequence[this.currentQuestionIndex]);
        this.updateProgressBar();
        this.updateNavigationButtons();
      });
    }
  }
  
  renderQuestionContent(question) {
    const questionContainer = document.getElementById('questionContainer');
    if (!questionContainer) return;
    
    const savedAnswer = this.answers[question.id] !== undefined ? this.answers[question.id] : 5;
    
    let stageLabel = '';
    if (question.stage === 1) {
      stageLabel = 'Broad Compatibility Assessment';
    } else if (question.stage === 2) {
      stageLabel = question.domainName ? `${SecurityUtils.sanitizeHTML(question.domainName)} - Deep Dive` : 'Domain-Specific Analysis';
    } else if (question.stage === 3) {
      stageLabel = 'Scenario-Based Reflection';
    }
    
    let exampleText = '';
    if (question.example) {
      exampleText = `<div class="example-box">
        <strong>Example Scenario:</strong>
        <p>${SecurityUtils.sanitizeHTML(question.example || '')}</p>
      </div>`;
    }
    
    // Sanitize dynamic content
    const sanitizedStageLabel = stageLabel ? SecurityUtils.sanitizeHTML(stageLabel) : '';
    const sanitizedName = question.name ? SecurityUtils.sanitizeHTML(question.name) : '';
    const sanitizedDescription = question.description ? SecurityUtils.sanitizeHTML(question.description) : '';
    const sanitizedQuestion = SecurityUtils.sanitizeHTML(question.question || '');
    
    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        ${sanitizedStageLabel ? `<p style="color: var(--muted); margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600;">${sanitizedStageLabel}</p>` : ''}
        ${sanitizedName ? `<h3>${sanitizedName}</h3>` : ''}
        ${sanitizedDescription ? `<p class="description">${sanitizedDescription}</p>` : ''}
        <h4>${sanitizedQuestion}</h4>
        ${exampleText}
        <div class="scale-container">
          <div class="scale-input">
            <input type="range" min="0" max="10" value="${savedAnswer}" class="slider" id="questionSlider">
            <div class="scale-labels">
              <span>Very Low / Minimal / Weak / Poor / Rare / Never (0-2)</span>
              <span>Moderate / Somewhat / Average / Moderate / Sometimes (5-6)</span>
              <span>Very High / Strong / Potent / Excellent / Frequent / Always (9-10)</span>
            </div>
          </div>
          <span class="scale-value" id="sliderValue">${savedAnswer}</span>
        </div>
        <p style="font-size: 0.9em; color: var(--muted); margin-top: 0.5rem; font-style: italic;">
          Tip: Rate your current relationship experience in this area (0 = significant problems, 10 = excellent alignment). I experience... I find myself...
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

  async buildStage2Sequence() {
      // Stage 2: Domain-specific questions for weakest links
      this.questionSequence = [];
      this.currentStage = 2;
      
      // Get domains for weakest links
    const relevantDomains = new Set();
    this.weakestLinks.forEach(link => {
      // Find which domain this compatibility point belongs to
      Object.keys(RELATIONSHIP_DOMAINS).forEach(domainKey => {
        const domain = RELATIONSHIP_DOMAINS[domainKey];
        if (domain.compatibilityPoints.includes(link.point)) {
          relevantDomains.add(domainKey);
        }
      });
    });
    
    // Add domain-specific questions for weakest links
    this.weakestLinks.forEach(link => {
      const domainQuestions = STAGE_2_DOMAIN_QUESTIONS[link.point];
      if (domainQuestions && domainQuestions.questions) {
        domainQuestions.questions.forEach(question => {
          this.questionSequence.push({
            ...question,
            stage: 2,
            domain: domainQuestions.domain,
            domainName: RELATIONSHIP_DOMAINS[domainQuestions.domain]?.name || domainQuestions.domain
          });
        });
      } else {
        // Generate generic domain questions if not explicitly defined
        const point = COMPATIBILITY_POINTS[link.point];
        if (point && point.questions && point.questions.length > 1) {
          // Use additional questions from the compatibility point as domain questions
          point.questions.slice(1).forEach((q, index) => {
            this.questionSequence.push({
              id: `domain_${link.point}_${index + 1}`,
              question: q,
              weight: 1.0 + (index * 0.1),
              compatibilityPoint: link.point,
              stage: 2,
              domain: 'generic',
              domainName: 'Deep Dive'
            });
          });
        }
      }
    });
  }

  buildStage3Sequence() {
    // Stage 3: Scenario-based roleplay questions for critical weak areas
    this.questionSequence = [];
    this.currentStage = 3;
    
    // Get top 3-5 weakest links for scenario questions
    const criticalLinks = this.weakestLinks.slice(0, 5);
    
    criticalLinks.forEach(link => {
      const scenarioQuestions = STAGE_3_SCENARIO_QUESTIONS[link.point];
      if (scenarioQuestions) {
        scenarioQuestions.forEach(question => {
          this.questionSequence.push({
            ...question,
            stage: 3,
            point: link.point
          });
        });
      } else {
        // Generate generic scenario questions if not explicitly defined
        const point = COMPATIBILITY_POINTS[link.point];
        if (point) {
          // Create scenario questions based on the compatibility point
          this.questionSequence.push({
            id: `scenario_${link.point}_1`,
            question: `Envision a situation where ${point.name.toLowerCase()} becomes a significant issue in your relationship. How do you imagine you would feel, and what would you need from your partner?`,
            weight: 1.0,
            compatibilityPoint: link.point,
            stage: 3,
            type: 'scenario',
            example: `Example: A real situation where ${SecurityUtils.sanitizeHTML(point.name || '').toLowerCase()} created tension or conflict in your relationship.`
          });
          
          this.questionSequence.push({
            id: `scenario_${link.point}_2`,
            question: `Imagine your partner's response to a ${SecurityUtils.sanitizeHTML(point.name || '').toLowerCase()} issue feels dismissive, unsupportive, or creates conflict. What would help restore connection and understanding?`,
            weight: 1.0,
            compatibilityPoint: link.point,
            stage: 3,
            type: 'scenario',
            example: `Example: Your partner's approach to ${SecurityUtils.sanitizeHTML(point.name || '').toLowerCase()} differs significantly from yours, and it's causing ongoing friction.`
          });
        }
      }
    });
  }

  /**
   * After Part 1 (no Stage 2/3) with mode "both", continue to viability questions.
   * @returns {Promise<void>}
   */
  async transitionToViabilityPhase() {
    try {
      await this.buildViabilitySequence();
      this.activePhase = 'viability';
      this.currentQuestionIndex = 0;
      this.renderCurrentQuestion();
      this.updateProgressBar();
      this.updateStageIndicator();
      this.saveProgress();
    } catch (error) {
      this.debugReporter.logError(error, 'transitionToViabilityPhase');
      this.finalizeResults();
    }
  }

  async buildViabilitySequence() {
    await this.loadRelationshipData();
    if (typeof getViabilityQuestions !== 'function') {
      this.questionSequence = [];
      return;
    }
    const list = getViabilityQuestions();
    this.questionSequence = list.map(q => ({
      id: q.id,
      question: q.question,
      scaleLabelLow: q.scaleLabelLow,
      scaleLabelHigh: q.scaleLabelHigh,
      dimensionId: q.dimensionId,
      dimensionName: q.dimensionName,
      phase: 'viability'
    }));
    this.currentStage = 1;
  }

  attachEventListeners() {
    const startBtn = document.getElementById('startAssessment');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startAssessment();
      });
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

    const sampleBtn = document.getElementById('generateSampleReport');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.generateSampleReport());
    }

    const abandonBtn = document.getElementById('abandonAssessment');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', () => this.abandonAssessment());
    }
  }

  shouldAutoGenerateSample() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('sample')) return false;
    const value = params.get('sample');
    if (value === null || value === '' || value === '1' || value === 'true') return true;
    return false;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async generateSampleReport() {
    try {
      await this.loadRelationshipData();
      this.dataStore.clear('progress');
      this.resetAssessmentState();

      await this.buildStage1Sequence();
      this.questionSequence.forEach(q => {
        this.answers[q.id] = this.getRandomInt(0, 10);
      });
      await this.analyzeStage1Results();

      if (this.weakestLinks.length === 0 && Object.keys(this.analysisData.compatibilityScores || {}).length > 0) {
        const fallbackLinks = Object.entries(this.analysisData.compatibilityScores)
          .map(([key, data]) => ({ key, ...data }))
          .sort((a, b) => a.weightedScore - b.weightedScore)
          .slice(0, 3);
        this.weakestLinks = fallbackLinks.map(item => ({
          point: item.key,
          ...item,
          score: item.rawScore
        }));
      }

      if (this.weakestLinks.length > 0) {
        await this.buildStage2Sequence();
        this.questionSequence.forEach(q => {
          this.answers[q.id] = this.getRandomInt(0, 10);
        });
        this.analyzeStage2Results();

        this.buildStage3Sequence();
        this.questionSequence.forEach(q => {
          this.answers[q.id] = this.getRandomInt(0, 10);
        });
        this.analyzeStage3Results();
      }

      this.assessmentMode = 'both';
      await this.buildViabilitySequence();
      this.questionSequence.forEach(q => {
        this.answers[q.id] = this.getRandomInt(0, 10);
      });
      this.computeViabilityScores();

      this.finalizeResults();
    } catch (error) {
      this.debugReporter.logError(error, 'generateSampleReport');
      ErrorHandler.showUserError('Failed to generate sample report. Please try again.');
    }
  }

  async abandonAssessment() {
    if (await showConfirm('Are you sure you want to abandon this assessment? All progress will be lost and you will need to start from the beginning.')) {
      this.resetAssessment();
    }
  }

  resetAssessmentState() {
    this.currentStage = 1;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.questionSequence = [];
    this.weakestLinks = [];
    this.domainWeakAreas = {};
    this.crossDomainSpillover = {};
    this.stage2TransitionShown = false;
    this.stage3TransitionShown = false;
    this.groundingPauseShown = false;
    this.analysisData = {
      timestamp: new Date().toISOString(),
      stage1Results: {},
      stage2Results: {},
      stage3Results: {},
      compatibilityScores: {},
      weakestLinks: [],
      actionStrategies: {},
      archetypalInsights: {},
      crossDomainSpillover: {}
    };
  }

  setLandingVisibility(showLanding) {
    if (showLanding) {
      this.ui.transition('idle');
    } else {
      this.ui.transition('assessment');
    }
  }

  /**
   * Start the assessment
   * @returns {Promise<void>}
   */
  async startAssessment() {
    try {
      await this.loadRelationshipData();

      this.assessmentMode = 'both';
      this.activePhase = 'conflict';

      this.dataStore.clear('progress');
      this.resetAssessmentState();

      if (this.assessmentMode === 'viability') {
        await this.buildViabilitySequence();
      } else {
        await this.buildStage1Sequence();
      }

      this.setLandingVisibility(false);
      this.setReportHeaderState(false);

      const questionnaireSection = document.getElementById('questionnaireSection');
      const resultsSection = document.getElementById('resultsSection');
      if (questionnaireSection) questionnaireSection.classList.add('active');
      if (resultsSection) resultsSection.classList.remove('active');

      this.currentQuestionIndex = 0;
      this.renderCurrentQuestion();
      this.updateProgressBar();
      this.updateStageIndicator();
      this.saveProgress();
    } catch (error) {
      this.debugReporter.logError(error, 'startAssessment');
      ErrorHandler.showUserError('Failed to start assessment. Please try again.');
    }
  }

  renderCurrentQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');

    if (!questionContainer || !prevBtn || !nextBtn) return;

    if (this.currentQuestionIndex >= this.questionSequence.length) {
      this.completeStage();
      return;
    }

    const currentQ = this.questionSequence[this.currentQuestionIndex];
    const isViability = currentQ.phase === 'viability';

    // Check for stage transitions (conflict assessment only)
    if (!isViability && currentQ.stage === 2 && !this.stage2TransitionShown) {
      // Count how many Stage 1 questions there are
      const stage1Count = this.questionSequence.filter(q => q.stage === 1).length;
      // If we're at the index right after all Stage 1 questions, show transition
      if (this.currentQuestionIndex === stage1Count) {
        this.showStage2Transition();
        return;
      }
    }
    
    if (!isViability && currentQ.stage === 3 && !this.stage3TransitionShown) {
      // Count Stage 1 and Stage 2 questions
      const stage1Count = this.questionSequence.filter(q => q.stage === 1).length;
      const stage2Count = this.questionSequence.filter(q => q.stage === 2).length;
      // If we're at the index right after all Stage 1 and Stage 2 questions, show transition
      if (this.currentQuestionIndex === stage1Count + stage2Count) {
        this.showStage3Transition();
        return;
      }
    }
    
    const savedAnswer = this.answers[currentQ.id] !== undefined ? this.answers[currentQ.id] : 5; // Default to 5

    let stageLabel = '';
    if (isViability) {
      stageLabel = currentQ.dimensionName ? `Relationship Viability — ${SecurityUtils.sanitizeHTML(currentQ.dimensionName)}` : 'Relationship Viability Evaluation';
    } else if (currentQ.stage === 1) {
      stageLabel = 'Broad Compatibility Assessment';
    } else if (currentQ.stage === 2) {
      stageLabel = currentQ.domainName ? `${SecurityUtils.sanitizeHTML(currentQ.domainName)} - Deep Dive` : 'Domain-Specific Analysis';
    } else if (currentQ.stage === 3) {
      stageLabel = 'Scenario-Based Reflection';
    }

    const scaleLow = isViability && currentQ.scaleLabelLow ? SecurityUtils.sanitizeHTML(currentQ.scaleLabelLow) : 'Very Low / Minimal (0-2)';
    const scaleHigh = isViability && currentQ.scaleLabelHigh ? SecurityUtils.sanitizeHTML(currentQ.scaleLabelHigh) : 'Very High / Strong (9-10)';
    const scaleMid = 'Moderate (5-6)';

    let exampleText = '';
    if (currentQ.example) {
      exampleText = `<div style="margin-top: 1rem; padding: 1rem; background: rgba(0, 123, 255, 0.1); border-left: 4px solid var(--brand); border-radius: var(--radius);">
        <strong style="color: var(--brand);">Example Scenario:</strong>
        <p style="margin-top: 0.5rem; color: var(--muted); font-style: italic;">${SecurityUtils.sanitizeHTML(currentQ.example || '')}</p>
      </div>`;
    }
    
    // Sanitize dynamic content
    const sanitizedStageLabel2 = stageLabel ? SecurityUtils.sanitizeHTML(stageLabel) : '';
    const sanitizedName2 = currentQ.name ? SecurityUtils.sanitizeHTML(currentQ.name) : '';
    const sanitizedDescription2 = currentQ.description ? SecurityUtils.sanitizeHTML(currentQ.description) : '';
    const sanitizedQuestion2 = SecurityUtils.sanitizeHTML(currentQ.question || '');
    const tipText = isViability
      ? 'Rate how true this is for your relationship (0 = not at all, 10 = fully).'
      : 'Rate your current relationship experience in this area (0 = significant problems, 10 = excellent alignment). I experience... I find myself...';
    const showSliderHint = !this.hintFlags.hasSeenSliderHint;

    SecurityUtils.safeInnerHTML(questionContainer, `
      <div class="question-block">
        ${sanitizedStageLabel2 ? `<p class="stage-label">${sanitizedStageLabel2}</p>` : ''}
        ${sanitizedName2 ? `<h3>${sanitizedName2}</h3>` : ''}
        ${sanitizedDescription2 ? `<p class="description">${sanitizedDescription2}</p>` : ''}
        <h4>${sanitizedQuestion2}</h4>
        ${exampleText}
        <div class="scale-container">
          <div class="scale-input">
            <input type="range" min="0" max="10" value="${savedAnswer}" class="slider" id="questionSlider">
            <div class="scale-labels">
              <span>${scaleLow}</span>
              <span>${scaleMid}</span>
              <span>${scaleHigh}</span>
            </div>
          </div>
          <span class="scale-value" id="sliderValue">${savedAnswer}</span>
        </div>
        ${showSliderHint ? `<details class="question-help-toggle" open>
          <summary>How to use this slider</summary>
          <p style="font-size: 0.9em; color: var(--muted); margin-top: 0.5rem; font-style: italic;">
            ${SecurityUtils.sanitizeHTML(tipText)}
          </p>
        </details>` : ''}
      </div>
    `);

    const slider = document.getElementById('questionSlider');
    const sliderValueSpan = document.getElementById('sliderValue');
    if (slider && sliderValueSpan) {
      attachRangeTouchGuard(slider);
      slider.oninput = (event) => {
        sliderValueSpan.textContent = event.target.value;
        this.answers[currentQ.id] = parseInt(event.target.value);
        if (!this.hintFlags.hasSeenSliderHint) {
          this.hintFlags.hasSeenSliderHint = true;
          persistHintFlags(this.hintStorageKey, this.hintFlags);
          const toggle = questionContainer.querySelector('.question-help-toggle');
          if (toggle) toggle.remove();
        }
        this.saveProgress();
      };
    }

    setTimeout(() => smoothScrollQuestionTop('questionContainer'), 100);
    
    prevBtn.disabled = this.currentQuestionIndex === 0;
    nextBtn.textContent = this.currentQuestionIndex === this.questionSequence.length - 1 ? 'Finish Assessment' : 'Next';
  }

  nextQuestion() {
    const currentQ = this.questionSequence[this.currentQuestionIndex];
    if (this.answers[currentQ.id] === undefined) {
      this.answers[currentQ.id] = 5; // Auto-save default if not touched
    }

    if (this.currentQuestionIndex < this.questionSequence.length - 1) {
      if (this.maybeShowMidAssessmentCheckpoint()) return;
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
      this.updateProgressBar();
      this.saveProgress();
    } else {
      this.completeStage();
    }
  }

  completeStage() {
    if (this.activePhase === 'viability') {
      this.computeViabilityScores();
      this.finalizeResults();
      return;
    }
    if (this.currentStage === 1) {
      // Analyze Stage 1 results and identify weakest links
      this.analyzeStage1Results();
      
      if (this.weakestLinks.length > 0) {
        // Move to Stage 2
        this.buildStage2Sequence();
        this.currentQuestionIndex = 0;
        this.renderCurrentQuestion();
        this.updateProgressBar();
        this.updateStageIndicator();
        return;
      } else {
        if (this.assessmentMode === 'both') {
          void this.transitionToViabilityPhase();
          return;
        }
        this.finalizeResults();
        return;
      }
    } else if (this.currentStage === 2) {
      // Analyze Stage 2 results
      this.analyzeStage2Results();
      
      // Move to Stage 3 for critical areas
      if (this.weakestLinks.length > 0) {
        this.buildStage3Sequence();
        if (this.questionSequence.length > 0) {
          this.currentQuestionIndex = 0;
          this.renderCurrentQuestion();
          this.updateProgressBar();
          this.updateStageIndicator();
          return;
        }
      }
      
      // No Stage 3 questions or complete, show results
      this.finalizeResults();
      return;
    } else if (this.currentStage === 3) {
      // Stage 3 complete, show grounding pause
      this.analyzeStage3Results();
      if (!this.groundingPauseShown) {
        this.showGroundingPause();
        return;
      }
      this.finalizeResults();
      return;
    }
  }

  showGroundingPause() {
    const container = document.getElementById('questionContainer');
    if (!container) {
      this.finalizeResults();
      return;
    }
    this.groundingPauseShown = true;

    if (this.assessmentMode === 'both') {
      SecurityUtils.safeInnerHTML(container, `
        <div style="padding: 2.5rem; text-align: center; background: rgba(255, 255, 255, 0.95); border-radius: var(--radius); box-shadow: var(--shadow);">
          <h3 style="color: var(--brand); margin-bottom: 1.5rem; font-size: 1.5rem;">Points of Conflict complete</h3>
          <p style="color: var(--muted); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem;">Now: Relationship Viability Evaluation — the six key considerations that inform whether investing in resolution is worth it.</p>
          <button class="btn btn-primary" id="continueToViability" style="min-width: 200px;">Continue to Viability Evaluation</button>
        </div>
      `);
      const btn = document.getElementById('continueToViability');
      if (btn) {
        btn.addEventListener('click', async () => {
          await this.buildViabilitySequence();
          this.activePhase = 'viability';
          this.currentQuestionIndex = 0;
          this.renderCurrentQuestion();
          this.updateProgressBar();
          this.updateStageIndicator();
          this.saveProgress();
        });
      } else {
        this.finalizeResults();
      }
      return;
    }

    SecurityUtils.safeInnerHTML(container, `
      <div style="padding: 2.5rem; text-align: center; background: rgba(255, 255, 255, 0.95); border-radius: var(--radius); box-shadow: var(--shadow);">
        <h3 style="color: var(--brand); margin-bottom: 1.5rem; font-size: 1.5rem;">Assessment Complete</h3>
        <p style="color: var(--muted); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem;">Your analysis is ready.</p>
        <button class="btn btn-primary" id="continueToResults" style="min-width: 150px;">View Results</button>
      </div>
    `);
    const continueBtn = document.getElementById('continueToResults');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.finalizeResults());
    } else {
      setTimeout(() => this.finalizeResults(), 100);
    }
  }

  computeViabilityScores() {
    if (!VIABILITY_DIMENSIONS || !Array.isArray(VIABILITY_DIMENSIONS)) {
      this.viabilityScoresByDimension = {};
      return;
    }
    const byDim = {};
    VIABILITY_DIMENSIONS.forEach(dim => {
      const vals = (dim.questions || [])
        .map(q => this.answers[q.id])
        .filter(v => typeof v === 'number');
      byDim[dim.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });
    this.viabilityScoresByDimension = byDim;
  }

  /**
   * Analyze Stage 1 results and proceed to Stage 2
   * @returns {Promise<void>}
   */
  async analyzeStage1Results() {
    await this.loadRelationshipData();
    
    try {
    // Calculate compatibility scores from Stage 1
    this.analysisData.stage1Results = {};
    
    Object.keys(COMPATIBILITY_POINTS).forEach(pointKey => {
      const point = COMPATIBILITY_POINTS[pointKey];
      const answerId = `stage1_${pointKey}`;
      const rawScore = this.answers[answerId] !== undefined ? this.answers[answerId] : 0;
      const tierWeight = IMPACT_TIER_WEIGHTS[point.impactTier] || 0.7;
      const weightedScore = rawScore * tierWeight * point.weight;

      this.analysisData.stage1Results[pointKey] = {
        name: point.name,
        rawScore: rawScore,
        weightedScore: weightedScore,
        impactTier: point.impactTier,
        tierWeight: tierWeight,
        priority: this.getPriorityLevel(rawScore, weightedScore),
        severity: this.getSeverityLevel(rawScore)
      };
    });

    // Identify current strain points (lowest weighted scores)
    const sortedPoints = Object.entries(this.analysisData.stage1Results)
      .map(([key, data]) => {
        return {
          point: key,
          ...data
        };
      })
      .sort((a, b) => a.weightedScore - b.weightedScore);
    
      // Top 5-7 current strain points
      this.weakestLinks = sortedPoints.slice(0, 7);
      
      // Build Stage 2 sequence if there are weak areas
      if (this.weakestLinks.length > 0) {
        await this.buildStage2Sequence();
      }
    } catch (error) {
      this.debugReporter.logError(error, 'analyzeStage1Results');
      ErrorHandler.showUserError('Failed to analyze Stage 1 results. Please try again.');
    }
  }
  
  /**
   * Build Stage 2 question sequence
   * @returns {Promise<void>}
   */
  async buildStage2Sequence() {
    await this.loadRelationshipData();
    
    try {
      // Stage 2: Domain-specific questions for weakest links
      this.questionSequence = [];
      this.currentStage = 2;
      
      // Get domains for weakest links
      const relevantDomains = new Set();
      this.weakestLinks.forEach(link => {
        // Find which domain this compatibility point belongs to
        Object.keys(RELATIONSHIP_DOMAINS).forEach(domainKey => {
          const domain = RELATIONSHIP_DOMAINS[domainKey];
          if (domain.compatibilityPoints.includes(link.point)) {
            relevantDomains.add(domainKey);
          }
        });
      });
      
      // Add domain-specific questions for weakest links
      this.weakestLinks.forEach(link => {
        const domainQuestions = STAGE_2_DOMAIN_QUESTIONS[link.point];
        if (domainQuestions && domainQuestions.questions) {
          domainQuestions.questions.forEach(question => {
            this.questionSequence.push({
              id: question.id || `stage2_${link.point}_${this.questionSequence.length + 1}`,
              question: question.question,
              weight: question.weight || 1.0,
              compatibilityPoint: link.point,
              stage: 2,
              domain: question.domain || 'generic',
              domainName: question.domainName || RELATIONSHIP_DOMAINS[question.domain]?.name || 'Deep Dive'
            });
          });
        } else {
          // Fallback: use questions from compatibility point if available
          const point = COMPATIBILITY_POINTS[link.point];
          if (point && point.questions && point.questions.length > 1) {
            // Use additional questions from the compatibility point as domain questions
            point.questions.slice(1).forEach((q, index) => {
              this.questionSequence.push({
                id: `domain_${link.point}_${index + 1}`,
                question: q,
                weight: 1.0 + (index * 0.1),
                compatibilityPoint: link.point,
                stage: 2,
                domain: 'generic',
                domainName: 'Deep Dive'
              });
            });
          }
        }
      });
    } catch (error) {
      this.debugReporter.logError(error, 'buildStage2Sequence');
      ErrorHandler.showUserError('Failed to build Stage 2 sequence. Please try again.');
    }
  }

  analyzeStage2Results() {
    // Analyze domain-specific answers
    this.analysisData.stage2Results = {};
    this.domainWeakAreas = {};
    
    // Group answers by domain and compatibility point
    const domainScores = {};
    
    this.questionSequence
      .filter(q => q.stage === 2)
      .forEach(q => {
        if (!domainScores[q.domain]) {
          domainScores[q.domain] = {};
        }
        if (!domainScores[q.domain][q.compatibilityPoint]) {
          domainScores[q.domain][q.compatibilityPoint] = [];
        }
        
        if (this.answers[q.id] !== undefined) {
          domainScores[q.domain][q.compatibilityPoint].push({
            answer: this.answers[q.id],
            weight: q.weight
          });
        }
      });
    
    // Calculate domain scores
    Object.keys(domainScores).forEach(domainKey => {
      const domain = domainScores[domainKey];
      Object.keys(domain).forEach(pointKey => {
        const answers = domain[pointKey];
        let totalScore = 0;
        let totalWeight = 0;
        
        answers.forEach(a => {
          totalScore += a.answer * a.weight;
          totalWeight += a.weight;
        });
        
        const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        
        if (!this.analysisData.stage2Results[domainKey]) {
          this.analysisData.stage2Results[domainKey] = {};
        }
        
        this.analysisData.stage2Results[domainKey][pointKey] = {
          score: averageScore,
          questionCount: answers.length
        };
        
        // Track weak areas (score < 5)
        if (averageScore < 5) {
          if (!this.domainWeakAreas[domainKey]) {
            this.domainWeakAreas[domainKey] = [];
          }
          this.domainWeakAreas[domainKey].push(pointKey);
        }
      });
    });
    
    // Track cross-domain spillover
    this.detectCrossDomainSpillover(domainScores);
  }
  
  detectCrossDomainSpillover(domainScores) {
    // Identify when multiple domains show low scores (cross-domain amplification)
    const lowScoreDomains = [];
    Object.keys(domainScores).forEach(domainKey => {
      const domain = domainScores[domainKey];
      let totalScore = 0;
      let count = 0;
      Object.values(domain).forEach(pointScores => {
        pointScores.forEach(score => {
          totalScore += score.answer;
          count++;
        });
      });
      const avgScore = count > 0 ? totalScore / count : 10;
      if (avgScore < 5) {
        lowScoreDomains.push({ domain: domainKey, score: avgScore });
      }
    });
    
    if (lowScoreDomains.length >= 2) {
      this.crossDomainSpillover = {
        detected: true,
        domains: lowScoreDomains.map(d => d.domain),
        message: `Cross-domain amplification detected: ${lowScoreDomains.map(d => SecurityUtils.sanitizeHTML(RELATIONSHIP_DOMAINS[d.domain]?.name || (d.domain === 'generic' ? 'Deep Dive' : d.domain))).join(' and ')} both show strain. This suggests systemic patterns rather than isolated issues.`
      };
      this.analysisData.crossDomainSpillover = this.crossDomainSpillover;
    } else {
      this.crossDomainSpillover = { detected: false };
    }
  }

  analyzeStage3Results() {
    // Store Stage 3 scenario insights
    this.analysisData.stage3Results = {};
    
    this.weakestLinks.forEach(link => {
      const scenarioAnswers = {};
      this.questionSequence
        .filter(q => q.stage === 3 && q.point === link.point)
        .forEach(q => {
          if (this.answers[q.id] !== undefined) {
            scenarioAnswers[q.id] = {
              question: q.question,
              example: q.example,
              answer: this.answers[q.id]
            };
          }
        });
      
      if (Object.keys(scenarioAnswers).length > 0) {
        this.analysisData.stage3Results[link.point] = scenarioAnswers;
      }
    });
  }

  finalizeResults() {
    if (this.assessmentMode !== 'viability') {
      this.calculateResults();
    }
    if (this.assessmentMode === 'viability' || this.assessmentMode === 'both') {
      this.analysisData.viabilityScoresByDimension = this.viabilityScoresByDimension || {};
      this.analysisData.viabilityBand = typeof getViabilityBand === 'function' ? getViabilityBand(this.viabilityScoresByDimension) : null;
      this.analysisData.assessmentMode = this.assessmentMode;
    }
    this.analysisData.allAnswers = { ...this.answers };
    this.analysisData.questionSequence = [];
    if (this.assessmentMode === 'viability' || this.activePhase === 'viability') {
      (this.questionSequence || []).forEach(q => {
        this.analysisData.questionSequence.push({
          id: q.id,
          question: q.question,
          phase: 'viability',
          dimensionId: q.dimensionId,
          dimensionName: q.dimensionName
        });
      });
    }
    [1, 2, 3].forEach(stage => {
      const stageQuestions = (this.questionSequence || []).filter(q => q.stage === stage);
      stageQuestions.forEach(q => {
        this.analysisData.questionSequence.push({
          id: q.id,
          question: q.question,
          stage: q.stage,
          point: q.point,
          domain: q.domain,
          name: q.name
        });
      });
    });
    this.renderResults();
    this.saveProgress();
  }

  updateStageIndicator() {
    const stageIndicator = document.getElementById('stageIndicator');
    if (stageIndicator) {
      if (this.activePhase === 'viability') {
        stageIndicator.textContent = 'Relationship Viability Evaluation';
        return;
      }
      const stageNames = {
        1: 'Stage 1: Broad Compatibility Assessment',
        2: 'Stage 2: Domain-Specific Deep Dive',
        3: 'Stage 3: Scenario-Based Reflection'
      };
      stageIndicator.textContent = stageNames[this.currentStage] || '';
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      // Save current answer before navigating back
      const currentQ = this.questionSequence[this.currentQuestionIndex];
      const slider = document.getElementById('questionSlider');
      if (slider && currentQ) {
        this.answers[currentQ.id] = parseInt(slider.value);
      }
      
      this.currentQuestionIndex--;
      this.renderCurrentQuestion();
      this.updateProgressBar();
      this.saveProgress();
    }
  }

  updateProgressBar() {
    const total = this.questionSequence.length || 1;
    const snapshot = buildProgressSnapshot({
      phaseIndex: this.activePhase === 'viability' ? 2 : 1,
      phaseTotal: this.assessmentMode === 'both' ? 2 : 1,
      questionIndexInPhase: this.currentQuestionIndex + 1,
      questionTotalInPhase: total,
      overallQuestionIndex: this.currentQuestionIndex + 1,
      overallQuestionTotal: total
    });
    applyProgressSnapshotToDom({
      snapshot,
      progressBarId: 'progressBarFill',
      phaseLabelId: 'phaseCounter',
      questionLabelId: 'questionCounter'
    });
  }

  maybeShowMidAssessmentCheckpoint() {
    if (this.midAssessmentShown) return false;
    const answeredCount = Object.keys(this.answers || {}).length;
    const scoreMap = {};
    Object.entries(this.answers || {}).forEach(([key, value]) => {
      scoreMap[key] = Number(value) || 0;
    });
    const evaluation = evaluateMidAssessment({
      scoreMap,
      answeredCount,
      minimumAnswers: 6,
      confidenceGap: 0.08
    });
    if (!evaluation.ready || !evaluation.definitive) return false;
    this.midAssessmentShown = true;
    if (this.instrumentation.firstCheckpointQuestionIndex == null) {
      this.instrumentation.firstCheckpointQuestionIndex = this.currentQuestionIndex + 1;
    }
    const container = document.getElementById('questionContainer');
    if (!container) return false;
    SecurityUtils.safeInnerHTML(container, `
      <div class="transition-card panel text-center">
        <h3 class="panel-title">Mid-assessment relationship signal</h3>
        <p class="panel-text">
          We already have a strong early read on your relationship dynamics. Continue to refine the areas that can customize your guidance.
        </p>
        <div class="action-buttons">
          <button class="btn btn-primary" id="continueFromRelationshipCheckpoint">Continue to refine</button>
          <button class="btn btn-secondary" id="finishRelationshipCheckpoint">Finish with current snapshot</button>
        </div>
      </div>
    `);
    const continueBtn = document.getElementById('continueFromRelationshipCheckpoint');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.instrumentation.continueFromCheckpoint += 1;
        this.renderCurrentQuestion();
      });
    }
    const finishBtn = document.getElementById('finishRelationshipCheckpoint');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.instrumentation.finishFromCheckpoint += 1;
        this.completeStage();
      });
    }
    this.saveProgress();
    return true;
  }

  calculateResults() {
    // Use stage 1 results as base compatibility scores
    this.analysisData.compatibilityScores = this.analysisData.stage1Results || {};
    
    // Build final weakest links list with strategies (include stateLabel and rangeStr for report/export)
    this.analysisData.weakestLinks = this.weakestLinks.map(link => {
      const tier = this.getSeverityTier(link.rawScore);
      return {
        point: link.point,
        name: link.name,
        rawScore: link.rawScore,
        weightedScore: link.weightedScore,
        impactTier: link.impactTier,
        priority: link.priority,
        severity: link.severity,
        stateLabel: this.getStrainStateLabel(link.severity),
        rangeStr: tier ? `${tier.minScore}–${tier.maxScore}` : '',
        strategies: this.getActionStrategies(link.point, link.rawScore)
      };
    });

    // Generate archetypal insights for weakest links
    this.analysisData.archetypalInsights = this.generateArchetypalInsights();
  }

  /** Paywall hook: when IAP is integrated, check Capacitor billing for "Unlock Full Diagnostic Data". Until then, always true. */
  hasUnlockedPaidReports() {
    return true;
  }

  getPriorityLevel(rawScore, weightedScore) {
    if (rawScore <= SCORING_THRESHOLDS.critical) return 'Critical';
    if (rawScore <= SCORING_THRESHOLDS.weakestLink) return 'High';
    if (rawScore <= SCORING_THRESHOLDS.moderate) return 'Moderate';
    return 'Low';
  }

  getSeverityLevel(rawScore) {
    const tier = this.getSeverityTier(rawScore);
    return tier ? tier.id : 'Minimal';
  }

  /** Full tier object for the given raw score (0–10). Used for state label and value range. */
  getSeverityTier(rawScore) {
    const tiers = SEVERITY_TIERS || [];
    const score = typeof rawScore === 'number' ? rawScore : 0;
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (score >= t.minScore && score <= t.maxScore) return t;
    }
    return tiers.length > 0 ? tiers[tiers.length - 1] : null;
  }

  /** User-facing state label for report header (from SEVERITY_TIERS). */
  getStrainStateLabel(severity) {
    const tiers = SEVERITY_TIERS || [];
    const tier = tiers.find(t => t.id === severity);
    return tier ? tier.stateLabel : severity || '';
  }

  /** Whether this severity tier counts as critical for terminal caveat and styling. */
  severityCountsAsCritical(severity) {
    const tiers = SEVERITY_TIERS || [];
    const tier = tiers.find(t => t.id === severity);
    return tier ? !!tier.countsAsCritical : severity === 'Critical';
  }

  getActionStrategies(pointKey, rawScore) {
    const strategies = ACTION_STRATEGIES[pointKey] || ACTION_STRATEGIES.generic;
    const severity = this.getSeverityLevel(rawScore);
    
    return {
      immediate: strategies.immediate || [],
      structural: strategies.structural || [],
      archetypal: strategies.archetypal || [],
      severity: severity
    };
  }

  generateArchetypalInsights() {
    const insights = {
      vulnerability: ARCHETYPAL_INSIGHTS.vulnerability.description,
      biologicalEssentialism: ARCHETYPAL_INSIGHTS.biologicalEssentialism.description,
      polarity: ARCHETYPAL_INSIGHTS.polarity.description,
      statusSelectionAttraction: ARCHETYPAL_INSIGHTS.statusSelectionAttraction.description,
      resentment: ARCHETYPAL_INSIGHTS.resentment.description
    };

    // Add specific insights for weakest links
    this.analysisData.weakestLinks.forEach(link => {
      const point = COMPATIBILITY_POINTS[link.point];
      if (ARCHETYPAL_INSIGHTS.biologicalEssentialism.compatibilityPoints[link.point]) {
        insights[link.point] = ARCHETYPAL_INSIGHTS.biologicalEssentialism.compatibilityPoints[link.point];
      }
    });

    return insights;
  }

  getViabilityLevel(score) {
    if (score == null || Number.isNaN(Number(score))) return 'Unavailable';
    if (score < 4) return 'Low';
    if (score <= 6) return 'Medium';
    return 'High';
  }

  getViabilitySummaryMeta(scores = {}) {
    const band = typeof getViabilityBand === 'function' ? getViabilityBand(scores) : null;
    const conclusionData = band && VIABILITY_BAND_CONCLUSIONS ? VIABILITY_BAND_CONCLUSIONS[band] : null;
    const dimensionSummaries = (VIABILITY_DIMENSIONS || []).map(dim => {
      const score = scores[dim.id];
      return {
        id: dim.id,
        name: dim.name || '',
        score: typeof score === 'number' ? score : null,
        level: this.getViabilityLevel(score)
      };
    });
    const rankedRisks = dimensionSummaries
      .filter(dim => dim.score != null)
      .sort((a, b) => a.score - b.score);
    const primaryRisks = rankedRisks.filter(dim => dim.level === 'Low').slice(0, 2);
    const watchRisks = rankedRisks.filter(dim => dim.level === 'Medium').slice(0, 2);
    const riskSet = primaryRisks.length ? primaryRisks : watchRisks;
    const riskText = riskSet.length
      ? `Primary pressure appears in ${riskSet.map(dim => SecurityUtils.sanitizeHTML(dim.name)).join(' and ')}.`
      : 'No single dominant gap stands out; focus on consistency and follow-through across all dimensions.';

    let nextAction = 'Choose one shared experiment, define clear boundaries, and reassess based on consistent behavior over time.';
    if (band === 'consider_stepping_away' || band === 'step_away') {
      nextAction = 'Protect your boundaries, reduce over-investment, and make a clear decision timeline instead of prolonged ambiguity.';
    } else if (band === 'invest_with_caution' || band === 'cautious_investment') {
      nextAction = 'Pick one high-friction pattern, agree on concrete behavior changes, and evaluate whether both partners follow through.';
    } else if (band === 'invest_in_resolution' || band === 'strong_potential') {
      nextAction = 'Keep investing in repair habits and shared direction so current strengths become stable patterns.';
    }

    return {
      band,
      conclusionData,
      dimensionSummaries,
      riskText,
      nextAction
    };
  }

  /**
   * @param {{ embedInPart2?: boolean }} opts - When true (both-mode Part 2), omit bridge copy that repeats the conclusion/reflection.
   */
  renderViabilityResults(opts = {}) {
    const embedInPart2 = Boolean(opts.embedInPart2);
    const scores = this.viabilityScoresByDimension || {};
    const summary = this.getViabilitySummaryMeta(scores);
    const conclusionData = summary.conclusionData;
    let html = '<div class="viability-report">';

    const verdictTitle = conclusionData?.headline
      ? SecurityUtils.sanitizeHTML(conclusionData.headline)
      : 'Overall conclusion: Review relationship direction';
    const verdictDetail = conclusionData?.conclusion
      ? SecurityUtils.sanitizeHTML(conclusionData.conclusion)
      : 'Use the dimensions below to clarify whether continued investment is likely to produce a healthy return.';

    html += `<div class="relationship-summary-cards" style="margin-bottom: 1.5rem;">
      <article class="relationship-summary-card relationship-summary-card--verdict">
        <h4>Verdict</h4>
        <p class="relationship-summary-emphasis">${verdictTitle}</p>
        <p>${verdictDetail}</p>
      </article>
      <article class="relationship-summary-card">
        <h4>Primary Risks</h4>
        <p>${summary.riskText}</p>
      </article>
      <article class="relationship-summary-card">
        <h4>Next Best Action</h4>
        <p>${SecurityUtils.sanitizeHTML(summary.nextAction)}</p>
      </article>
    </div>`;

    if (!embedInPart2) {
      html += '<p style="color: var(--muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">The dimensions below support this conclusion.</p>';
    }
    html += '<div style="padding: 1.25rem; background: var(--glass); border-radius: var(--radius); border-left: 4px solid var(--brand); margin-bottom: 1.5rem;">';
    html += '<h4 style="margin-top: 0; margin-bottom: 1rem; font-size: 1rem;">Your responses by dimension</h4>';
    html += '<ul style="margin: 0; padding-left: 1.25rem; list-style: none;">';
    summary.dimensionSummaries.forEach(dim => {
      const levelColor = dim.level === 'Low'
        ? 'var(--accent)'
        : dim.level === 'Medium'
          ? 'var(--brand)'
          : 'var(--muted)';
      html += `<li style="margin-bottom: 0.6rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.08);"><strong>${SecurityUtils.sanitizeHTML(dim.name || '')}</strong> — <span style="color: ${levelColor};">${SecurityUtils.sanitizeHTML(dim.level)}</span></li>`;
    });
    html += '</ul></div>';
    if (!embedInPart2) {
      html += '<p style="color: var(--muted); line-height: 1.7; margin-top: 1.5rem;">If your answers point to disconnection or one-sided investment, stepping away may be the clear choice. If there is potential for shared growth and mutual commitment, investing in resolution may be worthwhile. Use the reflection prompts below (or in Closure &amp; Next Steps) to align your decision with your goals and values.</p>';
    }
    html += '</div>';
    return html;
  }

  renderResults() {
    this.setReportHeaderState(true);
    this.ui.transition('results');

    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;

    if (this.assessmentMode === 'viability') {
      let html = '<h2 style="margin-top: 0;">Relationship Viability Evaluation</h2>';
      html += this.renderViabilityResults();
      html += `<div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; margin-top: 2rem; border-left: 4px solid var(--accent);">
        <p style="margin: 0;"><strong style="color: var(--accent);">Explore further:</strong> <a href="temperament.html">Polarity</a>, <a href="archetype.html">Archetype</a>, and <a href="attraction.html">Attraction</a> assessments can deepen your understanding of fit and investment.</p>
      </div>`;
      SecurityUtils.safeInnerHTML(resultsContainer, html);
      this.attachResultsActions();
      return;
    }

    let html = '';
    if (this.assessmentMode === 'both') {
      html += '<h2 style="margin-top: 0;">Part 1: Points of Conflict</h2>';
    }
    html += '<p style="color: var(--muted); line-height: 1.7; margin-bottom: 0.85rem;">All relationships show strain somewhere. Strain points indicate areas for attention moreso than verdicts on relationship viability. This is normal, not failure... not yet at least.</p>';
    html += '<p style="color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem;">This report clarifies the areas showing strain, ranked in order of impact. Having many areas of critical or high strain is often terminal for a relationship; focus on the most impactful areas or consider whether the pattern suggests fundamental incompatibility.</p>';

    if (this.crossDomainSpillover.detected && this.crossDomainSpillover.message) {
      html += '<p style="color: var(--muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; font-style: italic;">Cross-domain amplification detected, which suggests systemic strain patterns rather than a single isolated issue.</p>';
    }

    let weakestLinks = this.analysisData.weakestLinks || [];
    if (weakestLinks.length === 0) {
      const fallbackSource = Object.keys(this.analysisData.compatibilityScores || {}).length > 0
        ? this.analysisData.compatibilityScores
        : this.analysisData.stage1Results || {};
      if (Object.keys(fallbackSource).length > 0) {
        weakestLinks = Object.entries(fallbackSource)
          .map(([key, data]) => ({
            point: key,
            ...data,
            strategies: this.getActionStrategies(key, data.rawScore)
          }))
          .sort((a, b) => a.weightedScore - b.weightedScore)
          .slice(0, 3);
      }
    }

    if (weakestLinks.length > 0) {
        weakestLinks.forEach((link, index) => {
        const criticalClass = this.severityCountsAsCritical(link.severity) ? 'critical' : '';
        const stateLabel = this.getStrainStateLabel(link.severity);
        const point = COMPATIBILITY_POINTS?.[link.point];
        
        const selfRegulation = this.getSelfRegulationStrategies(link);
        const relationalInvitation = this.getRelationalInvitationStrategies(link);
        const structuralBoundary = this.getStructuralBoundaryStrategies(link);
        const changeStrategies = this.getChangeStrategies(link);
        const acceptanceStrategies = this.getAcceptanceStrategies(link);
        
        const contextDesc = point?.description ? SecurityUtils.sanitizeHTML(point.description) : '';
        const contextImpact = point?.impact ? SecurityUtils.sanitizeHTML(point.impact) : '';
        
        if (index > 0) {
          html += '<hr class="strain-section-divider" style="margin: 2.5rem 0 1.5rem; border: none; border-top: 1px solid rgba(255,255,255,0.12);" aria-hidden="true" />';
        }
        
        html += `
          <details class="strain-accordion weakest-link-item strain-point-section ${criticalClass}">
            <summary class="strain-accordion-summary">
              <h3 style="display: inline; margin: 0;">${index + 1}. ${SecurityUtils.sanitizeHTML(link.name || '')} <span style="font-size: 0.9em; color: var(--muted);">(${SecurityUtils.sanitizeHTML(link.impactTier || '')} impact)</span></h3>
              <p style="margin: 0.35rem 0 0;"><strong>Status:</strong> ${SecurityUtils.sanitizeHTML(link.priority || '')} priority · ${SecurityUtils.sanitizeHTML(stateLabel || '')}</p>
            </summary>
            <div class="strain-accordion-body" style="padding-top: 1rem;">
            <div class="strain-context" style="margin: 1.25rem 0; color: var(--muted); line-height: 1.7; font-size: 0.95rem;">
              ${contextDesc ? `<p style="margin: 0 0 0.75rem;"><strong style="color: var(--brand);">What this is:</strong> ${contextDesc}</p>` : ''}
              ${contextImpact ? `<p style="margin: 0;"><strong style="color: var(--brand);">Long-term impact:</strong> ${contextImpact}</p>` : ''}
            </div>
            
            ${(function() {
              const pointBullets = ARCHETYPAL_PRESSURES_BY_POINT && ARCHETYPAL_PRESSURES_BY_POINT[link.point];
              const items = Array.isArray(pointBullets) && pointBullets.length > 0 ? pointBullets : null;
              if (!items) return '';
              return `
            <div style="margin: 1.25rem 0;">
              <strong style="color: var(--brand); font-size: 0.95rem;">Archetypal Pressures</strong>
              <p style="font-size: 0.85rem; color: var(--muted); margin: 0.25rem 0 0.5rem; font-style: italic;">Potential impact upon Archetypal Pressures.</p>
              <ul style="margin: 0 0 0 1.5rem;">
                ${items.map(s => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(s || '')}</li>`).join('')}
              </ul>
            </div>
            `;
            })()}
            
            ${(selfRegulation.length > 0 || relationalInvitation.length > 0 || structuralBoundary.length > 0 || changeStrategies.length > 0 || acceptanceStrategies.length > 0) ? `
            <div class="action-strategies-card" style="background: var(--glass); border-left: 4px solid var(--brand); border-radius: var(--radius); padding: 1.25rem; margin-top: 1rem;">
              <h4 style="color: var(--brand); margin-top: 0; margin-bottom: 1rem;">Action Strategies</h4>
              
              ${selfRegulation.length > 0 ? `
              <div style="margin-bottom: 1.25rem;">
                <strong style="color: var(--brand); font-size: 0.95rem;">Self-Regulation</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  ${selfRegulation.map(strategy => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(strategy || '')}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${relationalInvitation.length > 0 ? `
              <div style="margin-bottom: 1.25rem;">
                <strong style="color: var(--accent); font-size: 0.95rem;">Relational Invitations</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  ${relationalInvitation.map(strategy => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(strategy || '')}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${structuralBoundary.length > 0 ? `
              <div style="margin-bottom: 1.25rem;">
                <strong style="color: var(--muted); font-size: 0.95rem;">Structural Boundaries (optional)</strong>
                <ul style="margin: 0.5rem 0 0 1.5rem;">
                  ${structuralBoundary.map(strategy => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(strategy || '')}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${changeStrategies.length > 0 || acceptanceStrategies.length > 0 ? `
              <div style="margin-bottom: 1.25rem;">
                <strong style="color: var(--brand); font-size: 0.95rem;">Change vs. Acceptance</strong>
                ${changeStrategies.length > 0 ? `
                <ul style="margin: 0.25rem 0 0 1.5rem;">
                  ${changeStrategies.map(strategy => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(strategy || '')}</li>`).join('')}
                </ul>
                ` : ''}
                ${acceptanceStrategies.length > 0 ? `
                <ul style="margin: 0.25rem 0 0 1.5rem;">
                  ${acceptanceStrategies.map(strategy => `<li style="margin-bottom: 0.35rem;">${SecurityUtils.sanitizeHTML(strategy || '')}</li>`).join('')}
                </ul>
                ` : ''}
              </div>
              ` : ''}
            </div>
            ` : ''}
            </div>
          </details>
        `;
      });

      html += '<p style="font-size: 0.85rem; color: var(--muted); margin: 2rem 0 0; font-style: italic;">Reassess after a deliberate cooling-off period. Avoid impulsive decisions based on this analysis alone.</p>';

      const criticalCount = weakestLinks.filter(l => this.severityCountsAsCritical(l.severity)).length;
      const criticalOrHighCount = weakestLinks.filter(l => l.priority === 'Critical' || l.priority === 'High').length;
      if (criticalCount >= 2 || criticalOrHighCount >= 4) {
        html += '<p style="font-size: 0.9rem; color: var(--muted); margin: 1.5rem 0 0; font-style: italic;">Several areas show critical or high strain. This pattern often indicates fundamental incompatibility; consider whether to focus on a few key areas or to reassess the relationship.</p>';
      }
    } else {
      html += '<p>No dominant strain points were flagged. Review strain context above and supplemental modules below for context.</p>';
    }

    if (this.assessmentMode === 'both') {
      html += '<h2 style="margin-top: 2.5rem; padding-top: 2rem; border-top: 2px solid rgba(255,255,255,0.12);">Part 2: Relationship Viability Evaluation</h2>';
      html += this.renderViabilityResults({ embedInPart2: true });
      html += this.renderPart2CrossCheck();
      html += this.getViabilityReflectionBlock();
    } else {
      html += `<details style="margin-top: 2rem;">
      <summary><strong>Supplemental Analysis Modules</strong></summary>
      ${this.renderAnalysisModules()}
    </details>`;
    }

    // Mandatory Closure Section (viability reflection lives in Part 2 when mode is both)
    html += this.getClosureSection(this.assessmentMode === 'both');

    // Follow-up invitation
    html += `
      <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; margin-top: 2rem; border-left: 4px solid var(--accent);">
        <p style="margin: 0;"><strong style="color: var(--accent);">Explore further:</strong> Strain points often root in identity, polarity, or market reality. <a href="temperament.html">Polarity Position Mapping</a> clarifies whether masculine–feminine fit underlies the tension. <a href="archetype.html">Modern Archetype Identification</a> surfaces archetypal pressures, and <a href="attraction.html">Attraction &amp; Status</a> maps your mating-market position so you can separate compatibility issues from selection reality.</p>
      </div>
    `;

    // Sanitize HTML before rendering - all dynamic content is already sanitized above
    SecurityUtils.safeInnerHTML(resultsContainer, html);
    this.attachResultsActions();
  }

  attachResultsActions() {
    const returnBtn = document.getElementById('returnToAssessments');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        this.resetAssessment();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

  }

  /**
   * Part 2 (both mode): explain rationale without exposing numeric grading.
   */
  renderPart2CrossCheck() {
    const scores = this.viabilityScoresByDimension || {};
    const vals = Object.values(scores).filter(n => typeof n === 'number');
    if (!vals.length) return '';

    const part1Keys = [];
    if (Array.isArray(RELATIONSHIP_ANALYSIS_MODULES)) {
      RELATIONSHIP_ANALYSIS_MODULES.forEach(m => {
        if (Array.isArray(m.pointKeys)) part1Keys.push(...m.pointKeys);
      });
    }
    const hasPart1Blend = part1Keys.length ? this.getModuleScore([...new Set(part1Keys)]) != null : false;

    let html = `<div class="analysis-modules-section part2-cross-check" style="margin-top: 1.5rem; padding: 1.1rem 1.25rem; background: var(--glass); border-radius: var(--radius); border-left: 3px solid rgba(255,255,255,0.15);">
      <h4 style="margin: 0 0 0.5rem; font-size: 1rem; color: var(--brand);">How this conclusion was formed</h4>
      <p style="margin: 0 0 0.85rem; color: var(--muted); font-size: 0.95rem; line-height: 1.65;">
        <strong>Verdict basis (same as headline):</strong> the pattern across the six viability dimensions supports the conclusion above.
      </p>`;

    if (hasPart1Blend) {
      html += `<p style="margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.65;">
        <strong>Part 1 context (not a second verdict):</strong> Part 1 blends many compatibility areas and can appear more neutral because stronger areas offset weaker ones.
        If this differs from the conclusion above, <strong>trust the six dimensions and the headline</strong>; use Part 1 as background texture.
      </p>`;
    }
    html += '</div>';
    return html;
  }

  /**
   * Supplemental module cards (Part 1 report details only — not Part 2, to avoid conflicting Watch/Urgent vs viability band).
   */
  renderAnalysisModules() {
    if (!Array.isArray(RELATIONSHIP_ANALYSIS_MODULES) || RELATIONSHIP_ANALYSIS_MODULES.length === 0) {
      return '';
    }

    let html = `<div class="analysis-modules-section" style="margin-top: 3rem;">
      <h4 style="color: var(--brand); margin-bottom: 0.75rem;">Cross-cutting module readouts</h4>
        <p style="color: var(--muted); margin-bottom: 1rem; font-size: 0.95rem;">
          Summaries from compatibility scores across related strain areas (principles, repair, termination considerations).
        </p>
      <div class="analysis-modules-grid">`;

    RELATIONSHIP_ANALYSIS_MODULES.forEach(module => {
      const score = this.getModuleScore(module.pointKeys);
      const status = this.getModuleStatus(score);
      const conclusion = module.conclusions?.[status.toLowerCase()] || '';

      html += `
        <div class="analysis-module-card card">
          <h4>${SecurityUtils.sanitizeHTML(module.title || '')}</h4>
          <p>${SecurityUtils.sanitizeHTML(module.summary || '')}</p>
          ${score !== null ? `<p><strong>Status:</strong> <span class="module-status">${SecurityUtils.sanitizeHTML(status)}</span></p>` : ''}
          ${conclusion ? `<p class="module-conclusion">${SecurityUtils.sanitizeHTML(conclusion)}</p>` : ''}
        </div>
      `;
    });

    html += '</div></div>';

    return html;
  }

  getModuleScore(pointKeys = []) {
    if (!pointKeys.length || !this.analysisData.compatibilityScores) return null;
    const scores = pointKeys
      .map(key => this.analysisData.compatibilityScores[key]?.rawScore)
      .filter(score => typeof score === 'number');
    if (!scores.length) return null;
    const total = scores.reduce((sum, score) => sum + score, 0);
    return total / scores.length;
  }

  getModuleStatus(score) {
    if (score === null || score === undefined) return 'Unscored';
    if (score <= 4) return 'Urgent';
    if (score <= 6) return 'Watch';
    return 'Strong';
  }

  getSelfRegulationStrategies(link) {
    // Only return point-specific self-regulation; omit when generic or absent to avoid redundancy
    if (!ACTION_STRATEGIES || !link?.point) return [];
    const strategies = ACTION_STRATEGIES[link.point] || ACTION_STRATEGIES.generic;
    if (!strategies || !Array.isArray(strategies.selfRegulation)) return [];
    return strategies.selfRegulation.filter(Boolean);
  }
  
  getRelationalInvitationStrategies(link) {
    if (!ACTION_STRATEGIES || !link?.point) return [];
    const strategies = ACTION_STRATEGIES[link.point] || ACTION_STRATEGIES.generic;
    if (!strategies || !Array.isArray(strategies.relationalInvitation)) return [];
    return strategies.relationalInvitation.filter(Boolean);
  }

  getStructuralBoundaryStrategies(link) {
    if (!ACTION_STRATEGIES || !link?.point) return [];
    const strategies = ACTION_STRATEGIES[link.point] || ACTION_STRATEGIES.generic;
    if (!strategies || !Array.isArray(strategies.structuralBoundary)) return [];
    return strategies.structuralBoundary.filter(Boolean);
  }

  getChangeStrategies(link) {
    if (!ACTION_STRATEGIES || !link?.point) return [];
    const strategies = ACTION_STRATEGIES[link.point] || ACTION_STRATEGIES.generic;
    if (!strategies || !Array.isArray(strategies.changeStrategies)) return [];
    return strategies.changeStrategies.filter(Boolean);
  }

  getAcceptanceStrategies(link) {
    if (!ACTION_STRATEGIES || !link?.point) return [];
    const strategies = ACTION_STRATEGIES[link.point] || ACTION_STRATEGIES.generic;
    if (!strategies || !Array.isArray(strategies.acceptanceStrategies)) return [];
    return strategies.acceptanceStrategies.filter(Boolean);
  }
  
  /** Compact prompts for Part 2 (both)—avoids repeating the band conclusion and module narrative */
  getViabilityReflectionBlock() {
    return `
      <div style="margin-top: 2rem; padding: 1.25rem 1.5rem; background: var(--glass); border-radius: var(--radius); border-left: 4px solid var(--brand);">
        <h4 style="color: var(--brand); margin-top: 0; margin-bottom: 0.5rem;">Reflection prompts</h4>
        <p style="color: var(--muted); margin: 0 0 0.5rem; font-size: 0.95rem;">Use with the Part 2 conclusion and dimension levels above (and Part 1 strain detail)—not a separate verdict.</p>
        <ul style="color: var(--muted); margin: 0; padding-left: 1.25rem;">
          <li style="margin-bottom: 0.35rem;">Does this relationship support the future you envision? Is there a shared vision that makes the effort worthwhile?</li>
          <li style="margin-bottom: 0.35rem;">Is the discomfort temporary or a pattern that undermines your goals? Can resolving these challenges lead to a deeper connection?</li>
          <li style="margin-bottom: 0.35rem;">Does the energy spent on resolution bring long-term value, or does it drain your emotional and mental health? Are you both committed to solutions that foster mutual growth?</li>
          <li style="margin-bottom: 0.35rem;">Do you align on values, goals, and growth trajectories, or are they diverging?</li>
          <li style="margin-bottom: 0.35rem;">In conflict, do you reflect and grow, or does the relationship become reactive and stagnant?</li>
        </ul>
      </div>
    `;
  }

  /**
   * @param {boolean} omitViabilityReflection - true when Part 2 already included the viability reflection block
   */
  getClosureSection(omitViabilityReflection = false) {
    const reflection = omitViabilityReflection
      ? ''
      : `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">Relationship Viability Reflection</h4>
            <p style="color: var(--muted); margin: 0 0 0.75rem;">Relationships shape the trajectory of our lives. The key is discernment: does this relationship support your vision for growth, or has it become a drain on your energy and aspirations? Conflicts do not always signal the end—what matters is whether investing in resolution brings long-term value and whether you share fundamental values, goals, and a compatible vision for the future.</p>
            <p style="color: var(--muted); margin: 0 0 0.5rem; font-size: 0.95rem;">Consider:</p>
            <ul style="color: var(--muted); margin: 0 0 0 1.25rem; padding-left: 0.5rem;">
              <li style="margin-bottom: 0.35rem;">Does this relationship support the future you envision? Is there a shared vision that makes the effort worthwhile?</li>
              <li style="margin-bottom: 0.35rem;">Is the discomfort temporary or a pattern that undermines your goals? Can resolving these challenges lead to a deeper connection?</li>
              <li style="margin-bottom: 0.35rem;">Does the energy spent on resolution bring long-term value, or does it drain your emotional and mental health? Are you both committed to solutions that foster mutual growth?</li>
              <li style="margin-bottom: 0.35rem;">Do you align on values, goals, and growth trajectories, or are they diverging?</li>
              <li style="margin-bottom: 0.35rem;">In conflict, do you reflect and grow, or does the relationship become reactive and stagnant?</li>
            </ul>
            <p style="color: var(--muted); margin: 0.75rem 0 0; font-size: 0.95rem;">If your answers point to disconnection, lack of shared vision, or one-sided investment, stepping away may be the clear choice. If there is potential for shared growth, depth, and mutual understanding, investing in resolution may lead to a rewarding connection. The evaluation above offers a clear basis for your decision.</p>
          </div>`;

    return `
      <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 2rem; margin-top: 2.5rem; border-left: 4px solid var(--brand);">
        <h3 style="color: var(--brand); margin-bottom: 1rem;">Closure & Next Steps</h3>
        <div style="line-height: 1.8;">
          ${reflection}
          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">What You Control</h4>
            <p style="color: var(--muted); margin: 0;">You control your responses, boundaries, communication style, and self-regulation. Focus your energy on actions within your sovereignty.</p>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">What Requires Mutual Participation</h4>
            <p style="color: var(--muted); margin: 0;">Improving relational dynamics requires both partners' participation. You can invite, but cannot force, mutual engagement. Some strain points may require your partner's willingness to address them.</p>
          </div>
          <div>
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">What Acceptance Would Look Like</h4>
            <p style="color: var(--muted); margin: 0;">If certain dynamics persist despite your efforts, acceptance means recognizing limitations without self-blame. It means protecting yourself through boundaries while maintaining clarity about what you can and cannot change.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Save results: produces a readable HTML report document recording report details (primary export action).
   */
  saveResults() {
    const reportTitle = 'Relationships Analysis';
    const html = generateReadableReport(this.analysisData, 'relationship', reportTitle);
    downloadFile(html, `relationships-report-${Date.now()}.html`, 'text/html');
  }

  /**
   * Save assessment progress to storage
   */
  saveProgress() {
    try {
      const progressData = {
        currentStage: this.currentStage,
        currentQuestionIndex: this.currentQuestionIndex,
        answers: this.answers,
        weakestLinks: this.weakestLinks,
        domainWeakAreas: this.domainWeakAreas,
        crossDomainSpillover: this.crossDomainSpillover,
        analysisData: this.analysisData,
        assessmentMode: this.assessmentMode,
        activePhase: this.activePhase,
        viabilityScoresByDimension: this.viabilityScoresByDimension,
        stage2TransitionShown: this.stage2TransitionShown,
        stage3TransitionShown: this.stage3TransitionShown,
        groundingPauseShown: this.groundingPauseShown,
        hintFlags: this.hintFlags,
        midAssessmentShown: this.midAssessmentShown,
        instrumentation: this.instrumentation,
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

      await this.loadRelationshipData();

      if (data.assessmentMode === 'module' || data.activeModuleId || data.analysisData?.assessmentMode === 'module' || data.analysisData?.moduleId) {
        this.dataStore.clear('progress');
        this.setLandingVisibility(true);
        return;
      }
      this.currentStage = data.currentStage || 1;
      this.currentQuestionIndex = data.currentQuestionIndex || 0;
      this.answers = data.answers || {};
      this.weakestLinks = data.weakestLinks || [];
      this.domainWeakAreas = data.domainWeakAreas || {};
      this.crossDomainSpillover = data.crossDomainSpillover || {};
      this.analysisData = data.analysisData || this.analysisData;
      this.assessmentMode = data.assessmentMode || 'conflict';
      this.activePhase = data.activePhase || 'conflict';
      this.viabilityScoresByDimension = data.viabilityScoresByDimension || {};
      this.stage2TransitionShown = data.stage2TransitionShown || false;
      this.stage3TransitionShown = data.stage3TransitionShown || false;
      this.groundingPauseShown = data.groundingPauseShown || false;
      this.hintFlags = { ...this.hintFlags, ...(data.hintFlags || {}) };
      this.midAssessmentShown = Boolean(data.midAssessmentShown);
      this.instrumentation = { ...this.instrumentation, ...(data.instrumentation || {}) };
      persistHintFlags(this.hintStorageKey, this.hintFlags);

      const hasConflictResults = this.analysisData && this.analysisData.compatibilityScores && Object.keys(this.analysisData.compatibilityScores).length > 0;
      const hasViabilityResults = this.viabilityScoresByDimension && Object.keys(this.viabilityScoresByDimension).length > 0;
      const hasCompletedResults = (this.assessmentMode === 'viability' && hasViabilityResults) ||
        (this.assessmentMode === 'conflict' && hasConflictResults) ||
        (this.assessmentMode === 'both' && hasConflictResults && hasViabilityResults);
      const atGroundingPause = this.currentStage === 3 && this.groundingPauseShown && !hasConflictResults;
      if (hasCompletedResults) {
        this.ui.transition('results');
        this.renderResults();
        return;
      }

      if (this.currentQuestionIndex > 0 || hasConflictResults) {
        if (this.activePhase === 'viability') {
          await this.buildViabilitySequence();
          this.setLandingVisibility(false);
          if (this.currentQuestionIndex < this.questionSequence.length) {
            this.renderCurrentQuestion();
            this.updateProgressBar();
            this.updateStageIndicator();
          }
        } else if (atGroundingPause) {
          this.setLandingVisibility(false);
          this.ui.transition('assessment');
          const container = document.getElementById('questionContainer');
          if (container) {
            if (this.assessmentMode === 'both') {
              SecurityUtils.safeInnerHTML(container, `
                <div style="padding: 2.5rem; text-align: center; background: rgba(255, 255, 255, 0.95); border-radius: var(--radius); box-shadow: var(--shadow);">
                  <h3 style="color: var(--brand); margin-bottom: 1.5rem; font-size: 1.5rem;">Points of Conflict complete</h3>
                  <p style="color: var(--muted); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem;">Now: Relationship Viability Evaluation — the six key considerations that inform whether investing in resolution is worth it.</p>
                  <button class="btn btn-primary" id="continueToViability" style="min-width: 200px;">Continue to Viability Evaluation</button>
                </div>
              `);
              const btn = document.getElementById('continueToViability');
              if (btn) {
                btn.addEventListener('click', async () => {
                  await this.buildViabilitySequence();
                  this.activePhase = 'viability';
                  this.currentQuestionIndex = 0;
                  this.renderCurrentQuestion();
                  this.updateProgressBar();
                  this.updateStageIndicator();
                  this.saveProgress();
                });
              }
            } else {
              SecurityUtils.safeInnerHTML(container, `
                <div style="padding: 2.5rem; text-align: center; background: rgba(255, 255, 255, 0.95); border-radius: var(--radius); box-shadow: var(--shadow);">
                  <h3 style="color: var(--brand); margin-bottom: 1.5rem; font-size: 1.5rem;">Assessment Complete</h3>
                  <p style="color: var(--muted); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem;">Your analysis is ready.</p>
                  <button class="btn btn-primary" id="continueToResults" style="min-width: 150px;">View Results</button>
                </div>
              `);
              const continueBtn = document.getElementById('continueToResults');
              if (continueBtn) continueBtn.addEventListener('click', () => this.finalizeResults());
            }
          }
        } else if (this.currentStage === 1) {
          await this.buildStage1Sequence();
          this.setLandingVisibility(false);
          if (this.currentQuestionIndex < this.questionSequence.length) {
            this.renderCurrentQuestion();
            this.updateProgressBar();
            this.updateStageIndicator();
          }
        } else if (this.currentStage === 2) {
          await this.analyzeStage1Results();
          await this.buildStage2Sequence();
          this.setLandingVisibility(false);
          if (this.currentQuestionIndex < this.questionSequence.length) {
            this.renderCurrentQuestion();
            this.updateProgressBar();
            this.updateStageIndicator();
          }
        } else if (this.currentStage === 3) {
          await this.analyzeStage1Results();
          await this.buildStage2Sequence();
          await this.buildStage3Sequence();
          this.setLandingVisibility(false);
          if (this.currentQuestionIndex < this.questionSequence.length) {
            this.renderCurrentQuestion();
            this.updateProgressBar();
            this.updateStageIndicator();
          }
        }
      } else if (Array.isArray(this.analysisData.questionSequence) && this.analysisData.questionSequence.length > 0) {
        this.setLandingVisibility(false);
        this.renderResults();
      } else {
        this.setLandingVisibility(true);
      }
    } catch (error) {
      this.debugReporter.logError(error, 'loadStoredData');
      ErrorHandler.showUserError('Failed to load saved progress.');
    }
  }

  /**
   * Clear all cached data
   */
  clearAllCachedData() {
    this.dataStore.clear('progress');
    this.resetAssessment();
    ErrorHandler.showUserError('All cached data for Relationship Optimization has been cleared.');
  }

  /**
   * Reset assessment
   * @returns {Promise<void>}
   */
  async resetAssessment() {
    this.resetAssessmentState();

    this.dataStore.clear('progress');

    // Reset UI
    const questionnaireSection = document.getElementById('questionnaireSection');
    const resultsSection = document.getElementById('resultsSection');
    const progressBarFill = document.getElementById('progressBarFill');
    
    if (questionnaireSection) questionnaireSection.classList.remove('active');
    if (resultsSection) resultsSection.classList.remove('active');
    if (progressBarFill) progressBarFill.style.width = '0%'; // Progress bar width is dynamic, keep inline
    this.setLandingVisibility(true);
    const startBtn = document.getElementById('startAssessment');
    if (startBtn) startBtn.disabled = false;
    this.setReportHeaderState(false);
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


