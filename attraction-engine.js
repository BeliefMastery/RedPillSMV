/**
 * STATUS, SELECTION, ATTRACTION — Assessment Engine
 * Gender-specific evolutionary clusters. Weightings informed by @hoe_math.
 *
 * @author Warwick Marshall
 */

import { createDebugReporter } from './shared/debug-reporter.js';
import { SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport } from './shared/export-utils.js';
import { reportGenderGlyphHtml } from './shared/report-gender-glyph.js';
import { EngineUIController } from './shared/engine-ui-controller.js';
import { showConfirm, showAlert } from './shared/confirm-modal.js';
import {
  MALE_CLUSTERS,
  FEMALE_CLUSTERS,
  MALE_PREFERENCE_QUESTIONS,
  FEMALE_PREFERENCE_QUESTIONS,
  MALE_CLUSTER_WEIGHTS,
  FEMALE_CLUSTER_WEIGHTS,
  MARKET_SEGMENTS,
  DEVELOPMENTAL_LEVELS,
  BAD_BOY_GOOD_GUY_GRID,
  KEEPER_SWEEPER_CHART,
  RAD_ACTIVITY_TYPE_MODIFIER,
  PARTNER_COUNT_DOWNGRADE,
  AXIS_SUBCATEGORY_WEIGHTS,
  MALE_AXIS_BAR_LABELS
} from './attraction-data.js';
import {
  calculateRadActivityPercentile,
  computeSmvClustersAndSubs,
  computeOverallSmv,
  scoreToPercentile
} from './shared/attraction-smv-core.mjs';
import {
  getClusterSummary as attractionClusterSummary,
  getQualificationExplanation as attractionQualificationExplanation,
  getSMVInterpretation as attractionSmvInterpretation,
  getDelusionWarning as attractionDelusionWarning,
  getMaleYoungerPartnerAccessCopy as attractionMaleYoungerPartnerAccessCopy
} from './shared/attraction-report-copy.js';
import { computeTargetMarketSummary } from './shared/attraction-target-market-summary.js';
import { maleAgeGapContext } from './shared/male-age-gap.js';

const ATTRACTION_RESULTS_KEY = 'attraction-assessment-results';

export class AttractionEngine {
  constructor() {
    this.currentGender = null;
    this.currentPhase = -1;
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.preferences = {};
    this.smv = {};
    this.baseSectionTitleText = null;

    this.debugReporter = createDebugReporter('AttractionEngine');
    this.debugReporter.markInitialized();

    this.ui = new EngineUIController({
      idle: { show: ['#introSection', '#actionButtonsSection'], hide: ['#questionnaireSection', '#resultsSection'] },
      assessment: { show: ['#questionnaireSection'], hide: ['#introSection', '#actionButtonsSection', '#resultsSection'] },
      results: { show: ['#resultsSection'], hide: ['#introSection', '#actionButtonsSection', '#questionnaireSection'] }
    });

    this.attachEventListeners();

    // Restore last report on revisit (show report unless user explicitly starts new)
    if (this.restoreLastResults()) return;
    this.ui.transition('idle');
  }

  restoreLastResults() {
    try {
      const raw = localStorage.getItem(ATTRACTION_RESULTS_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || !d.smv || !d.currentGender) return false;
      this.smv = d.smv;
      this.responses = d.responses || {};
      this.preferences = d.preferences || {};
      this.currentGender = d.currentGender;
      if (this.smv && typeof this.smv.overall === 'number') {
        this.smv.targetMarket = this.analyzeTargetMarket(this.smv);
      }
      this.setReportHeaderState(true);
      this.ui.transition('results');
      this.renderResults();
      window.scrollTo(0, 0);
      return true;
    } catch {
      return false;
    }
  }

