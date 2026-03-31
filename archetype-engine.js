// Modern Archetype Identification Engine
// Multi-Tier Assessment System for identifying primary, secondary, and tertiary archetypes
// Version 1.1 - Optimized with lazy loading and debug reporting

import { loadDataModule, setDebugReporter } from './shared/data-loader.js';
import { createDebugReporter } from './shared/debug-reporter.js';
import { ErrorHandler, DataStore, DOMUtils, SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport } from './shared/export-utils.js';
import { reportGenderGlyphHtml } from './shared/report-gender-glyph.js';
import { EngineUIController } from './shared/engine-ui-controller.js';
import { showConfirm, showAlert } from './shared/confirm-modal.js';
import { ensurePeriod, softenNarrativeTone, summarizeBehavioralAccent } from './shared/archetype-narrative-utils.js';
import { quotedMemeticSummary } from './shared/archetype-memetic-format.js';

// Data modules - will be loaded lazily
let ARCHETYPES, CORE_GROUPS, ARCHETYPE_OPTIMIZATION;
let PHASE_1_QUESTIONS, PHASE_2_QUESTIONS, PHASE_3_QUESTIONS, PHASE_4_QUESTIONS, PHASE_5_QUESTIONS, RESPECT_CONTEXT_QUESTIONS;
let SUBTYPE_REFINEMENT_QUESTIONS;
let ARCHETYPE_SPREAD_MAP;
let BRUTAL_TRUTHS;
let ARCHETYPE_ROLE_ACCENTS;

function archetypeSlogan(archetype) {
  const id = archetype?.id || '';
  const byId = {
    alpha: 'wins the room, sets the frame',
    alpha_xi: 'dies for the mission, not the spotlight',
    alpha_rho: 'enforces the rules everyone else plays by',
    dark_alpha: 'power without restraint = eventual collapse',
    beta: 'useful, reliable... replaceable',
    beta_iota: 'good-hearted, not taken seriously',
    beta_kappa: 'agrees to belong',
    gamma: 'smart, outside the system, resents it',
    gamma_nu: 'loves the idea of love',
    gamma_theta: 'talks to God, struggles with people',
    gamma_pi: 'rides luck instead of building power',
    dark_gamma: 'sees through everything, believes in nothing',
    delta: 'keeps the world running, never leads it',
    delta_mu: 'dad energy without dominance',
    sigma: 'opts out, plays solo, keeps leverage',
    sigma_kappa: 'quiet strategist, moves pieces unseen',
    sigma_lambda: 'creates in isolation',
    dark_sigma_zeta: 'burns the system instead of mastering it',
    omega: 'invisible, disengaged, low agency',
    dark_omega: 'drags others down with him',
    phi: 'myth, not a demographic',

    alpha_female: 'desired, selects-not chased',
    alpha_xi_female: 'cuts through men with standards',
    alpha_unicorn_female: 'idealized loyalty fantasy',
    alpha_iota_female: 'balanced, rare, stable',
    dark_alpha_female: 'control disguised as empowerment',
    beta_female: 'trades access for security',
    beta_nu_female: 'settles into tradition',
    beta_kappa_female: 'leverages attention, plays angles',
    beta_rho_female: 'mothering with control baked in',
    gamma_female: 'smart, disagreeable, hard to pair',
    gamma_theta_female: 'intense, visionary, confrontational',
    gamma_feminist_female: 'career-first, relationship-fractured',
    dark_gamma_female: 'withdrawn, disillusioned',
    delta_female: 'home, stability, support',
    delta_mu_female: 'warmth, joy, life energy',
    dark_delta_female: 'self-sacrifice turned resentment',
    sigma_female: 'independent, hard to lock down',
    sigma_feminist_female: 'self-sufficient, low compromise',
    dark_sigma_zeta_female: 'rejects system entirely',
    omega_female: 'excluded from the game',
    dark_omega_female: 'weaponizes destruction',
    phi_female: 'myth, not a demographic'
  };
  if (byId[id]) return byId[id];

  const parent = archetype?.parentType || id.split('_')[0] || '';
  const coreByParent = {
    alpha: 'I decide.',
    beta: 'Pick me.',
    gamma: "I see what others don't-but can't convert it.",
    delta: 'Tell me what to do.',
    sigma: "I don't need your game.",
    omega: 'Why try?',
    phi: 'myth, not a demographic'
  };
  return coreByParent[parent] || '';
}

function memeticSummaryHtml(archetype, { margin = '0.15rem 0 0.9rem', fontSize = '1rem' } = {}) {
  const q = quotedMemeticSummary(archetypeSlogan(archetype));
  if (!q) return '';
  return `<p class="archetype-memetic-summary" style="margin: ${margin}; color: var(--muted); font-size: ${fontSize}; font-style: italic;">${SecurityUtils.sanitizeHTML(q)}</p>`;
}

export class ArchetypeEngine {
  constructor() {
    this.currentPhase = 0; // 0 = gender selection, 0.5 = IQ bracket, 1-4 = assessment phases
    this.currentQuestionIndex = 0;
    this.gender = null; // 'male' or 'female'
    this.iqBracket = null; // IQ bracket for faster funneling
    this.answers = {};
    this.aspirationAnswers = {}; // Track aspiration test responses separately
    this.respectContextAnswers = {}; // Respect context (social vs business) for bias mitigation
    this.questionSequence = [];
    this.archetypeScores = {};
    this.shuffledOptions = {};
    this.shuffledVignettes = {};
    this.baseSectionTitleText = null;
    this.shuffledOptions = {};
    this.shuffledVignettes = {};
    this.analysisData = {
      timestamp: new Date().toISOString(),
      gender: null,
      iqBracket: null,
      phase1Results: {},
      phase2Results: {},
      phase3Results: {},
      phase4Results: {},
      phase5Results: {},
      aspirationAnalysis: {},
      primaryArchetype: null,
      secondaryArchetype: null,
      tertiaryArchetype: null,
      confidenceLevels: {},
      allAnswers: {},
      questionSequence: []
    };

    // Initialize debug reporter
    this.debugReporter = createDebugReporter('ArchetypeEngine');
    setDebugReporter(this.debugReporter);
    this.debugReporter.markInitialized();

// Initialize data store
    this.dataStore = new DataStore('archetype-assessment', '1.0.0');

    this.ui = new EngineUIController({
      idle: {
        show: ['#introSection', '#actionButtonsSection'],
        hide: ['#questionnaireSection', '#resultsContainer']
      },
      assessment: {
        show: ['#questionnaireSection'],
        hide: ['#introSection', '#actionButtonsSection', '#resultsContainer']
      },
      results: {
        show: ['#resultsContainer'],
        hide: ['#introSection', '#actionButtonsSection', '#questionnaireSection']
      }
    });

    this.init();
  }

init() {
  const setup = async () => {
    // 1. Attach listeners first so the 'Begin' button is functional
    this.attachEventListeners();
    
    // 2. Load the data silently in the background
    try {
      await this.loadStoredData();
      this.initializeScores();

      if (this.shouldAutoGenerateSample()) {
        await this.generateSampleReport();
        return;
      }
      
      // 3. LOGIC CHECK: If we loaded a mid-assessment state, 
      // we DON'T call renderCurrentQuestion() yet. 
      // We wait for the user to click "Begin" or "Resume".
      console.log('ArchetypeEngine: Data restored. Current Phase:', this.currentPhase);
    } catch (error) {
      this.debugReporter.logError(error, 'init');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}

  initializeScores() {
    // Initialize scores dynamically as archetypes are scored
    this.archetypeScores = {};
  }

  attachEventListeners() {
    // 1. START BUTTON LOGIC
    const setupStartBtn = (btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Start button clicked');
        this.startAssessment();
      });
    };

    const startBtn = document.getElementById('startAssessment');
    if (startBtn) {
      setupStartBtn(startBtn);
      console.log('Start button event listener attached');
    } else {
      // Retry logic if DOM wasn't fully ready
      setTimeout(() => {
        const retryBtn = document.getElementById('startAssessment');
        if (retryBtn) setupStartBtn(retryBtn);
      }, 500);
    }

    // 2. THE GLOBAL "WATCHER" (Event Delegation)
    // This handles Phase 1, 2, 3, and 4 selections automatically.
    const container = document.getElementById('questionContainer');
    if (container) {
      container.addEventListener('click', (e) => {
        // Find if the click was on or inside an option label
        const optionLabel = e.target.closest('.option-label, .likert-option, .narrative-option, .gender-btn, .iq-btn');
        
        // Ignore if no option found or if the question is locked
        if (!optionLabel || optionLabel.classList.contains('locked')) return;

        // Find the radio input inside the clicked label
        const input = optionLabel.querySelector('input[type="radio"]');
        
        if (input) {
          input.checked = true;
          const questionId = input.name.replace('question_', '');
          const value = parseInt(input.value);
          const question = this.questionSequence[this.currentQuestionIndex];

          console.log(`Phase ${this.currentPhase} Input Captured:`, value);
          
          // Only process if we have a valid question object (Phases 1-4)
          if (question) {
            this.processAnswer(question, value);
            
            // Update visual selection immediately
            // Remove selected class from all options of the same type
            const questionContainer = input.closest('.question-card');
            if (questionContainer) {
              // For Likert options
              if (optionLabel.classList.contains('likert-option')) {
                questionContainer.querySelectorAll('label.likert-option').forEach(label => {
                  label.classList.remove('selected');
                });
                optionLabel.classList.add('selected');
              }
              // For forced choice options
              else if (optionLabel.classList.contains('option-label')) {
                questionContainer.querySelectorAll('label.option-label').forEach(label => {
                  label.classList.remove('selected');
                });
                optionLabel.classList.add('selected');
              }
              // For narrative options
              else if (optionLabel.classList.contains('narrative-option')) {
                questionContainer.querySelectorAll('label.narrative-option').forEach(label => {
                  label.classList.remove('selected');
                });
                optionLabel.classList.add('selected');
              }
            }
          }
        }
      });
    }

    // 3. NAVIGATION & UTILITY BUTTONS
    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }

    const prevBtn = document.getElementById('prevQuestion');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevQuestion());
    }

    const newAssessmentBtn = document.getElementById('newAssessment');
    if (newAssessmentBtn) {
      newAssessmentBtn.addEventListener('click', () => this.resetAssessment());
    }

    const saveResultsBtn = document.getElementById('saveResults');
    if (saveResultsBtn) {
      saveResultsBtn.addEventListener('click', () => this.saveResults());
    }

    const sampleBtn = document.getElementById('generateSampleReport');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.generateSampleReport());
    }

    const abandonBtn = document.getElementById('abandonAssessment');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', async () => {
        if (await showConfirm('Are you sure you want to abandon this assessment? All progress will be lost.')) {
          this.resetAssessment();
        }
      });
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
      gender: null,
      iqBracket: null,
      phase1Results: {},
      phase2Results: {},
      phase3Results: {},
      phase4Results: {},
      phase5Results: {},
      aspirationAnalysis: {},
      respectContext: null,
      provisionContext: null,
      primaryArchetype: null,
      secondaryArchetype: null,
      tertiaryArchetype: null,
      confidenceLevels: {},
      allAnswers: {},
      questionSequence: []
    };
  }

  pickRandomIndices(length, count) {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
  }

  answerQuestionForSample(question) {
    if (!question) return;
    if (question.type === 'likert') {
      const scale = question.scale || 5;
      const value = Math.floor(Math.random() * scale) + 1;
      this.processAnswer(question, value);
      return;
    }
    if (question.type === 'multi_select') {
      const total = Array.isArray(question.options) ? question.options.length : 0;
      if (total === 0) return;
      const count = Math.min(total, Math.max(1, Math.ceil(Math.random() * 3)));
      const selected = this.pickRandomIndices(total, count);
      this.processAnswer(question, selected);
      return;
    }
    if (question.options && Array.isArray(question.options)) {
      const selectedIndex = Math.floor(Math.random() * question.options.length);
      this.processAnswer(question, selectedIndex);
    }
  }

  async generateSampleReport() {
    try {
      await this.loadArchetypeData();
      this.currentPhase = 1;
      this.currentQuestionIndex = 0;
      this.gender = this.gender || 'male';
      this.iqBracket = 'unknown';
      this.answers = {};
      this.aspirationAnswers = {};
      this.respectContextAnswers = {};
      this.initializeScores();
      this.analysisData = this.getEmptyAnalysisData();
      this.analysisData.gender = this.gender;
      this.analysisData.iqBracket = this.iqBracket;

      await this.buildPhase1Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      this.analyzePhase1Results();

      await this.buildPhase2Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      this.analyzePhase2Results();

      await this.buildPhase3Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      this.analyzePhase3Results();

      await this.buildPhase4Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));

      await this.buildPhase5Sequence();
      this.questionSequence.forEach(q => this.answerQuestionForSample(q));
      this.analyzePhase5Results();

      this.finalizeResults();
    } catch (error) {
      this.debugReporter.logError(error, 'generateSampleReport');
      ErrorHandler.showUserError('Failed to generate sample report. Please try again.');
    }
  }

startAssessment() {
  console.log('startAssessment called');
  
  // 1. Reset Internal State
  this.currentPhase = 0; 
  this.currentQuestionIndex = 0;
  this.gender = null;
  this.answers = {};
  
  // 2. Clear stale data from local storage so Phase 2 doesn't "ghost" in
  if (this.dataStore) {
    this.dataStore.clear(); 
  }

  this.initializeScores();

  // 3. Force UI Visibility
  // Ensure the landing page hidden and the container is visible
  const landingUI = document.getElementById('landing-section'); // Update with your actual ID
  const containerUI = document.getElementById('questionContainer');
  
  if (landingUI) landingUI.classList.add('hidden');
  if (containerUI) {
    containerUI.classList.remove('hidden');
    containerUI.innerHTML = ''; // Clear any "ghost" Phase 2 boxes
  }

  // 4. Trigger First View
  this.showQuestionContainer(); 
  this.showGenderSelection();
  this.saveProgress();
}

