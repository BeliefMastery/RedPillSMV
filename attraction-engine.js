/**
 * STATUS, SELECTION, ATTRACTION — Assessment Engine
 * Gender-specific evolutionary clusters. Weightings informed by @hoe_math.
 *
 * @author Warwick Marshall
 */

import { createDebugReporter } from './shared/debug-reporter.js';
import { SecurityUtils } from './shared/utils.js';
import { downloadFile, generateReadableReport } from './shared/export-utils.js';
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
  PARTNER_COUNT_DOWNGRADE
} from './attraction-data.js';

const ATTRACTION_RESULTS_KEY = 'attraction-assessment-results';

export class AttractionEngine {
  constructor() {
    this.currentGender = null;
    this.currentPhase = -1;
    this.currentQuestionIndex = 0;
    this.responses = {};
    this.preferences = {};
    this.smv = {};

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
      this.ui.transition('results');
      this.renderResults();
      window.scrollTo(0, 0);
      return true;
    } catch {
      return false;
    }
  }

  saveResults() {
    try {
      if (this.smv && this.currentGender) {
        localStorage.setItem(ATTRACTION_RESULTS_KEY, JSON.stringify({
          smv: this.smv,
          responses: this.responses,
          preferences: this.preferences,
          currentGender: this.currentGender,
          savedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      this.debugReporter.logError(e, 'saveResults');
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

    let html = `<div class="phase-intro"><h2>Market Preference Configuration</h2><h3 class="phase-subtitle">Define Your Mate Selection Criteria</h3><p class="phase-description">These preferences calibrate your assessment to the market segment you're targeting.</p><form id="preferencesForm" class="preferences-form">`;
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
      const optsHtml = pairs.map(p => `<label class="option-label"><input type="radio" name="${SecurityUtils.sanitizeHTML(q.id)}" value="${p.value}" required><span class="option-content"><span class="option-text">${SecurityUtils.sanitizeHTML(p.label)}</span></span></label>`).join('');
      const subcat = phase.subcategories?.[q.subcategory]?.label || q.subcategory;
      html += `<div class="question-block" data-question-index="${idx}" data-phase="${phaseName}" style="${idx === 0 ? '' : 'display:none'}">
        <div class="question-header"><span class="question-number">Question ${idx + 1} of ${questions.length}</span><span class="question-category">${SecurityUtils.sanitizeHTML(subcat)}</span></div>
        <p class="question-text">${SecurityUtils.sanitizeHTML(q.text)}</p>
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
    const input = block?.querySelector('input[type="radio"]:checked');
    if (!input) { showAlert('Please select an answer.'); return; }
    this.responses[input.name] = parseInt(input.value, 10);

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
    const input = block?.querySelector('input[type="radio"]:checked');
    if (!input) { showAlert('Please select an answer.'); return; }
    this.responses[input.name] = parseInt(input.value, 10);

    this.currentPhase++;
    if (this.currentPhase < phaseNames.length) {
      this.showPhaseIntro();
    } else {
      this.calculateAndShowResults();
    }
  }

  calculateAndShowResults() {
    this.smv = this.calculateSMV();
    this.saveResults();
    this.ui.transition('results');
    this.renderResults();
    window.scrollTo(0, 0);
  }

  scoreToPercentile(score) {
    const normalized = (score - 1) / 9;
    const sigmoid = 1 / (1 + Math.exp(-6 * (normalized - 0.5)));
    return sigmoid * 100;
  }

  /**
   * Rad Activity: weighted scoring (activity type 40%, consumption 30%, competition 20%, visibility 10%).
   * Anti-rad floor: porn/drugs or gaming/TV tanks the score to max 25th percentile.
   * Justification: activity type and consumption-vs-creation dominate because they directly signal direction;
   * competition and visibility amplify but cannot override a fundamentally anti-rad base.
   */
  calculateRadActivityScore() {
    const r = this.responses;
    const rad1 = r.rad_1 ?? 1, rad2 = r.rad_2 ?? 1, rad3 = r.rad_3 ?? 1, rad4 = r.rad_4 ?? 1;
    const norm = v => Math.max(0, Math.min(1, (v - 1) / 9));
    const weighted = 0.40 * norm(rad1) + 0.30 * norm(rad2) + 0.20 * norm(rad3) + 0.10 * norm(rad4);
    const rawScore = weighted * 9 + 1;
    let percentile = this.scoreToPercentile(rawScore);
    if (rad1 <= RAD_ACTIVITY_TYPE_MODIFIER.ANTI_RAD_THRESHOLD) {
      percentile = Math.min(percentile, RAD_ACTIVITY_TYPE_MODIFIER.ANTI_RAD_FLOOR);
    }
    return percentile;
  }

  calculateSMV() {
    const clusters = this.getClusters();
    const weights = this.getClusterWeights();
    const rawScores = { clusters: {}, subcategories: {} };
    const smv = { overall: 0, clusters: {}, subcategories: {}, marketPosition: '', delusionIndex: 0, levelClassification: '', targetMarket: {}, recommendation: {} };

    Object.keys(clusters).forEach(clusterId => {
      const cluster = clusters[clusterId];
      rawScores.clusters[clusterId] = [];
      rawScores.subcategories[clusterId] = {};
      (cluster.questions || []).forEach(q => {
        let v = this.responses[q.id];
        if (v == null) return;
        if (q.reverseScore) v = 11 - v;
        rawScores.clusters[clusterId].push(v);
        if (!rawScores.subcategories[clusterId][q.subcategory]) rawScores.subcategories[clusterId][q.subcategory] = [];
        rawScores.subcategories[clusterId][q.subcategory].push(v);
      });
      const avg = rawScores.clusters[clusterId].length ? rawScores.clusters[clusterId].reduce((a, b) => a + b, 0) / rawScores.clusters[clusterId].length : 0;
      smv.clusters[clusterId] = this.scoreToPercentile(avg);
      smv.subcategories[clusterId] = {};
      Object.keys(rawScores.subcategories[clusterId]).forEach(sub => {
        const arr = rawScores.subcategories[clusterId][sub];
        const subAvg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        smv.subcategories[clusterId][sub] = this.scoreToPercentile(subAvg);
      });
      // Override radActivity for males: weighted scoring + anti-rad floor
      if (this.currentGender === 'male' && clusterId === 'axisOfAttraction' && smv.subcategories[clusterId].radActivity != null) {
        smv.subcategories[clusterId].radActivity = this.calculateRadActivityScore();
      }
    });

    smv.overall = Object.keys(weights).reduce((sum, k) => sum + (smv.clusters[k] || 0) * (weights[k] || 0), 0);
    smv.marketPosition = this.classifyMarketPosition(smv.overall);
    smv.weakestSubcategories = this.identifyWeakestSubcategories(smv);
    smv.levelClassification = this.classifyDevelopmentalLevel(smv);
    smv.delusionIndex = this.calculateDelusionIndex(smv);
    smv.targetMarket = this.analyzeTargetMarket(smv);
    smv.recommendation = this.generateRecommendation(smv);
    if (this.currentGender === 'male') smv.badBoyGoodGuy = this.placeBadBoyGoodGuy(smv);
    else smv.keeperSweeper = this.placeKeeperSweeper(smv);
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
    const subLabels = { radActivity: 'Rad Activity', courage: 'Courage', control: 'Control', competence: 'Competence', perspicacity: 'Perspicacity', protector: 'Protector', provider: 'Provider', parentalInvestor: 'Parental Investor', performanceStatus: 'Performance/Status (Wealth)', physicalGenetic: 'Physical/Genetic', humour: 'Humour', socialInfluence: 'Social Influence', selectivity: 'Selectivity & Mate Guarding', statusSignaling: 'Status Signaling', paternityCertainty: 'Paternity Certainty', nurturingStandard: 'Nurturing Standard', collaborativeTrust: 'Collaborative Trust', fertility: 'Fertility & Health', riskCost: 'Risk Cost', personality: 'Personality', factorsHidden: 'Factors Hidden' };
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
    const goodGuy = smv.clusters?.reproductiveConfidence ?? 50;
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
      const ageDelta = (p.age || 0) - (p.target_age_max || 0);
      if (ageDelta > 10 && smv.overall < 70) score += 20;
      if (ageDelta > 15 && smv.overall < 60) score += 30;
      const phys = p.physical_standards || 0;
      if (phys >= 5 && (smv.clusters?.axisOfAttraction || 0) < 60) score += 25;
      if (phys >= 7 && (smv.clusters?.axisOfAttraction || 0) < 70) score += 35;
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
    const m = { realistic: '', aspirational: '' };
    if (this.currentGender === 'male') {
      if (smv.overall >= 80) { m.realistic = 'Top 20-30% of women (7-9/10 range)'; m.aspirational = 'Top 10% possible'; }
      else if (smv.overall >= 60) { m.realistic = 'Top 40-60% of women (5-7/10 range)'; m.aspirational = 'Top 30% with optimization'; }
      else if (smv.overall >= 40) { m.realistic = 'Average to below average (4-6/10)'; m.aspirational = 'Top 50% with improvement'; }
      else { m.realistic = 'Bottom 40%'; m.aspirational = 'Average with major self-improvement'; }
    } else {
      if (smv.overall >= 80) { m.realistic = 'Top 10-20% of men'; m.aspirational = 'Top 5% accessible'; }
      else if (smv.overall >= 60) { m.realistic = 'Top 30-50% of men'; m.aspirational = 'Top 20% with optimization'; }
      else if (smv.overall >= 40) { m.realistic = 'Average men'; m.aspirational = 'Above average possible'; }
      else { m.realistic = 'Below average'; m.aspirational = 'Average with improvement'; }
    }
    return m;
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
      performanceStatus: { meaning: 'Performance/Status (wealth = productivity, sharing, social popularity, unique talent) drives initiation attraction and time-to-intimacy. Unique talent (music, sport, craft) signals potential windfall or novelty.', actions: ['Raise visible status: certifications, titles, audience, or social proof', 'Develop or showcase one outstanding talent — music, sport, craft, or expertise', 'Increase generosity: time, introductions, sharing; produce and publish content others can point to'] },
      physicalGenetic: { meaning: 'Physical/Genetic signals (aesthetics, fitness, grooming, vitality) drive immediate attraction and mating access.', actions: ['Optimise fitness: strength 2–3x/week, conditioning 2x, body composition target', 'Upgrade grooming: skin, hair, teeth, wardrobe — invest in presentation', 'Increase energy and presence: sleep, nutrition, posture, eye contact'] },
      humour: { meaning: 'Humour is an intelligence signal and drives approachability and attraction. Women are drawn to men who can make them laugh and show quick wit.', actions: ['Study comedic timing and delivery — watch stand-up, practice in low-stakes settings', 'Read widely; humour relies on pattern recognition and surprise', 'Use self-deprecation sparingly; aim for playful observation over put-downs'] },
      radActivity: { meaning: 'Rad Activity is an external interest that signals direction; she competes with it. Anti-rad (gaming, TV, porn, drugs) = consumption/escape, no direction, attraction-killing. Low-rad (badminton, casual hobbies) = weak signal. Rad (snowboarding, martial arts, kitesurfing) = risk, skill, lifestyle. High-rad (business, mission) = "fucking the world with your passion."', actions: ['Replace consumption (gaming, TV, porn, scrolling) with building or mastery—output, not input', 'Develop one serious passion: sport, business, craft, or mission—make it visible', 'Choose activities that require risk, skill, or creation over passive hobbies'] },
      socialInfluence: { meaning: 'Social Influence is control over perceptions and alliances. It determines resource flow and protection in the female network.', actions: ['Identify key nodes in your social graph and deepen those alliances', 'Speak up in group settings; practice shaping narratives and opinions', 'Avoid burning bridges; repair one strained relationship and document the pattern'] },
      selectivity: { meaning: 'Selectivity & Mate Guarding Success is the ability to attract and retain top male attention against rivals.', actions: ['Raise your standards visibly — decline low-value attention and broadcast selectivity', 'Invest in appearance and presentation where it increases attention quality', 'Reduce availability and increase mystery; scarcity raises perceived value'] },
      statusSignaling: { meaning: 'Status Signaling is strategic display of beauty, fertility, and alliance without triggering sabotage.', actions: ['Display value incrementally rather than in one competitive burst', 'Build alliances before you shine — secure cover from key women first', 'Avoid overt one-upmanship; use subtle cues (quality, exclusivity, association)'] },
      paternityCertainty: { meaning: 'Paternity Certainty: men filter for signals of loyalty and exclusivity. High partner count, infidelity history, or opacity about the past raise paternity risk and reduce commitment willingness.', actions: ['Be fully transparent about relationship history when appropriate — no hidden bombs', 'Demonstrate exclusivity through behaviour, not just words', 'Reduce or reframe factors that signal volatility or infidelity risk'] },
      nurturingStandard: { meaning: 'Nurturing Standard aligns with the male’s early maternal care baseline. Men commit when they see warmth, care, and domestic potential.', actions: ['Practice active listening and emotional attunement in low-stakes settings', 'Demonstrate care through acts of service (food, comfort, support) without overgiving', 'Share examples of nurturing behaviour (family, pets, friends) in conversation'] },
      collaborativeTrust: { meaning: 'Collaborative Trust Efficiency is the ability to work with a male partner without waste, sabotage, or chronic conflict.', actions: ['Identify one recurring conflict pattern and change your response', 'Reduce drama: pause before escalating, avoid triangulation, address issues directly', 'Demonstrate reliability — follow through on commitments and show up consistently'] },
      fertility: { meaning: 'Fertility & Health cues (youth, waist–hip ratio, skin, hair, symmetry) drive male initial approach and short-term attraction.', actions: ['Optimise body composition and posture for fertility signalling', 'Invest in skin, hair, and grooming; treat them as non-negotiable', 'Dress to emphasise favourable ratios and health cues'] },
      riskCost: { meaning: 'Risk Cost indicators (volatility, infidelity risk, sabotage potential) filter men out of long-term investment.', actions: ['Reduce visible red flags: substance use, instability, destructive patterns', 'Increase predictability — stable routine, consistent mood, clear communication', 'Address mental health or trauma if it shows up as volatility or conflict'] },
      personality: { meaning: 'Personality affects ease of partnership. Men invest when they enjoy your company and feel low friction.', actions: ['Audit one friction point (negativity, criticism, neediness) and reduce it', 'Increase positive interactions: humour, gratitude, shared interests', 'Be easy to be around — low maintenance, flexible, agreeable when it matters'] },
      factorsHidden: { meaning: 'Hidden factors (secrets, undisclosed past, concealed habits) undermine trust and commitment once discovered.', actions: ['Surface significant secrets before commitment deepens; control the narrative', 'Work through shame or guilt so you’re not carrying hidden weight', 'If disclosure is risky, get support (therapy, trusted friend) to plan timing and framing'] }
    };
    return g[subId] || { meaning: `Address ${subId} to improve rank.`, actions: ['Review the questions in this cluster and identify specific improvements'] };
  }

  generateRecommendation(smv) {
    const r = { priority: '', tactical: [], strategic: '', warning: '', weakestGuidance: [] };
    const weakest = smv.weakestSubcategories || {};
    if (this.currentGender === 'male') {
      if (smv.overall < 40) { r.priority = 'CRITICAL DEVELOPMENT NEEDED'; r.strategic = 'Sexual Market Value below average. Focus on fundamentals before pursuing high-value women.'; }
      else if (smv.overall < 60) { r.priority = 'Optimization Phase'; r.strategic = 'Average Sexual Market Value. Strategic improvements can move you into keeper territory.'; }
      else { r.priority = 'Refinement and Leverage'; r.strategic = 'Strong Sexual Market Value. Focus on finding the right match.'; }
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
      if (smv.delusionIndex > 50) r.warning = 'WARNING: Your standards significantly exceed your market value. Adjust expectations or commit to major self-improvement.';
    } else {
      if (smv.overall < 40) { r.priority = 'CRITICAL DEVELOPMENT NEEDED'; r.strategic = 'Sexual Market Value below average. Without improvement, high-value men will not commit long-term.'; }
      else if (smv.overall < 60) { r.priority = 'Optimization Phase'; r.strategic = 'Average Sexual Market Value. Improvements can access above-average men.'; }
      else { r.priority = 'Leverage and Selection'; r.strategic = 'Strong Sexual Market Value. Focus on selecting the right high-value man.'; }
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
      if (smv.delusionIndex > 50) r.warning = 'WARNING: Your standards (height/income/status) significantly exceed your market value. Adjust standards or dramatically improve Sexual Market Value.';
    }
    r.tactical = r.weakestGuidance.flatMap(w => w.actions);
    if (r.tactical.length === 0) r.tactical = this.currentGender === 'male' ? ['Maintain current trajectory', 'Continue refining highest-leverage areas'] : ['Maintain Sexual Market Value through health and presentation', 'Continue vetting for commitment-capable men'];
    return r;
  }

  renderResults() {
    const container = document.getElementById('resultsContainer');
    if (!container) return;
    const s = this.smv;
    const rec = s.recommendation || {};
    const subLabels = { radActivity: 'Rad Activity', courage: 'Courage', control: 'Control', competence: 'Competence', perspicacity: 'Perspicacity', protector: 'Protector', provider: 'Provider', parentalInvestor: 'Parental Investor', performanceStatus: 'Performance/Status (Wealth)', physicalGenetic: 'Physical/Genetic', humour: 'Humour', socialInfluence: 'Social Influence', selectivity: 'Selectivity & Mate Guarding', statusSignaling: 'Status Signaling', paternityCertainty: 'Paternity Certainty', nurturingStandard: 'Nurturing Standard', collaborativeTrust: 'Collaborative Trust', fertility: 'Fertility & Health', riskCost: 'Risk Cost', personality: 'Personality', factorsHidden: 'Factors Hidden' };

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
    const peerRankBadge = `<div class="attraction-badge" style="background:${this.getPercentileColor(peerRank)}20;border-color:${this.getPercentileColor(peerRank)}"><span class="attraction-badge-label">Peer Rank</span><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(peerRankSentence)}</span></div>`;
    const reproConfBadge = `<div class="attraction-badge" style="background:${this.getPercentileColor(reproConf)}20;border-color:${this.getPercentileColor(reproConf)}"><span class="attraction-badge-label">Reproductive Confidence</span><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(reproConfSentence)}</span></div>`;
    const attractOppBadge = `<div class="attraction-badge" style="background:${this.getPercentileColor(attractOpp)}20;border-color:${this.getPercentileColor(attractOpp)}"><span class="attraction-badge-label">Attraction Opportunity</span><span class="attraction-badge-desc">${SecurityUtils.sanitizeHTML(attractOppSentence)}</span></div>`;

    const gridLabel = this.currentGender === 'male' && s.badBoyGoodGuy ? s.badBoyGoodGuy.label : this.currentGender === 'female' && s.keeperSweeper ? s.keeperSweeper.label : '';
    const gridExpl = this.currentGender === 'male' && s.badBoyGoodGuy ? this.getQualificationExplanation(s.badBoyGoodGuy.label, 'badBoyGoodGuy') : this.currentGender === 'female' && s.keeperSweeper ? this.getQualificationExplanation(s.keeperSweeper.label, 'keeperSweeper') : '';
    const overallPercentile = Math.round(s.overall);
    const smvColor = this.getPercentileColor(s.overall);
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
    const combinedCard = gridLabel ? `<div class="attraction-result-badge attraction-badge-with-expl attraction-at-glance-card" style="background:${smvColor}12;border-left:4px solid ${smvColor}"><span class="attraction-classification-label">${SecurityUtils.sanitizeHTML(classificationContext)}</span><span class="attraction-classification-value" style="color:${smvColor}">${SecurityUtils.sanitizeHTML(classificationDisplay)}${SecurityUtils.sanitizeHTML(investmentSuffix)}</span><span class="attraction-badge-desc" style="margin-top:0.5rem;">${SecurityUtils.sanitizeHTML(combinedCardDetail)}</span>${gridExpl ? `<span class="qualification-explanation">${SecurityUtils.sanitizeHTML(gridExpl)}</span>` : ''}${partnerCountNote}</div>` : '';

    const clusterOrder = ['coalitionRank', 'reproductiveConfidence', 'axisOfAttraction'];
    const badgeByCluster = { coalitionRank: peerRankBadge, reproductiveConfidence: reproConfBadge, axisOfAttraction: attractOppBadge };
    const subcategoryBlock = clusterOrder.filter(clusterId => s.subcategories?.[clusterId]).map(clusterId => {
      const subs = s.subcategories[clusterId];
      const weakest = s.weakestSubcategories?.[clusterId];
      const clusterPct = s.clusters?.[clusterId] ?? (Object.values(subs).reduce((a, b) => a + b, 0) / Object.keys(subs).length);
      const tierInfo = this.getPercentileTier(clusterPct);
      const subHtml = Object.entries(subs).map(([subId, score]) => {
        const isWeak = weakest && weakest.id === subId;
        return `<div class="subcategory-row ${isWeak ? 'weakest' : ''}"><span class="sub-label">${subLabels[subId] || subId}</span><div class="sub-bar"><div class="sub-bar-fill" style="width:${score}%;background:${this.getPercentileColor(score)}"></div></div></div>`;
      }).join('');
      const badge = badgeByCluster[clusterId] || '';
      const clusterSummary = this.getClusterSummary(clusterId);
      return `<div class="attraction-cluster-section"><div class="attraction-cluster-badge">${badge}</div><div class="cluster-subcategory-block"><h4>${this.formatClusterName(clusterId)}: Tier ${tierInfo.tier} (${tierInfo.label})</h4>${clusterSummary ? `<p class="cluster-summary" style="font-size:0.95rem;color:var(--brand);margin:0.5rem 0 0.5rem;line-height:1.6;">${SecurityUtils.sanitizeHTML(clusterSummary)}</p>` : ''}<p class="tier-logic" style="font-size:0.9rem;color:var(--muted);margin:0.25rem 0 0.75rem;font-style:italic;">${SecurityUtils.sanitizeHTML(tierInfo.logic)}</p>${subHtml}</div></div>`;
    }).join('');

    const radScore = this.currentGender === 'male' && s.subcategories?.axisOfAttraction?.radActivity;
    const radBlock = this.currentGender === 'male' && radScore != null && (radScore < 40 || radScore >= 75)
      ? radScore < 40
        ? `<section class="report-section"><div class="panel-brand-left" style="background: rgba(211, 47, 47, 0.12); border-left: 4px solid #d32f2f; border-radius: var(--radius); padding: 1.25rem;"><h3 style="color: #d32f2f; margin-top: 0;">Rad Activity — Notable Finding</h3><p style="margin: 0;">Your Rad Activity score is <strong>~${Math.round(radScore)}th percentile</strong>. Anti-rad activities (gaming, TV, porn, drugs) signal consumption and escape, not direction. Low-rad hobbies (badminton, casual pastimes) are better than nothing but weak. Shift toward building, mastery, or risk—sport, business, craft, or mission—so she competes with something real.</p></div></section>`
        : `<section class="report-section"><div class="panel-brand-left" style="background: rgba(40, 167, 69, 0.12); border-left: 4px solid #28a745; border-radius: var(--radius); padding: 1.25rem;"><h3 style="color: #28a745; margin-top: 0;">Rad Activity — Notable Finding</h3><p style="margin: 0;">Your Rad Activity score is <strong>~${Math.round(radScore)}th percentile</strong>. You have an external interest that she competes with—proof of value beyond initial attraction and the ultimate enduring competition. This strengthens your market position.</p></div></section>`
      : '';

    let html = `
      <div class="results-dashboard">
        <div class="results-header"><h2>Your Sexual Market Value Profile</h2><p class="results-subtitle">${this.currentGender === 'male' ? 'Male' : 'Female'} Sexual Market Value Assessment</p></div>

        <section class="report-section attraction-exec-summary">
          <div class="attraction-exec-badges">${combinedCard}</div>
        </section>

        <section class="report-section">
        <div class="subcategory-breakdown">${subcategoryBlock}</div></section>

        ${radBlock}
        <section class="report-section"><h2 class="report-section-title">Market Position</h2>
        ${s.delusionIndex > 30 ? `<div class="delusion-warning"><h3>⚠️ Delusion Index: ${Math.round(s.delusionIndex)}%</h3><p>${this.getDelusionWarning(s.delusionIndex)}</p></div>` : ''}
        <div class="market-analysis"><div class="market-grid"><div class="market-card"><h4>Realistic Target</h4><p>${s.targetMarket?.realistic || ''}</p></div><div class="market-card"><h4>Aspirational</h4><p>${s.targetMarket?.aspirational || ''}</p></div></div></div></section>

        <section class="report-section"><h2 class="report-section-title">Strategic Recommendations</h2>
        <div class="recommendations"><div class="priority-box ${rec.priority?.includes('CRITICAL') ? 'critical' : 'normal'}"><h4>${rec.priority || ''}</h4><p>${rec.strategic || ''}</p></div>
        ${rec.warning ? `<div class="warning-box"><strong>⚠️ Reality Check:</strong><p>${rec.warning}</p></div>` : ''}
        ${(rec.weakestGuidance || []).length ? `<div class="weakest-guidance"><h4>Targeted Guidance — Weakest Subcategories</h4>${(rec.weakestGuidance || []).map(w => `<div class="guidance-block"><h5>${SecurityUtils.sanitizeHTML(w.label)} <span class="guidance-cluster">(${SecurityUtils.sanitizeHTML(w.cluster)})</span></h5><p class="guidance-meaning"><strong>What it means:</strong> ${SecurityUtils.sanitizeHTML(w.meaning)}</p><p class="guidance-actions"><strong>How to improve:</strong></p><ol>${(w.actions || []).map(a => `<li>${SecurityUtils.sanitizeHTML(a)}</li>`).join('')}</ol></div>`).join('')}</div>` : ''}
        <div class="tactical-actions"><h4>Immediate Actions</h4><ol>${(rec.tactical || []).map(a => `<li>${SecurityUtils.sanitizeHTML(a)}</li>`).join('')}</ol></div>
        </div></section>

        <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; margin-top: 2rem; border-left: 4px solid var(--accent);">
          <p style="margin: 0;"><strong style="color: var(--accent);">Explore further:</strong> Market position links to who you are and how you relate. <a href="archetype.html">Modern Archetype Identification</a> shows the patterns behind your attraction dynamics; <a href="temperament.html">Polarity Position Mapping</a> clarifies how masculine–feminine expression affects selection; <a href="relationship.html">Relationships</a> assesses compatibility and strain so you can see where market reality and fit diverge.</p>
        </div>

        <section class="report-section" style="margin-top: 2rem;">
          <h2 class="report-section-title">Opportunity to improve quality of life</h2>
          <div class="panel-brand-left" style="background: var(--glass); border-radius: var(--radius); padding: 1.25rem; border-left: 4px solid var(--accent);">
            <p style="margin: 0;">${levelExpl ? SecurityUtils.sanitizeHTML(levelExpl) : `Your responses suggest you're operating from ${SecurityUtils.sanitizeHTML(s.levelClassification)}.`}</p>
          </div>
        </section>
      </div>`;
    container.innerHTML = html;
  }

  formatClusterName(id) {
    const map = { coalitionRank: 'Coalition Rank', reproductiveConfidence: 'Reproductive Confidence', axisOfAttraction: 'Axis of Attraction' };
    return map[id] || id;
  }

  /** Short description of what each cluster measures (used above the subcategory bars for context). */
  getClusterSummary(clusterId) {
    const male = this.currentGender === 'male';
    const summaries = {
      coalitionRank: male
        ? 'Coalition Rank reflects where you sit in the male–male hierarchy: status, resources, and social proof as perceived by the market. The bars below show how you score on the subcomponents (e.g. status, competence, influence) that feed into this rank.'
        : 'Coalition Rank reflects where you sit in the female–female hierarchy: status, social proof, and how you are perceived by peers. The bars below show the subcomponents (e.g. selectivity, nurturing, collaboration) that feed into this rank.',
      reproductiveConfidence: male
        ? 'Reproductive Confidence is the long-term commitment signal you project: provision, stability, and willingness to invest. It drives how seriously you are taken as a potential partner. The bars below break down the factors (provider, parental investor, etc.) that contribute.'
        : 'Reproductive Confidence is the commitment and nesting signal you project: how seriously you are taken as a long-term option. The bars below break down the factors (nurturing, paternity certainty, collaborative trust, etc.) that contribute.',
      axisOfAttraction: male
        ? 'Axis of Attraction captures initiation and access: physical presence, rad activity, and the traits that drive initial pull. The bars below show where you stand on the subdimensions that determine attraction opportunity.'
        : 'Axis of Attraction captures initiation and access: how you are perceived on the dimensions that drive initial pull (fertility signals, risk cost, personality, etc.). The bars below show where you stand on each subdimension.'
    };
    return summaries[clusterId] || '';
  }

  /** Brief explanations for qualifications — respondent may not know the terms */
  getQualificationExplanation(label, type) {
    const keeperSweeper = {
      'Keepers': 'Men you attract are likely to invest in you for the long term: they\'d commit to and prioritise you.',
      'Sleepers': 'The middle zone — men are open to you but not fully committed; they\'d consider you but may not prioritise you.',
      'Sweepers': 'Men you attract are likely to treat you with less investment: they\'ll engage casually or de-prioritise you relative to women they see as higher value.'
    };
    const badBoyGoodGuy = {
      'Prince Charming (Ideal Long Term)': 'Women are likely to see you as ideal long-term: high on both manner/provision and attraction.',
      'Husband zone': 'Women see you as strong long-term material: high manner/provision and solid attraction.',
      'Friend zone': 'Women tend to value you for your provision and reliability but don\'t feel the attraction; they keep you around without romantic intent.',
      'Good Situationship': 'Upper-mid on manner/provision, high attraction; the relationship is ambiguous but has good foundations and could move toward commitment.',
      'Situationship': 'Moderate manner/provision, high attraction; women are drawn to you but don\'t see clear commitment; they engage without fully investing long-term.',
      'Bad Situationship': 'Lower-mid on manner/provision, high attraction; women engage but see weak foundations; the relationship is ambiguous and unlikely to deepen.',
      'Good Settling': 'Upper-mid on both axes; women accept you as "good enough" — the match is workable but not exciting.',
      'Settling': 'Moderate on both axes; women may accept but not be excited; you\'re often read as "good enough" rather than a strong match.',
      'Bad Settling': 'Lower-mid on manner/provision, moderate attraction; women may be with you primarily for what you provide — they\'re settling for provision rather than desire.',
      'Comfortable Compromise': 'Upper-mid provision, low attraction; women may be with you for what you provide; the compromise feels acceptable.',
      'Resource Compromise': 'Moderate provision, low attraction; women may be with you primarily for what you provide.',
      'Last Resort': 'Lower-mid provision, low attraction; women are barely engaged; the relationship is fragile.',
      'Bad Boy Fun Time (Short Term)': 'Women are attracted short-term but don\'t see you as long-term material; high attraction, low manner/provision signal.',
      '... Mistake': 'Women may engage for fun but typically don\'t see it lasting; low provision, moderate attraction.',
      'Invisible/Ghost or Creep': 'Women are most likely to categorise you as invisible or threatening; they tend to avoid or disengage.'
    };
    const developmentalLevels = {
      'Integral/Holistic (High Integration)': 'You integrate multiple perspectives and act from a coherent worldview; mature decision-making.',
      'Achievement-Oriented (Rational/Strategic)': 'You focus on goals, strategy, and rational choice; rule-conscious and achievement-driven.',
      'Conformist (Rule-Following)': 'You follow social norms and authority; stability and belonging matter more than individual edge.',
      'Egocentric (Reactive/Impulsive)': 'You react from immediate needs and impulses; short-term gratification over long-term planning.',
      'Survival Mode (Basic Needs Focus)': 'Focus is on safety, security, and meeting basic needs; little bandwidth for higher-order strategy.'
    };
    if (type === 'keeperSweeper') return keeperSweeper[label] || '';
    if (type === 'badBoyGoodGuy') return badBoyGoodGuy[label] || '';
    if (type === 'developmentalLevel') return this.getDevelopmentalOpportunity(label);
    return '';
  }

  /** Reframe developmental level as opportunity to reorient one stage higher (not a fixed label). */
  getDevelopmentalOpportunity(currentLabel) {
    const order = [
      'Survival Mode (Basic Needs Focus)',
      'Egocentric (Reactive/Impulsive)',
      'Conformist (Rule-Following)',
      'Achievement-Oriented (Rational/Strategic)',
      'Integral/Holistic (High Integration)'
    ];
    const nextDescriptions = {
      'Survival Mode (Basic Needs Focus)': 'Egocentric — start to act from immediate wants and impulses while still securing basics.',
      'Egocentric (Reactive/Impulsive)': 'Conformist — begin to follow norms and consider stability and belonging, not only short-term gain.',
      'Conformist (Rule-Following)': 'Achievement-Oriented — shift toward goals, strategy, and rational choice; rule-conscious and achievement-driven.',
      'Achievement-Oriented (Rational/Strategic)': 'Integral/Holistic — integrate multiple perspectives and act from a coherent worldview; mature decision-making.',
      'Integral/Holistic (High Integration)': 'You\'re at the highest integration; continue to deepen and sustain this level.'
    };
    const idx = order.indexOf(currentLabel);
    if (idx === -1) return '';
    if (idx === order.length - 1) return nextDescriptions[currentLabel] || '';
    const nextLabel = order[idx + 1];
    return `Your responses suggest you're operating from ${currentLabel}. The opportunity is to adjust consciousness toward the next stage: ${nextDescriptions[currentLabel] || nextLabel}.`;
  }

  /** Plain-language Reproductive Confidence for men (percentile as likelihood of nesting/reproduction if desired). */
  getReproConfSentenceMale(percent) {
    const p = Math.round(percent);
    if (p >= 70) return `High likelihood of reproduction as signalled to women (~${p}% if desired).`;
    if (p >= 40) return `Moderate likelihood of reproduction as signalled to women (~${p}% if desired).`;
    return `Low likelihood of reproduction as signalled to women (~${p}% if desired).`;
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

  getSMVInterpretation(smv) {
    if (smv >= 80) return `You are in the top quintile. Significant options and leverage.`;
    if (smv >= 60) return `Above average. With optimization, you can access high-quality partners.`;
    if (smv >= 40) return `Average range. Focused improvement will expand options.`;
    return `Below average. Significant development needed.`;
  }
  getDelusionWarning(i) {
    if (i >= 70) return 'SEVERE MISMATCH: Expectations dramatically out of alignment with market value.';
    if (i >= 50) return 'SIGNIFICANT MISMATCH: Standards exceed market position. Adjust or improve.';
    return 'MODERATE MISMATCH: Some recalibration needed.';
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
    this.ui.transition('idle');
    window.scrollTo(0, 0);
  }

  /**
   * Save results: produces a readable HTML report document recording report details (primary export action).
   */
  saveResults() {
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