  /** Persist completed assessment to localStorage (must not share name with export `saveResults` below). */
  persistResultsToStorage() {
    try {
      if (this.smv && Object.keys(this.smv).length > 0 && this.currentGender) {
        localStorage.setItem(ATTRACTION_RESULTS_KEY, JSON.stringify({
          smv: this.smv,
          responses: this.responses,
          preferences: this.preferences,
          currentGender: this.currentGender,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      this.debugReporter.logError(e, 'persistResultsToStorage');
    }
  }

  attachEventListeners() {
    const ids = ['startAssessment', 'generateSampleReport', 'abandonAssessment', 'prevQuestion', 'nextQuestion', 'saveResults', 'newAssessment'];
    const handlers = {
      startAssessment: () => this.startAssessment(),
      generateSampleReport: () => this.generateSampleReport(),
      abandonAssessment: () => this.abandonAssessment(),
      prevQuestion: () => this.prevQuestion(),
      nextQuestion: () => this.nextQuestion(),
      saveResults: () => this.saveResults(),
      newAssessment: () => this.resetAssessment()
    };
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el && handlers[id]) el.addEventListener('click', handlers[id]);
    });
  }

  getClusters() {
    return this.currentGender === 'male' ? MALE_CLUSTERS : FEMALE_CLUSTERS;
  }

  getPreferenceQuestions() {
    return this.currentGender === 'male' ? MALE_PREFERENCE_QUESTIONS : FEMALE_PREFERENCE_QUESTIONS;
  }

  getClusterWeights() {
    return this.currentGender === 'male' ? MALE_CLUSTER_WEIGHTS : FEMALE_CLUSTER_WEIGHTS;
  }

  startAssessment() {
    this.currentGender = null;
    this.currentPhase = -1;
    this.responses = {};
    this.preferences = {};
    this.setReportHeaderState(false);
    this.ui.transition('assessment');
    this.showGenderSelection();
  }

  setNavVisibility(visible) {
    const nav = document.querySelector('.navigation-buttons');
    if (nav) nav.style.display = visible ? '' : 'none';
  }

  showGenderSelection() {
    this.setNavVisibility(false);
    const container = document.getElementById('questionContainer');
    if (!container) return;
    container.innerHTML = `
      <div class="gender-selection">
        <h2>Select Your Gender</h2>
        <p class="form-help">Weightings and biases differ significantly between male and female assessment paths.</p>
        <div class="gender-buttons">
          <button class="btn btn-large gender-btn" data-gender="male">
            <span class="gender-icon">♂</span>
            <span class="gender-label">Male Assessment</span>
            <span class="gender-desc">Coalition Rank (3C's), Reproductive Confidence (4P's), Axis of Attraction</span>
          </button>
          <button class="btn btn-large gender-btn" data-gender="female">
            <span class="gender-icon">♀</span>
            <span class="gender-label">Female Assessment</span>
            <span class="gender-desc">Coalition Rank (3S's), Reproductive Confidence, Axis of Attraction</span>
          </button>
        </div>
      </div>`;
    container.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', e => this.selectGender(e.currentTarget.dataset.gender));
    });
  }

  selectGender(gender) {
    this.currentGender = gender;
    this.currentPhase = -1;
    this.responses = {};
    this.preferences = {};
    this.showPreferencesForm();
  }

  /** Default verbal labels for 1–10 scale when question has no optionLabels */
  static DEFAULT_SCALE_LABELS = {
    1: 'Very low / Rarely',
    2: 'Low–moderate',
    3: 'Low / Occasionally',
    4: 'Moderate–low',
    5: 'Moderate / Sometimes',
    6: 'Moderate–high',
    7: 'High / Often',
    8: 'High–very high',
    9: 'Very high',
    10: 'Very high / Consistently'
  };

  buildOptionLabel(q, val) {
    if (q.optionLabels && Array.isArray(q.optionLabels)) {
      const idx = (q.options || []).indexOf(val);
      return q.optionLabels[idx] !== undefined ? q.optionLabels[idx] : String(val);
    }
    return AttractionEngine.DEFAULT_SCALE_LABELS[val] ?? String(val);
  }

  /** Fisher-Yates shuffle; used for rad questions to hide significance of option order. */
  shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  showPreferencesForm() {
    this.setNavVisibility(false);
    const questions = this.getPreferenceQuestions();
    const container = document.getElementById('questionContainer');
    if (!container) return;

    let html = `<div class="phase-intro"><h2>Market Preference Configuration</h2><h3 class="phase-subtitle">Define Your Mate Selection Criteria</h3><p class="phase-description">These preferences describe who you’re seeking. They inform delusion checks and contextual notes in your report. Core cluster and axis <strong>weights</strong> in the overall score stay fixed so results stay comparable—preferences do not reweight the math. For men, stated partner ages tune realistic-options copy and delusion; if market position is below mid-tier and age preferences add friction, a short <strong>younger-partner access</strong> note may appear. Headline Sexual Market Value stays the scored model only.</p><form id="preferencesForm" class="preferences-form">`;
    questions.forEach(q => {
      html += `<div class="form-group"><label class="form-label">${SecurityUtils.sanitizeHTML(q.text)}</label>`;
      if (q.type === 'number') {
        html += `<input type="number" id="${q.id}" name="${q.id}" min="${q.min}" max="${q.max}" ${q.required ? 'required' : ''} class="form-input">`;
      } else if (q.type === 'select') {
        html += `<select id="${q.id}" name="${q.id}" class="form-select">`;
        (q.options || []).forEach(opt => html += `<option value="${opt.value}">${SecurityUtils.sanitizeHTML(opt.label)}</option>`);
        html += `</select>`;
      } else if (q.type === 'scale') {
        html += `<div class="options-container">`;
        (q.options || []).forEach(opt => html += `<label class="option-label"><input type="radio" name="${q.id}" value="${opt.value}" required><span class="option-content"><span class="option-text">${SecurityUtils.sanitizeHTML(opt.label)}</span></span></label>`);
        html += `</div>`;
      }
      html += `</div>`;
    });
    html += `<button type="button" class="btn btn-primary btn-large" id="submitPreferences">Continue to Assessment</button></form></div>`;
    container.innerHTML = html;

    const form = document.getElementById('preferencesForm');
    if (form) {
      document.getElementById('submitPreferences').addEventListener('click', () => this.capturePreferences());
    }
  }

  capturePreferences() {
    const form = document.getElementById('preferencesForm');
    if (!form) return;
    const fd = new FormData(form);
    let valid = true;
    fd.forEach((v, k) => { if (!v) valid = false; });
    if (!valid) { showAlert('Please complete all preference fields'); return; }
    fd.forEach((v, k) => { this.preferences[k] = isNaN(v) ? v : parseFloat(v); });
    this.currentPhase = 0;
    this.showPhaseIntro();
  }

  showPhaseIntro() {
    this.setNavVisibility(false);
    const clusters = this.getClusters();
    const phaseNames = Object.keys(clusters);
    const phaseName = phaseNames[this.currentPhase];
    const phase = clusters[phaseName];
    if (!phase) return;

    const container = document.getElementById('questionContainer');
    if (!container) return;
    const totalPhases = phaseNames.length;
    const pct = (this.currentPhase / totalPhases) * 100;

    container.innerHTML = `
      <div class="phase-intro">
        <div class="phase-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <p class="progress-text">Phase ${this.currentPhase + 1} of ${totalPhases}</p>
        </div>
        <h2>${SecurityUtils.sanitizeHTML(phase.title)}</h2>
        <h3 class="phase-subtitle">${SecurityUtils.sanitizeHTML(phase.subtitle)}</h3>
        <p class="phase-description">${SecurityUtils.sanitizeHTML(phase.description)}</p>
        <div class="phase-info">
          <p><strong>Questions:</strong> ${phase.questions.length}</p>
        </div>
        <button class="btn btn-primary btn-large" id="startPhaseBtn">Begin Phase ${this.currentPhase + 1}</button>
      </div>`;
    document.getElementById('startPhaseBtn')?.addEventListener('click', () => this.showPhaseQuestions());
  }

  showPhaseQuestions() {
    const clusters = this.getClusters();
    const phaseNames = Object.keys(clusters);
    const phaseName = phaseNames[this.currentPhase];
    const phase = clusters[phaseName];
    if (!phase) return;

    const container = document.getElementById('questionContainer');
    if (!container) return;
    const questions = phase.questions || [];

    let html = `<div class="phase-questions"><div class="phase-header-mini"><h3>${SecurityUtils.sanitizeHTML(phase.title)}</h3><p class="question-progress" id="questionProgress">Question 1 of ${questions.length}</p></div><form id="phaseForm">`;
    questions.forEach((q, idx) => {
      const opts = q.options || [1, 3, 5, 7, 10];
      let pairs = opts.map(v => ({ value: v, label: this.buildOptionLabel(q, v) }));
      if (q.shuffleOptions) pairs = this.shuffleArray(pairs);
      const req = q.optional ? '' : ' required';
      const optsHtml = pairs.map(p => `<label class="option-label"><input type="radio" name="${SecurityUtils.sanitizeHTML(q.id)}" value="${p.value}"${req}><span class="option-content"><span class="option-text">${SecurityUtils.sanitizeHTML(p.label)}</span></span></label>`).join('');
      const subcat = phase.subcategories?.[q.subcategory]?.label || q.subcategory;
      const optHint = q.optional ? '<p class="question-optional-hint" style="color:var(--muted);font-size:0.88rem;margin:0 0 0.75rem;line-height:1.5;">Optional: press <strong>Next</strong> without choosing if you prefer not to answer—this item is omitted from scoring; your other answers still count.</p>' : '';
      const helpHint = q.helpText ? `<p class="question-help">${SecurityUtils.sanitizeHTML(q.helpText)}</p>` : '';
      html += `<div class="question-block" data-question-index="${idx}" data-phase="${phaseName}" style="${idx === 0 ? '' : 'display:none'}">
        <div class="question-header"><span class="question-number">Question ${idx + 1} of ${questions.length}</span><span class="question-category">${SecurityUtils.sanitizeHTML(subcat)}</span></div>
        <p class="question-text">${SecurityUtils.sanitizeHTML(q.text)}</p>
        ${helpHint}
        ${optHint}
        <div class="options-container">${optsHtml}</div>
      </div>`;
    });
    html += `</form></div>`;
    container.innerHTML = html;
    this.currentQuestionIndex = 0;
    this.setNavVisibility(true);
    this.updatePrevNextButtons();
  }

  updatePrevNextButtons() {
    const prevBtn = document.getElementById('prevQuestion');
    const nextBtn = document.getElementById('nextQuestion');
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = this.currentQuestionIndex <= 0;
    nextBtn.textContent = 'Next';
  }

  nextQuestion() {
    const clusters = this.getClusters();
    const phaseNames = Object.keys(clusters);
    const phaseName = phaseNames[this.currentPhase];
    const phase = clusters[phaseName];
    const questions = phase?.questions || [];
    const block = document.querySelector(`[data-question-index="${this.currentQuestionIndex}"][data-phase="${phaseName}"]`);
    const qCurrent = questions[this.currentQuestionIndex];
    const input = block?.querySelector('input[type="radio"]:checked');
    if (!input) {
      if (qCurrent?.optional) {
        delete this.responses[qCurrent.id];
      } else {
        showAlert('Please select an answer.');
        return;
      }
    } else {
      this.responses[input.name] = parseInt(input.value, 10);
    }

    if (this.currentQuestionIndex >= questions.length - 1) {
      this.completePhase();
      return;
    }

    block.style.display = 'none';
    this.currentQuestionIndex++;
    const nextBlock = document.querySelector(`[data-question-index="${this.currentQuestionIndex}"][data-phase="${phaseName}"]`);
    if (nextBlock) {
      nextBlock.style.display = 'block';
      const prog = document.getElementById('questionProgress');
      if (prog) prog.textContent = `Question ${this.currentQuestionIndex + 1} of ${questions.length}`;
    }
    this.updatePrevNextButtons();
  }

  prevQuestion() {
    const clusters = this.getClusters();
    const phaseNames = Object.keys(clusters);
    const phaseName = phaseNames[this.currentPhase];
    const phase = clusters[phaseName];
    const questions = phase?.questions || [];
    const block = document.querySelector(`[data-question-index="${this.currentQuestionIndex}"][data-phase="${phaseName}"]`);
    if (block) block.style.display = 'none';
    this.currentQuestionIndex--;
    const prevBlock = document.querySelector(`[data-question-index="${this.currentQuestionIndex}"][data-phase="${phaseName}"]`);
    if (prevBlock) {
      prevBlock.style.display = 'block';
      const prog = document.getElementById('questionProgress');
      if (prog) prog.textContent = `Question ${this.currentQuestionIndex + 1} of ${questions.length}`;
    }
    this.updatePrevNextButtons();
  }

  completePhase() {
    const clusters = this.getClusters();
    const phaseNames = Object.keys(clusters);
    const phaseName = phaseNames[this.currentPhase];
    const phase = clusters[phaseName];
    const questions = phase?.questions || [];
    const block = document.querySelector(`[data-question-index="${this.currentQuestionIndex}"][data-phase="${phaseName}"]`);
    const qLast = questions[this.currentQuestionIndex];
    const input = block?.querySelector('input[type="radio"]:checked');
    if (!input) {
      if (qLast?.optional) {
        delete this.responses[qLast.id];
      } else {
        showAlert('Please select an answer.');
        return;
      }
    } else {
      this.responses[input.name] = parseInt(input.value, 10);
    }

    this.currentPhase++;
    if (this.currentPhase < phaseNames.length) {
      this.showPhaseIntro();
    } else {
      this.calculateAndShowResults();
    }
  }

  calculateAndShowResults() {
    this.smv = this.calculateSMV();
    this.persistResultsToStorage();
    this.setReportHeaderState(true);
    this.ui.transition('results');
    this.renderResults();
    window.scrollTo(0, 0);
  }

  /**
   * Rad Activity modifier: how "cool" / novel / radical outside-relationship pursuits read—mate competition for attention, boredom mitigation.
   * Component mix (inside RAD): activity type 40%, consumption 30%, competition 20%, visibility 10%.
   * Anti-rad floor: porn/drugs or gaming/TV tanks the score to max 25th percentile.
   * Implementation: shared/attraction-smv-core.mjs (keep in sync).
   */
  calculateRadActivityScore() {
    return calculateRadActivityPercentile(this.responses, RAD_ACTIVITY_TYPE_MODIFIER);
  }

  calculateSMV() {
    const clusters = this.getClusters();
    const weights = this.getClusterWeights();
    const partial = computeSmvClustersAndSubs({
      gender: this.currentGender,
      responses: this.responses,
      clusters,
      axisSubWeights: AXIS_SUBCATEGORY_WEIGHTS,
      radModifier: RAD_ACTIVITY_TYPE_MODIFIER
    });
    const smv = {
      overall: 0,
      clusters: partial.clusters,
      subcategories: partial.subcategories,
      marketPosition: '',
      delusionIndex: 0,
      delusionBand: 'low',
      levelClassification: '',
      targetMarket: {},
      recommendation: {}
    };

    smv.overall = computeOverallSmv(smv.clusters, weights);
    smv.marketPosition = this.classifyMarketPosition(smv.overall);
    smv.weakestSubcategories = this.identifyWeakestSubcategories(smv);
    smv.levelClassification = this.classifyDevelopmentalLevel(smv);
    smv.delusionIndex = this.calculateDelusionIndex(smv);
    smv.delusionBand = this.calculateDelusionBand(smv.delusionIndex);
    smv.targetMarket = this.analyzeTargetMarket(smv);
    smv.recommendation = this.generateRecommendation(smv);
    if (this.currentGender === 'male') {
      smv.badBoyGoodGuy = this.placeBadBoyGoodGuy(smv);
      smv.maleSocialProofLine = this.getMaleSocialProofSignalLine(this.responses);
    } else smv.keeperSweeper = this.placeKeeperSweeper(smv);
    smv.rawResponses = { ...this.responses };
    smv.preferences = { ...this.preferences };
    return smv;
  }

  classifyMarketPosition(overall) {
    const useLabel = this.currentGender === 'male' ? 'maleLabel' : 'femaleLabel';
    let result = '';
    for (const s of MARKET_SEGMENTS) if (overall >= s.min) { result = s[useLabel]; break; }
    if (!result) result = MARKET_SEGMENTS[MARKET_SEGMENTS.length - 1][useLabel];
    // Ensure male reports never show female Keeper/Sleeper/Sweeper terminology (e.g. "Sweeper Territory (Below Average)")
    const femaleSegmentInMaleReport = /(Sweeper|Sleeper)\s+(Zone|Territory)\b|(Sweeper|Sleeper)\s*[\(—]|^Keeper\s+(Zone|Territory)\b/i;
    if (this.currentGender === 'male' && femaleSegmentInMaleReport.test(result || '')) {
      for (const s of MARKET_SEGMENTS) if (overall >= s.min) return s.maleLabel;
      return MARKET_SEGMENTS[MARKET_SEGMENTS.length - 1].maleLabel;
    }
    return result;
  }

  identifyWeakestSubcategories(smv) {
    const weakest = {};
    const subLabels = { radActivity: 'Radical Activity (modifier)', courage: 'Courage', control: 'Control', competence: 'Competence', perspicacity: 'Perspicacity', protector: 'Protector', provider: 'Provider', parentalInvestor: 'Parental Investor', socialInfluence: 'Social Influence', selectivity: 'Selectivity & Mate Guarding', statusSignaling: 'Status Signaling', paternityCertainty: 'Paternity Certainty', nurturingStandard: 'Nurturing Standard', collaborativeTrust: 'Collaborative Trust', fertility: 'Fertility & Health', riskCost: 'Risk Cost', personality: 'Personality', factorsHidden: 'Factors Hidden', ...MALE_AXIS_BAR_LABELS };
    Object.keys(smv.subcategories || {}).forEach(clusterId => {
      const subs = smv.subcategories[clusterId];
      if (!subs || !Object.keys(subs).length) return;
      const entries = Object.entries(subs).map(([k, v]) => ({ id: k, score: v }));
      entries.sort((a, b) => a.score - b.score);
      if (entries[0]) weakest[clusterId] = { id: entries[0].id, label: subLabels[entries[0].id] || entries[0].id, score: entries[0].score };
    });
    return weakest;
  }

  placeBadBoyGoodGuy(smv) {
    const coalition = smv.clusters?.coalitionRank ?? 50;
    const repro = smv.clusters?.reproductiveConfidence ?? 50;
    const goodGuy = (repro * 0.85) + (coalition * 0.15);
    const badBoy = smv.clusters?.axisOfAttraction ?? 50;
    const gLevel = goodGuy >= 70 ? 'hi' : goodGuy >= 55 ? 'upper-mid' : goodGuy >= 40 ? 'mid' : goodGuy >= 25 ? 'lower-mid' : 'lo';
    const bLevel = badBoy >= 70 ? 'hi' : badBoy >= 40 ? 'mid' : 'lo';
    const labels = {
      hi_hi: 'Prince Charming (Ideal Long Term)', hi_mid: 'Husband zone', hi_lo: 'Friend zone',
      'upper-mid_hi': 'Good Situationship', 'upper-mid_mid': 'Good Settling', 'upper-mid_lo': 'Comfortable Compromise',
      mid_hi: 'Situationship', mid_mid: 'Settling', mid_lo: 'Resource Compromise',
      'lower-mid_hi': 'Bad Situationship', 'lower-mid_mid': 'Bad Settling', 'lower-mid_lo': 'Last Resort',
      lo_hi: 'Bad Boy Fun Time (Short Term)', lo_mid: '... Mistake', lo_lo: 'Invisible/Ghost or Creep'
    };
    return { goodGuyPercentile: Math.round(goodGuy), badBoyPercentile: Math.round(badBoy), label: labels[`${gLevel}_${bLevel}`] || 'Settling', goodGuyLevel: gLevel, badBoyLevel: bLevel };
  }

  calculateDelusionBand(score) {
    if (score >= 70) return 'severe';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  placeKeeperSweeper(smv) {
    const overall = smv.overall;
    let segment = overall >= 80 ? 'keepers' : overall >= 40 ? 'sleepers' : 'sweepers';
    let label = segment === 'keepers' ? 'Keepers' : segment === 'sleepers' ? 'Sleepers' : 'Sweepers';
    let desc = segment === 'keepers' ? 'My one and only' : segment === 'sleepers' ? 'Babe, I dunno where I\'m gonna be in 3 weeks, ya know?' : '(Under the rug)';
    let investment = segment === 'keepers' ? 'More Investment' : segment === 'sweepers' ? 'LESS Investment' : undefined;
    let partnerCountDowngrade = null;

    const pat2Raw = this.responses?.pat_2;
    const age = this.preferences?.age ?? 25;
    if (pat2Raw != null && PARTNER_COUNT_DOWNGRADE) {
      const cfg = PARTNER_COUNT_DOWNGRADE;
      const ageKey = age < 30 ? 'under30' : age < 40 ? 'under40' : 'over40';
      const k2s = cfg.keeperToSleeper[ageKey];
      const s2s = cfg.sleeperToSweeper[ageKey];
      const wasKeeper = segment === 'keepers';
      if (segment === 'keepers' && pat2Raw >= k2s) {
        segment = 'sleepers';
        label = 'Sleepers';
        desc = 'Babe, I dunno where I\'m gonna be in 3 weeks, ya know?';
        investment = undefined;
        partnerCountDowngrade = 'Keeper→Sleeper';
      }
      if (segment === 'sleepers' && pat2Raw >= s2s && !wasKeeper) {
        segment = 'sweepers';
        label = 'Sweepers';
        desc = '(Under the rug)';
        investment = 'LESS Investment';
        partnerCountDowngrade = 'Sleeper→Sweeper';
      }
    }

    return { segment, label, desc, investment, partnerCountDowngrade };
  }

  classifyDevelopmentalLevel(smv) {
    const coalition = smv.clusters?.coalitionRank || 0;
    const repro = smv.clusters?.reproductiveConfidence || 0;
    const avg = (coalition + repro) / 2;
    for (const l of DEVELOPMENTAL_LEVELS) if (avg >= l.min) return l.label;
    return DEVELOPMENTAL_LEVELS[DEVELOPMENTAL_LEVELS.length - 1].label;
  }

  calculateDelusionIndex(smv) {
    const p = this.preferences;
    let score = 0;
    if (this.currentGender === 'male') {
      const ageCtx = maleAgeGapContext(p, smv);
      score += ageCtx.ageDelusionContribution;
      const phys = p.physical_standards || 0;
      if (phys >= 5 && (smv.clusters?.axisOfAttraction || 0) < 60) score += 25;
      if (phys >= 7 && (smv.clusters?.axisOfAttraction || 0) < 70) score += 35;
      const fp = p.fertility_priority || 0;
      const repro = smv.clusters?.reproductiveConfidence || 0;
      if (fp >= 5 && repro < 60) score += 20;
      if (fp >= 7 && repro < 70) score += 30;
    } else {
      const h = p.height_requirement || 0;
      const inc = p.income_requirement || 0;
      const st = p.status_requirement || 0;
      if (h >= 7 && smv.overall < 70) score += 25;
      if (h >= 10 && smv.overall < 80) score += 40;
      if (inc >= 7 && smv.overall < 70) score += 25;
      if (inc >= 10 && smv.overall < 80) score += 40;
      if (st >= 7 && smv.overall < 65) score += 20;
      const age = p.age || 25;
      if (age > 30 && (h >= 7 || inc >= 7)) score += 15;
      if (age > 35 && (h >= 7 || inc >= 7)) score += 25;
    }
    return Math.min(score, 100);
  }

  analyzeTargetMarket(smv) {
    if (this.currentGender !== 'male') {
      return computeTargetMarketSummary(smv.overall, false);
    }
    const ctx = maleAgeGapContext(this.preferences, smv);
    const copy = attractionMaleYoungerPartnerAccessCopy(ctx.accessBand);
    return {
      ...computeTargetMarketSummary(ctx.effectiveOverall, true),
      headlineOverallPercentile: Math.round(smv.overall),
      poolAdjustedForStatedAges: Math.abs(ctx.effectiveOverallAdjust) >= 0.5,
      youngerPartnerAccessBand: ctx.accessBand,
      youngerPartnerAccessTitle: copy.title,
      youngerPartnerAccessDetail: copy.detail
    };
  }

  /** Targeted guidance for each weakest subcategory: what it means and how to achieve it */
  getWeakestSubcategoryGuidance(subId, clusterId) {
    const g = {
      courage: { meaning: 'Courage is risk tolerance under threat: standing ground, stepping into conflict, taking calculated risks. It drives male–male hierarchy and ally access.', actions: ['Practice de-escalation first, then escalation when needed — get comfortable in low-stakes conflict', 'Take one calculated risk per month (career, social, physical) and debrief afterwards', 'Train a contact sport or martial art to raise baseline confidence under pressure'] },
      control: { meaning: 'Control is mastery over impulses and stress: composure, discipline, emotional regulation. It signals reliability and coalition leadership.', actions: ['Establish one non-negotiable daily routine (sleep, training, or work block)', 'Use a 10-second pause before responding when stressed', 'Track one discipline metric (e.g. workouts/week) and maintain for 90 days'] },
      competence: { meaning: 'Competence is the ability to solve problems and secure resources under pressure. It determines whether others rely on you.', actions: ['Pick one high-value skill and reach demonstrable competence (certification or portfolio)', 'Volunteer to own one complex problem at work or in a group', 'Build a 3–6 month financial buffer to prove resource security'] },
      perspicacity: { meaning: 'Perspicacity is acute perception of threats and opportunities. Women filter for men who notice risk and opportunity early.', actions: ['Practice situational awareness: scan exits, body language, and outliers in every environment', 'Debrief decisions with a trusted peer to spot blind spots', 'Read one book per quarter on negotiation, body language, or threat assessment'] },
      protector: { meaning: 'Protector capacity is physical defense and intent to defend. It underlies female mate choice for long-term security.', actions: ['Invest in baseline physical capability: strength, cardio, and one self-defense skill', 'Role-play protective scenarios (verbal and physical) so you respond instead of freeze', 'Signal protector intent through consistent presence and reliability in daily life'] },
      provider: { meaning: 'Provider capacity is stable resource generation. It predicts whether offspring will be supported to maturity.', actions: ['Increase income or build a second stream — show upward trajectory', 'Create visible proof of provisioning: savings, assets, or documented support history', 'Reduce debt and instability; men who can’t provide are filtered out early'] },
      parentalInvestor: { meaning: 'Parental Investor signals willingness and competence in offspring rearing. Women filter for men who will stay and invest.', actions: ['Spend time with children (nieces, nephews, friends’ kids) and document it', 'Articulate a clear vision of fatherhood and how you’d structure family life', 'Demonstrate consistency and follow-through in other domains as a proxy for parental reliability'] },
      performanceStatus: { meaning: 'This bar blends wealth/finance, visible status, productivity, talent, and popularity—what signals resource depth, credibility, and social pull on first pass. It drives initiation attraction and time-to-intimacy alongside room command and followership in real contexts.', actions: ['Strengthen the financial picture: runway, debt control, and visible trajectory—not only headline income', 'Raise verifiable credibility: credentials, portfolio, wins, or audience that outsiders can check', 'Increase social leadership reps: host plans, set logistics, follow through, and showcase one standout talent'] },
      physicalGenetic: { meaning: 'Looks, physical, genetic, and aesthetic signals: face, body composition, fitness, proportions, skin/hair/teeth, voice and early presence, height, grooming, vitality, style/cohesive look, plus optional early-filter and net calibration. Mismatches (e.g. strong body vs weaker face) show across items; one optional item is market friction—not a verdict on worth.', actions: ['Prioritise the lowest sub-bars (often face, composition, style, or vitality as shown)', 'Train body composition and align grooming, skin/hair/teeth, and aesthetic presentation with your target standard', 'Posture, voice, sleep, and intentional style compound first-impression signal'] },
      humour: { meaning: 'Wit, conversational intelligence, and companionship quality—how stimulating and enjoyable you are beyond jokes alone. Supports approachability, tension release, and progression when calibrated to context.', actions: ['Build substance + timing: read, argue, tell stories—not only punchlines', 'Practise extended one-on-one quality: warmth, attunement, low-friction presence', 'Train calibration: read pace and cues before pushing banter or escalation'] },
      radActivity: { meaning: 'Radical Activity is a modifier, not a fourth core bar. It measures how cool, novel, or radical your main life outside the relationship reads—pursuits a partner has to compete with for your time and attention, which mitigates boredom and stops you from being the only stimulus. Passive consumption (gaming, TV, porn, drugs, endless scrolling) signals little worth competing with; a visible skill, risk, build, or mission signals a world larger than the pair bond and tends to sustain interest when core pillars are solid.', actions: ['Swap passive consumption for one visible pursuit others can see on a calendar—sport, craft, performance, business, or mastery', 'Make outside life concrete (events, outputs, training blocks) so competition for attention feels real, not vague busyness', 'Bias toward pursuits that feel fresh or high-signal in your circles so “what he does when he’s not with me” stays interesting'] },
      socialInfluence: { meaning: 'Social Influence is control over perceptions and alliances. It determines resource flow and protection in the female network.', actions: ['Identify key nodes in your social graph and deepen those alliances', 'Speak up in group settings; practice shaping narratives and opinions', 'Avoid burning bridges; repair one strained relationship and document the pattern'] },
      selectivity: { meaning: 'Selectivity & Mate Guarding Success is the ability to attract and retain top male attention against rivals.', actions: ['Raise your standards visibly — decline low-value attention and broadcast selectivity', 'Invest in appearance and presentation where it increases attention quality', 'Reduce availability and increase mystery; scarcity raises perceived value'] },
      statusSignaling: { meaning: 'Status Signaling is strategic display of beauty, fertility, and alliance without triggering sabotage.', actions: ['Display value incrementally rather than in one competitive burst', 'Build alliances before you shine — secure cover from key women first', 'Avoid overt one-upmanship; use subtle cues (quality, exclusivity, association)'] },
      paternityCertainty: { meaning: 'Paternity Certainty: men filter for signals of loyalty and exclusivity. High partner count, infidelity history, or opacity about the past raise paternity risk and reduce commitment willingness.', actions: ['Be fully transparent about relationship history when appropriate — no hidden bombs', 'Demonstrate exclusivity through behaviour, not just words', 'Reduce or reframe factors that signal volatility or infidelity risk'] },
      nurturingStandard: { meaning: 'Nurturing Standard aligns with the male’s early maternal care baseline. Men commit when they see warmth, care, and domestic potential.', actions: ['Practice active listening and emotional attunement in low-stakes settings', 'Demonstrate care through acts of service (food, comfort, support) without overgiving', 'Share examples of nurturing behaviour (family, pets, friends) in conversation'] },
      collaborativeTrust: { meaning: 'Collaborative Trust Efficiency is the ability to work with a male partner without waste, sabotage, or chronic conflict.', actions: ['Identify one recurring conflict pattern and change your response', 'Reduce drama: pause before escalating, avoid triangulation, address issues directly', 'Demonstrate reliability — follow through on commitments and show up consistently'] },
      fertility: { meaning: 'Fertility & Health cues combine face, waist-to-hip silhouette (self-reported from mirror, not tape measure), overall shape, skin/hair/teeth, balance of features/proportions, age bracket, optional early-filter item, and net calibration. Face and waist/hip silhouette pull harder than the optional early-filter item, which measures typical market friction, not value.', actions: ['Address the weakest bars first—often face, waist/hip line, or vitality presentation', 'Skin, hair, teeth, and posture compound; invest where you are thinnest', 'If the early-filter item is low, pair presentation work with realistic venue and pacing—initial impression is not the whole story'] },
      riskCost: { meaning: 'Risk Cost indicators (volatility, infidelity risk, sabotage potential) filter men out of long-term investment.', actions: ['Reduce visible red flags: substance use, instability, destructive patterns', 'Increase predictability — stable routine, consistent mood, clear communication', 'Address mental health or trauma if it shows up as volatility or conflict'] },
      personality: { meaning: 'Personality affects ease of partnership and game progression. Men invest when they enjoy your company, feel low friction, and can move interactions forward without chronic turbulence.', actions: ['Audit one friction point (negativity, criticism, neediness) and reduce it', 'Increase positive interactions: humour, gratitude, shared interests', 'Improve progression hygiene: clear communication, realistic scheduling, and consistent follow-through'] },
      factorsHidden: { meaning: 'Hidden factors (secrets, undisclosed past, concealed habits) undermine trust and commitment once discovered.', actions: ['Surface significant secrets before commitment deepens; control the narrative', 'Work through shame or guilt so you’re not carrying hidden weight', 'If disclosure is risky, get support (therapy, trusted friend) to plan timing and framing'] }
    };
    return g[subId] || { meaning: `Address ${subId} to improve rank.`, actions: ['Review the questions in this cluster and identify specific improvements'] };
  }

  generateRecommendation(smv) {
    const r = { priority: '', tactical: [], strategic: '', warning: '', weakestGuidance: [] };
    const weakest = smv.weakestSubcategories || {};
    if (this.currentGender === 'male') {
      if (smv.overall < 40) { r.priority = 'CRITICAL DEVELOPMENT NEEDED'; r.strategic = 'Lift the weakest sub-bars in each pillar before chasing higher-tier matches.'; }
      else if (smv.overall < 60) { r.priority = 'Optimization Phase'; r.strategic = 'Prioritize the highest-leverage sub-bars in each pillar to widen keeper-tier access.'; }
      else { r.priority = 'Refinement and Leverage'; r.strategic = 'Selection and calibration matter more than raw gain—vet fit, not only attraction.'; }
      if (weakest.coalitionRank) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.coalitionRank.id, 'coalitionRank');
        r.weakestGuidance.push({ cluster: '3C\'s (Coalition Rank)', label: weakest.coalitionRank.label, ...guid });
      }
      if (weakest.reproductiveConfidence) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.reproductiveConfidence.id, 'reproductiveConfidence');
        r.weakestGuidance.push({ cluster: '4P\'s (Reproductive Confidence)', label: weakest.reproductiveConfidence.label, ...guid });
      }
      if (weakest.axisOfAttraction) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.axisOfAttraction.id, 'axisOfAttraction');
        r.weakestGuidance.push({ cluster: 'Axis of Attraction', label: weakest.axisOfAttraction.label, ...guid });
      }
      if (smv.delusionBand === 'high' || smv.delusionBand === 'severe') r.warning = 'WARNING: Your standards significantly exceed your market value. Adjust expectations or commit to major self-improvement.';
    } else {
      if (smv.overall < 40) { r.priority = 'CRITICAL DEVELOPMENT NEEDED'; r.strategic = 'Lift the weakest sub-bars in each pillar before expecting commitment from high-value men.'; }
      else if (smv.overall < 60) { r.priority = 'Optimization Phase'; r.strategic = 'Target the weakest sub-bars first to access a wider band of commitment-minded men.'; }
      else { r.priority = 'Leverage and Selection'; r.strategic = 'Use leverage to select for fit and character—not only headline status.'; }
      if (weakest.coalitionRank) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.coalitionRank.id, 'coalitionRank');
        r.weakestGuidance.push({ cluster: '3S\'s (Coalition Rank)', label: weakest.coalitionRank.label, ...guid });
      }
      if (weakest.reproductiveConfidence) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.reproductiveConfidence.id, 'reproductiveConfidence');
        r.weakestGuidance.push({ cluster: 'Reproductive Confidence', label: weakest.reproductiveConfidence.label, ...guid });
      }
      if (weakest.axisOfAttraction) {
        const guid = this.getWeakestSubcategoryGuidance(weakest.axisOfAttraction.id, 'axisOfAttraction');
        r.weakestGuidance.push({ cluster: 'Axis of Attraction', label: weakest.axisOfAttraction.label, ...guid });
      }
      if (smv.delusionBand === 'high' || smv.delusionBand === 'severe') r.warning = 'WARNING: Your standards (height/income/status) significantly exceed your market value. Adjust standards or dramatically improve Sexual Market Value.';
    }
    if (r.weakestGuidance.length > 0) {
      r.tactical = ['Pick one action from each pillar\'s guidance above; run a short cycle and re-test in 2-4 weeks.'];
    } else {
      r.tactical = this.currentGender === 'male' ? ['Maintain current trajectory', 'Continue refining highest-leverage areas'] : ['Maintain Sexual Market Value through health and presentation', 'Continue vetting for commitment-capable men'];
    }
    return r;
  }

  renderResults() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    const s = this.smv;
    const rec = s.recommendation || {};
    const subLabels = { radActivity: 'Radical Activity (modifier)', courage: 'Courage', control: 'Control', competence: 'Competence', perspicacity: 'Perspicacity', protector: 'Protector', provider: 'Provider', parentalInvestor: 'Parental Investor', socialInfluence: 'Social Influence', selectivity: 'Selectivity & Mate Guarding', statusSignaling: 'Status Signaling', paternityCertainty: 'Paternity Certainty', nurturingStandard: 'Nurturing Standard', collaborativeTrust: 'Collaborative Trust', fertility: 'Fertility & Health', riskCost: 'Risk Cost', personality: 'Personality', factorsHidden: 'Factors Hidden', ...MALE_AXIS_BAR_LABELS };

    const peerRank = Math.round(s.clusters?.coalitionRank ?? 0);
    const reproConf = Math.round(s.clusters?.reproductiveConfidence ?? 0);
    const attractOpp = Math.round(s.clusters?.axisOfAttraction ?? 0);
    const peerRankSentence = this.currentGender === 'male'
      ? `Ranging above ~${peerRank}% of other men in the male–male hierarchy.`
      : `Ranging above ~${peerRank}% of other women in the female–female hierarchy.`;
    const reproConfSentence = this.currentGender === 'male'
      ? this.getReproConfSentenceMale(reproConf)
      : `Ranging above ~${reproConf}% of women on the male commitment signal you project (willingness to nest / long-term invest).`;
    const attractOppSentence = `Ranging above ~${attractOpp}% of peers on initiation and access.`;
    const peerRankBadge = `<div class="attraction-badge attraction-badge-cluster-metric" role="group" aria-label="Peer Rank" style="background:${this.getPercentileColor(peerRank)}20;border-color:${this.getPercentileColor(peerRank)}"><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(peerRankSentence)}</span></div>`;
    const reproConfBadge = `<div class="attraction-badge attraction-badge-cluster-metric" role="group" aria-label="Reproductive Confidence" style="background:${this.getPercentileColor(reproConf)}20;border-color:${this.getPercentileColor(reproConf)}"><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(reproConfSentence)}</span></div>`;
    const attractOppBadge = `<div class="attraction-badge attraction-badge-cluster-metric" role="group" aria-label="Attraction Opportunity" style="background:${this.getPercentileColor(attractOpp)}20;border-color:${this.getPercentileColor(attractOpp)}"><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(attractOppSentence)}</span></div>`;

    const gridLabel = this.currentGender === 'male' && s.badBoyGoodGuy ? s.badBoyGoodGuy.label : this.currentGender === 'female' && s.keeperSweeper ? s.keeperSweeper.label : '';
    const gridExpl = this.currentGender === 'male' && s.badBoyGoodGuy ? this.getQualificationExplanation(s.badBoyGoodGuy.label, 'badBoyGoodGuy') : this.currentGender === 'female' && s.keeperSweeper ? this.getQualificationExplanation(s.keeperSweeper.label, 'keeperSweeper') : '';
    const overallPercentile = Math.round(s.overall);
    const levelExpl = this.getQualificationExplanation(s.levelClassification, 'developmentalLevel');

    const femaleLabelSingular = { Keepers: 'Keeper', Sleepers: 'Sleeper', Sweepers: 'Sweeper' };
    const classificationContext = this.currentGender === 'male' ? 'How women are likely to categorise you' : 'How men are likely to treat you';
    const classificationDisplay = this.currentGender === 'female' && gridLabel ? `${femaleLabelSingular[gridLabel] || gridLabel}` : gridLabel;
    const investmentSuffix = '';
    const combinedCardDetail = this.currentGender === 'male' && s.badBoyGoodGuy
      ? `Overall Sexual Market Value ~${overallPercentile}th percentile (${s.marketPosition}). Driven by: manner and provision ~${s.badBoyGoodGuy.goodGuyPercentile}%; attraction ~${s.badBoyGoodGuy.badBoyPercentile}%.`
      : this.currentGender === 'female' && s.keeperSweeper
        ? `Overall Sexual Market Value ~${overallPercentile}th percentile — ${s.marketPosition}.${s.keeperSweeper.desc ? ` ${s.keeperSweeper.desc}` : ''}`
        : '';
    const partnerCountNote = this.currentGender === 'female' && s.keeperSweeper?.partnerCountDowngrade
      ? `<span class="qualification-explanation" style="display:block;margin-top:0.5rem;font-style:italic;">Partner-count impact (${s.keeperSweeper.partnerCountDowngrade}): attractiveness mitigates the effect. High partner count more often moves Keepers to Sleepers than Sleepers to Sweepers—the latter typically requires an extremely high partner count. It signals reduced loyalty expectation for long-term commitment. Men won't know initially; it matters if discovered.</span>`
      : '';
    const badgeValueRaw = (classificationDisplay || s.marketPosition || '').trim();
    const badgeAria = SecurityUtils.sanitizeHTML(badgeValueRaw || 'Market classification').replace(/"/g, '&quot;');
    const classificationFollowupParts = [];
    if (combinedCardDetail) {
      let detailBlock = `<p class="attraction-classification-detail">${SecurityUtils.sanitizeHTML(combinedCardDetail)}</p>`;
      if (this.currentGender === 'male' && gridExpl) {
        detailBlock += `<p class="attraction-classification-qualifier"><em>${SecurityUtils.sanitizeHTML(gridExpl)}</em></p>`;
      }
      classificationFollowupParts.push(detailBlock);
    }
    const marketUi =
      s.targetMarket && s.targetMarket.realisticOptionsPct && s.targetMarket.potentialMateCore
        ? s.targetMarket
        : typeof s.overall === 'number' && !Number.isNaN(s.overall)
          ? computeTargetMarketSummary(s.overall, this.currentGender === 'male')
          : null;
    if (marketUi?.realisticOptionsPct && marketUi?.potentialMateCore) {
      const roPlain = String(marketUi.realisticOptionsPct);
      const roPct = SecurityUtils.sanitizeHTML(roPlain);
      const pmc = SecurityUtils.sanitizeHTML(marketUi.potentialMateCore);
      const roAria = `Realistic options: ${roPlain}`.replace(/"/g, '&quot;');
      classificationFollowupParts.push(
        `<div class="temperament-composite-badge-wrap attraction-realistic-options-badge-wrap">
          <div class="temperament-composite-badge attraction-realistic-options-badge" role="status" aria-label="${roAria}">
            Realistic options: ${roPct}
          </div>
        </div>
        <p class="attraction-potential-mate-quality-line">Potential Mate Quality is ${pmc} (with major self-improvement).</p>`
      );
    }
    const showMaleYoungerPartnerAccess =
      this.currentGender === 'male' &&
      marketUi?.youngerPartnerAccessTitle &&
      marketUi?.youngerPartnerAccessDetail &&
      typeof s.overall === 'number' &&
      s.overall < 50 &&
      (marketUi.youngerPartnerAccessBand === 'mixed' || marketUi.youngerPartnerAccessBand === 'strained');
    if (showMaleYoungerPartnerAccess) {
      const headPct = marketUi.headlineOverallPercentile ?? Math.round(s.overall);
      const poolNote =
        marketUi.poolAdjustedForStatedAges
          ? `<span class="qualification-explanation" style="display:block;margin-top:0.5rem;font-style:italic;">Realistic-options bands above reflect your stated partner ages (headline overall ~${SecurityUtils.sanitizeHTML(String(headPct))}th percentile unchanged).</span>`
          : '';
      const ypAria = String(marketUi.youngerPartnerAccessTitle).replace(/"/g, '&quot;');
      classificationFollowupParts.push(
        `<div class="attraction-younger-partner-access" role="region" aria-label="${ypAria}">
          <p class="attraction-younger-partner-access-title"><strong>${SecurityUtils.sanitizeHTML(marketUi.youngerPartnerAccessTitle)}</strong></p>
          <p class="attraction-younger-partner-access-detail">${SecurityUtils.sanitizeHTML(marketUi.youngerPartnerAccessDetail)}${poolNote}</p>
        </div>`
      );
    }
    if (gridExpl && this.currentGender !== 'male') {
      classificationFollowupParts.push(`<p class="attraction-classification-expl">${SecurityUtils.sanitizeHTML(gridExpl)}</p>`);
    }
    if (partnerCountNote) classificationFollowupParts.push(partnerCountNote);
    const classificationFollowupHtml = classificationFollowupParts.length
      ? `<div class="attraction-classification-followup">${classificationFollowupParts.join('')}</div>`
      : '';
    const attractionHeaderSuiteHtml = `
        <div class="results-header attraction-report-header-suite">
          ${reportGenderGlyphHtml(this.currentGender)}
          <h2 class="suite-results-main-title">Your Sexual Market Value Profile:</h2>
          <p class="attraction-classification-foreword">${SecurityUtils.sanitizeHTML(classificationContext)}</p>
          ${badgeValueRaw ? `<div class="temperament-composite-badge-wrap temperament-composite-badge-wrap--lead attraction-classification-badge-wrap">
            <div class="temperament-composite-badge attraction-market-classification-badge" role="status" aria-label="${badgeAria}">
              ${SecurityUtils.sanitizeHTML(badgeValueRaw)}
            </div>
          </div>` : ''}
          ${classificationFollowupHtml}
        </div>`;

    const clusterOrder = ['coalitionRank', 'reproductiveConfidence', 'axisOfAttraction'];
    const badgeByCluster = { coalitionRank: peerRankBadge, reproductiveConfidence: reproConfBadge, axisOfAttraction: attractOppBadge };
    const subcategoryBlock = clusterOrder.filter(clusterId => s.subcategories?.[clusterId]).map(clusterId => {
      const subs = s.subcategories[clusterId];
      const weakest = s.weakestSubcategories?.[clusterId];
      const clusterPct = s.clusters?.[clusterId] ?? (Object.values(subs).reduce((a, b) => a + b, 0) / Object.keys(subs).length);
      const tierInfo = this.getPercentileTier(clusterPct);
      const subHtml = Object.entries(subs).filter(([subId]) => !(this.currentGender === 'male' && subId === 'radActivity')).map(([subId, score]) => {
        const isWeak = weakest && weakest.id === subId;
        return `<div class="subcategory-row ${isWeak ? 'weakest' : ''}"><span class="sub-label">${subLabels[subId] || subId}</span><div class="sub-bar"><div class="sub-bar-fill" style="width:${score}%;background:${this.getPercentileColor(score)}"></div></div></div>`;
      }).join('');
      const badge = badgeByCluster[clusterId] || '';
      const clusterSummary = this.getClusterSummary(clusterId);
      const clusterGuidance = weakest?.id ? this.getWeakestSubcategoryGuidance(weakest.id, clusterId) : null;
      const weakLabel = weakest?.id ? (subLabels[weakest.id] || weakest.id) : '';
      const tierLineHtml = `<p class="tier-logic" style="font-size:0.9rem;color:var(--muted);margin:0.25rem 0 0.75rem;font-style:italic;">${SecurityUtils.sanitizeHTML(tierInfo.logic)}</p>`;
      const axisSocialProofHtml =
        this.currentGender === 'male' && clusterId === 'axisOfAttraction' && s.maleSocialProofLine
          ? `<p class="attraction-axis-modifier qualification-explanation">${SecurityUtils.sanitizeHTML(s.maleSocialProofLine)}</p>`
          : '';
      const clusterGuidanceHtml = clusterGuidance
        ? `<div class="weakest-guidance" style="margin-top:1rem;"><h4>Focus: ${SecurityUtils.sanitizeHTML(weakLabel)}</h4><div class="guidance-block"><p class="guidance-meaning">${SecurityUtils.sanitizeHTML(clusterGuidance.meaning || '')}</p><p class="guidance-actions"><strong>How to improve:</strong></p><ol>${(clusterGuidance.actions || []).map(a => `<li>${SecurityUtils.sanitizeHTML(a)}</li>`).join('')}</ol></div></div>`
        : '';
      return `<section class="report-section"><h2 class="report-section-title">${this.getReportClusterHeading(clusterId)}</h2><div class="attraction-cluster-section"><div class="attraction-cluster-badge">${badge}</div><div class="cluster-subcategory-block">${subHtml}${clusterSummary ? `<p class="cluster-summary" style="font-size:0.95rem;color:var(--brand);margin:0.5rem 0 0.5rem;line-height:1.6;">${SecurityUtils.sanitizeHTML(clusterSummary)}</p>` : ''}${tierLineHtml}${axisSocialProofHtml}${clusterGuidanceHtml}</div></div></section>`;
    }).join('');

    const radScore = this.currentGender === 'male' && s.subcategories?.axisOfAttraction?.radActivity;
    const radBlock = this.currentGender === 'male' && radScore != null && (radScore < 40 || radScore >= 75)
      ? radScore < 40
        ? `<section class="report-section"><h2 class="report-section-title">Radical Activity — Notable Finding</h2><div class="panel-brand-left" style="background: rgba(211, 47, 47, 0.12); border-left: 4px solid #d32f2f; border-radius: var(--radius); padding: 1.25rem;"><p style="margin: 0;">Your Radical Activity modifier is <strong>~${Math.round(radScore)}th percentile</strong>. This is not a core matrix pillar, but it shapes whether interest stays fresh. Right now your life outside romance reads more like consumption or escape (e.g. heavy gaming, TV, porn, drugs) than a cool or novel pursuit—there is little benign competition for your attention, so boredom and over-availability can creep in. Build something visible outside the relationship (skill, sport, build, mission) that others respect and that legitimately pulls your time.</p></div></section>`
        : `<section class="report-section"><h2 class="report-section-title">Radical Activity — Notable Finding</h2><div class="panel-brand-left" style="background: rgba(40, 167, 69, 0.12); border-left: 4px solid #28a745; border-radius: var(--radius); padding: 1.25rem;"><p style="margin: 0;">Your Radical Activity modifier is <strong>~${Math.round(radScore)}th percentile</strong>. You signal a life beyond the relationship that reads as real, cool, or novel—something a partner competes with for your time in a healthy way. That mitigates boredom, reduces you being the only show, and supports sustained pull when your core pillars are also solid.</p></div></section>`
      : '';

    let html = `
      <div class="results-dashboard">
        ${attractionHeaderSuiteHtml}

        <div class="subcategory-breakdown">${subcategoryBlock}</div>

        ${radBlock}
        ${(() => {
          const delusionBlock =
            s.delusionBand !== 'low'
              ? `<div class="delusion-warning"><h3>⚠️ Standards-Market Mismatch: ${SecurityUtils.sanitizeHTML(s.delusionBand.toUpperCase())}</h3><p>${this.getDelusionWarning(s.delusionBand)}</p></div>`
              : '';
          const standardsBlock =
            this.currentGender === 'male' ? this.getMaleStandardsContextNote(s) : this.getFemaleStandardsContextNote(s);
          if (!delusionBlock && !standardsBlock) return '';
          return `<section class="report-section attraction-standards-calibration">${delusionBlock}${standardsBlock}</section>`;
        })()}

        <section class="report-section"><h2 class="report-section-title">Strategic Recommendations</h2>
        <div class="recommendations"><div class="priority-box ${rec.priority?.includes('CRITICAL') ? 'critical' : 'normal'}"><h4>${rec.priority || ''}</h4><p>${rec.strategic || ''}</p></div>
        ${rec.warning ? `<div class="warning-box"><strong>⚠️ Reality Check:</strong><p>${rec.warning}</p></div>` : ''}
        <div class="tactical-actions">${(rec.weakestGuidance || []).length && (rec.tactical || []).length === 1 ? `<h4>Next step</h4><p class="tactical-synthesis">${SecurityUtils.sanitizeHTML((rec.tactical || [])[0] || '')}</p>` : `<h4>Immediate Actions</h4><ol>${(rec.tactical || []).map(a => `<li>${SecurityUtils.sanitizeHTML(a)}</li>`).join('')}</ol>`}</div>
        </div></section>

        <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; margin-top: 2rem; border-left: 4px solid var(--accent);">
          <p style="margin: 0;"><strong style="color: var(--accent);">Explore further:</strong> Market position links to who you are and how you relate. <a href="archetype.html">Modern Archetype Identification</a> shows the patterns behind your attraction dynamics; <a href="temperament.html">Polarity Position Mapping</a> clarifies how masculine–feminine expression affects selection; <a href="relationship.html">Relationships</a> assesses compatibility and strain so you can see where market reality and fit diverge.</p>
        </div>

        <section class="report-section" style="margin-top: 2rem;">
          <h2 class="report-section-title">Opportunity to improve quality of life</h2>
          <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; border-left: 4px solid var(--accent);">
            <p style="margin: 0;">${levelExpl ? SecurityUtils.sanitizeHTML(levelExpl) : `Your responses suggest you're operating as ${SecurityUtils.sanitizeHTML(s.levelClassification)}.`}</p>
          </div>
        </section>
      </div>`;
    container.innerHTML = html;
  }

  formatClusterName(id) {
    const map = { coalitionRank: 'Coalition Rank', reproductiveConfidence: 'Reproductive Confidence', axisOfAttraction: 'Axis of Attraction' };
    return map[id] || id;
  }

  getReportClusterHeading(id) {
    const map = {
      coalitionRank: 'Peer Rank',
      reproductiveConfidence: 'Reproductive Confidence',
      axisOfAttraction: 'Attraction Opportunity'
    };
    return map[id] || this.formatClusterName(id);
  }

  getClusterSummary(clusterId) {
    return attractionClusterSummary(clusterId, this.currentGender === 'male');
  }

  getQualificationExplanation(label, type) {
    return attractionQualificationExplanation(label, type);
  }

  getSMVInterpretation(smv) {
    return attractionSmvInterpretation(smv);
  }

  getDelusionWarning(band) {
    return attractionDelusionWarning(band);
  }

  /** Plain-language Reproductive Confidence for men (percentile as likelihood of nesting/reproduction if desired). */
  getReproConfSentenceMale(percent) {
    const p = Math.round(percent);
    if (p >= 70) return `High likelihood of reproduction as signalled to women (~${p}% if desired).`;
    if (p >= 40) return `Moderate likelihood of reproduction as signalled to women (~${p}% if desired).`;
    return `Low likelihood of reproduction as signalled to women (~${p}% if desired).`;
  }

  /** Male-only social-proof read (light-weight signal from perf_9..perf_11). */
  getMaleSocialProofSignalLine(rawResponses) {
    if (this.currentGender !== 'male') return '';
    const responseMap = rawResponses || {};
    const socialProofItems = [
      { id: 'perf_9', weight: 0.7 },
      { id: 'perf_10', weight: 0.7 },
      { id: 'perf_11', weight: 0.7 }
    ];
    const answered = socialProofItems
      .map(item => ({ value: responseMap[item.id], weight: item.weight }))
      .filter(entry => typeof entry.value === 'number');
    if (!answered.length) return '';

    const totalWeight = answered.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) return '';
    const weightedScore = answered.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / totalWeight;
    const percentile = Math.round(scoreToPercentile(weightedScore));

    let intensity = 'Low';
    if (percentile >= 65) intensity = 'High';
    else if (percentile >= 45) intensity = 'Moderate';

    return `Social proof modifier: ${intensity} (~${percentile}th percentile) from recent traction, public conversion, and dating stability—weighted lightly inside Wealth/Status/Performance on this axis.`;
  }

  getPercentileColor(p) { if (p >= 80) return '#2ecc71'; if (p >= 60) return '#3498db'; if (p >= 40) return '#f39c12'; return '#e74c3c'; }

  /** Visual tier for report: 0–100 percentile → tier number, label, one-line logic (grade-based UI). */
  getPercentileTier(percent) {
    const p = Math.min(100, Math.max(0, Number(percent) || 0));
    if (p <= 20) return { tier: 1, label: 'Foundational', logic: 'This dimension is a critical base; significant development is needed before it supports your position.' };
    if (p <= 40) return { tier: 2, label: 'Developing', logic: 'You have a foothold but lack leverage; focused improvement will expand options.' };
    if (p <= 60) return { tier: 3, label: 'Functional Support', logic: 'You are a reliable node within the hierarchy but currently lack apex influence.' };
    if (p <= 80) return { tier: 4, label: 'Strong', logic: 'Strong position with clear leverage; refinement and selectivity matter more than raw gain.' };
    return { tier: 5, label: 'Apex', logic: 'Top-tier position; maintain and deploy with intention.' };
  }

  /**
   * Male-only: tie stated preferences to narrower scored constructs (physical vs full axis; fertility priority vs repro cluster).
   */
  getMaleStandardsContextNote(smv) {
    const p = this.preferences || {};
    const parts = [];
    const axisSubs = smv.subcategories?.axisOfAttraction || {};
    const pg = axisSubs.physicalGenetic;
    if ((p.physical_standards || 0) >= 5 && pg != null && pg < 58) {
      parts.push(
        `You rated physical attractiveness standards as important, but your Looks/Physical/Genetic/Aesthetic subscore (~${Math.round(pg)}th percentile) is only part of the full Attraction Opportunity score. Delusion checks use the whole axis; closing the gap means fitness, grooming, style, height presentation, and vitality — not only face.`
      );
    }
    const fp = p.fertility_priority || 0;
    const repro = smv.clusters?.reproductiveConfidence ?? 50;
    if (fp >= 5 && repro < 58) {
      parts.push(
        `You indicated strong priority on a partner’s fertility / having children; your Reproductive Confidence cluster (~${Math.round(repro)}th percentile) is what signals nesting and paternal intent to women screening for long-term fathers.`
      );
    }
    if (!parts.length) return '';
    return `<div class="standards-context-note" style="margin-top:1rem;padding:0.75rem 1rem;background:var(--glass);border-radius:var(--radius);font-size:0.9rem;line-height:1.5;border-left:3px solid var(--accent);"><strong>Preferences vs scored pillars:</strong><ul style="margin:0.5rem 0 0 1rem;">${parts.map(t => `<li>${SecurityUtils.sanitizeHTML(t)}</li>`).join('')}</ul></div>`;
  }

  /**
   * Female: tie stated partner requirements to scored pillars (narrative only; weights unchanged).
   */
  getFemaleStandardsContextNote(smv) {
    const p = this.preferences || {};
    const parts = [];
    const coalition = smv.clusters?.coalitionRank ?? 50;
    const repro = smv.clusters?.reproductiveConfidence ?? 50;
    const fertSub = smv.subcategories?.axisOfAttraction?.fertility;

    if ((p.height_requirement || 0) >= 7 && coalition < 58) {
      parts.push(
        `You indicated a strict height floor for partners (${p.height_requirement >= 10 ? '6\'2"+ only' : '6\'0"+ or higher'}). Your Coalition Rank (~${Math.round(coalition)}th percentile) reflects female–female hierarchy and attention quality—both affect realistic access to the partner pool you described.`
      );
    } else if ((p.height_requirement || 0) >= 5 && coalition < 55) {
      parts.push(
        `You indicated a meaningful height preference for partners. Your Coalition Rank (~${Math.round(coalition)}th percentile) shapes how you read in social and mating markets alongside that filter.`
      );
    }

    if ((p.income_requirement || 0) >= 7 && repro < 58) {
      parts.push(
        `You indicated high income/wealth expectations for a partner. Your Reproductive Confidence cluster (~${Math.round(repro)}th percentile) is part of what signals long-term pair-bonding and trust to men calibrating on those axes.`
      );
    } else if ((p.income_requirement || 0) >= 5 && repro < 55) {
      parts.push(
        `You indicated elevated income/wealth expectations. Reproductive Confidence (~${Math.round(repro)}th percentile) contributes to how you read on nesting and commitment-relevant signals.`
      );
    }

    if ((p.status_requirement || 0) >= 5 && coalition < 55) {
      parts.push(
        `Status and prestige matter in your stated preferences. Coalition Rank (~${Math.round(coalition)}th percentile) affects your own standing and how alliance and rivalry dynamics play out.`
      );
    }

    const longTermGoal = p.relationship_goal === 'marriage' || p.relationship_goal === 'family';
    if (longTermGoal && fertSub != null && fertSub < 55) {
      parts.push(
        `You selected a marriage- or family-oriented goal. Your Fertility & Health subscore (~${Math.round(fertSub)}th percentile) is one lane men weigh for long-term pairing; Attraction Opportunity still blends risk, personality, and hidden-factor signals.`
      );
    }

    if (!parts.length) return '';
    return `<div class="standards-context-note" style="margin-top:1rem;padding:0.75rem 1rem;background:var(--glass);border-radius:var(--radius);font-size:0.9rem;line-height:1.5;border-left:3px solid var(--accent);"><strong>Preferences vs scored pillars:</strong><ul style="margin:0.5rem 0 0 1rem;">${parts.map(t => `<li>${SecurityUtils.sanitizeHTML(t)}</li>`).join('')}</ul></div>`;
  }

  generateSampleReport() {
    this.currentGender = Math.random() < 0.5 ? 'male' : 'female';
    this.responses = {};
    this.preferences = {};
    const prefQ = this.getPreferenceQuestions();
    prefQ.forEach(q => {
      if (q.type === 'number') this.preferences[q.id] = q.min + Math.floor(Math.random() * (q.max - q.min + 1));
      else if (q.type === 'scale' && q.options) this.preferences[q.id] = q.options[Math.floor(Math.random() * q.options.length)].value;
      else if (q.type === 'select' && q.options) this.preferences[q.id] = q.options[Math.floor(Math.random() * q.options.length)].value;
    });
    const clusters = this.getClusters();
    Object.values(clusters).forEach(cluster => {
      (cluster.questions || []).forEach(q => {
        const opts = q.options || [1, 3, 5, 7, 10];
        this.responses[q.id] = opts[Math.floor(Math.random() * opts.length)];
      });
    });
    this.calculateAndShowResults();
  }

  async abandonAssessment() {
    if (await showConfirm('Abandon and restart? All progress will be lost.')) this.resetAssessment();
  }

  resetAssessment() {
    localStorage.removeItem(ATTRACTION_RESULTS_KEY);
    this.currentGender = null;
    this.currentPhase = -1;
    this.responses = {};
    this.preferences = {};
    this.smv = {};
    this.setReportHeaderState(false);
    this.ui.transition('idle');
    window.scrollTo(0, 0);
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

  /**
   * Save results: download readable HTML report. Also refresh localStorage snapshot if a report is loaded.
   */
  saveResults() {
    this.persistResultsToStorage();
    const data = { ...this.smv, gender: this.currentGender };
    const html = generateReadableReport(data, 'attraction', 'Status Selection Attraction');
    downloadFile(html, `attraction-report-${this.currentGender}-${Date.now()}.html`, 'text/html');
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.attractionEngine = new AttractionEngine(); });
} else {
  window.attractionEngine = new AttractionEngine();
}