showGenderSelection() {
  const container = document.getElementById('questionContainer');
  if (!container) return;

  // We remove the hardcoded 'white' background and use our new CSS classes
  SecurityUtils.safeInnerHTML(container, `
    <div class="question-card selection-panel">
      <h2>Select Your Gender</h2>
      <p>This assessment adapts questions based on gender to provide more accurate archetype identification.</p>
      
      <div class="gender-options">
        <button id="selectMale" class="btn btn-outline gender-btn">Male</button>
        <button id="selectFemale" class="btn btn-outline gender-btn">Female</button>
      </div>
    </div>
    `);

    // Add hover effects
    setTimeout(() => {
      document.getElementById('selectMale')?.addEventListener('click', () => {
        this.gender = 'male';
        this.analysisData.gender = 'male';
        this.currentPhase = 0.5; // Move to IQ bracket selection
        this.showIQBracketSelection();
        this.saveProgress();
      });

      document.getElementById('selectFemale')?.addEventListener('click', () => {
        this.gender = 'female';
        this.analysisData.gender = 'female';
        this.currentPhase = 0.5; // Move to IQ bracket selection
        this.showIQBracketSelection();
        this.saveProgress();
      });

      // Add hover effects
      document.querySelectorAll('.gender-btn').forEach(btn => {
        // Hover effects handled by CSS
      });
    }, 100);
    
    // Show the questionnaire section
    this.showQuestionContainer();
  }

  showIQBracketSelection() {
    const container = document.getElementById('questionContainer');
    if (!container) return;

    SecurityUtils.safeInnerHTML(container, `
      <div class="question-card"">
        <h2">Select Your IQ Bracket</h2>
        <p>
          Providing your IQ bracket helps us prioritize relevant questions and accelerate the assessment. 
          If you don't know your IQ, estimate based on standardized tests (SAT, ACT, WAIS, etc.) or educational/career patterns.
        </p>
        <div>
          <button id="selectIQ80_100" class="iq-btn">
            <strong>80-100 IQ</strong> - Routine Guided Thinkers (~34% of population)
          </button>
          <button id="selectIQ100_115" class="iq-btn">
            <strong>100-115 IQ</strong> - Practical Adaptive Thinkers (~34% of population)
          </button>
          <button id="selectIQ115_130" class="iq-btn">
            <strong>115-130 IQ</strong> - Strategic Analytical Thinkers (~14% of population)
          </button>
          <button id="selectIQ130_145" class="iq-btn">
            <strong>130-145 IQ</strong> - Creative Synthesizing Thinkers (~2% of population)
          </button>
          <button id="selectIQ145_plus" class="iq-btn">
            <strong>145+ IQ</strong> - Meta-Recursive Thinkers (&lt;1% of population)
          </button>
          <button id="selectIQUnknown" class="iq-btn iq-btn-unknown">
            <strong>I don't know / Prefer not to specify</strong> - Full assessment will be provided
          </button>
        </div>
      </div>
    `);

    // Add click handlers
    setTimeout(() => {
      const iqBrackets = {
        'selectIQ80_100': '80_100',
        'selectIQ100_115': '100_115',
        'selectIQ115_130': '115_130',
        'selectIQ130_145': '130_145',
        'selectIQ145_plus': '145_plus',
        'selectIQUnknown': 'unknown'
      };

      Object.keys(iqBrackets).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.addEventListener('click', async () => {
            this.iqBracket = iqBrackets[buttonId];
            this.analysisData.iqBracket = iqBrackets[buttonId];
            this.currentPhase = 1;
            try {
              await this.buildPhase1Sequence();
              this.showQuestionContainer();
              this.renderCurrentQuestion();
              this.updateNavigation();
              this.saveProgress();
            } catch (error) {
              this.debugReporter.logError(error, 'IQ bracket selection');
            }
          });

          // Add hover effects
          // Hover effects handled by CSS
        }
      });
    }, 100);
    
    this.showQuestionContainer();
  }

  /**
   * Load archetype data modules asynchronously
   * @returns {Promise<void>}
   */
  async loadArchetypeData() {
    if (ARCHETYPES && PHASE_1_QUESTIONS) {
      return; // Already loaded
    }

    try {
      // Load archetypes data
      const archetypesModule = await loadDataModule(
        './archetype-data/archetypes.js',
        'Archetypes Data'
      );
      ARCHETYPES = archetypesModule.ARCHETYPES;
      CORE_GROUPS = archetypesModule.CORE_GROUPS;
      ARCHETYPE_OPTIMIZATION = archetypesModule.ARCHETYPE_OPTIMIZATION || {};

      // Load questions data
      const questionsModule = await loadDataModule(
        './archetype-data/archetype-questions.js',
        'Archetype Questions'
      );
      PHASE_1_QUESTIONS = questionsModule.PHASE_1_QUESTIONS;
      PHASE_2_QUESTIONS = questionsModule.PHASE_2_QUESTIONS;
      SUBTYPE_REFINEMENT_QUESTIONS = questionsModule.SUBTYPE_REFINEMENT_QUESTIONS;
      PHASE_3_QUESTIONS = questionsModule.PHASE_3_QUESTIONS;
      PHASE_4_QUESTIONS = questionsModule.PHASE_4_QUESTIONS;
      PHASE_5_QUESTIONS = questionsModule.PHASE_5_QUESTIONS;
      RESPECT_CONTEXT_QUESTIONS = questionsModule.RESPECT_CONTEXT_QUESTIONS || [];

      const spreadModule = await loadDataModule(
        './archetype-data/archetype-spread.js',
        'Archetype Spread'
      );
      ARCHETYPE_SPREAD_MAP = spreadModule.ARCHETYPE_SPREAD_MAP || {};

      const brutalTruthsModule = await loadDataModule(
        './archetype-data/BRUTAL-TRUTH.js',
        'Brutal Truths'
      );
      BRUTAL_TRUTHS = brutalTruthsModule.default || {};

      const roleAccentsModule = await loadDataModule(
        './archetype-data/archetype-role-accents.js',
        'Archetype role accents'
      );
      ARCHETYPE_ROLE_ACCENTS = roleAccentsModule.default || roleAccentsModule.ARCHETYPE_ROLE_ACCENTS || {};

      this.debugReporter.recordSection('Phase 1', PHASE_1_QUESTIONS?.length || 0);
      this.debugReporter.recordSection('Phase 2', PHASE_2_QUESTIONS?.length || 0);
      this.debugReporter.recordSection('Phase 3', PHASE_3_QUESTIONS?.length || 0);
      this.debugReporter.recordSection('Phase 4', PHASE_4_QUESTIONS?.length || 0);
      const phase5Count = (PHASE_5_QUESTIONS?.male?.length || 0) + (PHASE_5_QUESTIONS?.female?.length || 0);
      this.debugReporter.recordSection('Phase 5', phase5Count);
    } catch (error) {
      this.debugReporter.logError(error, 'loadArchetypeData');
      ErrorHandler.showUserError('Failed to load assessment data. Please refresh the page.');
      throw error;
    }
  }

  /**
   * Build Phase 1 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase1Sequence() {
    await this.loadArchetypeData();
    
    // Phase 1: Core Orientation - Filter/prioritize based on IQ bracket
    let questions = [...PHASE_1_QUESTIONS];
    
    // If IQ bracket known, prioritize relevant questions and reduce total
    if (this.iqBracket && this.iqBracket !== 'unknown') {
      questions = this.filterQuestionsByIQ(questions, 12); // Reduce to 12 questions for faster assessment
    }
    
    this.questionSequence = questions;
    this.debugReporter.recordQuestionCount(questions.length);
    // Shuffle to mitigate order bias
    this.questionSequence.sort(() => Math.random() - 0.5);
  }

  /**
   * Build Phase 2 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase2Sequence() {
    await this.loadArchetypeData();
    
    // Phase 2: Dimensional Refinement - Filter/prioritize based on IQ bracket
    this.currentPhase = 2;
    this.currentQuestionIndex = 0;
    const coreGroupScores = this.analysisData.phase1Results?.coreGroupScores || this.calculateCoreGroupScores();
    const topGroup = Object.keys(coreGroupScores).sort((a, b) => coreGroupScores[b] - coreGroupScores[a])[0];
    const refinementQuestions = SUBTYPE_REFINEMENT_QUESTIONS?.[topGroup] || [];
    let questions = [...PHASE_2_QUESTIONS];
    
    // If IQ bracket known, reduce questions for faster assessment
    if (this.iqBracket && this.iqBracket !== 'unknown') {
      questions = this.filterQuestionsByIQ(questions, 15); // Reduce to 15 questions
    }

    questions = [...refinementQuestions, ...questions];
    
    this.questionSequence = questions;
    this.debugReporter.recordQuestionCount(questions.length);
    // Shuffle to mitigate order bias
    this.questionSequence.sort(() => Math.random() - 0.5);
  }

  /**
   * Build Phase 3 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase3Sequence() {
    await this.loadArchetypeData();
    
    // Phase 3: Shadow/Integration Assessment - Keep aspiration and respect-context questions, filter others
    this.currentPhase = 3;
    this.currentQuestionIndex = 0;
    let questions = [...(PHASE_3_QUESTIONS || []), ...(RESPECT_CONTEXT_QUESTIONS || [])];

    // Always keep aspiration and respect-context questions (bias mitigation)
    const aspirationQuestions = questions.filter(q => q.isAspiration);
    const respectContextQuestions = questions.filter(q => q.isRespectContext);
    const otherQuestions = questions.filter(q => !q.isAspiration && !q.isRespectContext);

    // If IQ bracket known, reduce non-aspiration, non-respect-context questions
    if (this.iqBracket && this.iqBracket !== 'unknown') {
      const filteredOthers = this.filterQuestionsByIQ(otherQuestions, 6); // Reduce to 6
      questions = [...aspirationQuestions, ...respectContextQuestions, ...filteredOthers];
    } else {
      questions = [...aspirationQuestions, ...respectContextQuestions, ...otherQuestions];
    }

    this.questionSequence = questions;
    this.debugReporter.recordQuestionCount(questions.length);
    // Shuffle to mitigate order bias
    this.questionSequence.sort(() => Math.random() - 0.5);
  }
  
  filterQuestionsByIQ(questions, targetCount) {
    // Prioritize questions based on IQ bracket and archetype correlations
    // IQ bands correlate with certain archetypes:
    // Lower IQ (80-115): More likely Beta, Delta, Omega
    // Mid IQ (115-130): More likely Alpha, Beta, Delta
    // Higher IQ (130+): More likely Gamma, Sigma, Phi
    
    if (this.iqBracket === 'unknown') {
      return questions.slice(0, targetCount); // Just take first N if unknown
    }
    
    // Score each question by relevance to IQ bracket
    const scoredQuestions = questions.map(q => {
      let relevanceScore = 0;
      
      // Check which archetypes this question maps to
      const archetypeIds = [];
      if (q.options) {
        q.options.forEach(opt => {
          if (opt.archetypes) {
            archetypeIds.push(...opt.archetypes);
          }
        });
      }
      if (q.archetypes) {
        archetypeIds.push(...q.archetypes.map(a => a.id || a));
      }
      
      // IQ-Archetype correlations
      if (this.iqBracket === '80_100' || this.iqBracket === '100_115') {
        // Lower IQ brackets correlate with Beta, Delta, Omega
        const lowerIQArchetypes = ['beta', 'delta', 'omega', 'beta_iota', 'beta_nu', 'delta_mu'];
        relevanceScore = archetypeIds.filter(id => lowerIQArchetypes.includes(id)).length * 3;
        // Also relevant but less: Alpha (some), Gamma/Sigma less likely
        if (archetypeIds.some(id => id === 'alpha' || id === 'alpha_xi')) relevanceScore += 1;
      } else if (this.iqBracket === '115_130') {
        // Mid IQ correlates with Alpha, Beta, Delta
        const midIQArchetypes = ['alpha', 'beta', 'delta', 'alpha_xi', 'beta_nu', 'delta_mu'];
        relevanceScore = archetypeIds.filter(id => midIQArchetypes.includes(id)).length * 3;
        // Gamma/Sigma also possible
        if (archetypeIds.some(id => id === 'gamma' || id === 'sigma')) relevanceScore += 2;
      } else if (this.iqBracket === '130_145' || this.iqBracket === '145_plus') {
        // Higher IQ correlates with Gamma, Sigma, Phi, Alpha
        const higherIQArchetypes = ['gamma', 'sigma', 'phi', 'alpha', 'gamma_theta', 'sigma_kappa'];
        relevanceScore = archetypeIds.filter(id => higherIQArchetypes.includes(id)).length * 3;
        // Beta/Delta less likely but still possible
        if (archetypeIds.some(id => id === 'beta' || id === 'delta')) relevanceScore += 1;
        // Omega unlikely
        if (archetypeIds.some(id => id === 'omega')) relevanceScore -= 1;
      }
      
      return { question: q, score: relevanceScore };
    });
    
    // Sort by relevance, then randomize top questions
    scoredQuestions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Math.random() - 0.5; // Randomize ties
    });
    
    // Take top N questions, ensuring we get variety
    const selected = [];
    const seenArchetypes = new Set();
    
    // First pass: high relevance questions
    for (const item of scoredQuestions) {
      if (selected.length >= targetCount) break;
      
      // Check if this adds archetype diversity
      const questionArchetypes = [];
      if (item.question.options) {
        item.question.options.forEach(opt => {
          if (opt.archetypes) questionArchetypes.push(...opt.archetypes);
        });
      }
      
      const addsDiversity = questionArchetypes.some(id => !seenArchetypes.has(id));
      if (item.score > 0 || addsDiversity || selected.length < targetCount * 0.7) {
        selected.push(item.question);
        questionArchetypes.forEach(id => seenArchetypes.add(id));
      }
    }
    
    // Second pass: fill remaining slots if needed
    if (selected.length < targetCount) {
      for (const item of scoredQuestions) {
        if (selected.length >= targetCount) break;
        if (!selected.includes(item.question)) {
          selected.push(item.question);
        }
      }
    }
    
    return selected.slice(0, targetCount);
  }

  /**
   * Build Phase 4 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase4Sequence() {
    await this.loadArchetypeData();
    
    // Phase 4: Validation & Narrative Matching (5 narrative vignettes)
    this.currentPhase = 4;
    this.currentQuestionIndex = 0;
    this.questionSequence = [...PHASE_4_QUESTIONS];
    this.debugReporter.recordQuestionCount(this.questionSequence.length);
    // Shuffle to mitigate order bias
    this.questionSequence.sort(() => Math.random() - 0.5);
  }

  /**
   * Build Phase 5 question sequence
   * @returns {Promise<void>}
   */
  async buildPhase5Sequence() {
    await this.loadArchetypeData();

    // Phase 5: Status, Selection & Attraction Markers (gender-specific)
    this.currentPhase = 5;
    this.currentQuestionIndex = 0;
    const genderKey = this.gender === 'female' ? 'female' : 'male';
    const questions = Array.isArray(PHASE_5_QUESTIONS?.[genderKey])
      ? [...PHASE_5_QUESTIONS[genderKey]]
      : [];

    this.questionSequence = questions;
    this.debugReporter.recordQuestionCount(questions.length);
    // Shuffle to mitigate order bias
    this.questionSequence.sort(() => Math.random() - 0.5);
  }

  renderCurrentQuestion() {
    const renderStart = performance.now();
    
    if (this.questionSequence.length === 0) {
      this.finalizeResults();
      return;
    }

    const question = this.questionSequence[this.currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    if (!container) return;

    let html = '';

    // Show phase explanation at start of each phase
    if (this.currentQuestionIndex === 0) {
      html += this.getPhaseExplanation(this.currentPhase);
    }

    // Allow edits to previous answers
    const isLocked = false;

    // Render the current question only (replace previous content)
    if (question.type === 'forced_choice') {
      html += this.renderForcedChoiceQuestion(question, isLocked);
    } else if (question.type === 'multi_select') {
      html += this.renderMultiSelectQuestion(question, isLocked);
    } else if (question.type === 'likert') {
      html += this.renderLikertQuestion(question, isLocked);
    } else if (question.type === 'narrative') {
      html += this.renderNarrativeQuestion(question, isLocked);
    }

    // Replace content instead of appending - only show current question
    SecurityUtils.safeInnerHTML(container, html);
    this.updateNavigation();
    
    // Track render performance
    const renderDuration = performance.now() - renderStart;
    this.debugReporter.recordRender('question', renderDuration);

    // Scroll to question after rendering
    setTimeout(() => {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Focus management for accessibility
    const firstInput = container.querySelector('input, button, select, textarea');
    if (firstInput) {
      DOMUtils.focusElement(firstInput);
    }
  }

  getPhaseExplanation(phase) {
    const explanations = {
      1: {
        title: 'Phase 1: Core Orientation',
        description: 'We\'ll start by identifying your fundamental behavioral patterns and values through concrete scenarios.',
        purpose: 'This phase helps determine which primary archetype group (Alpha, Beta, Gamma, Delta, Sigma, Omega, or Phi) best matches your natural orientation.'
      },
      2: {
        title: 'Phase 2: Dimensional Refinement',
        description: 'Now we\'ll explore the nuances within your primary group to identify specific subtypes and variations.',
        purpose: 'This phase distinguishes between main types and their variants (e.g., Alpha vs Alpha-Xi vs Dark Alpha) through detailed behavioral statements.'
      },
      3: {
        title: 'Phase 3: Shadow & Integration Assessment',
        description: 'We\'ll examine how you respond under stress and identify secondary influences and developmental areas.',
        purpose: 'This phase reveals situational variability, aspirational traits, stress responses, and potential shadow expressions of your archetype.'
      },
      4: {
        title: 'Phase 4: Validation & Narrative Matching',
        description: 'Finally, we\'ll present narrative scenarios to confirm the resonance of your identified archetype.',
        purpose: 'This phase uses holistic pattern recognition to validate your results through real-world scenarios.'
      },
      5: {
        title: 'Phase 5: Status, Selection & Attraction Markers',
        description: 'This extension explores self-reported selection criteria and social positioning signals.',
        purpose: 'These markers refine archetype weighting by mapping coalition rank, reproductive confidence, and attraction signals.'
      }
    };

    const exp = explanations[phase];
    if (!exp) return '';
    return `
      <div class="phase-explanation">
        <h3>${SecurityUtils.sanitizeHTML(exp.title || '')}</h3>
        <p>${SecurityUtils.sanitizeHTML(exp.description || '')}</p>
        <p>${SecurityUtils.sanitizeHTML(exp.purpose || '')}</p>
      </div>
    `;
  }

  getShuffledItems(questionId, items, cache) {
    if (!Array.isArray(items) || items.length <= 1) {
      return items ? items.map((item, index) => ({ item, index })) : [];
    }
    if (!cache[questionId]) {
      const shuffled = items.map((item, index) => ({ item, index }));
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      cache[questionId] = shuffled;
    }
    return cache[questionId];
  }

  renderForcedChoiceQuestion(question, isLocked = false) {
    const currentAnswer = this.answers[question.id];
    const shuffledOptions = this.getShuffledItems(question.id, question.options, this.shuffledOptions);
    let optionsHTML = shuffledOptions.map(({ item: option, index }) => {
      const isSelected = currentAnswer && currentAnswer.selectedIndex === index;
      return `
        <label class="option-label ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}">
          <input type="radio" name="question_${question.id}" value="${index}" ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
          <span>${SecurityUtils.sanitizeHTML(option.text || '')}</span>
          ${isSelected ? '<span class="selected-check">✓</span>' : ''}
        </label>
      `;
    }).join('');

    // Add click handlers only if not locked
    if (!isLocked) {
      setTimeout(() => {
        document.querySelectorAll(`input[name="question_${question.id}"]:not([disabled])`).forEach(radio => {
          radio.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            this.processAnswer(question, selectedIndex);
            // Update visual selection immediately
            document.querySelectorAll(`label.option-label`).forEach(label => {
              label.classList.remove('selected');
            });
            const selectedLabel = e.target.closest('label');
            if (selectedLabel) {
              selectedLabel.classList.add('selected');
            }
          });
        });
      }, 100);
    }

    const lockedNotice = '';

    return `
      <div class="question-card">
        <h3>${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="options-container">
          ${optionsHTML}
        </div>
        ${lockedNotice}
      </div>
    `;
  }

  renderLikertQuestion(question, isLocked = false) {
    const currentAnswer = this.answers[question.id];
    const scale = question.scale || 5;
    const labels = Array.isArray(question.likertLabels) && question.likertLabels.length >= scale
      ? question.likertLabels
      : ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    
    let scaleHTML = '';
    for (let i = 1; i <= scale; i++) {
      const isSelected = currentAnswer && currentAnswer.value === i;
      scaleHTML += `
        <label class="likert-option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}">
          <input type="radio" name="question_${question.id}" value="${i}" ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
          <span>${i}</span>
          <div class="likert-label">${labels[i - 1] || ''}</div>
        </label>
      `;
    }

    // Add click handlers only if not locked
    if (!isLocked) {
      setTimeout(() => {
        document.querySelectorAll(`input[name="question_${question.id}"]:not([disabled])`).forEach(radio => {
          radio.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            this.processAnswer(question, value);
            // Update visual selection immediately
            document.querySelectorAll(`label.likert-option`).forEach(label => {
              label.classList.remove('selected');
            });
            const selectedLabel = e.target.closest('label');
            if (selectedLabel) {
              selectedLabel.classList.add('selected');
            }
          });
        });
      }, 100);
    }

    const lockedNotice = '';

    return `
      <div class="question-card">
        <h3>${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="likert-scale">
          ${scaleHTML}
        </div>
        ${lockedNotice}
      </div>
    `;
  }

  renderMultiSelectQuestion(question, isLocked = false) {
    const currentAnswer = this.answers[question.id];
    const selectedIndices = currentAnswer && Array.isArray(currentAnswer.selectedIndices)
      ? currentAnswer.selectedIndices
      : [];
    const shuffledOptions = this.getShuffledItems(question.id, question.options, this.shuffledOptions);

    let optionsHTML = shuffledOptions.map(({ item: option, index }) => {
      const isSelected = selectedIndices.includes(index);
      return `
        <label class="option-label ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}">
          <input type="checkbox" name="question_${question.id}" value="${index}" ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
          <span>${SecurityUtils.sanitizeHTML(option.text || '')}</span>
          ${isSelected ? '<span class="selected-check">✓</span>' : ''}
        </label>
      `;
    }).join('');

    if (!isLocked) {
      setTimeout(() => {
        const inputs = document.querySelectorAll(`input[name="question_${question.id}"]:not([disabled])`);
        inputs.forEach(input => {
          input.addEventListener('change', () => {
            const selected = Array.from(inputs)
              .filter(el => el.checked)
              .map(el => parseInt(el.value, 10));
            this.processAnswer(question, selected);
            document.querySelectorAll(`label.option-label`).forEach(label => {
              label.classList.remove('selected');
            });
            selected.forEach(idx => {
              const selectedInput = document.querySelector(`input[name="question_${question.id}"][value="${idx}"]`);
              const label = selectedInput?.closest('label');
              if (label) {
                label.classList.add('selected');
              }
            });
          });
        });
      }, 100);
    }

    const lockedNotice = '';
    return `
      <div class="question-card">
        <h3>${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <p class="form-help" style="margin-bottom: 0.75rem;"><span class="multi-select-badge" style="display: inline-block; background: var(--brand); color: #0a0a0a; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius); font-size: 0.9rem;">Select all that apply.</span></p>
        <div class="options-container">
          ${optionsHTML}
        </div>
        ${lockedNotice}
      </div>
    `;
  }

  renderNarrativeQuestion(question, isLocked = false) {
    const currentAnswer = this.answers[question.id];
    const shuffledVignettes = this.getShuffledItems(question.id, question.vignettes, this.shuffledVignettes);
    let vignettesHTML = shuffledVignettes.map(({ item: vignette, index }) => {
      const isSelected = currentAnswer && currentAnswer.selectedIndex === index;
      const lockedStyle = isLocked && !isSelected ? 'opacity: 0.5; cursor: not-allowed;' : '';
      const selectedLockedStyle = isLocked && isSelected ? 'background: rgba(255, 184, 0, 0.3) !important; border: 3px solid var(--brand) !important;' : '';
      return `
        <label class="narrative-option ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}" style="display: block; padding: 1.5rem; margin: 1rem 0; background: ${isSelected ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'}; border: 2px solid ${isSelected ? 'var(--brand)' : 'transparent'}; border-radius: var(--radius); cursor: ${isLocked && !isSelected ? 'not-allowed' : 'pointer'}; transition: all 0.2s; ${lockedStyle} ${selectedLockedStyle}">
          <input type="radio" name="question_${question.id}" value="${index}" ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''} style="margin-right: 0.5rem;">
          <div style="font-style: italic; color: var(--muted); line-height: 1.7;">${SecurityUtils.sanitizeHTML(vignette.text || '')}</div>
          ${isSelected ? '<div style="margin-top: 0.5rem; color: var(--brand); font-weight: 700; font-size: 0.9rem;">✓ Selected</div>' : ''}
        </label>
      `;
    }).join('');

    // Add click handlers only if not locked
    if (!isLocked) {
      setTimeout(() => {
        document.querySelectorAll(`input[name="question_${question.id}"]:not([disabled])`).forEach(radio => {
          radio.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            this.processAnswer(question, selectedIndex);
            // Update visual selection immediately
            document.querySelectorAll(`label.narrative-option`).forEach(label => {
              label.classList.remove('selected');
            });
            const selectedLabel = e.target.closest('label');
            if (selectedLabel) {
              selectedLabel.classList.add('selected');
            }
          });
        });
      }, 100);
    }

    const lockedNotice = '';

    return `
      <div class="question-card">
        <h3>${SecurityUtils.sanitizeHTML(question.question || '')}</h3>
        <div class="narrative-container">
          ${vignettesHTML}
        </div>
        ${lockedNotice}
      </div>
    `;
  }

  processAnswer(question, answerValue) {
    this.answers[question.id] = {
      questionId: question.id,
      value: answerValue,
      selectedIndex: Array.isArray(answerValue) ? undefined : answerValue,
      selectedIndices: Array.isArray(answerValue) ? answerValue : undefined,
      timestamp: new Date().toISOString()
    };

    // Respect context: store only, do not score as archetype
    if (this.currentPhase === 3 && question.isRespectContext) {
      this.respectContextAnswers[question.id] = {
        value: typeof answerValue === 'number' ? answerValue : (Array.isArray(answerValue) ? answerValue[0] : 0),
        key: question.respectContextKey,
        type: question.respectContextType || 'feel'
      };
      this.saveProgress();
      return;
    }

    // Score based on phase
    if (this.currentPhase === 1) {
      this.scorePhase1Answer(question, answerValue);
    } else if (this.currentPhase === 2) {
      this.scorePhase2Answer(question, answerValue);
    } else if (this.currentPhase === 3) {
      this.scorePhase3Answer(question, answerValue);
    } else if (this.currentPhase === 4) {
      this.scorePhase4Answer(question, answerValue);
    } else if (this.currentPhase === 5) {
      this.scorePhase5Answer(question, answerValue);
    }

    this.saveProgress();
  }

  scorePhase1Answer(question, selectedIndex) {
    // Phase 1: 50% weight
    const selectedOption = question.options[selectedIndex];
    if (!selectedOption) return;

    selectedOption.archetypes.forEach(archId => {
      // Map to gender-specific archetype if gender is selected
      let targetArchId = archId;
      if (this.gender === 'female') {
        const femaleMapping = {
          'alpha': 'alpha_female',
          'alpha_xi': 'alpha_xi_female',
          'alpha_rho': 'alpha_xi_female', // Alpha-Rho doesn't exist for female
          'dark_alpha': 'dark_alpha_female',
          'beta': 'beta_female',
          'beta_iota': 'alpha_unicorn_female',
          'beta_nu': 'beta_nu_female',
          'beta_manipulator': 'beta_kappa_female',
          'beta_kappa': 'beta_kappa_female',
          'beta_rho': 'beta_rho_female',
          'gamma': 'gamma_female',
          'gamma_theta': 'gamma_theta_female',
          'dark_gamma': 'dark_gamma_female',
          'delta': 'delta_female',
          'delta_mu': 'delta_mu_female',
          'dark_delta': 'dark_delta_female',
          'sigma': 'sigma_female',
          'dark_sigma_zeta': 'dark_sigma_zeta_female',
          'omega': 'omega_female',
          'dark_omega': 'dark_omega_female',
          'phi': 'phi_female'
        };
        targetArchId = femaleMapping[archId] || archId;
      }
      
      // Initialize score if needed
      if (!this.archetypeScores[targetArchId]) {
        this.archetypeScores[targetArchId] = {
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0,
          phase5: 0,
          total: 0,
          weighted: 0
        };
      }
      
      const weight = selectedOption.weight || 1;
      this.archetypeScores[targetArchId].phase1 += weight * 3; // Phase 1 gets 3x multiplier
    });
  }

  scorePhase2Answer(question, value) {
    // Phase 2: 30% weight
    // Likert scale: 1-5, convert to -2 to +2 for scoring
    const normalizedValue = value - 3; // -2 to +2

    const mapArchetypeId = (archId) => {
      if (this.gender !== 'female') return archId;
      const femaleMapping = {
        'alpha': 'alpha_female',
        'alpha_xi': 'alpha_xi_female',
        'alpha_rho': 'alpha_xi_female',
        'dark_alpha': 'dark_alpha_female',
        'beta': 'beta_female',
        'beta_iota': 'alpha_unicorn_female',
        'beta_nu': 'beta_nu_female',
        'beta_manipulator': 'beta_kappa_female',
        'beta_kappa': 'beta_kappa_female',
        'beta_rho': 'beta_rho_female',
        'gamma': 'gamma_female',
        'gamma_theta': 'gamma_theta_female',
        'dark_gamma': 'dark_gamma_female',
        'delta': 'delta_female',
        'delta_mu': 'delta_mu_female',
        'dark_delta': 'dark_delta_female',
        'sigma': 'sigma_female',
        'dark_sigma_zeta': 'dark_sigma_zeta_female',
        'omega': 'omega_female',
        'dark_omega': 'dark_omega_female',
        'phi': 'phi_female'
      };
      return femaleMapping[archId] || archId;
    };

    // Handle forced-choice refinement questions that use options instead of archetypes
    if (question.options && Array.isArray(question.options)) {
      const selectedOption = question.options[value];
      if (!selectedOption || !Array.isArray(selectedOption.archetypes)) {
        this.debugReporter.logError(new Error('Phase 2 forced-choice option missing archetypes array'), 'scorePhase2Answer');
        return;
      }

      selectedOption.archetypes.forEach(archId => {
        const targetArchId = mapArchetypeId(archId);
        if (!this.archetypeScores[targetArchId]) {
          this.archetypeScores[targetArchId] = {
            phase1: 0,
            phase2: 0,
            phase3: 0,
            phase4: 0,
            phase5: 0,
            total: 0,
            weighted: 0
          };
        }
        const weight = selectedOption.weight || 1;
        this.archetypeScores[targetArchId].phase2 += 1 * weight * 2;
      });
      return;
    }
    
    if (!question.archetypes || !Array.isArray(question.archetypes)) {
      this.debugReporter.logError(new Error('Phase 2 question missing archetypes array'), 'scorePhase2Answer');
      return;
    }
    
    question.archetypes.forEach(arch => {
      // Skip if arch or arch.id is missing
      if (!arch || !arch.id) {
        this.debugReporter.logError(new Error('Phase 2 archetype missing id'), 'scorePhase2Answer');
        return;
      }
      
      const targetArchId = mapArchetypeId(arch.id);
      // Initialize score object if it doesn't exist
      if (!this.archetypeScores[targetArchId]) {
        this.archetypeScores[targetArchId] = {
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0,
          phase5: 0,
          total: 0,
          weighted: 0
        };
      }
      
      const weight = arch.weight || 1;
      this.archetypeScores[targetArchId].phase2 += normalizedValue * weight * 2; // Phase 2 gets 2x multiplier
    });
  }

  scorePhase3Answer(question, selectedIndex) {
    // Phase 3: 15% weight
    if (!Array.isArray(question.options)) return;

    // Track aspiration answers separately for bias mitigation
    if (question.isAspiration) {
      if (!this.aspirationAnswers[question.id]) {
        this.aspirationAnswers[question.id] = [];
      }
      if (Array.isArray(selectedIndex)) {
        selectedIndex.forEach(idx => {
          const opt = question.options[idx];
          if (opt?.aspirationTarget) {
            this.aspirationAnswers[question.id].push(opt.aspirationTarget);
          }
        });
      } else {
        const selectedOption = question.options[selectedIndex];
        if (selectedOption?.aspirationTarget) {
      this.aspirationAnswers[question.id].push(selectedOption.aspirationTarget);
        }
      }
      // Don't apply direct scoring for aspiration questions - they're used for reverse psychology
      return;
    }

    const selectedOptions = Array.isArray(selectedIndex)
      ? selectedIndex.map(idx => question.options[idx]).filter(Boolean)
      : [question.options[selectedIndex]].filter(Boolean);

    selectedOptions.forEach(selectedOption => {
      if (!selectedOption || !selectedOption.archetypes) return;
    selectedOption.archetypes.forEach(archId => {
      // Map to gender-specific archetype if gender is selected
      let targetArchId = archId;
      if (this.gender === 'female') {
        const femaleMapping = {
          'alpha': 'alpha_female',
          'alpha_xi': 'alpha_xi_female',
          'alpha_rho': 'alpha_xi_female',
          'dark_alpha': 'dark_alpha_female',
          'beta': 'beta_female',
          'beta_iota': 'alpha_unicorn_female',
          'beta_nu': 'beta_nu_female',
          'beta_manipulator': 'beta_kappa_female',
          'beta_kappa': 'beta_kappa_female',
          'beta_rho': 'beta_rho_female',
          'gamma': 'gamma_female',
          'gamma_theta': 'gamma_theta_female',
          'dark_gamma': 'dark_gamma_female',
          'delta': 'delta_female',
          'delta_mu': 'delta_mu_female',
          'dark_delta': 'dark_delta_female',
          'sigma': 'sigma_female',
          'dark_sigma_zeta': 'dark_sigma_zeta_female',
          'omega': 'omega_female',
          'dark_omega': 'dark_omega_female',
          'phi': 'phi_female'
        };
        targetArchId = femaleMapping[archId] || archId;
      }
      
      // Initialize score if needed
      if (!this.archetypeScores[targetArchId]) {
        this.archetypeScores[targetArchId] = {
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0,
          phase5: 0,
          total: 0,
          weighted: 0
        };
      }
      
      const weight = selectedOption.weight || 1;
      this.archetypeScores[targetArchId].phase3 += weight * 1; // Phase 3 gets 1x multiplier
      });
    });
  }

  scorePhase4Answer(question, selectedIndex) {
    // Phase 4: 5% weight (validation)
    const selectedVignette = question.vignettes[selectedIndex];
    if (!selectedVignette) return;

    selectedVignette.archetypes.forEach(archId => {
      const weight = selectedVignette.weight || 1;
      this.archetypeScores[archId].phase4 += weight * 0.5; // Phase 4 gets 0.5x multiplier
    });
  }

  scorePhase5Answer(question, value) {
    // Phase 5: Status/Selection/Attraction markers (light weighting)
    const normalizedValue = value - 3; // -2 to +2

    const mapArchetypeId = (archId) => {
      if (this.gender !== 'female') return archId;
      const femaleMapping = {
        'alpha': 'alpha_female',
        'alpha_xi': 'alpha_xi_female',
        'alpha_rho': 'alpha_xi_female',
        'dark_alpha': 'dark_alpha_female',
        'beta': 'beta_female',
        'beta_iota': 'alpha_unicorn_female',
        'beta_nu': 'beta_nu_female',
        'beta_manipulator': 'beta_kappa_female',
        'beta_kappa': 'beta_kappa_female',
        'beta_rho': 'beta_rho_female',
        'gamma': 'gamma_female',
        'gamma_theta': 'gamma_theta_female',
        'dark_gamma': 'dark_gamma_female',
        'delta': 'delta_female',
        'delta_mu': 'delta_mu_female',
        'dark_delta': 'dark_delta_female',
        'sigma': 'sigma_female',
        'dark_sigma_zeta': 'dark_sigma_zeta_female',
        'omega': 'omega_female',
        'dark_omega': 'dark_omega_female',
        'phi': 'phi_female'
      };
      return femaleMapping[archId] || archId;
    };

    if (!question.archetypes || !Array.isArray(question.archetypes)) {
      this.debugReporter.logError(new Error('Phase 5 question missing archetypes array'), 'scorePhase5Answer');
      return;
    }

    question.archetypes.forEach(arch => {
      if (!arch || !arch.id) {
        this.debugReporter.logError(new Error('Phase 5 archetype missing id'), 'scorePhase5Answer');
        return;
      }
      const targetArchId = mapArchetypeId(arch.id);
      if (!this.archetypeScores[targetArchId]) {
        this.archetypeScores[targetArchId] = {
          phase1: 0,
          phase2: 0,
          phase3: 0,
          phase4: 0,
          phase5: 0,
          total: 0,
          weighted: 0
        };
      }
      const weight = arch.weight || 1;
      this.archetypeScores[targetArchId].phase5 += normalizedValue * weight;
    });
  }

  calculateFinalScores() {
    // Apply aspiration-based adjustments BEFORE final calculation
    if (this.analysisData.aspirationAnalysis && this.analysisData.aspirationAnalysis.adjustments) {
      const adjustments = this.analysisData.aspirationAnalysis.adjustments;
      Object.keys(adjustments).forEach(archId => {
        if (this.archetypeScores[archId]) {
          // Apply adjustment to phase 1 and 2 scores (behavioral evidence)
          this.archetypeScores[archId].phase1 *= adjustments[archId];
          this.archetypeScores[archId].phase2 *= adjustments[archId];
        }
      });
    }

    // Apply respect-context adjustments (social vs business) to reduce over-attribution of Alpha when respect is business-only
    if (this.analysisData.respectContext && this.analysisData.respectContext.adjustments) {
      const adj = this.analysisData.respectContext.adjustments;
      Object.keys(this.archetypeScores).forEach(archId => {
        const baseId = archId.replace(/_female$/, '');
        const mult = adj[baseId] ?? adj[archId] ?? 1;
        this.archetypeScores[archId].phase1 *= mult;
        this.archetypeScores[archId].phase2 *= mult;
        this.archetypeScores[archId].phase3 *= (1 + ((mult - 1) * 0.5)); // damped carryover into phase 3
      });
    }

    // Apply provision-context adjustments (males): low provision down-weights Alpha, up-weights Beta/Delta so Alpha isn't over-attributed when respondent struggles to provide
    if (this.gender === 'male' && this.analysisData.provisionContext && this.analysisData.provisionContext.adjustments) {
      const adj = this.analysisData.provisionContext.adjustments;
      Object.keys(this.archetypeScores).forEach(archId => {
        const baseId = archId.replace(/_female$/, '');
        const mult = adj[baseId] ?? adj[archId] ?? 1;
        this.archetypeScores[archId].phase1 *= mult;
        this.archetypeScores[archId].phase2 *= mult;
        this.archetypeScores[archId].phase3 *= (1 + ((mult - 1) * 0.5)); // damped carryover into phase 3
      });
    }

    // Apply aesthetics-context adjustments (both genders): high aesthetic capital amplifies Alpha/Sigma,
    // low aesthetic capital dampens them; large aesthetic-behavioural gap nudges toward inner-pattern archetypes.
    // Multipliers are intentionally modest — aesthetics nudge, not override behavioural evidence.
    if (this.analysisData.aestheticsContext && this.analysisData.aestheticsContext.adjustments) {
      const adj = this.analysisData.aestheticsContext.adjustments;
      Object.keys(this.archetypeScores).forEach(archId => {
        const baseId = archId.replace(/_female$/, '');
        const mult = adj[baseId] ?? adj[archId] ?? 1;
        this.archetypeScores[archId].phase1 *= mult;
        this.archetypeScores[archId].phase2 *= mult;
        this.archetypeScores[archId].phase3 *= (1 + ((mult - 1) * 0.5)); // damped carryover into phase 3
      });
    }

    // Gender-split calibrated phase weights.
    // Weights derived from: desired_proportion / typical_max_raw_score_per_archetype_per_phase,
    // accounting for per-scoring multipliers (Phase1=3x, Phase2=2x, Phase3=1x, Phase4=0.5x, Phase5=1x).
    //
    // Male targets:  Phase1=45%, Phase2=28%, Phase3=14%, Phase4=7%, Phase5=6%
    //   Phase 5 now has 16 questions (12 original + 4 aesthetics_capital) — p5raw rises ~1.5pts.
    //   Weight drops from 0.0077 to 0.0060 to hold 6% target proportion.
    //
    // Female targets: Phase1=42%, Phase2=28%, Phase3=14%, Phase4=7%, Phase5=9%
    //   Phase 5 now has 18 questions (14 previous + 4 aesthetics_capital) — p5raw rises ~1.5pts.
    //   Weight drops from 0.0107 to 0.0090 to hold 9% target proportion.
    // Phase 3 has 16 non-aspiration behavioral questions (p3raw ≈ 8) — weight 0.0175 unchanged.
    const phaseWeights = this.gender === 'female'
      ? {
          phase1: 0.0233,  // 42%
          phase2: 0.0194,  // 28%
          phase3: 0.0175,  // 14% — 16 behavioral qs (p3raw ≈ 8)
          phase4: 0.0467,  //  7%
          phase5: 0.0090   //  9% — recalibrated for 18 female Phase 5 qs (p5raw ≈ 9.9)
        }
      : {
          phase1: 0.025,   // 45%
          phase2: 0.0194,  // 28%
          phase3: 0.0175,  // 14% — 16 behavioral qs (p3raw ≈ 8)
          phase4: 0.0467,  //  7%
          phase5: 0.0060   //  6% — recalibrated for 16 male Phase 5 qs (p5raw ≈ 9.9)
        };

    // Apply phase weights with Phase 5 extension
    Object.keys(this.archetypeScores).forEach(archId => {
      const scores = this.archetypeScores[archId];
      scores.total = scores.phase1 + scores.phase2 + scores.phase3 + scores.phase4 + (scores.phase5 || 0);
      scores.weighted = (scores.phase1 * phaseWeights.phase1)
        + (scores.phase2 * phaseWeights.phase2)
        + (scores.phase3 * phaseWeights.phase3)
        + (scores.phase4 * phaseWeights.phase4)
        + ((scores.phase5 || 0) * phaseWeights.phase5);
    });
  }

  identifyArchetypes() {
    this.calculateFinalScores();

    // Map gender-neutral archetype IDs to gender-specific ones
    const genderMapping = {
      'alpha': this.gender === 'female' ? 'alpha_female' : 'alpha',
      'alpha_xi': this.gender === 'female' ? 'alpha_xi_female' : 'alpha_xi',
      'alpha_rho': this.gender === 'female' ? 'alpha_rho' : 'alpha_rho', // Alpha-Rho is male-specific
      'dark_alpha': this.gender === 'female' ? 'dark_alpha_female' : 'dark_alpha',
      'beta': this.gender === 'female' ? 'beta_female' : 'beta',
      'beta_iota': this.gender === 'female' ? 'alpha_unicorn_female' : 'beta_iota', // Alpha-Unicorn maps to Beta-Iota pattern
      'beta_nu': this.gender === 'female' ? 'beta_nu_female' : 'beta_nu',
      'beta_manipulator': this.gender === 'female' ? 'beta_kappa_female' : 'beta_kappa',
      'beta_kappa': this.gender === 'female' ? 'beta_kappa_female' : 'beta_kappa',
      'beta_rho': this.gender === 'female' ? 'beta_rho_female' : 'beta_rho',
      'gamma': this.gender === 'female' ? 'gamma_female' : 'gamma',
      'gamma_theta': this.gender === 'female' ? 'gamma_theta_female' : 'gamma_theta',
      'dark_gamma': this.gender === 'female' ? 'dark_gamma_female' : 'dark_gamma',
      'delta': this.gender === 'female' ? 'delta_female' : 'delta',
      'delta_mu': this.gender === 'female' ? 'delta_mu_female' : 'delta_mu',
      'dark_delta': this.gender === 'female' ? 'dark_delta_female' : 'dark_delta',
      'sigma': this.gender === 'female' ? 'sigma_female' : 'sigma',
      'dark_sigma_zeta': this.gender === 'female' ? 'dark_sigma_zeta_female' : 'dark_sigma_zeta',
      'omega': this.gender === 'female' ? 'omega_female' : 'omega',
      'dark_omega': this.gender === 'female' ? 'dark_omega_female' : 'dark_omega',
      'phi': this.gender === 'female' ? 'phi_female' : 'phi'
    };

    // Get all archetypes sorted by weighted score, mapping to gender-specific IDs
    const sortedArchetypes = Object.keys(this.archetypeScores)
      .map(archId => {
        const genderSpecificId = genderMapping[archId] || archId;
        const archetype = ARCHETYPES[genderSpecificId] || ARCHETYPES[archId];
        if (!archetype) return null;
        return {
          id: genderSpecificId,
          ...archetype,
          score: this.archetypeScores[archId].weighted,
          totalScore: this.archetypeScores[archId].total
        };
      })
      .filter(arch => arch !== null)
      .sort((a, b) => b.score - a.score);

    // Primary archetype (highest score)
    let primary = sortedArchetypes[0];

    const pickSubtype = (baseArchetype) => {
      if (!baseArchetype?.subtypes?.length) return null;
      const subtypeScores = baseArchetype.subtypes
        .map(id => ({
          id,
          score: this.archetypeScores[id]?.phase2 || 0
        }))
        .sort((a, b) => b.score - a.score);
      const topSubtype = subtypeScores[0];
      if (!topSubtype || topSubtype.score <= 0) return null;
      const subtype = ARCHETYPES[topSubtype.id];
      return subtype ? { ...subtype, score: this.archetypeScores[topSubtype.id]?.weighted || topSubtype.score } : null;
    };

    const primarySubtype = pickSubtype(primary);
    if (primarySubtype) {
      primary = { ...primarySubtype, parentType: primary?.id || primarySubtype.parentType };
    }
    
    // Secondary archetype (next highest, must be >25% of primary)
    let secondary = sortedArchetypes[1] && sortedArchetypes[1].score > (primary.score * 0.25) 
      ? sortedArchetypes[1] 
      : null;
    const secondarySubtype = pickSubtype(secondary);
    if (secondarySubtype) {
      secondary = { ...secondarySubtype, parentType: secondary?.id || secondarySubtype.parentType };
    }

    // Tertiary archetype (next highest, must be >15% of primary)
    let tertiary = sortedArchetypes[2] && sortedArchetypes[2].score > (primary.score * 0.15)
      ? sortedArchetypes[2]
      : null;
    const tertiarySubtype = pickSubtype(tertiary);
    if (tertiarySubtype) {
      tertiary = { ...tertiarySubtype, parentType: tertiary?.id || tertiarySubtype.parentType };
    }

    // Calculate confidence levels
    const totalScore = sortedArchetypes.reduce((sum, arch) => sum + arch.score, 0);
    const primaryConfidence = totalScore > 0 ? (primary.score / totalScore) * 100 : 0;
    const secondaryConfidence = secondary && totalScore > 0 ? (secondary.score / totalScore) * 100 : 0;
    const tertiaryConfidence = tertiary && totalScore > 0 ? (tertiary.score / totalScore) * 100 : 0;

    this.analysisData.primaryArchetype = {
      ...primary,
      confidence: primaryConfidence
    };
    this.analysisData.secondaryArchetype = secondary ? {
      ...secondary,
      confidence: secondaryConfidence
    } : null;
    this.analysisData.tertiaryArchetype = tertiary ? {
      ...tertiary,
      confidence: tertiaryConfidence
    } : null;
    this.analysisData.confidenceLevels = {
      primary: primaryConfidence,
      secondary: secondaryConfidence,
      tertiary: tertiaryConfidence
    };
  }

  async nextQuestion() {
    // Check if current question has been answered
    const currentQuestion = this.questionSequence[this.currentQuestionIndex];
    if (currentQuestion && !this.answers[currentQuestion.id]) {
      ErrorHandler.showUserError('Please select an answer before proceeding.');
      return;
    }

    if (this.currentQuestionIndex < this.questionSequence.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentQuestion();
      this.saveProgress();
    } else {
      // End of current phase
      await this.completePhase();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderCurrentQuestion();
    }
  }

  async completePhase() {
    try {
      if (this.currentPhase === 1) {
        this.analyzePhase1Results();
        await this.buildPhase2Sequence();
        this.renderCurrentQuestion();
      } else if (this.currentPhase === 2) {
        this.analyzePhase2Results();
        await this.buildPhase3Sequence();
        this.renderCurrentQuestion();
      } else if (this.currentPhase === 3) {
        this.analyzePhase3Results();
        await this.buildPhase4Sequence();
        this.renderCurrentQuestion();
      } else if (this.currentPhase === 4) {
        await this.buildPhase5Sequence();
        this.renderCurrentQuestion();
      } else if (this.currentPhase === 5) {
        this.analyzePhase5Results();
        this.finalizeResults();
      }
    } catch (error) {
      this.debugReporter.logError(error, 'completePhase');
      ErrorHandler.showUserError('Failed to load next phase. Please refresh the page.');
    }
  }

  analyzePhase1Results() {
    this.analysisData.phase1Results = {
      coreGroupScores: this.calculateCoreGroupScores(),
      timestamp: new Date().toISOString()
    };
  }

  analyzePhase2Results() {
    this.analysisData.phase2Results = {
      subtypeScores: this.getTopSubtypes(5),
      timestamp: new Date().toISOString()
    };
  }

  analyzePhase3Results() {
    this.analysisData.phase3Results = {
      // Shadow list needs primary/secondary/tertiary — filled in finalizeResults via getShadowPatternsForReport()
      shadowIndicators: [],
      aspirationalTraits: this.identifyAspirationalTraits(),
      timestamp: new Date().toISOString()
    };

    // Analyze aspirations for bias mitigation
    this.analysisData.aspirationAnalysis = this.analyzeAspirations();

    // Respect context: social vs business for bias mitigation (e.g. over-attribution of Alpha)
    const respectContext = this.computeRespectContext();
    if (respectContext) {
      this.analysisData.respectContext = respectContext;
    }
  }

  computeRespectContext() {
    const raw = this.respectContextAnswers || {};
    const getScore = (key, type) => {
      const entries = Object.values(raw).filter(r => r && r.key === key && (type ? r.type === type : true));
      if (entries.length === 0) return null;
      const sum = entries.reduce((s, e) => s + (typeof e.value === 'number' ? e.value : 0), 0);
      return sum / entries.length;
    };
    const socialFeel = getScore('social', 'feel');
    const socialDeference = getScore('social', 'deference');
    const businessFeel = getScore('business', 'feel');
    const businessDeference = getScore('business', 'deference');
    const socialRespect = socialFeel != null && socialDeference != null
      ? (socialFeel + socialDeference) / 2
      : (socialFeel ?? socialDeference);
    const businessRespect = businessFeel != null && businessDeference != null
      ? (businessFeel + businessDeference) / 2
      : (businessFeel ?? businessDeference);
    if (socialRespect == null && businessRespect == null) return null;

    const band = (v) => (v == null ? 'mid' : v >= 4 ? 'high' : v <= 2 ? 'low' : 'mid');
    const socialBand = band(socialRespect);
    const businessBand = band(businessRespect);
    const pattern = `${socialBand}_${businessBand}`;

    const topBehavioral = Object.keys(this.archetypeScores)
      .map(archId => ({ id: archId, score: (this.archetypeScores[archId].phase1 || 0) + (this.archetypeScores[archId].phase2 || 0) }))
      .sort((a, b) => b.score - a.score)[0]?.id;
    const adjustments = this.calculateRespectContextAdjustments(pattern, topBehavioral);

    return {
      socialRespect: socialRespect ?? 0,
      businessRespect: businessRespect ?? 0,
      pattern,
      adjustments
    };
  }

  calculateRespectContextAdjustments(pattern, topBehavioral) {
    // Base (canonical) archetype ids only; apply in calculateFinalScores via baseId lookup for gender-specific keys
    const adj = {};
    const alphaFamily = ['alpha', 'alpha_xi', 'alpha_rho', 'dark_alpha'];
    const betaDelta = ['beta', 'beta_nu', 'beta_kappa', 'delta', 'delta_mu'];

    if (pattern === 'low_high') {
      alphaFamily.forEach(a => { adj[a] = 0.8; });
      betaDelta.forEach(b => { adj[b] = 1.2; });
      ['gamma', 'sigma'].forEach(g => { adj[g] = 0.95; });
      adj['omega'] = 1.05;
      adj['phi'] = 0.98;
    } else if (pattern === 'high_low') {
      adj['alpha'] = 0.92;
      ['beta', 'sigma', 'gamma'].forEach(b => { adj[b] = 1.1; });
      adj['delta'] = 0.9;
      adj['omega'] = 1.05;
    } else if (pattern === 'high_high') {
      ['alpha', 'sigma', 'phi'].forEach(a => { adj[a] = 1.03; });
      adj['beta'] = 0.97;
      adj['omega'] = 0.97;
    } else if (pattern === 'low_low') {
      adj['alpha'] = 0.85;
      adj['omega'] = 1.1;
      adj['delta'] = 1.1;
      adj['sigma'] = 1.05;
    }
    return adj;
  }

  analyzePhase5Results() {
    const clusters = {};
    const markers = [];

    this.questionSequence.forEach(question => {
      const answer = this.answers[question.id];
      if (!answer || typeof answer.value !== 'number') return;
      if (!question.cluster) return;

      const normalized = (answer.value - 1) / 4; // 0-1
      const clusterKey = question.cluster;
      if (!clusters[clusterKey]) {
        clusters[clusterKey] = {
          label: question.clusterLabel || clusterKey,
          total: 0,
          count: 0
        };
      }
      clusters[clusterKey].total += normalized;
      clusters[clusterKey].count += 1;
      markers.push({
        label: question.markerLabel || question.question || '',
        cluster: clusterKey,
        clusterLabel: question.clusterLabel || clusterKey,
        score: normalized
      });
    });

    Object.keys(clusters).forEach(key => {
      const entry = clusters[key];
      const avg = entry.count > 0 ? entry.total / entry.count : 0;
      entry.score = avg;
    });

    const topMarkers = markers
      .filter(marker => marker.label)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    this.analysisData.phase5Results = {
      clusters,
      topMarkers,
      timestamp: new Date().toISOString()
    };

    // Male provision context: low provision should down-weight Alpha and up-weight Beta/Delta (avoid over-attribution when respondent can't provide)
    if (this.gender === 'male') {
      const provisionQuestionIds = ['p5_m_rc_provision_dating', 'p5_m_rc_provision_lifestyle', 'p5_m_rc_provision_stability'];
      let provisionSum = 0;
      let provisionCount = 0;
      provisionQuestionIds.forEach(qId => {
        const ans = this.answers[qId];
        if (ans && typeof ans.value === 'number') {
          provisionSum += ans.value;
          provisionCount += 1;
        }
      });
      const provisionAverage = provisionCount > 0 ? provisionSum / provisionCount : null;
      const provisionLevel = provisionAverage == null ? 'unknown' : provisionAverage <= 2.5 ? 'low' : provisionAverage >= 4 ? 'high' : 'mid';
      if (provisionLevel === 'low') {
        this.analysisData.provisionContext = {
          provisionAverage,
          provisionLevel: 'low',
          adjustments: {
            alpha: 0.78,
            alpha_xi: 0.78,
            alpha_rho: 0.78,
            dark_alpha: 0.78,
            beta: 1.22,
            beta_nu: 1.22,
            beta_kappa: 1.18,
            delta: 1.22,
            delta_mu: 1.22,
            gamma: 0.98,
            sigma: 0.98,
            omega: 1.05,
            phi: 0.97
          }
        };
      } else {
        this.analysisData.provisionContext = provisionAverage != null ? { provisionAverage, provisionLevel } : null;
      }
    }

    // Aesthetics context: applies to both genders
    // Questions: investment, market return, engineering intentionality, aesthetic-behavioural gap
    const isMaleAesthetics = this.gender === 'male';
    const acInvestmentId  = isMaleAesthetics ? 'p5_m_ac_investment'  : 'p5_f_ac_investment';
    const acResponseId    = isMaleAesthetics ? 'p5_m_ac_response'    : 'p5_f_ac_response';
    const acEngineeringId = isMaleAesthetics ? 'p5_m_ac_engineering' : 'p5_f_ac_engineering';
    const acGapId         = isMaleAesthetics ? 'p5_m_ac_gap'         : 'p5_f_ac_gap';

    const acAnswers = [acInvestmentId, acResponseId, acEngineeringId, acGapId]
      .map(id => this.answers[id])
      .filter(a => a && typeof a.value === 'number');

    if (acAnswers.length >= 2) {
      const acValues = acAnswers.map(a => a.value);
      const aestheticsAverage = acValues.slice(0, 3).reduce((s, v) => s + v, 0) / Math.min(3, acValues.length);
      const gapScore = (this.answers[acGapId]?.value ?? null);
      const engineeringScore = (this.answers[acEngineeringId]?.value ?? null);

      const aestheticsLevel = aestheticsAverage >= 4.0 ? 'high' : aestheticsAverage <= 2.0 ? 'low' : 'mid';
      const engineeringLevel = engineeringScore == null ? 'unknown' : engineeringScore >= 4 ? 'high' : engineeringScore <= 2 ? 'low' : 'mid';
      const gapLevel = gapScore == null ? 'unknown' : gapScore >= 4 ? 'large' : gapScore <= 2 ? 'small' : 'moderate';

      let adjustments = null;

      if (this.gender === 'male') {
        if (aestheticsLevel === 'high') {
          adjustments = {
            alpha: 1.08, alpha_xi: 1.05, sigma: 1.06,
            delta: 0.96, beta: 0.97, omega: 0.95, gamma: 0.97
          };
        } else if (aestheticsLevel === 'low') {
          adjustments = {
            alpha: 0.92, alpha_xi: 0.93, sigma: 0.94,
            delta: 1.04, beta: 1.03, omega: 1.05, gamma: 1.02
          };
        }
        // If large gap detected: the aesthetic presentation is masking behavioral archetype — nudge toward inner-pattern archetypes
        if (gapLevel === 'large' && adjustments) {
          adjustments.gamma  = (adjustments.gamma  || 1) * 1.08;
          adjustments.beta   = (adjustments.beta   || 1) * 1.06;
          adjustments.omega  = (adjustments.omega  || 1) * 1.04;
          adjustments.alpha  = (adjustments.alpha  || 1) * 0.93;
          adjustments.sigma  = (adjustments.sigma  || 1) * 0.95;
        }
      } else {
        if (aestheticsLevel === 'high') {
          adjustments = {
            alpha: 1.10, sigma: 1.06,
            delta: 0.95, beta: 0.96, gamma: 0.97, omega: 0.95
          };
        } else if (aestheticsLevel === 'low') {
          adjustments = {
            alpha: 0.90, sigma: 0.94,
            delta: 1.05, beta: 1.04, gamma: 1.03, omega: 1.05
          };
        }
        if (gapLevel === 'large' && adjustments) {
          adjustments.dark_alpha = (adjustments.dark_alpha || 1) * 1.08;
          adjustments.beta_kappa = (adjustments.beta_kappa || 1) * 1.08;
          adjustments.alpha      = (adjustments.alpha      || 1) * 0.93;
          adjustments.sigma      = (adjustments.sigma      || 1) * 0.94;
        }
      }

      this.analysisData.aestheticsContext = {
        aestheticsAverage,
        aestheticsLevel,
        engineeringLevel,
        gapLevel,
        adjustments
      };
    }
  }

  analyzeAspirations() {
    // Collect all aspiration targets from aspiration questions
    const aspirationTargets = [];
    Object.values(this.aspirationAnswers).forEach(answerArray => {
      aspirationTargets.push(...answerArray);
    });
    
    // Count frequency of each aspiration
    const aspirationCounts = {};
    aspirationTargets.forEach(target => {
      aspirationCounts[target] = (aspirationCounts[target] || 0) + 1;
    });
    
    // Find most frequently aspired-to archetype
    const topAspiration = Object.keys(aspirationCounts)
      .sort((a, b) => aspirationCounts[b] - aspirationCounts[a])[0];
    
    // Get current top behavioral archetypes (before aspiration adjustment)
    const behavioralTop3 = Object.keys(this.archetypeScores)
      .map(archId => ({
        id: archId,
        score: this.archetypeScores[archId].phase1 + this.archetypeScores[archId].phase2
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(a => a.id);
    
    const topBehavioral = behavioralTop3[0];
    
    // Apply reverse psychology logic based on gender
    const adjustments = this.calculateAspirationAdjustments(topAspiration, topBehavioral, aspirationCounts);
    
    return {
      topAspiration: topAspiration,
      topBehavioral: topBehavioral,
      aspirationCounts: aspirationCounts,
      adjustments: adjustments,
      explanation: this.generateAspirationExplanation(topAspiration, topBehavioral, adjustments)
    };
  }
  
  calculateAspirationAdjustments(aspiredTo, topBehavioral, aspirationCounts) {
    const adjustments = {};
    
    // Get reproductive success levels for aspiration analysis
    const getReproductiveSuccess = (archId) => {
      const archetype = ARCHETYPES[archId] || ARCHETYPES[this.gender === 'female' ? `${archId}_female` : archId];
      return archetype?.reproductiveSuccess || 'unknown';
    };
    
    const aspiredSuccess = aspiredTo ? getReproductiveSuccess(aspiredTo) : 'unknown';
    const behavioralSuccess = topBehavioral ? getReproductiveSuccess(topBehavioral) : 'unknown';
    
    // Reverse psychology patterns (strongest for males, but apply to all)
    if (this.gender === 'male') {
      // Male-specific patterns (stronger reverse psychology, weighted by reproductive success)
      
      // Pattern 1: Desiring HIGH reproductive success (Alpha) → likely Beta (aspiring to what they lack)
      // Status impact: High status, but Beta lacks it and desires it
      if (aspiredTo === 'alpha' && aspiredSuccess === 'medium_high' && topBehavioral !== 'alpha' && aspirationCounts['alpha'] >= 2) {
        adjustments['beta'] = 1.3; // Boost beta score by 30% (status/status impact)
        adjustments['alpha'] = 0.85; // Reduce alpha score by 15% (they're over-reporting)
        if (topBehavioral === 'omega') {
          adjustments['beta'] = 1.4; // Even stronger if currently omega
        }
      }
      
      // Pattern 2: Desiring HIGH reproductive success (Delta) → likely Beta wanting security
      // Delta is highest reproductive success, so aspiring to it from lower positions suggests Beta
      if (aspiredTo === 'delta' && aspiredSuccess === 'high' && topBehavioral !== 'delta' && behavioralSuccess !== 'high') {
        adjustments['beta'] = 1.2; // Beta wants Delta's practical provisioning value
        adjustments['delta'] = 0.9; // Delta is aspirational, not actual
      }
      
      // Pattern 3: Comfortable with MEDIUM reproductive success (Beta) → possibly Sigma
      // Sigma is okay with low status, so being okay with Beta suggests actual independence
      if (aspirationCounts['beta'] >= 2 && aspiredSuccess === 'medium' && topBehavioral !== 'beta' && topBehavioral !== 'alpha') {
        adjustments['sigma'] = 1.25; // Boost sigma by 25% (okay with lower status = independence)
        adjustments['beta'] = 0.8; // Reduce beta reporting
      }
      
      // Pattern 4: Desiring LOW reproductive success (Sigma, Gamma, Omega) → likely actual positioning
      // If aspiring to LOW success, they might actually be there (less reverse psychology)
      if ((aspiredTo === 'sigma' || aspiredTo === 'gamma' || aspiredTo === 'omega') && aspiredSuccess === 'low') {
        // But if behavioral pattern suggests higher, they might be Beta/Omega trying to rationalize
        if (topBehavioral === 'beta' || topBehavioral === 'omega') {
          // Still likely Beta/Omega, not actual Sigma/Gamma
          adjustments[topBehavioral] = 1.15;
          adjustments[aspiredTo] = 0.85; // Aspirational rationalization
        } else {
          // Might actually be the low-success archetype
          adjustments[aspiredTo] = 1.1; // Less reverse psychology for low-success aspirations
        }
      }
      
      // Pattern 5: Desiring Beta → possibly Alpha feeling burdened OR Delta wanting harmony
      if (aspiredTo === 'beta' && topBehavioral === 'alpha') {
        adjustments['alpha'] = 1.1; // Confirm alpha, but feeling burdened by leadership
        adjustments['beta'] = 0.75; // Beta is aspirational escape, not actual
      } else if (aspiredTo === 'beta' && topBehavioral === 'delta') {
        // Delta might want Beta's harmony, but Delta is better positioned
        adjustments['delta'] = 1.05; // Confirm delta
        adjustments['beta'] = 0.9;
      }
      
      // Pattern 6: Admiring/Envious of HIGH success → likely Beta or Omega (status seeking)
      if (aspirationCounts['alpha'] >= 2 && aspiredSuccess === 'medium_high' && (topBehavioral === 'beta' || topBehavioral === 'omega')) {
        adjustments[topBehavioral] = 1.25; // Strong confirmation - status seeking behavior
        adjustments['alpha'] = 0.8; // Reduce alpha (aspirational status seeking)
      }
      
      // Pattern 7: Admiring Gamma (LOW success) → possibly Delta wanting intellectual recognition
      if (aspirationCounts['gamma'] >= 2 && aspiredSuccess === 'low' && topBehavioral === 'delta') {
        adjustments['delta'] = 1.15; // Confirm delta - wants recognition for practical work
        adjustments['gamma'] = 0.85; // Gamma is aspirational, not actual
      }
      
      // Pattern 8: Multiple scattered aspirations → likely Beta (unclear identity, status confusion)
      const uniqueAspirations = Object.keys(aspirationCounts).length;
      if (uniqueAspirations >= 3 && topBehavioral !== 'gamma' && topBehavioral !== 'sigma') {
        adjustments['beta'] = 1.2; // Scattered aspirations suggest Beta confusion about status
      }
    } else {
      // Female-specific patterns (less pronounced reverse psychology, but still present)
      
      // Pattern 1: Desiring Alpha-Female (HIGH status) → possibly Beta-Female
      if (aspiredTo === 'alpha' && topBehavioral !== 'alpha' && aspirationCounts['alpha'] >= 2) {
        adjustments['beta'] = 1.2; // Boost beta
        adjustments['alpha'] = 0.85;
      }
      
      // Pattern 2: Comfortable with Beta → possibly Sigma-Female
      if (aspirationCounts['beta'] >= 2 && topBehavioral !== 'beta') {
        adjustments['sigma'] = 1.1;
      }
      
      // Pattern 3: Multiple aspirations → likely Beta-Female
      const uniqueAspirations = Object.keys(aspirationCounts).length;
      if (uniqueAspirations >= 3) {
        adjustments['beta'] = 1.1;
      }
    }
    
    return adjustments;
  }
  
  generateAspirationExplanation(aspiredTo, topBehavioral, adjustments) {
    if (!aspiredTo || !adjustments || Object.keys(adjustments).length === 0) {
      return null;
    }
    
    const aspirationAnalysis = this.analysisData.aspirationAnalysis;
    const aspirationCounts = (aspirationAnalysis && aspirationAnalysis.aspirationCounts)
      ? aspirationAnalysis.aspirationCounts
      : {};
    
    const genderText = this.gender === 'male' ? 'For males' : 'For females';
    let explanation = `${genderText}, aspiration patterns can reveal self-reporting bias. `;
    
    if (aspiredTo === 'alpha' && adjustments['beta']) {
      explanation += `You aspire to Alpha qualities, which often indicates you're actually Beta - we desire what we lack. Your behavioral patterns suggest ${topBehavioral}, but your aspirations point to Beta.`;
    } else if (adjustments['sigma'] && Object.keys(aspirationCounts).some(k => k === 'beta' && aspirationCounts[k] >= 2)) {
      explanation += `Being comfortable with Beta identification suggests you may actually be Sigma - comfortable with what others reject indicates independence.`;
    } else if (aspiredTo === 'sigma' && adjustments['beta']) {
      explanation += `Desiring Sigma independence often indicates Beta or Omega trying to escape social positioning, rather than genuine Sigma orientation.`;
    } else {
      explanation += `Your aspirations for ${aspiredTo} differ from your behavioral patterns (${topBehavioral}), suggesting some self-reporting bias.`;
    }
    
    return explanation;
  }

  calculateCoreGroupScores() {
    const groupScores = {};
    Object.keys(CORE_GROUPS).forEach(groupId => {
      groupScores[groupId] = CORE_GROUPS[groupId].reduce((sum, archId) => {
        return sum + (this.archetypeScores[archId]?.phase1 || 0);
      }, 0);
    });
    return groupScores;
  }

  formatSocialProportion(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
      return null;
    }
    return `${value.toFixed(1)}%`;
  }

  getSpreadInfo(archetype) {
    if (!archetype || !ARCHETYPE_SPREAD_MAP) {
      return null;
    }
    const spreadKey = this.gender === 'female' ? archetype.name : `${archetype.name} Male`;
    return ARCHETYPE_SPREAD_MAP[spreadKey] || null;
  }

  getTopSubtypes(count) {
    return Object.keys(this.archetypeScores)
      .map(archId => ({
        id: archId,
        name: ARCHETYPES[archId]?.name,
        score: this.archetypeScores[archId].phase2
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * All shadow-tagged archetypes with Phase 3 signal (unfiltered).
   */
  getShadowPatternsRaw() {
    return Object.keys(this.archetypeScores)
      .filter(archId => ARCHETYPES[archId]?.isShadow)
      .map(archId => ({
        id: archId,
        name: ARCHETYPES[archId].name,
        score: this.archetypeScores[archId].phase3
      }))
      .filter(arch => arch.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Shadow patterns for the report: only shadows whose parentType matches primary/secondary/tertiary families,
   * and never the same archetype id already shown in the top three (dark-as-primary is not duplicated).
   * Note: male Beta line has no isShadow with parentType beta in taxonomy — Beta-heavy profiles may show none.
   */
  getShadowPatternsForReport() {
    const primary = this.analysisData?.primaryArchetype;
    if (!primary?.id) return [];

    const topIds = [
      primary.id,
      this.analysisData.secondaryArchetype?.id,
      this.analysisData.tertiaryArchetype?.id
    ].filter(Boolean);

    const allowedParentTypes = new Set();
    topIds.forEach(id => {
      const p = ARCHETYPES[id]?.parentType;
      if (p) allowedParentTypes.add(p);
    });
    if (allowedParentTypes.size === 0) return [];

    const excludeIds = new Set(topIds);

    return this.getShadowPatternsRaw().filter(arch => {
      const def = ARCHETYPES[arch.id];
      if (!def?.parentType) return false;
      if (!allowedParentTypes.has(def.parentType)) return false;
      if (excludeIds.has(arch.id)) return false;
      return true;
    });
  }

  identifyAspirationalTraits() {
    // Look for answers marked as aspirational in Phase 3
    const aspirationalArchetypes = [];
    PHASE_3_QUESTIONS.forEach(q => {
      if (q.options) {
        q.options.forEach((opt, idx) => {
          if (opt.isAspirational && this.answers[q.id]?.selectedIndex === idx) {
            opt.archetypes.forEach(archId => {
              if (!aspirationalArchetypes.find(a => a.id === archId)) {
                aspirationalArchetypes.push({
                  id: archId,
                  name: ARCHETYPES[archId]?.name,
                  description: ARCHETYPES[archId]?.growthEdge
                });
              }
            });
          }
        });
      }
    });
    return aspirationalArchetypes;
  }

  async finalizeResults() {
    await this.loadArchetypeData(); // Ensure data is loaded
    this.identifyArchetypes();
    this.analysisData.phase3Results = this.analysisData.phase3Results || {};
    this.analysisData.phase3Results.shadowIndicators = this.getShadowPatternsForReport();
    this.analysisData.allAnswers = { ...this.answers };
    // Store full question objects with text for export
    this.analysisData.questionSequence = this.questionSequence.map(q => ({
      id: q.id,
      question: q.question || q.questionText || '',
      phase: q.phase,
      category: q.category,
      archetype: q.archetype,
      dimension: q.dimension
    }));
    this.renderResults();
    this.saveProgress();
    
    // Display debug report if in development mode
    if (window.location.search.includes('debug=true')) {
      this.debugReporter.displayReport('debug-report');
    }
  }

  renderResults() {
    const container = document.getElementById('resultsContent');
    if (!container) {
      // Fallback to questionContainer if resultsContent doesn't exist
      const fallbackContainer = document.getElementById('questionContainer');
      if (fallbackContainer) {
        fallbackContainer.innerHTML = '';
        return this.renderResultsToContainer(fallbackContainer);
      }
      return;
    }
    return this.renderResultsToContainer(container);
  }

  renderResultsToContainer(container) {

    const hydrateArchetype = (entry) => {
      if (!entry) return null;
      const base = ARCHETYPES?.[entry.id] || ARCHETYPES?.[entry.baseId] || null;
      return base ? { ...base, ...entry } : entry;
    };

    const primary = hydrateArchetype(this.analysisData.primaryArchetype);
    const secondary = hydrateArchetype(this.analysisData.secondaryArchetype);
    const tertiary = hydrateArchetype(this.analysisData.tertiaryArchetype);
    const primarySpread = this.getSpreadInfo(primary);
    const secondarySpread = this.getSpreadInfo(secondary);
    const tertiarySpread = this.getSpreadInfo(tertiary);
    const summarizeArchetype = (archetype) => {
      if (!archetype) return '';
      const traits = Array.isArray(archetype.behavioralTraits) ? archetype.behavioralTraits.slice(0, 4) : [];
      if (!traits.length) return '';
      return traits.map((trait) => {
        const text = String(trait ?? '').trim();
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
      }).filter(Boolean).join(', ');
    };

    const primaryParent = primary?.parentType ? ARCHETYPES?.[primary.parentType] : null;
    const secondaryParent = secondary?.parentType ? ARCHETYPES?.[secondary.parentType] : null;
    const tertiaryParent = tertiary?.parentType ? ARCHETYPES?.[tertiary.parentType] : null;

    const primaryParentSummary = primaryParent ? summarizeArchetype(primaryParent) : '';
    const secondaryParentSummary = secondaryParent ? summarizeArchetype(secondaryParent) : '';
    const tertiaryParentSummary = tertiaryParent ? summarizeArchetype(tertiaryParent) : '';

    const formatList = (items) => {
      if (!Array.isArray(items)) return '';
      return items
        .map((item) => {
          const text = String(item ?? '').trim();
          if (!text) return '';
          return `<li>${text.charAt(0).toUpperCase() + text.slice(1)}</li>`;
        })
        .filter(Boolean)
        .join('');
    };

    const archetypeQualitiesHtml = (() => {
      const sName = secondary?.name ? String(secondary.name).trim() : '';
      const tName = tertiary?.name ? String(tertiary.name).trim() : '';
      if (sName && tName) {
        return `<p class="archetype-profile-qualities">with qualities of ${SecurityUtils.sanitizeHTML(sName)} and ${SecurityUtils.sanitizeHTML(tName)}</p>`;
      }
      if (sName) return `<p class="archetype-profile-qualities">with qualities of ${SecurityUtils.sanitizeHTML(sName)}</p>`;
      if (tName) return `<p class="archetype-profile-qualities">with qualities of ${SecurityUtils.sanitizeHTML(tName)}</p>`;
      return '';
    })();
    const getBaseBrutalNarrative = (archetype) => {
      if (!archetype) return '';
      return String(BRUTAL_TRUTHS?.[archetype.id]?.narrative || archetype.archetypalNarrative || '').trim();
    };
    const getRoleAwareBrutalNarrative = (archetype, role) => {
      const baseNarrative = getBaseBrutalNarrative(archetype);
      if (!baseNarrative) return '';
      if (role === 'primary') return baseNarrative;

      const id = archetype?.id;
      const precomposed = id && ARCHETYPE_ROLE_ACCENTS?.[id];
      if (role === 'secondary' && precomposed?.secondaryAccent) {
        return String(precomposed.secondaryAccent).trim();
      }
      if (role === 'tertiary' && precomposed?.tertiaryAccent) {
        return String(precomposed.tertiaryAccent).trim();
      }

      // Fallback if an id is missing from the precomposed map (keep report usable).
      const maxAccentSentences = role === 'secondary' ? 5 : 4;
      const softened = summarizeBehavioralAccent(
        softenNarrativeTone(baseNarrative),
        maxAccentSentences
      );
      return softened || '';
    };
    const primaryTraitsSummary = summarizeArchetype(primary);
    const optimizationCopy = (primary?.id && ARCHETYPE_OPTIMIZATION?.[primary.id]) || null;
    const primaryNarrative = getRoleAwareBrutalNarrative(primary, 'primary');
    const secondaryNarrative = getRoleAwareBrutalNarrative(secondary, 'secondary');
    const tertiaryNarrative = getRoleAwareBrutalNarrative(tertiary, 'tertiary');
    const primaryBlindSpot = optimizationCopy?.likelyBlindSpot
      ? `Likely blind spot: ${ensurePeriod(optimizationCopy.likelyBlindSpot)}`
      : primary?.stressResponse
        ? `Likely blind spot: ${ensurePeriod(primary.stressResponse)}`
        : 'Likely blind spot: Under pressure, your default pattern can narrow options and reduce flexibility.';
    const primaryOptimization = optimizationCopy?.optimizationStrategy
      ? `Within-archetype strategy: ${ensurePeriod(optimizationCopy.optimizationStrategy)}${primaryTraitsSummary ? ` Leverage your strengths: ${primaryTraitsSummary}.` : ''}`
      : primary?.growthEdge
        ? `Within-archetype strategy: ${ensurePeriod(primary.growthEdge)}${primaryTraitsSummary ? ` Leverage your strengths: ${primaryTraitsSummary}.` : ''}`
        : `Within-archetype strategy: Build stability by doubling down on your healthiest traits while expanding flexibility.${primaryTraitsSummary ? ` Leverage your strengths: ${primaryTraitsSummary}.` : ''}`;

    let resultsHTML = `
      <div class="results-container" style="max-width: 900px; margin: 0 auto;">
        <div class="archetype-profile-header">
          ${reportGenderGlyphHtml(this.gender)}
          <h2 class="suite-results-main-title">Your Archetype Profile:</h2>
          <div class="temperament-composite-badge-wrap temperament-composite-badge-wrap--lead">
            <div class="temperament-composite-badge archetype-primary-name-badge" role="status" aria-label="${SecurityUtils.sanitizeHTML(primary?.name || '').replace(/"/g, '&quot;')}">
              ${SecurityUtils.sanitizeHTML(primary?.name || '')}
            </div>
          </div>
          ${archetypeQualitiesHtml}
        </div>

        <!-- Primary Archetype -->
        <div class="archetype-card primary" style="background: rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: var(--radius); margin-bottom: 2rem; border: 2px solid var(--brand);">
          <h3 style="color: var(--brand); margin-top: 0; font-size: 1.75rem; font-weight: 800; letter-spacing: 0.01em;">Primary Archetype</h3>
          ${memeticSummaryHtml(primary, { margin: '0.15rem 0 0.9rem', fontSize: '1rem' })}
          ${primary.explanation ? `<div style="background: rgba(255, 184, 0, 0.1); border-left: 3px solid var(--brand); border-radius: var(--radius); padding: 1rem; margin: 1rem 0;"><p style="margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.6; font-style: italic;">${primary.explanation}</p></div>` : ''}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;"><strong>Social Role:</strong> ${SecurityUtils.sanitizeHTML(primary.socialRole || '')}</p>
          ${primaryParent ? `<p style="color: var(--muted); margin: 0.5rem 0 1rem; line-height: 1.7;"><strong>Subtype of:</strong> ${SecurityUtils.sanitizeHTML(primaryParent.name || '')}${primaryParentSummary ? `: ${SecurityUtils.sanitizeHTML(primaryParentSummary)}` : ''}</p>` : ''}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;">${SecurityUtils.sanitizeHTML(primary.description || '')}</p>
          
          <div style="margin-top: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">Key Characteristics:</h4>
            <ul style="color: var(--muted); line-height: 1.8;">
              ${formatList(primary?.behavioralTraits)}
            </ul>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">Core Motivations:</h4>
            <ul style="color: var(--muted); line-height: 1.8;">
              ${formatList(primary?.motivations)}
            </ul>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.5rem;">Stress Response:</h4>
            <p style="color: var(--muted); line-height: 1.7;">${primary.stressResponse}</p>
          </div>

          ${primaryNarrative ? `
          <div class="archetype-report-card" style="margin-top: 1.5rem; background: rgba(100, 0, 0, 0.15); border-left: 4px solid #cc0000; border-radius: var(--radius); padding: 1.5rem;">
            <h4 style="color: #cc0000; margin-top: 0; margin-bottom: 1rem;">Archetypal Narrative: The Brutal Truth</h4>
            <p style="color: var(--muted); line-height: 1.8; font-size: 1rem; margin: 0; font-style: italic;">
              ${SecurityUtils.sanitizeHTML(primaryNarrative)}
            </p>
            <p style="color: var(--muted); font-size: 0.85rem; margin-top: 1rem; margin-bottom: 0; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1rem;">
              <em>Note: This is an archetypal narrative - a generic but honest representation of the typical life pattern for this classification. It reflects common trajectories, not personal destiny. Archetypes describe patterns, not fixed fate. Understanding your pattern is the first step toward conscious change if you choose it.</em>
            </p>
          </div>
          ` : ''}

          <div class="archetype-report-card" style="margin-top: 1.5rem; background: rgba(0, 120, 200, 0.12); border-left: 4px solid #1e90ff; border-radius: var(--radius); padding: 1.25rem;">
            <h4 style="color: #7fbfff; margin-top: 0; margin-bottom: 0.75rem;">Innate Challenges</h4>
            <p style="color: var(--muted); line-height: 1.7; margin: 0 0 0.75rem;">${primary.growthEdge || ''}</p>
            <h5 style="color: #7fbfff; font-size: 0.95rem; margin: 1rem 0 0.5rem;">Within-Archetype Optimization</h5>
            <p style="color: var(--muted); line-height: 1.7; margin: 0 0 0.75rem;">${SecurityUtils.sanitizeHTML(primaryBlindSpot)}</p>
            <p style="color: var(--muted); line-height: 1.7; margin: 0;">${SecurityUtils.sanitizeHTML(primaryOptimization)}</p>
          </div>

          ${primary.reproductiveSuccess && primary.reproductiveDescription ? `
          <div style="margin-top: 1.5rem; background: rgba(0, 100, 200, 0.1); border-left: 3px solid #0066cc; border-radius: var(--radius); padding: 1rem;">
            <h4 style="color: #0066cc; margin-bottom: 0.75rem;">Reproductive/Mating Success Profile</h4>
            <p style="color: var(--muted); line-height: 1.7; margin: 0.5rem 0;">
              <strong>Level:</strong> ${primary.reproductiveSuccess === 'high' ? 'High' : primary.reproductiveSuccess === 'medium_high' ? 'Medium-High' : primary.reproductiveSuccess === 'medium' ? 'Medium' : primary.reproductiveSuccess === 'low' ? 'Low' : primary.reproductiveSuccess}
            </p>
            <p style="color: var(--muted); line-height: 1.7; margin: 0.5rem 0; font-size: 0.95rem;">
              ${primary.reproductiveDescription}
            </p>
            <p style="color: var(--muted); font-size: 0.85rem; font-style: italic; margin-top: 0.75rem; margin-bottom: 0;">
              Note: Reproductive success patterns reflect typical mate access and relationship dynamics for this archetype, not a judgment of value. Each archetype has unique contributions and challenges.
            </p>
          </div>
          ` : ''}

          ${primary.jungianEquivalent || primary.vedicEquivalent || primary.greekPantheon || primary.tarotCard ? `
          <div style="margin-top: 1.5rem; background: rgba(255, 184, 0, 0.1); border-left: 3px solid var(--brand); border-radius: var(--radius); padding: 1rem;">
            <h4 style="color: var(--brand); margin-bottom: 0.75rem;">Cross-Paradigm Equivalents:</h4>
            <div style="color: var(--muted); line-height: 1.8; font-size: 0.9rem;">
              ${primary.jungianEquivalent ? `<p style="margin: 0.5rem 0;"><strong>Jungian/Q-KWML:</strong> ${primary.jungianEquivalent}</p>` : ''}
              ${primary.vedicEquivalent ? `<p style="margin: 0.5rem 0;"><strong>Vedic:</strong> ${primary.vedicEquivalent}</p>` : ''}
              ${primary.greekPantheon ? `<p style="margin: 0.5rem 0;"><strong>Greek Pantheon:</strong> ${primary.greekPantheon}</p>` : ''}
              ${primary.tarotCard ? `<p style="margin: 0.5rem 0;"><strong>Tarot Card:</strong> ${primary.tarotCard}</p>` : ''}
            </div>
            <p style="color: var(--muted); font-size: 0.85rem; font-style: italic; margin-top: 0.75rem; margin-bottom: 0;">
              These equivalents help translate this archetype across different psychological and mythological frameworks.
            </p>
          </div>
          ` : ''}
        </div>
    `;

      // Secondary Archetype
    if (secondary) {
      resultsHTML += `
        <div class="archetype-card secondary" style="background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: var(--radius); margin-bottom: 2rem;">
          <h3 style="color: var(--brand); margin-top: 0; font-size: 1.4rem; font-weight: 760; letter-spacing: 0.005em;">Secondary Influence: ${SecurityUtils.sanitizeHTML(secondary.name || '')}</h3>
          ${memeticSummaryHtml(secondary, { margin: '0.1rem 0 0.85rem', fontSize: '0.98rem' })}
          ${secondary.explanation ? `<div style="background: rgba(255, 184, 0, 0.1); border-left: 3px solid var(--brand); border-radius: var(--radius); padding: 1rem; margin: 1rem 0;"><p style="margin: 0; color: var(--muted); font-size: 0.9rem; line-height: 1.6; font-style: italic;">${secondary.explanation}</p></div>` : ''}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;"><strong>Social Role:</strong> ${SecurityUtils.sanitizeHTML(secondary.socialRole || '')}</p>
          ${secondaryParent ? `<p style="color: var(--muted); margin: 0.5rem 0 1rem; line-height: 1.7;"><strong>Subtype of:</strong> ${SecurityUtils.sanitizeHTML(secondaryParent.name || '')}${secondaryParentSummary ? `: ${SecurityUtils.sanitizeHTML(secondaryParentSummary)}` : ''}</p>` : ''}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;">${SecurityUtils.sanitizeHTML(secondary.description || '')}</p>
          ${secondaryNarrative ? `
          <div style="margin-top: 1rem; background: rgba(80, 0, 0, 0.12); border-left: 3px solid rgba(180, 40, 40, 0.6); border-radius: var(--radius); padding: 1rem;">
            <h4 style="color: #cc6666; margin: 0 0 0.5rem; font-size: 0.95rem;">Behavioral accent</h4>
            <p style="color: var(--muted); line-height: 1.7; font-size: 0.92rem; margin: 0; font-style: italic;">${SecurityUtils.sanitizeHTML(secondaryNarrative)}</p>
          </div>` : ''}
          <p style="color: var(--muted); margin-top: 1rem; font-style: italic; font-size: 0.9rem;">
            This archetype influences you in specific contexts or situations, complementing your primary archetype.
          </p>
        </div>
      `;
    }

    // Tertiary Archetype
    if (tertiary) {
      resultsHTML += `
        <div class="archetype-card tertiary" style="background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: var(--radius); margin-bottom: 2rem;">
          <h3 style="color: var(--brand); margin-top: 0; font-size: 1.24rem; font-weight: 720; letter-spacing: 0.003em;">Tertiary Influence: ${SecurityUtils.sanitizeHTML(tertiary.name || '')}</h3>
          ${memeticSummaryHtml(tertiary, { margin: '0.1rem 0 0.8rem', fontSize: '0.95rem' })}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;"><strong>Social Role:</strong> ${SecurityUtils.sanitizeHTML(tertiary.socialRole || '')}</p>
          ${tertiaryParent ? `<p style="color: var(--muted); margin: 0.5rem 0 1rem; line-height: 1.7;"><strong>Subtype of:</strong> ${SecurityUtils.sanitizeHTML(tertiaryParent.name || '')}${tertiaryParentSummary ? `: ${SecurityUtils.sanitizeHTML(tertiaryParentSummary)}` : ''}</p>` : ''}
          <p style="color: var(--muted); margin: 1rem 0; line-height: 1.7;">${SecurityUtils.sanitizeHTML(tertiary.description || '')}</p>
          ${tertiaryNarrative ? `
          <div style="margin-top: 1rem; background: rgba(80, 0, 0, 0.08); border-left: 3px solid rgba(160, 40, 40, 0.4); border-radius: var(--radius); padding: 1rem;">
            <h4 style="color: #b85c5c; margin: 0 0 0.5rem; font-size: 0.95rem;">Behavioral accent</h4>
            <p style="color: var(--muted); line-height: 1.7; font-size: 0.92rem; margin: 0; font-style: italic;">${SecurityUtils.sanitizeHTML(tertiaryNarrative)}</p>
          </div>` : ''}
          <p style="color: var(--muted); margin-top: 1rem; font-style: italic; font-size: 0.9rem;">
            This archetype may emerge under stress, represent aspirational qualities, or appear in specific life domains.
          </p>
        </div>
      `;
    }

    // Shadow Patterns (family-aligned with primary/secondary/tertiary — recomputed for saved-report revisits)
    const shadowPatterns = this.getShadowPatternsForReport();
    if (shadowPatterns.length > 0) {
      resultsHTML += `
        <div class="shadow-section" style="background: rgba(255, 0, 0, 0.1); padding: 2rem; border-radius: var(--radius); margin-bottom: 2rem; border-left: 4px solid #ff4444;">
          <h3 style="color: #ff4444; margin-top: 0;">Shadow Patterns</h3>
          <p style="color: var(--muted); line-height: 1.7; margin-bottom: 1rem;">
            These are stress or integration patterns tied to the <strong>same archetype families</strong> as your primary, secondary, and tertiary results above—not unrelated shadow types. They may surface under pressure or signal areas for healing.
          </p>
          <ul style="color: var(--muted); line-height: 1.8;">
            ${shadowPatterns.map(shadow => `<li><strong>${SecurityUtils.sanitizeHTML(shadow.name || '')}:</strong> ${SecurityUtils.sanitizeHTML(ARCHETYPES[shadow.id]?.description || '')}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    resultsHTML += `
      <p style="margin-top: 2rem; font-size: 0.9rem; color: var(--muted);">
        <a href="archetype-spread.html" style="color: var(--brand); text-decoration: underline;">View full archetype table</a> — cross-paradigm equivalents and population proportions.
      </p>
    `;

    resultsHTML += `</div>`;

    // Sanitize results HTML before rendering
    SecurityUtils.safeInnerHTML(container, resultsHTML);
    this.showResultsContainer();
  }

  updateNavigation() {
    const progress = ((this.currentQuestionIndex + 1) / this.questionSequence.length) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    const questionCounter = document.getElementById('questionCounter');
    if (questionCounter) {
      questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questionSequence.length} (Phase ${this.currentPhase})`;
    }

    const prevBtn = document.getElementById('prevQuestion');
    if (prevBtn) {
      if (this.currentQuestionIndex > 0) {
        prevBtn.classList.remove('hidden');
      } else {
        prevBtn.classList.add('hidden');
      }
    }
  }

  showQuestionContainer() {
    const questionContainer = document.getElementById('questionContainer');
    if (questionContainer) questionContainer.classList.remove('hidden');
    this.setReportHeaderState(false);
    this.ui.transition('assessment');
  }

  showResultsContainer() {
    const questionContainer = document.getElementById('questionContainer');
    if (questionContainer) questionContainer.classList.add('hidden');
    this.setReportHeaderState(true);
    this.ui.transition('results');
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

  saveProgress() {
    try {
      const progress = {
        currentPhase: this.currentPhase,
        currentQuestionIndex: this.currentQuestionIndex,
        gender: this.gender,
        iqBracket: this.iqBracket,
        answers: this.answers,
        aspirationAnswers: this.aspirationAnswers,
        respectContextAnswers: this.respectContextAnswers,
        archetypeScores: this.archetypeScores,
        analysisData: this.analysisData
      };
      this.dataStore.save('progress', progress);
    } catch (error) {
      this.debugReporter.logError(error, 'saveProgress');
    }
  }

  async loadStoredData() {
    try {
      const progress = this.dataStore.load('progress');
      if (!progress) return;

      const hasProgress = (progress.currentPhase && progress.currentPhase > 0)
        || progress.gender
        || progress.iqBracket
        || (progress.answers && Object.keys(progress.answers).length > 0);
      if (!hasProgress) return;

      this.currentPhase = progress.currentPhase || 0;
      this.currentQuestionIndex = progress.currentQuestionIndex || 0;
      this.gender = progress.gender || null;
      this.iqBracket = progress.iqBracket || progress.analysisData?.iqBracket || null;
      this.answers = progress.answers || {};
      this.aspirationAnswers = progress.aspirationAnswers || {};
      this.respectContextAnswers = progress.respectContextAnswers || {};
      this.archetypeScores = progress.archetypeScores || {};
      this.analysisData = progress.analysisData || this.analysisData;

      // PRIORITY: If we have completed results, show report immediately on revisit
      if (this.analysisData.primaryArchetype) {
        // We still must load the archetype data modules before rendering results.
        // Stored progress can contain phase3/4 results, but ARCHETYPES/BRUTAL_TRUTHS are lazy-loaded.
        await this.loadArchetypeData();
        this.renderResults();
        this.showResultsContainer();
        return;
      }
      
      // If gender not selected, show gender selection
      if (!this.gender || this.currentPhase === 0) {
        this.showGenderSelection();
        return;
      }
      
      // If IQ bracket not selected, show IQ bracket selection
      if (!this.iqBracket || this.currentPhase === 0.5) {
        this.showIQBracketSelection();
        return;
      }
      
      // Rebuild question sequence based on phase (in-progress only)
      if (this.currentPhase === 1 || (this.currentPhase > 0 && this.currentPhase < 2)) {
        this.currentPhase = 1;
        await this.buildPhase1Sequence();
      } else if (this.currentPhase === 2) {
        await this.buildPhase2Sequence();
      } else if (this.currentPhase === 3) {
        await this.buildPhase3Sequence();
      } else if (this.currentPhase === 4) {
        await this.buildPhase4Sequence();
      } else if (this.currentPhase === 5) {
        await this.buildPhase5Sequence();
      }

      if (this.currentPhase <= 5 && this.questionSequence.length > 0) {
        this.renderCurrentQuestion();
        this.showQuestionContainer();
      }
    } catch (error) {
      this.debugReporter.logError(error, 'loadStoredData');
      ErrorHandler.showUserError('Failed to load saved progress.');
    }
  }

  resetAssessment() {
    // Clear all stored data
    if (this.dataStore) {
      this.dataStore.clear();
    }
    sessionStorage.removeItem('archetypeAssessmentProgress');
    localStorage.removeItem('archetype-assessment');
    
    // Reset all state to initial values
    this.currentPhase = 0; // Start at gender selection
    this.currentQuestionIndex = 0;
    this.gender = null;
    this.iqBracket = null;
    this.answers = {};
    this.aspirationAnswers = {};
    this.respectContextAnswers = {};
    this.questionSequence = [];
    this.initializeScores();
    this.analysisData = {
      timestamp: new Date().toISOString(),
      gender: null,
      iqBracket: null,
      phase1Results: {},
      phase2Results: {},
      phase3Results: {},
      phase4Results: {},
      phase5Results: {},
      aspirationAnalysis: {},
      respectContext: null,
      provisionContext: null,
      primaryArchetype: null,
      secondaryArchetype: null,
      tertiaryArchetype: null,
      confidenceLevels: {},
      allAnswers: {},
      questionSequence: []
    };
    
    // Hide results and questionnaire, show intro section
    const questionContainer = document.getElementById('questionContainer');
    const questionnaireSection = document.getElementById('questionnaireSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsSection = document.getElementById('resultsContainer');
    const introSection = document.querySelector('.intro-section');
    const actionButtonsSection = document.querySelector('.action-buttons')?.closest('.content-section');
    
    if (questionContainer) {
      questionContainer.classList.add('hidden');
      questionContainer.innerHTML = '';
    }
    if (questionnaireSection) {
      questionnaireSection.classList.add('hidden');
      questionnaireSection.classList.remove('active');
    }
    if (resultsContainer || resultsSection) {
      const container = resultsContainer || resultsSection;
      if (container) {
        container.classList.add('hidden');
        container.classList.remove('active');
      }
    }
    if (introSection) introSection.classList.remove('hidden');
    if (actionButtonsSection) actionButtonsSection.classList.remove('hidden');
    this.setReportHeaderState(false);
    this.ui.transition('idle');
  }

  /**
   * Save results: produces a readable HTML report document recording report details (primary export action).
   */
  saveResults() {
    if (!this.analysisData.primaryArchetype) {
      showAlert('Please complete the assessment before saving results.');
      return;
    }
    const html = generateReadableReport(this.analysisData, 'archetype-analysis', 'Modern Archetype Identification');
    downloadFile(html, `archetype-report-${Date.now()}.html`, 'text/html');
  }
}

// Initialize engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.archetypeEngine = new ArchetypeEngine();
  });
} else {
  // DOM already ready, but wait a tick to ensure all elements are available
  setTimeout(() => {
    window.archetypeEngine = new ArchetypeEngine();
  }, 0);
}

