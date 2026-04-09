// Shared Export Utilities
// Standardized export functionality with AI agent instructions for all questionnaire systems

import {
  TEMPERAMENT_REPORT_TIER1_PARAS,
  TEMPERAMENT_REPORT_SPECTRUM_NOTE,
  TEMPERAMENT_REPORT_TIER2_SUMMARY,
  TEMPERAMENT_REPORT_TIER2_PARAS
} from '../temperament-data/temperament-report-copy.js';
import { EXPECTED_GENDER_TRENDS, formatCompositePositionDescription } from './temperament-composite-meta.js';
import { getDimensionNormativeClarifier } from './temperament-normative-clarifier.js';
import { TEMPERAMENT_DIMENSIONS } from '../temperament-data/temperament-dimensions.js';
import { INTIMATE_DYNAMICS } from '../temperament-data/intimate-dynamics.js';
import { ATTRACTION_RESPONSIVENESS } from '../temperament-data/attraction-responsiveness.js';
import { reportGenderGlyphHtml } from './report-gender-glyph.js';
import { getQualificationExplanation, getMaleYoungerPartnerAccessCopy } from './attraction-report-copy.js';
import { computeTargetMarketSummary, partnerRangeSublineFromOverall } from './attraction-target-market-summary.js';
import { maleAgeGapContext } from './male-age-gap.js';
import { formatProfileDecisivenessExportLine } from './archetype-profile-decisiveness.mjs';
import {
  formatArchetypeLayeringExportLine,
  formatArchetypeLayeringExportParagraph
} from './archetype-layering-profile.mjs';

const EXPORT_VERSION = '1.1.0';

const FRAMEWORK_MAP = {
  diagnosis: ['Sovereign of Mind', 'Distortion Codex'],
  coaching: ['Belief Mastery', 'Sovereign of Mind'],
  'life-domain-review': ['Belief Mastery', 'Sovereign of Mind'],
  manipulation: ['Sovereign of Mind', 'Distortion Codex'],
  channels: ['Sovereign of Mind'],
  paradigm: ['Sovereign of Mind'],
  'sovereignty-spectrum': ['Sovereign of Mind'],
  sovereignty: ['Sovereign of Mind'],
  relationship: ['Belief Mastery', 'Sovereign of Mind'],
  temperament: ['Belief Mastery', 'Sovereign of Mind'],
  'temperament-analysis': ['Belief Mastery', 'Sovereign of Mind'],
  'needs-dependency': ['Belief Mastery', 'Sovereign of Mind'],
  attraction: ['Belief Mastery', 'Sovereign of Mind'],
  archetype: ['Belief Mastery', 'Sovereign of Mind'],
  'archetype-analysis': ['Belief Mastery', 'Sovereign of Mind']
};

function getFrameworksForSystem(systemType) {
  if (!systemType) return ['Belief Mastery', 'Sovereign of Mind'];
  return FRAMEWORK_MAP[systemType] || ['Belief Mastery', 'Sovereign of Mind'];
}

function getTopEntriesByValue(entries, valueKey, limit = 3) {
  return entries
    .filter(entry => typeof entry[valueKey] === 'number')
    .sort((a, b) => b[valueKey] - a[valueKey])
    .slice(0, limit);
}

function buildExecutiveHighlights(data) {
  const highlights = [];
  if (!data) return highlights;

  if (Array.isArray(data.identifiedVectors) && data.identifiedVectors.length) {
    getTopEntriesByValue(data.identifiedVectors, 'weightedScore').forEach(vec => {
      highlights.push(`Manipulation vector: ${vec.name} (${vec.weightedScore?.toFixed?.(2) || vec.weightedScore})`);
    });
  }

  if (Array.isArray(data.weakestLinks) && data.weakestLinks.length) {
    data.weakestLinks.slice(0, 3).forEach(link => {
      const statePart = link.stateLabel ? ` — ${link.stateLabel}` : '';
      highlights.push(`Relationship strain: ${link.name}${statePart}`);
    });
  }
  if (data.viabilityBand) {
    const bandLabels = { 'consider-stepping-away': 'Consider stepping away', 'unclear-use-reflection': 'Unclear — use reflection', 'worth-investing': 'Worth investing in resolution' };
    highlights.push(`Viability: ${bandLabels[data.viabilityBand] || data.viabilityBand}`);
  }
  if (data.viabilityScoresByDimension && typeof data.viabilityScoresByDimension === 'object' && Object.keys(data.viabilityScoresByDimension).length > 0) {
    highlights.push('Viability dimensions: qualitative pattern included in report body');
  }

  if (data.obstacles && typeof data.obstacles === 'object') {
    const obsList = Object.values(data.obstacles || {});
    getTopEntriesByValue(obsList, 'weightedScore').forEach(obs => {
      highlights.push(`Sovereignty obstacle: ${obs.name} (${obs.weightedScore?.toFixed?.(2) || obs.weightedScore})`);
    });
  }

  if (data.domains && typeof data.domains === 'object') {
    const domList = Object.values(data.domains || {});
    const lowest = domList
      .filter(dom => typeof dom.combinedScore === 'number')
      .sort((a, b) => a.combinedScore - b.combinedScore)
      .slice(0, 2);
    lowest.forEach(dom => {
      highlights.push(`Life domain strain: ${dom.name} (${dom.combinedScore?.toFixed?.(1) || dom.combinedScore}/10)`);
    });
  }

  if (data.probabilities && typeof data.probabilities === 'object') {
    const probs = Object.entries(data.probabilities)
      .map(([name, value]) => ({ name, value }))
      .filter(item => typeof item.value === 'number');
    getTopEntriesByValue(probs, 'value').forEach(item => {
      highlights.push(`Diagnostic indicator: ${item.name} (${Math.round(item.value * 100)}%)`);
    });
  }

  if (data.primaryArchetype) {
    highlights.push(`Primary archetype: ${data.primaryArchetype}`);
  }

  if (data.primaryPattern) {
    highlights.push(`Primary pattern: ${data.primaryPattern}`);
  }

  if (data.crossPolarityDetected && data.crossPolarityNote) {
    highlights.push(`Cross-polarity finding: ${data.crossPolarityNote}`);
  }

  if (data.primaryLoop) {
    highlights.push(`Primary dependency loop: ${data.primaryLoop}`);
    if (data.needChainDisplay) {
      highlights.push(`Need chain (Loop ← Root): ${data.needChainDisplay}`);
    }
    if (data.firstLinkInChain) {
      highlights.push(`First link in chain (immanent focus): ${data.firstLinkInChain}`);
    }
  }

  if (data.quadrants && typeof data.quadrants === 'object') {
    Object.entries(data.quadrants).forEach(([layerId, q]) => {
      if (q && q.label) highlights.push(`Sovereign Assessment ${layerId}: ${q.label}`);
    });
  }

  // Status, Selection, Attraction (SMV) specific
  if (typeof data.overall === 'number') {
    highlights.push(`Sexual Market Value Percentile: ${Math.round(data.overall)} (${data.marketPosition || ''})`);
  }
  if (typeof data.delusionIndex === 'number' && data.delusionIndex > 30) {
    highlights.push(`Delusion Index: ${Math.round(data.delusionIndex)}% — expectations vs reality mismatch`);
  }
  if (data.levelClassification) {
    highlights.push(`Developmental Level: ${data.levelClassification}`);
  }
  if (data.clusters && typeof data.clusters === 'object') {
    const clusterNames = { coalitionRank: 'Coalition Rank', reproductiveConfidence: 'Reproductive Confidence', axisOfAttraction: 'Axis of Attraction' };
    Object.entries(data.clusters).forEach(([k, v]) => {
      if (typeof v === 'number') highlights.push(`${clusterNames[k] || k}: ${Math.round(v)}th percentile`);
    });
  }

  return highlights;
}

export function exportExecutiveBrief(assessmentData, systemType, systemName) {
  const frameworks = getFrameworksForSystem(systemType).join(', ');
  const highlights = buildExecutiveHighlights(assessmentData);
  const guidance = [
    'Focus on the top 1–3 findings before expanding scope.',
    'Use the full export for AI-guided action planning.',
    'Re-run the assessment after applying corrective actions.'
  ];

  let text = `${systemName} — Executive Brief\n`;
  text += `Version: ${EXPORT_VERSION}\n`;
  text += `Generated: ${new Date().toISOString()}\n`;
  text += `Frameworks: ${frameworks}\n\n`;
  text += 'Key Findings:\n';
  if (highlights.length) {
    highlights.forEach(item => {
      text += `- ${item}\n`;
    });
  } else {
    text += '- No dominant findings detected. Review the full report for detail.\n';
  }
  text += '\nNext Actions:\n';
  guidance.forEach(item => {
    text += `- ${item}\n`;
  });

  return text;
}

export function exportForAIAgent(assessmentData, systemType, systemName) {
  // Generate comprehensive CSV export with AI interpretation instructions
  let csv = `${systemName} Assessment Profile\n`;
  csv += `Export Version: ${EXPORT_VERSION}\n`;
  csv += 'Generated: ' + new Date().toISOString() + '\n';
  csv += 'System Type: ' + systemType + '\n';
  csv += 'Frameworks: ' + getFrameworksForSystem(systemType).join(', ') + '\n';
  csv += '\n';
  csv += '=== HOW TO USE THIS DATA ===\n';
  csv += 'This CSV contains assessment data with comprehensive explanations for how your AI agent should interpret, value, and prioritize the content.\n';
  csv += 'Import this data into your AI platform (ChatGPT, Claude, etc.) and use the "AI Agent Configuration" section to configure your agent.\n';
  csv += 'This profile is designed to transform your AI into a personalized sovereignty-aligned coaching and analysis agent.\n';
  csv += '\n';
  csv += '=== AI AGENT CONFIGURATION INSTRUCTIONS ===\n';
  csv += 'Section,Instruction\n';
  csv += '"System Prompt","Use this assessment profile to understand the user\'s patterns, obstacles, and needs. Focus on sovereignty-aligned support and structural clarity."\n';
  csv += '"Primary Function","Provide coaching, analysis, and guidance based on the identified patterns and priorities in this profile."\n';
  csv += '"Tone & Approach","Adjust tone based on severity/priority levels: High = supportive but direct; Moderate = encouraging with strategies; Low = awareness and maintenance. Honor individual autonomy and authorship."\n';
  csv += '"Coaching Style","Question-based inquiry that surfaces self-awareness. Support without imposing. Help user recognize patterns and reclaim sovereignty."\n';
  csv += '"Prioritization","Use weighted scores and priority levels as primary metrics. Address high-priority items first, then moderate, then low."\n';
  csv += '"Response Approach","Focus responses on identified priorities. Acknowledge strengths. Provide practical strategies for obstacles and improvement areas."\n';
  csv += '"Sovereignty Alignment","All guidance should support the user\'s capacity for self-authorship, structural clarity, and reclaiming agency."\n';
  csv += '\n';
  
  // Add system-specific data sections
  if (systemType === 'coaching') {
    csv += generateCoachingExport(assessmentData);
  } else if (systemType === 'manipulation') {
    csv += generateManipulationExport(assessmentData);
  } else if (systemType === 'channels') {
    csv += generateChannelsExport(assessmentData);
  } else if (systemType === 'paradigm') {
    csv += generateParadigmExport(assessmentData);
  } else if (systemType === 'diagnosis') {
    csv += generateDiagnosisExport(assessmentData);
  } else if (systemType === 'relationship') {
    csv += generateRelationshipExport(assessmentData);
  } else if (systemType === 'temperament' || systemType === 'temperament-analysis') {
    csv += generateTemperamentExport(assessmentData);
  } else if (systemType === 'needs-dependency') {
    csv += generateNeedsDependencyExport(assessmentData);
  } else if (systemType === 'archetype' || systemType === 'archetype-analysis') {
    csv += generateArchetypeExport(assessmentData);
  } else if (systemType === 'sovereignty' || systemType === 'sovereignty-analysis') {
    csv += generateSovereigntyExport(assessmentData);
  }
  
  csv += '\n';
  csv += '=== INTERPRETATION GUIDE ===\n';
  csv += 'Column,Meaning,Priority Weight,Interpretation\n';
  csv += 'Raw Score,User response on 0-10 scale,Low,Direct user response - use for context\n';
  csv += 'Weighted Score,Score multiplied by importance weight,High,Primary metric for prioritization - higher = more urgent\n';
  csv += 'Priority Level,Calculated priority (High/Moderate/Low),High,Use to determine focus and intervention urgency\n';
  csv += 'Severity/Level,Interpreted level based on score,Medium,Use to understand user state and adjust tone/approach\n';
  csv += '\n';
  csv += '=== GENERAL SCORING INTERPRETATION ===\n';
  csv += 'Higher scores typically indicate stronger presence of patterns, obstacles, or concerns.\n';
  csv += 'Weighted scores determine priority - focus on high-priority items first.\n';
  csv += 'Use priority levels to determine coaching focus and intervention urgency.\n';
  csv += 'Adjust tone and approach based on severity/level indicators.\n';
  csv += '\n';
  
  return csv;
}

function generateCoachingExport(data) {
  let csv = '=== COACHING PROFILE DATA ===\n';
  
  // Include ALL questions with their answers
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Category,Section,Name\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.category || ''}","${q.section || ''}","${(q.name || '').replace(/"/g, '""')}"\n`;
    });
  }
  
  // Legacy support: include raw answers if questionSequence is missing
  if ((!data.questionSequence || data.questionSequence.length === 0) && data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    csv += '\n=== ALL RAW ANSWERS (Legacy Format) ===\n';
    csv += 'Question ID,Answer (0-10)\n';
    Object.entries(data.allAnswers).forEach(([id, answer]) => {
      const question = data.questionSequence ? data.questionSequence.find(q => q.id === id) : null;
      const questionText = question ? question.question : id;
      csv += `"${id}","${questionText.replace(/"/g, '""')}",${answer}\n`;
    });
  }
  
  if (data.obstacles && Object.keys(data.obstacles).length > 0) {
    csv += '\n=== OBSTACLES TO SOVEREIGNTY ===\n';
    csv += 'Name,Description,Raw Score,Weight,Weighted Score,Priority Level,Severity,Coaching Focus\n';
    
    const sortedObstacles = Object.entries(data.obstacles)
      .map(([key, obs]) => ({ key, ...obs }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
    
    sortedObstacles.forEach(obs => {
      const severity = obs.rawScore >= 7 ? 'High' : obs.rawScore >= 4 ? 'Moderate' : 'Low';
      const priority = obs.weightedScore >= 8 ? 'High' : obs.weightedScore >= 5 ? 'Moderate' : 'Low';
      const focus = obs.rawScore >= 7 
        ? 'Urgent - Address immediately with direct coaching support'
        : obs.rawScore >= 4 
          ? 'Important - Regular coaching attention and strategies'
          : 'Monitor - Periodic check-ins and awareness';
      
      csv += `"${obs.name}","${(obs.description || '').replace(/"/g, '""')}",${obs.rawScore},${obs.weight || 1.0},${obs.weightedScore.toFixed(2)},${priority},${severity},"${focus}"\n`;
    });
  }
  
  if (data.domains && Object.keys(data.domains).length > 0) {
    csv += '\n=== SATISFACTION DOMAINS ===\n';
    csv += 'Domain,Overall Score,Average Aspect Score,Combined Score,Weight,Weighted Score,Priority Level,Satisfaction Level,Coaching Focus\n';
    
    const sortedDomains = Object.entries(data.domains)
      .map(([key, dom]) => ({ key, ...dom }))
      .sort((a, b) => a.combinedScore - b.combinedScore);
    
    sortedDomains.forEach(dom => {
      const satisfaction = dom.combinedScore >= 7 ? 'High' : dom.combinedScore >= 4 ? 'Moderate' : 'Low';
      const priority = dom.combinedScore <= 3 ? 'High' : dom.combinedScore <= 5 ? 'Moderate' : 'Low';
      const focus = dom.combinedScore <= 3
        ? 'Urgent - Primary focus for satisfaction improvement'
        : dom.combinedScore <= 5
          ? 'Important - Regular support and goal-setting'
          : 'Maintain - Acknowledge strengths and support maintenance';
      
      csv += `"${dom.name}",${dom.overviewScore},${dom.averageAspectScore.toFixed(2)},${dom.combinedScore.toFixed(2)},${dom.weight || 1.0},${dom.weightedScore.toFixed(2)},${priority},${satisfaction},"${focus}"\n`;
    });
  }
  
  if (data.priorities) {
    csv += '\n=== PRIORITY SUMMARY ===\n';
    if (data.priorities.topObstacles && data.priorities.topObstacles.length > 0) {
      csv += 'Top Obstacles to Address:\n';
      data.priorities.topObstacles.forEach((obs, i) => {
        csv += `${i + 1},"${obs.name}",Score: ${obs.rawScore}/10,Weighted: ${obs.weightedScore.toFixed(2)}\n`;
      });
    }
    if (data.priorities.topImprovementAreas && data.priorities.topImprovementAreas.length > 0) {
      csv += '\nTop Areas for Improvement:\n';
      data.priorities.topImprovementAreas.forEach((dom, i) => {
        csv += `${i + 1},"${dom.name}",Satisfaction: ${dom.combinedScore.toFixed(1)}/10,Weighted: ${dom.weightedScore.toFixed(2)}\n`;
      });
    }
  }
  
  return csv;
}

function generateManipulationExport(data) {
  let csv = '=== MANIPULATION ANALYSIS DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Category,Subcategory,Type,Weight\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.text || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.category || ''}","${q.subcategory || ''}","${q.type || ''}",${q.weight || ''}\n`;
    });
  }
  
  // Legacy support: include raw answers if questionSequence is missing
  if ((!data.questionSequence || data.questionSequence.length === 0) && data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    csv += '\n=== ALL RAW ANSWERS (Legacy Format) ===\n';
    csv += 'Question ID,Question,Answer (0-10),Category,Subcategory\n';
    Object.entries(data.allAnswers).forEach(([id, answer]) => {
      const question = data.questionSequence ? data.questionSequence.find(q => q.id === id) : null;
      const questionText = question ? question.question : id;
      const category = question ? question.category : '';
      const subcategory = question ? question.subcategory : '';
      csv += `"${id}","${questionText.replace(/"/g, '""')}",${answer},"${category}","${subcategory}"\n`;
    });
  }
  
  if (data.identifiedVectors && data.identifiedVectors.length > 0) {
    csv += '\n=== IDENTIFIED MANIPULATION VECTORS ===\n';
    csv += 'Vector,Description,Raw Score,Weighted Score,Priority Level,Severity,Focus\n';
    
    data.identifiedVectors.forEach(vec => {
      const severity = vec.weightedScore >= 8 ? 'High' : vec.weightedScore >= 5 ? 'Moderate' : 'Low';
      const priority = vec.weightedScore >= 8 ? 'High' : vec.weightedScore >= 5 ? 'Moderate' : 'Low';
      const focus = vec.weightedScore >= 8
        ? 'Urgent - Primary manipulation vector requiring immediate recognition and protection strategies'
        : vec.weightedScore >= 5
          ? 'Important - Significant manipulation pattern requiring awareness and boundary-setting'
          : 'Monitor - Present but lower priority, maintain awareness';
      
      csv += `"${vec.name}","${(vec.description || '').replace(/"/g, '""')}",${vec.rawScore.toFixed(2)},${vec.weightedScore.toFixed(2)},${priority},${severity},"${focus}"\n`;
    });
  }
  
  if (data.tactics && data.tactics.length > 0) {
    csv += '\n=== RELEVANT MANIPULATION TACTICS ===\n';
    csv += 'Tactic,Vector,Mode,Phase,Example,Mechanism\n';
    data.tactics.slice(0, 10).forEach(tactic => {
      csv += `"${tactic.name}","${tactic.vector}","${tactic.mode}","${tactic.phase}","${(tactic.example || '').replace(/"/g, '""')}","${(tactic.mechanism || '').replace(/"/g, '""')}"\n`;
    });
  }
  
  return csv;
}

function generateChannelsExport(data) {
  let csv = '=== CHANNEL ANALYSIS DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Stage,Category,Node,Channel,Weight\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.stage || ''}","${q.category || ''}","${q.node || ''}","${q.channel || ''}",${q.weight || ''}\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer (0-10)\n';
      missingAnswers.forEach(([id, answer]) => {
        csv += `"${id}",${answer}\n`;
      });
    }
  }
  
  if (data.identifiedChannels && data.identifiedChannels.length > 0) {
    csv += '\n=== IDENTIFIED CHANNEL BLOCKAGES ===\n';
    csv += 'Channel,From Node,To Node,Blockage Score,Priority Level,Severity,Remediation Focus\n';
    
    data.identifiedChannels.forEach(ch => {
      const severity = ch.rawScore >= 8 ? 'High' : ch.rawScore >= 5 ? 'Moderate' : 'Low';
      const priority = ch.rawScore >= 8 ? 'High' : ch.rawScore >= 5 ? 'Moderate' : 'Low';
      const focus = ch.rawScore >= 8
        ? 'Urgent - Primary channel blockage requiring immediate remediation strategies'
        : ch.rawScore >= 5
          ? 'Important - Significant blockage requiring targeted practices'
          : 'Monitor - Present but lower priority, maintain awareness';
      
      csv += `"${ch.name}","${ch.from}","${ch.to}",${ch.rawScore.toFixed(2)},${priority},${severity},"${focus}"\n`;
    });
  }
  
  if (data.remediationStrategies && data.remediationStrategies.length > 0) {
    csv += '\n=== REMEDIATION STRATEGIES ===\n';
    csv += 'Channel,Strategy,Practices\n';
    data.remediationStrategies.forEach(strat => {
      const strategies = strat.strategies ? strat.strategies.join('; ') : '';
      const practices = strat.practices ? strat.practices.join(', ') : '';
      csv += `"${strat.channelName}","${strategies.replace(/"/g, '""')}","${practices.replace(/"/g, '""')}"\n`;
    });
  }
  
  return csv;
}

function generateParadigmExport(data) {
  let csv = '=== LOGOS STRUCTURE DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Category,Paradigm,Perspective,Dimension,Name\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.category || ''}","${q.paradigm || ''}","${q.perspective || ''}","${q.dimension || ''}","${(q.name || '').replace(/"/g, '""')}"\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer (0-10)\n';
      missingAnswers.forEach(([id, answer]) => {
        csv += `"${id}",${answer}\n`;
      });
    }
  }
  
  if (data.identifiedParadigms && data.identifiedParadigms.length > 0) {
    csv += '\n=== IDENTIFIED PARADIGMS ===\n';
    csv += 'Paradigm,Dimension,Score,Priority Level,Clarity Level,Focus\n';
    
    data.identifiedParadigms.forEach(paradigm => {
      const priority = paradigm.score >= 7 ? 'High' : paradigm.score >= 4 ? 'Moderate' : 'Low';
      const clarity = paradigm.score >= 7 ? 'High' : paradigm.score >= 4 ? 'Moderate' : 'Low';
      const focus = paradigm.score >= 7
        ? 'Primary paradigm - Strong alignment, use as foundation for coaching'
        : paradigm.score >= 4
          ? 'Secondary paradigm - Present but not dominant, consider in context'
          : 'Tertiary paradigm - Minimal alignment, may indicate conflict or transition';
      
      csv += `"${paradigm.name}","${paradigm.dimension}",${paradigm.score.toFixed(2)},${priority},${clarity},"${focus}"\n`;
    });
  }
  
  return csv;
}

function generateDiagnosisExport(data) {
  let csv = '=== DIAGNOSTIC ASSESSMENT DATA ===\n';
  
  // Combine all answers (main + refined)
  const allAnswers = {};
  if (data.answers) {
    Object.assign(allAnswers, data.answers);
  }
  if (data.refinedAnswers) {
    Object.assign(allAnswers, data.refinedAnswers);
  }
  // Fallback to allAnswers if available
  if (data.allAnswers && Object.keys(allAnswers).length === 0) {
    Object.assign(allAnswers, data.allAnswers);
  }
  
  // Include ALL questions with their answers (main sequence)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS (Main Sequence) ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Category,Disorder,Criterion\n';
    data.questionSequence.forEach(q => {
      const answer = allAnswers[q.id] !== undefined ? allAnswers[q.id] : (data.answers && data.answers[q.id] !== undefined ? data.answers[q.id] : 'Not answered');
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.category || ''}","${q.disorder || ''}","${q.criterion || ''}"\n`;
    });
  }
  
  // Include ALL refined questions with their answers
  if (data.refinedQuestionSequence && data.refinedQuestionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS (Refined Sequence) ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Disorder,Category\n';
    data.refinedQuestionSequence.forEach(q => {
      const answer = allAnswers[q.id] !== undefined ? allAnswers[q.id] : (data.refinedAnswers && data.refinedAnswers[q.id] !== undefined ? data.refinedAnswers[q.id] : 'Not answered');
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.disorder || ''}","${q.category || ''}"\n`;
    });
  }
  
  // Ensure ALL questions are included even if not in sequence (comprehensive coverage)
  const allQuestionIds = new Set();
  if (data.questionSequence) {
    data.questionSequence.forEach(q => allQuestionIds.add(q.id));
  }
  if (data.refinedQuestionSequence) {
    data.refinedQuestionSequence.forEach(q => allQuestionIds.add(q.id));
  }
  
  // Legacy support: include raw answers if questionSequence is missing
  if ((!data.questionSequence || data.questionSequence.length === 0) && allAnswers && Object.keys(allAnswers).length > 0) {
    csv += '\n=== ALL RAW ANSWERS (Legacy Format) ===\n';
    csv += 'Question ID,Answer (0-10),Category,Disorder,Criterion\n';
    Object.entries(allAnswers).forEach(([id, answer]) => {
      const question = data.questionSequence ? data.questionSequence.find(q => q.id === id) : 
                      (data.refinedQuestionSequence ? data.refinedQuestionSequence.find(q => q.id === id) : null);
      const category = question ? question.category : '';
      const disorder = question ? question.disorder : '';
      const criterion = question ? question.criterion : '';
      csv += `"${id}",${answer},"${category}","${disorder}","${criterion}"\n`;
    });
  }
  
  if (data.primaryDiagnosis) {
    csv += '\n=== PRIMARY DIAGNOSIS ===\n';
    csv += `Diagnosis: ${data.primaryDiagnosis.name}\n`;
    csv += `Probability: ${data.primaryDiagnosis.probability}%\n`;
    csv += `Severity: ${data.primaryDiagnosis.severity || 'Not specified'}\n`;
  }
  
  if (data.secondaryConsiderations && data.secondaryConsiderations.length > 0) {
    csv += '\n=== SECONDARY CONSIDERATIONS ===\n';
    csv += 'Diagnosis,Probability,Severity\n';
    data.secondaryConsiderations.forEach(diag => {
      csv += `"${diag.name}",${diag.probability}%,${diag.severity || 'Not specified'}\n`;
    });
  }
  
  return csv;
}

function generateRelationshipExport(data) {
  let csv = '=== RELATIONSHIP OPTIMIZATION DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Stage,Compatibility Point,Domain,Name\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.stage || ''}","${q.point || ''}","${q.domain || ''}","${(q.name || '').replace(/"/g, '""')}"\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer (0-10)\n';
      missingAnswers.forEach(([id, answer]) => {
        csv += `"${id}",${answer}\n`;
      });
    }
  }
  
  if (data.weakestLinks && data.weakestLinks.length > 0) {
    csv += '\n=== WEAKEST LINKS (Priority Areas) ===\n';
    csv += 'Rank,Compatibility Point,Name,Raw Score,Weighted Score,Impact Tier,Priority,Severity,Focus\n';
    
    data.weakestLinks.forEach((link, index) => {
      const focus = link.severity === 'Critical' || link.severity === 'Severe'
        ? 'Urgent - Immediate attention required, relationship at risk'
        : link.severity === 'Moderate'
          ? 'Important - Significant area for improvement, address soon'
          : 'Monitor - Present but manageable, maintain awareness';
      const severityDisplay = (link.stateLabel && link.rangeStr) ? `${link.stateLabel} (${link.rangeStr})` : (link.stateLabel || link.severity);
      csv += `${index + 1},"${(link.point + '').replace(/"/g, '""')}","${(link.name + '').replace(/"/g, '""')}",${link.rawScore},${link.weightedScore.toFixed(2)},"${(link.impactTier + '').replace(/"/g, '""')}",${link.priority},"${(severityDisplay + '').replace(/"/g, '""')}","${(focus + '').replace(/"/g, '""')}"\n`;
    });
  }
  
  if (data.compatibilityScores && Object.keys(data.compatibilityScores).length > 0) {
    csv += '\n=== ALL COMPATIBILITY SCORES ===\n';
    csv += 'Compatibility Point,Name,Raw Score,Weighted Score,Impact Tier,Tier Weight,Priority,Severity\n';
    
    const sortedScores = Object.entries(data.compatibilityScores)
      .map(([key, score]) => ({ key, ...score }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
    
    sortedScores.forEach(score => {
      csv += `"${score.key}","${score.name}",${score.rawScore},${score.weightedScore.toFixed(2)},"${score.impactTier}",${score.tierWeight},${score.priority},${score.severity}\n`;
    });
  }
  
  if (data.actionStrategies) {
    csv += '\n=== ACTION STRATEGIES ===\n';
    csv += 'Compatibility Point,Strategy Type,Action\n';
    
    data.weakestLinks.forEach(link => {
      if (link.strategies) {
        if (link.strategies.immediate && link.strategies.immediate.length > 0) {
          link.strategies.immediate.forEach(strategy => {
            csv += `"${link.point}","Immediate","${strategy.replace(/"/g, '""')}"\n`;
          });
        }
        if (link.strategies.structural && link.strategies.structural.length > 0) {
          link.strategies.structural.forEach(strategy => {
            csv += `"${link.point}","Structural","${strategy.replace(/"/g, '""')}"\n`;
          });
        }
        if (link.strategies.archetypal && link.strategies.archetypal.length > 0) {
          link.strategies.archetypal.forEach(insight => {
            csv += `"${link.point}","Archetypal","${insight.replace(/"/g, '""')}"\n`;
          });
        }
      }
    });
  }

  if (data.viabilityScoresByDimension && typeof data.viabilityScoresByDimension === 'object' && Object.keys(data.viabilityScoresByDimension).length > 0) {
    csv += '\n=== RELATIONSHIP VIABILITY EVALUATION ===\n';
    csv += 'Dimension ID,Score (0-10),Band\n';
    const bandLabels = { 'consider-stepping-away': 'Consider stepping away', 'unclear-use-reflection': 'Unclear — use reflection', 'worth-investing': 'Worth investing in resolution' };
    Object.entries(data.viabilityScoresByDimension).forEach(([dimId, score]) => {
      if (typeof score !== 'number') return;
      const band = score < 4 ? 'consider-stepping-away' : score <= 6 ? 'unclear-use-reflection' : 'worth-investing';
      csv += `"${dimId}",${Number(score).toFixed(2)},"${bandLabels[band] || band}"\n`;
    });
    if (data.viabilityBand) {
      csv += `\nOverall viability band: ${bandLabels[data.viabilityBand] || data.viabilityBand}\n`;
    }
  }
  
  return csv;
}

function generateTemperamentExport(data) {
  let csv = '=== TEMPERAMENT ANALYSIS DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (polarity / allocation),Type,Dimension/Category,Dimension Name/Category Name\n';
    data.questionSequence.forEach(q => {
      const rawAnswer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const answer = formatAnswerForExport(rawAnswer);
      const questionText = q.question || q.questionText || '';
      const dimensionOrCategory = q.dimension || q.category || '';
      const name = q.dimensionName || q.categoryName || q.name || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}","${String(answer).replace(/"/g, '""')}","${q.type || ''}","${dimensionOrCategory}","${name.replace(/"/g, '""')}"\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer\n';
      missingAnswers.forEach(([id, answer]) => {
        const formatted = formatAnswerForExport(answer);
        csv += `"${id}","${String(formatted).replace(/"/g, '""')}"\n`;
      });
    }
  }
  
  if (data.overallTemperament) {
    csv += '\n=== OVERALL TEMPERAMENT ===\n';
    csv += `Category: ${data.overallTemperament.category || 'Not specified'}\n`;
    csv += `Normalized Score: ${(data.overallTemperament.normalizedScore * 100).toFixed(1)}%\n`;
    csv += `Masculine Score: ${(data.overallTemperament.masculineScore * 100).toFixed(1)}%\n`;
    csv += `Feminine Score: ${(data.overallTemperament.feminineScore * 100).toFixed(1)}%\n`;
    csv += `Net Score: ${(data.overallTemperament.netScore * 100).toFixed(1)}%\n`;
    if (data.overallTemperament.normalizedScoreDecimal != null) {
      csv += `Composite (0–1, 4 dp): normalized=${data.overallTemperament.normalizedScoreDecimal}, masc=${data.overallTemperament.masculineScoreDecimal}, fem=${data.overallTemperament.feminineScoreDecimal}, net=${data.overallTemperament.netScoreDecimal}\n`;
    }
  }
  if (data.crossPolarityDetected && data.crossPolarityNote) {
    csv += '\n=== CROSS-POLARITY FINDING ===\n';
    csv += `Notable: ${data.crossPolarityNote}\n`;
  }
  if (data.dimensionScores && Object.keys(data.dimensionScores).length > 0) {
    csv += '\n=== DIMENSION SCORES ===\n';
    csv += 'Dimension,Masculine Score,Feminine Score,Net Score\n';
    Object.entries(data.dimensionScores).forEach(([dim, score]) => {
      csv += `"${dim}",${(score.masculine * 100).toFixed(1)}%,${(score.feminine * 100).toFixed(1)}%,${(score.net * 100).toFixed(1)}%\n`;
    });
  }
  
  return csv;
}

function formatAnswerForExport(answer) {
  if (answer == null || answer === '') return 'Not answered';
  if (typeof answer === 'object') {
    if (answer.type === 'value_allocation' && Array.isArray(answer.allocationPercents) && answer.allocationPercents.length >= 2) {
      const a = Math.max(0, Math.min(100, Number(answer.allocationPercents[0]) || 0));
      const b = Math.max(0, Math.min(100, Number(answer.allocationPercents[1]) || 0));
      const sum = a + b;
      const low = sum > 0 ? ((a / sum)).toFixed(2) : '0.50';
      const high = sum > 0 ? ((b / sum)).toFixed(2) : '0.50';
      return `low_pole=${low}; high_pole=${high}`;
    }
    if (answer.mapsTo && answer.mapsTo.need) return answer.mapsTo.need;
    if (answer.text) return answer.text;
    if (Array.isArray(answer)) return answer.map(a => formatAnswerForExport(a)).join('; ');
    return JSON.stringify(answer);
  }
  return String(answer);
}

function generateNeedsDependencyExport(data) {
  let csv = '=== NEEDS DEPENDENCY LOOP DETERMINATOR DATA (4-Phase Architecture) ===\n';
  
  // Include ALL questions with their answers (4-phase structure)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer,Phase,Loop\n';
    data.questionSequence.forEach(q => {
      const rawAnswer = q.answer !== undefined ? q.answer : (data.allAnswers && data.allAnswers[q.id]);
      const answer = formatAnswerForExport(rawAnswer);
      const questionText = (q.question || q.questionText || '').replace(/"/g, '""');
      csv += `"${q.id}","${questionText}","${String(answer).replace(/"/g, '""')}",${q.phase || ''},"${(q.loop || '').replace(/"/g, '""')}"\n`;
    });
  }
  
  // Primary Dependency Loop (4-phase: primaryLoop is string, loopScores has details)
  if (data.primaryLoop) {
    csv += '\n=== PRIMARY DEPENDENCY LOOP ===\n';
    const scores = data.loopScores && data.loopScores[data.primaryLoop];
    const totalScore = scores && typeof scores.totalScore === 'number' ? scores.totalScore.toFixed(1) : 'N/A';
    csv += `Loop Type: ${data.primaryLoop}\n`;
    csv += `Confidence: ${totalScore}/10\n`;
  }
  
  // Secondary Loops
  if (data.secondaryLoops && data.secondaryLoops.length > 0) {
    csv += '\n=== SECONDARY LOOPS ===\n';
    csv += data.secondaryLoops.join(', ') + '\n';
  }
  
  // Need Chain (Loop ← Root)
  const needChain = data.needChain || data.phase3Results?.needChain || [];
  if (needChain.length > 0) {
    csv += '\n=== NEED CHAIN (Loop ← Root) ===\n';
    if (data.needChainDisplay) {
      csv += `Chain: ${data.needChainDisplay}\n`;
    }
    csv += 'Position,Need,Deeper Options\n';
    needChain.forEach((entry, index) => {
      const need = (entry.need || entry).toString().replace(/"/g, '""');
      const deeper = Array.isArray(entry.deeper) ? entry.deeper.join('; ') : '';
      csv += `${index + 1},"${need}","${deeper.replace(/"/g, '""')}"\n`;
    });
  }
  
  // First Link in Chain (action-strategy recommendation)
  if (data.firstLinkInChain) {
    csv += '\n=== FIRST LINK IN CHAIN (Immanent Focus) ===\n';
    csv += `Seek and achieve: ${data.firstLinkInChain}\n`;
  }
  
  // Loop Scores (all loops)
  if (data.loopScores && typeof data.loopScores === 'object') {
    csv += '\n=== LOOP SCORES ===\n';
    csv += 'Loop,Total Score,Compulsion,Aversion,Need Chain Depth\n';
    Object.entries(data.loopScores).forEach(([loop, s]) => {
      const total = s && typeof s.totalScore === 'number' ? s.totalScore.toFixed(1) : '';
      const comp = s && typeof s.compulsionScore === 'number' ? s.compulsionScore.toFixed(1) : '';
      const av = s && typeof s.aversionScore === 'number' ? s.aversionScore.toFixed(1) : '';
      const depth = s && typeof s.needChainDepth === 'number' ? s.needChainDepth : '';
      csv += `"${loop}",${total},${comp},${av},${depth}\n`;
    });
  }
  
  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    csv += '\n=== RECOMMENDATIONS ===\n';
    csv += 'Priority,Title,Description\n';
    data.recommendations.forEach(rec => {
      const title = (rec.title || '').replace(/"/g, '""');
      const desc = (rec.description || '').replace(/"/g, '""');
      csv += `${rec.priority || ''},"${title}","${desc}"\n`;
    });
  }
  
  return csv;
}

function generateArchetypeExport(data) {
  let csv = '=== MODERN ARCHETYPE IDENTIFICATION DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Phase,Category,Archetype,Dimension\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.phase || ''}","${q.category || ''}","${q.archetype || ''}","${q.dimension || ''}"\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer (0-10)\n';
      missingAnswers.forEach(([id, answer]) => {
        csv += `"${id}",${answer}\n`;
      });
    }
  }
  
  if (data.primaryArchetype) {
    csv += '\n=== PRIMARY ARCHETYPE ===\n';
    csv += `Archetype: ${data.primaryArchetype.name}\n`;
    csv += `Confidence: ${data.primaryArchetype.confidence.toFixed(1)}%\n`;
    if (data.profileDecisiveness) {
      const decLine = formatProfileDecisivenessExportLine(data.profileDecisiveness);
      if (decLine) csv += `${decLine}\n`;
    }
    if (data.archetypeLayering) {
      const layLine = formatArchetypeLayeringExportLine(data.archetypeLayering);
      if (layLine) csv += `${layLine}\n`;
      const layPara = formatArchetypeLayeringExportParagraph(data.archetypeLayering);
      if (layPara) csv += `${layPara}\n`;
    }
    if (data.primaryArchetype.description) {
      csv += `Description: ${data.primaryArchetype.description}\n`;
    }
  }
  
  if (data.secondaryArchetype) {
    csv += '\n=== SECONDARY ARCHETYPE ===\n';
    csv += `Archetype: ${data.secondaryArchetype.name}\n`;
    csv += `Confidence: ${data.secondaryArchetype.confidence.toFixed(1)}%\n`;
  }
  
  if (data.tertiaryArchetype) {
    csv += '\n=== TERTIARY ARCHETYPE ===\n';
    csv += `Archetype: ${data.tertiaryArchetype.name}\n`;
    csv += `Confidence: ${data.tertiaryArchetype.confidence.toFixed(1)}%\n`;
  }
  
  return csv;
}

function generateSovereigntyExport(data) {
  let csv = '=== AI SOVEREIGNTY ANALYSIS DATA ===\n';
  
  // Include ALL questions with their answers (ensure comprehensive coverage)
  if (data.questionSequence && data.questionSequence.length > 0) {
    csv += '\n=== ALL QUESTIONS AND ANSWERS ===\n';
    csv += 'Question ID,Question Text,Answer (0-10),Section,Category,Type\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.section || ''}","${q.category || ''}","${q.type || ''}"\n`;
    });
  }
  
  // Include any additional answers not in questionSequence (legacy support)
  if (data.allAnswers && Object.keys(data.allAnswers).length > 0) {
    const questionIds = new Set();
    if (data.questionSequence) {
      data.questionSequence.forEach(q => questionIds.add(q.id));
    }
    const missingAnswers = Object.entries(data.allAnswers).filter(([id]) => !questionIds.has(id));
    if (missingAnswers.length > 0) {
      csv += '\n=== ADDITIONAL ANSWERS (Not in Question Sequence) ===\n';
      csv += 'Question ID,Answer (0-10)\n';
      missingAnswers.forEach(([id, answer]) => {
        csv += `"${id}",${answer}\n`;
      });
    }
  }
  
  if (data.cognitiveBand) {
    csv += '\n=== COGNITIVE BAND ===\n';
    csv += `Band: ${data.cognitiveBand.name || ''}\n`;
    csv += `IQ Range: ${data.cognitiveBand.iqRange || ''}\n`;
  }
  
  if (data.sovereigntyScore !== undefined) {
    csv += '\n=== SOVEREIGNTY METRICS ===\n';
    csv += `Sovereignty Score: ${data.sovereigntyScore}/100\n`;
    csv += `Attachment Mode: ${data.attachmentMode || ''}\n`;
    if (data.sovereignSplitPosition) {
      csv += `Sovereign Split Position: ${data.sovereignSplitPosition.name || ''}\n`;
    }
  }
  
  return csv;
}

export function exportJSON(assessmentData, systemType, systemName) {
  const exportData = {
    exportVersion: EXPORT_VERSION,
    systemType: systemType,
    systemName: systemName,
    timestamp: new Date().toISOString(),
    frameworks: getFrameworksForSystem(systemType),
    assessmentData: assessmentData,
    aiAgentInstructions: {
      systemPrompt: `Use this ${systemName} assessment profile to understand the user's patterns, obstacles, and needs. Focus on sovereignty-aligned support and structural clarity.`,
      primaryFunction: 'Provide coaching, analysis, and guidance based on the identified patterns and priorities in this profile.',
      tone: 'Adjust tone based on severity/priority levels: High = supportive but direct; Moderate = encouraging with strategies; Low = awareness and maintenance.',
      coachingStyle: 'Question-based inquiry that surfaces self-awareness. Support without imposing. Help user recognize patterns and reclaim sovereignty.',
      prioritization: 'Use weighted scores and priority levels as primary metrics. Address high-priority items first.',
      sovereigntyAlignment: 'All guidance should support the user\'s capacity for self-authorship, structural clarity, and reclaiming agency.'
    }
  };
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Save results: readable report document (HTML) ---
function escapeHtml(str) {
  if (str == null || str === '') return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reportDocHead(title, mainHeading, genderGlyphHtml = '', headLayout = 'default') {
  const isSuite = headLayout === 'suite';
  const titleBlock = isSuite
    ? `<div class="report-doc-header-suite">
  ${genderGlyphHtml}
  <h1 class="report-doc-main-title">${escapeHtml(mainHeading)}</h1>
</div>`
    : `<h1>${escapeHtml(mainHeading)}</h1>
  ${genderGlyphHtml}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 1.5rem; background: #fff; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h1.report-doc-main-title { text-align: center; margin: 0 0 0.35rem; color: #1a4d8c; }
    .report-doc-header-suite .assessment-report-gender-glyph { margin: 0 auto 0.45rem; }
    .meta { font-size: 0.875rem; color: #666; margin-bottom: 1.5rem; }
    h2 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; }
    h3 { font-size: 1.05rem; margin-top: 1rem; }
    ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
    li { margin-bottom: 0.35rem; }
    .card { background: #f8f9fa; border-left: 4px solid #0d6efd; border-radius: 4px; padding: 1rem; margin: 1rem 0; }
    .muted { color: #666; font-size: 0.9rem; }
    .strong { font-weight: 600; }
    .dimension-pole-bias { text-decoration: underline; text-decoration-thickness: 0.09em; text-underline-offset: 0.15em; font-weight: inherit; }
    .assessment-report-gender-glyph { margin: 0 auto 1rem; text-align: center; font-size: 2.75rem; line-height: 1; font-weight: 700; user-select: none; }
    .assessment-report-gender-glyph--male { color: #6ec1ff; }
    .assessment-report-gender-glyph--female { color: #ff89d4; }
    @media print { body { max-width: 100%; } }
  </style>
</head>
<body>
  ${titleBlock}
  <p class="meta">Report saved ${new Date().toLocaleString()} · Version ${EXPORT_VERSION}</p>
`;
}

function reportDocFoot() {
  return '\n</body>\n</html>';
}

function buildRelationshipReportBody(data) {
  const bandLabels = { 'consider-stepping-away': 'Consider stepping away', 'unclear-use-reflection': 'Unclear — use reflection', 'worth-investing': 'Worth investing in resolution' };
  let html = '';

  if (data.viabilityBand) {
    html += `<h2>Relationship Viability</h2><p><strong>${escapeHtml(bandLabels[data.viabilityBand] || data.viabilityBand)}</strong></p>`;
    if (data.viabilityScoresByDimension && typeof data.viabilityScoresByDimension === 'object' && Object.keys(data.viabilityScoresByDimension).length > 0) {
      html += '<p class="muted">Dimension levels:</p><ul>';
      Object.entries(data.viabilityScoresByDimension).forEach(([dimId, score]) => {
        if (typeof score !== 'number') return;
        const level = score < 4 ? 'Low' : score <= 6 ? 'Medium' : 'High';
        html += `<li>${escapeHtml(dimId)}: ${level}</li>`;
      });
      html += '</ul>';
    }
  }

  const weakestLinks = data.weakestLinks || [];
  if (weakestLinks.length > 0) {
    html += '<h2>Strain Points (Priority Areas)</h2><p class="muted">Areas of compatibility strain, ranked by impact. Address these for greatest effect.</p>';
    weakestLinks.forEach((link, index) => {
      const stateText = link.stateLabel ? escapeHtml(link.stateLabel) : '';
      html += `<div class="card"><h3>${index + 1}. ${escapeHtml(link.name || '')}</h3>`;
      html += `<p><strong>Impact:</strong> ${escapeHtml(link.impactTier || '')}${stateText ? ` · <strong>State:</strong> ${stateText}` : ''}</p>`;
      const strat = link.strategies || {};
      if (strat.immediate && strat.immediate.length) {
        html += '<p><strong>Immediate actions:</strong></p><ul>';
        strat.immediate.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
        html += '</ul>';
      }
      if (strat.structural && strat.structural.length) {
        html += '<p><strong>Structural actions:</strong></p><ul>';
        strat.structural.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
        html += '</ul>';
      }
      if (strat.archetypal && strat.archetypal.length) {
        html += '<p><strong>Archetypal insights:</strong></p><ul>';
        strat.archetypal.forEach(s => { html += `<li>${escapeHtml(s)}</li>`; });
        html += '</ul>';
      }
      html += '</div>';
    });
  }

  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

/** Male target-market lines + younger-partner access (preferences layer; headline SMV unchanged). */
function buildMaleTargetMarketForExport(s) {
  const overall = typeof s.overall === 'number' ? s.overall : 50;
  const ctx = maleAgeGapContext(s.preferences || {}, s);
  const copy = getMaleYoungerPartnerAccessCopy(ctx.accessBand);
  return {
    ...computeTargetMarketSummary(ctx.effectiveOverall, true),
    headlineOverallPercentile: Math.round(overall),
    poolAdjustedForStatedAges: Math.abs(ctx.effectiveOverallAdjust) >= 0.5,
    youngerPartnerAccessBand: ctx.accessBand,
    youngerPartnerAccessTitle: copy.title,
    youngerPartnerAccessDetail: copy.detail
  };
}

function buildAttractionClassificationExportBlock(data) {
  const gRaw = (data.gender || '').toLowerCase();
  const gender = gRaw === 'female' || gRaw === 'woman' ? 'female' : gRaw === 'male' || gRaw === 'man' ? 'male' : '';
  const overall = typeof data.overall === 'number' ? Math.round(data.overall) : null;
  const mp = String(data.marketPosition || '');
  const marketEsc = escapeHtml(mp);

  if (!gender) {
    if (overall == null) return '';
    return `<div class="export-attraction-classification" style="margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #e8e8e8;"><p><strong>Overall:</strong> ~${overall}th percentile${mp ? ` (${marketEsc})` : ''}</p></div>`;
  }

  const s = data;
  const gridLabel = gender === 'male' && s.badBoyGoodGuy ? s.badBoyGoodGuy.label : gender === 'female' && s.keeperSweeper ? s.keeperSweeper.label : '';
  const femaleLabelSingular = { Keepers: 'Keeper', Sleepers: 'Sleeper', Sweepers: 'Sweeper' };
  const classificationContext = gender === 'male' ? 'How women are likely to categorise you' : 'How men are likely to treat you';
  const classificationDisplay = gender === 'female' && gridLabel ? (femaleLabelSingular[gridLabel] || gridLabel) : gridLabel;
  const gg = s.badBoyGoodGuy;
  const ks = s.keeperSweeper;
  const pct = v => (typeof v === 'number' ? Math.round(v) : v);
  const combinedCardDetail =
    gender === 'male' && gg && overall != null
      ? `Overall Sexual Market Value ~${overall}th percentile (${marketEsc}). Driven by: manner and provision ~${pct(gg.goodGuyPercentile)}%; attraction ~${pct(gg.badBoyPercentile)}%.`
      : gender === 'female' && ks && overall != null
        ? `Overall Sexual Market Value ~${overall}th percentile — ${marketEsc}.${ks.desc ? ` ${escapeHtml(String(ks.desc))}` : ''}`
        : '';
  const gridExpl =
    gender === 'male' && gg ? getQualificationExplanation(gg.label, 'badBoyGoodGuy') : gender === 'female' && ks ? getQualificationExplanation(ks.label, 'keeperSweeper') : '';

  let partnerNote = '';
  if (gender === 'female' && ks?.partnerCountDowngrade) {
    partnerNote = `<p class="muted" style="font-style:italic;margin-top:0.5rem;font-size:0.9rem;">Partner-count impact (${escapeHtml(String(ks.partnerCountDowngrade))}): attractiveness mitigates the effect. High partner count more often moves Keepers to Sleepers than Sleepers to Sweepers—the latter typically requires an extremely high partner count. It signals reduced loyalty expectation for long-term commitment. Men won't know initially; it matters if discovered.</p>`;
  }

  const badgeValueRaw = (classificationDisplay || mp).trim();
  const pieces = [`<p class="muted" style="margin:0 0 0.35rem;font-size:0.95rem;">${escapeHtml(classificationContext)}</p>`];
  if (badgeValueRaw) {
    pieces.push(`<p style="font-weight:700;margin:0.35rem 0 0.65rem;font-size:1.05rem;">${escapeHtml(badgeValueRaw)}</p>`);
  }
  if (combinedCardDetail) {
    pieces.push(`<p style="margin:0.35rem 0;line-height:1.55;font-size:0.95rem;">${combinedCardDetail}</p>`);
  }
  if (gender === 'male' && gridExpl) {
    pieces.push(`<p class="muted" style="margin:0.35rem 0 0.5rem;line-height:1.55;font-size:0.92rem;font-style:italic;text-align:center;">${escapeHtml(gridExpl)}</p>`);
  }
  let tmSummary = null;
  if (gender === 'male' && overall != null) {
    tmSummary = buildMaleTargetMarketForExport(s);
  } else if (s.targetMarket?.realisticOptionsPct && s.targetMarket?.potentialMateCore) {
    tmSummary = s.targetMarket;
  } else if (overall != null && gender) {
    tmSummary = computeTargetMarketSummary(overall, gender === 'male');
  }
  if (tmSummary?.realisticOptionsPct && tmSummary?.potentialMateCore) {
    const rangeMin = Number.isFinite(tmSummary.partnerRangeMin) ? Math.max(0, Math.min(100, tmSummary.partnerRangeMin)) : 0;
    const rangeMax = Number.isFinite(tmSummary.partnerRangeMax) ? Math.max(rangeMin, Math.min(100, tmSummary.partnerRangeMax)) : 100;
    const rangeWidth = Math.max(2, rangeMax - rangeMin);
    const rangeTailWidth = Math.min(18, Math.max(4, rangeMin));
    const rangeTailLeft = Math.max(0, rangeMin - rangeTailWidth);
    pieces.push(
      `<div style="margin:0.85rem auto 0.45rem;max-width:34rem;">` +
        `<p style="font-weight:700;margin:0 0 0.35rem;font-size:1rem;text-align:center;">Achievable partner quality</p>` +
        `<div aria-label="Achievable partner quality range" role="status" style="position:relative;height:0.8rem;border-radius:999px;background:#3c3b40;overflow:hidden;">` +
          `<span style="position:absolute;top:0;bottom:0;left:${rangeTailLeft}%;width:${rangeTailWidth}%;border-radius:999px;background:linear-gradient(90deg,rgba(190,143,69,0),rgba(190,143,69,0.62));"></span>` +
          `<span style="position:absolute;top:0;bottom:0;left:${rangeMin}%;width:${rangeWidth}%;border-radius:999px;background:linear-gradient(90deg,#be8f45,#f2d08b);"></span>` +
        `</div>` +
        `<div aria-hidden="true" style="margin-top:0.3rem;display:flex;justify-content:space-between;font-size:0.78rem;color:#7a7a7a;letter-spacing:0.01em;font-weight:600;">` +
          `<span>1</span><span>10</span>` +
        `</div>` +
      `</div>`
    );
    pieces.push(
      `<p class="muted" style="margin:0 0 0.5rem;text-align:center;line-height:1.55;font-size:0.92rem;">${escapeHtml(
        tmSummary.potentialMateSubline ||
          partnerRangeSublineFromOverall(typeof overall === 'number' ? overall : 50)
      )}</p>`
    );
  }
  const exportShowMaleYoungerPartner =
    gender === 'male' &&
    tmSummary?.youngerPartnerAccessTitle &&
    tmSummary?.youngerPartnerAccessDetail &&
    overall != null &&
    overall < 50 &&
    (tmSummary.youngerPartnerAccessBand === 'mixed' || tmSummary.youngerPartnerAccessBand === 'strained');
  if (exportShowMaleYoungerPartner) {
    pieces.push(
      `<div class="muted" style="margin-top:0.75rem;padding:0.65rem 0.85rem;border-left:3px solid #888;line-height:1.55;font-size:0.92rem;">` +
        `<strong>${escapeHtml(tmSummary.youngerPartnerAccessTitle)}</strong><br/>` +
        `${escapeHtml(tmSummary.youngerPartnerAccessDetail)}` +
        (tmSummary.poolAdjustedForStatedAges && tmSummary.headlineOverallPercentile != null
          ? ` <em>Realistic-options bands reflect stated ages; headline overall ~${escapeHtml(String(tmSummary.headlineOverallPercentile))}th percentile unchanged.</em>`
          : '') +
        `</div>`
    );
  }
  if (gridExpl && gender !== 'male') {
    pieces.push(`<p class="muted" style="margin:0.5rem 0;line-height:1.55;font-size:0.9rem;">${escapeHtml(gridExpl)}</p>`);
  }
  if (partnerNote) pieces.push(partnerNote);
  if (s.suiteCalibration?.version != null) {
    const hashNote =
      s.suiteCalibration.inputsHash != null
        ? ` Inputs fingerprint: ${escapeHtml(String(s.suiteCalibration.inputsHash))}.`
        : '';
    pieces.push(
      `<p class="muted" style="margin:0.75rem 0 0;font-size:0.88rem;line-height:1.5;font-style:italic;">Suite calibration v${escapeHtml(String(s.suiteCalibration.version))}: cluster percentiles nudged using stored Archetype and Polarity results (≤±3 points per cluster, ≤±2 overall vs questionnaire overall).${hashNote}</p>`
    );
  }

  return `<div class="export-attraction-classification" style="margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:1px solid #e8e8e8;">${pieces.join('')}</div>`;
}

function buildAttractionReportBody(data) {
  const delusionIndex = typeof data.delusionIndex === 'number' ? Math.round(data.delusionIndex) : null;
  const rec = data.recommendation || {};
  let html = buildAttractionClassificationExportBlock(data);

  if (data.clusters && typeof data.clusters === 'object') {
    const clusterNames = { coalitionRank: 'Coalition Rank', reproductiveConfidence: 'Reproductive Confidence', axisOfAttraction: 'Axis of Attraction' };
    html += '<h3>Clusters</h3><ul>';
    Object.entries(data.clusters).forEach(([k, v]) => {
      if (typeof v === 'number') html += `<li>${escapeHtml(clusterNames[k] || k)}: ~${Math.round(v)}th percentile</li>`;
    });
    html += '</ul>';
  }

  const gAttr = String(data.gender || '').toLowerCase();
  const isMaleExport = gAttr === 'male' || gAttr === 'man';
  if (isMaleExport && data.maleSocialProofLine) {
    html += `<p class="muted" style="font-size:0.92rem;margin-top:0.65rem;line-height:1.55;">${escapeHtml(data.maleSocialProofLine)}</p>`;
  }

  if (delusionIndex != null && delusionIndex > 30) {
    html += `<div class="card" style="border-left-color: #dc3545;"><h3>Delusion Index: ${delusionIndex}%</h3><p class="muted">Expectations vs. reality mismatch — consider adjusting standards or improving SMV.</p></div>`;
  }

  if (data.levelClassification) {
    html += `<p><strong>Developmental level:</strong> ${escapeHtml(data.levelClassification)}</p>`;
  }

  if (rec.priority || rec.strategic) {
    html += '<h2>Recommendations</h2>';
    if (rec.priority) html += `<p><strong>Priority:</strong> ${escapeHtml(rec.priority)}</p>`;
    if (rec.strategic) html += `<p>${escapeHtml(rec.strategic)}</p>`;
    if (rec.warning) html += `<p class="muted"><strong>Reality check:</strong> ${escapeHtml(rec.warning)}</p>`;
    if (Array.isArray(rec.weakestGuidance) && rec.weakestGuidance.length) {
      html += '<h3>Targeted guidance (weakest areas)</h3>';
      rec.weakestGuidance.forEach(w => {
        html += `<div class="card"><p><strong>${escapeHtml(w.label)}</strong> (${escapeHtml(w.cluster || '')})</p><p class="muted">${escapeHtml(w.meaning || '')}</p>`;
        if (Array.isArray(w.actions) && w.actions.length) {
          html += '<ol>';
          w.actions.forEach(a => { html += `<li>${escapeHtml(a)}</li>`; });
          html += '</ol>';
        }
        html += '</div>';
      });
    }
    if (Array.isArray(rec.tactical) && rec.tactical.length) {
      if (Array.isArray(rec.weakestGuidance) && rec.weakestGuidance.length && rec.tactical.length === 1) {
        html += `<p><strong>Next step:</strong> ${escapeHtml(rec.tactical[0])}</p>`;
      } else {
        html += '<p><strong>Immediate actions:</strong></p><ol>';
        rec.tactical.forEach(a => { html += `<li>${escapeHtml(a)}</li>`; });
        html += '</ol>';
      }
    }
  }

  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

/** Fallback display name for a dimension key when no name map is present (e.g. older saved reports). */
function dimensionKeyToDisplayName(key) {
  if (key == null || key === '') return '';
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getTemperamentSpectrumBandKey(normalizedDimScore) {
  const x = Math.min(1, Math.max(0, Number(normalizedDimScore) || 0));
  if (x < 13.33 / 100) return 'hyper_femme';
  if (x < 26.66 / 100) return 'strongly_femme';
  if (x < 40 / 100) return 'femme';
  if (x < 60 / 100) return 'balanced';
  if (x < 73.33 / 100) return 'masc';
  if (x < 86.66 / 100) return 'strongly_masc';
  return 'hyper_masc';
}

const TEMPERAMENT_BAND_LABELS_EXPORT = {
  hyper_femme: 'Hyper-femme',
  strongly_femme: 'Strongly Femme',
  femme: 'Femme',
  balanced: 'Balanced',
  masc: 'Masc',
  strongly_masc: 'Strongly Masc',
  hyper_masc: 'Hyper-masc'
};

const TEMPERAMENT_BAND_ORDER_EXPORT = [
  'hyper_femme',
  'strongly_femme',
  'femme',
  'balanced',
  'masc',
  'strongly_masc',
  'hyper_masc'
];

function getDimensionMetaForExport(dimKey) {
  return (TEMPERAMENT_DIMENSIONS && TEMPERAMENT_DIMENSIONS[dimKey])
    || (INTIMATE_DYNAMICS && INTIMATE_DYNAMICS[dimKey])
    || (ATTRACTION_RESPONSIVENESS && ATTRACTION_RESPONSIVENESS[dimKey]);
}

/** Aligns with temperament-engine getDimensionDisplayName (pursuit axis: intimate vs connection rows). */
function getTemperamentDimensionExportLabel(dimKey) {
  const dim = getDimensionMetaForExport(dimKey);
  if (dimKey === 'arousal_and_responsiveness' && dim?.name && dim?.spectrumLabel) {
    return `${dim.name}: ${dim.spectrumLabel}`;
  }
  if (dim?.spectrumLabel) return dim.spectrumLabel;
  return dimensionKeyToDisplayName(dimKey);
}

function getSpectrumPartPoleBiasHtmlExport(spectrumPart, normalizedDimScore, dimKey) {
  const label = spectrumPart || '';
  const parts = label.split(/\s+vs\s+/i);
  if (parts.length >= 2) {
    const fem = escapeHtml(parts[0].trim());
    const masc = escapeHtml(parts.slice(1).join(' vs ').trim());
    const vs = ' vs ';
    const x = normalizedDimScore;
    if (x > 0.52) return `${fem}${vs}<span class="dimension-pole-bias">${masc}</span>`;
    if (x < 0.48) return `<span class="dimension-pole-bias">${fem}</span>${vs}${masc}`;
    return `${fem}${vs}${masc}`;
  }
  const dim = dimKey ? getDimensionMetaForExport(dimKey) : null;
  const masculineLabel = dim?.masculinePoleLabel || '';
  const feminineLabel = dim?.femininePoleLabel || '';
  const x = normalizedDimScore;
  if (x > 0.52 && masculineLabel) {
    return `<span class="dimension-pole-bias">${escapeHtml(masculineLabel)}</span>`;
  }
  if (x < 0.48 && feminineLabel) {
    return `<span class="dimension-pole-bias">${escapeHtml(feminineLabel)}</span>`;
  }
  return escapeHtml(label || feminineLabel || masculineLabel || '');
}

/** Matches on-screen getDimensionTitleHtml; rawDisplayFromSave optional (saved dimensionDisplayNames). */
function buildTemperamentDimensionTitleHtmlExport(dimKey, normalizedDimScore, rawDisplayFromSave) {
  const rawDisplay =
    rawDisplayFromSave != null && String(rawDisplayFromSave).trim() !== ''
      ? String(rawDisplayFromSave).trim()
      : getTemperamentDimensionExportLabel(dimKey);
  const emSep = ' — ';
  if (rawDisplay.includes(emSep)) {
    const i = rawDisplay.indexOf(emSep);
    const prefix = rawDisplay.slice(0, i).trim();
    const spectrumPart = rawDisplay.slice(i + emSep.length).trim();
    return `${escapeHtml(prefix)}${emSep}${getSpectrumPartPoleBiasHtmlExport(spectrumPart, normalizedDimScore, dimKey)}`;
  }
  const colonSep = ': ';
  const ci = rawDisplay.indexOf(colonSep);
  if (ci > 0 && /\s+vs\s+/i.test(rawDisplay.slice(ci + colonSep.length))) {
    const prefix = rawDisplay.slice(0, ci).trim();
    const spectrumPart = rawDisplay.slice(ci + colonSep.length).trim();
    return `${escapeHtml(prefix)}${colonSep}${getSpectrumPartPoleBiasHtmlExport(spectrumPart, normalizedDimScore, dimKey)}`;
  }
  return getSpectrumPartPoleBiasHtmlExport(rawDisplay, normalizedDimScore, dimKey);
}

function formatMagnetDimensionKeysHtmlExport(data, dimKeys, maxShown = 3) {
  if (!Array.isArray(dimKeys) || dimKeys.length === 0) return '';
  const scores = data.dimensionScores || {};
  const displayNames = data.dimensionDisplayNames && typeof data.dimensionDisplayNames === 'object' ? data.dimensionDisplayNames : {};
  const n = maxShown;
  const slice = dimKeys.slice(0, n);
  const parts = slice.map((dimKey) => {
    const net = scores[dimKey]?.net;
    const norm = typeof net === 'number' ? (net + 1) / 2 : 0.5;
    const raw = displayNames[dimKey];
    return buildTemperamentDimensionTitleHtmlExport(dimKey, norm, raw);
  });
  let out = parts.join(', ');
  if (dimKeys.length > n) {
    out += `, +${dimKeys.length - n} more`;
  }
  return out;
}

function getDimensionDescriptorCompactExport(dimKey, normalizedDimScore) {
  const dim = getDimensionMetaForExport(dimKey);
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

function formatMagnetListExport(names, maxShown = 3) {
  if (!names || names.length === 0) return '';
  if (names.length <= maxShown) return names.map(n => escapeHtml(n)).join(', ');
  return `${names.slice(0, maxShown).map(n => escapeHtml(n)).join(', ')}, +${names.length - maxShown} more`;
}

function buildTemperamentDimensionBreakdownExportHtml(data) {
  const scores = data.dimensionScores;
  if (!scores || Object.keys(scores).length === 0) return '';
  const displayNames = data.dimensionDisplayNames && typeof data.dimensionDisplayNames === 'object' ? data.dimensionDisplayNames : {};
  const anomalousSet = new Set(Array.isArray(data.anomalousDimensionKeys) ? data.anomalousDimensionKeys : []);
  const grouped = {};
  TEMPERAMENT_BAND_ORDER_EXPORT.forEach(b => { grouped[b] = []; });
  Object.entries(scores).forEach(([dimKey, score]) => {
    if (!score || typeof score.net !== 'number') return;
    const normalized = (score.net + 1) / 2;
    const band = getTemperamentSpectrumBandKey(normalized);
    grouped[band].push({ dimKey, normalized });
  });
  let h = '<div class="card"><h3>Dimension breakdown</h3>';
  TEMPERAMENT_BAND_ORDER_EXPORT.forEach(bandKey => {
    const items = grouped[bandKey];
    if (!items.length) return;
    items.sort((a, b) => a.dimKey.localeCompare(b.dimKey));
    h += `<h4>${escapeHtml(TEMPERAMENT_BAND_LABELS_EXPORT[bandKey] || bandKey)}</h4><ul>`;
    items.forEach(({ dimKey, normalized }) => {
      const titleHtml = buildTemperamentDimensionTitleHtmlExport(dimKey, normalized, displayNames[dimKey]);
      const ann = anomalousSet.has(dimKey) ? ' <strong>(Temperament anomaly)</strong>' : '';
      const compact = escapeHtml(getDimensionDescriptorCompactExport(dimKey, normalized));
      const normative = getDimensionNormativeClarifier({
        reportedGender: data.gender,
        normalizedDimScore: normalized,
        spectrumBand: bandKey
      });
      const normativeHtml = normative ? `<br/><span class="muted">${escapeHtml(normative)}</span>` : '';
      h += `<li>${titleHtml}${ann} — ${compact}${normativeHtml}</li>`;
    });
    h += '</ul>';
  });
  h += '</div>';
  return h;
}

/**
 * Plain-text paragraphs reconciling weighted composite category with dimension-level
 * anomaly and magnetism flags. Used on-screen and in HTML export.
 * @param {Object} data - assessment / analysisData snapshot
 * @returns {string[]}
 */
export function buildTemperamentSynthesisPlainParagraphs(data) {
  const cat = data?.overallTemperament?.category || 'balanced';
  const compositeIntro = {
    balanced:
      'Your weighted composite sits near the center of the spectrum—masculine and feminine pulls average out across dimensions.',
    balanced_masculine:
      'Your weighted composite leans modestly masculine on average, with substantial feminine-leaning integration in the mix.',
    balanced_feminine:
      'Your weighted composite leans modestly feminine on average, with substantial masculine-leaning integration in the mix.',
    predominantly_masculine:
      'Your weighted composite reads clearly masculine-leaning—that is the centre of gravity across dimensions.',
    highly_masculine:
      'Your weighted composite reads strongly masculine-leaning—that is the centre of gravity across dimensions.',
    predominantly_feminine:
      'Your weighted composite reads clearly feminine-leaning—that is the centre of gravity across dimensions.',
    highly_feminine:
      'Your weighted composite reads strongly feminine-leaning—that is the centre of gravity across dimensions.'
  };
  const intro = compositeIntro[cat] || compositeIntro.balanced;

  const nA = Array.isArray(data?.anomalousDimensionNames) ? data.anomalousDimensionNames.length : 0;
  const hasCross = !!data?.crossPolarityDetected;

  let nM = 0;
  if (data?.gender === 'man') {
    nM =
      (Array.isArray(data.stronglyMascBandDimensionNames) ? data.stronglyMascBandDimensionNames.length : 0) +
      (Array.isArray(data.hypermascBandDimensionNames) ? data.hypermascBandDimensionNames.length : 0);
  } else if (data?.gender === 'woman') {
    nM =
      (Array.isArray(data.stronglyFemmeBandDimensionNames) ? data.stronglyFemmeBandDimensionNames.length : 0) +
      (Array.isArray(data.hyperfemmeBandDimensionNames) ? data.hyperfemmeBandDimensionNames.length : 0) +
      (Array.isArray(data.femmeBandDimensionNames) ? data.femmeBandDimensionNames.length : 0);
  } else if (Array.isArray(data?.stronglyAlignedDimensionNames)) {
    nM = data.stronglyAlignedDimensionNames.length;
  }

  let second = '';
  if (nA > 0 && nM > 0) {
    second = `That average coexists with a textured map: ${nA} dimension${nA === 1 ? '' : 's'} ${nA === 1 ? 'is' : 'are'} flagged as temperament anomalies for your context, and ${nM} dimension${nM === 1 ? '' : 's'} ${nM === 1 ? 'shows' : 'show'} strong pole magnetism. Those are the axes where strain or spark concentrates; they do not cancel the composite—they show where the average hides real spread.`;
  } else if (nA > 0) {
    second = `Dimension-level, ${nA} dimension${nA === 1 ? '' : 's'} ${nA === 1 ? 'sits' : 'sit'} outside typical range for your context (see partner-fit note above). The headline still describes the blend across all dimensions.`;
  } else if (nM > 0) {
    second = `${nM} dimension${nM === 1 ? '' : 's'} ${nM === 1 ? 'shows' : 'show'} strong pole magnetism (see above). The composite is an average; those pulls mark where complementary opposite strength matters most for fit.`;
  } else if (hasCross) {
    second =
      'Your overall position relative to typical norms for your context is flagged above; individual dimensions may still look moderate on the sliders. Read the composite line together with that note for headline partner-fit.';
  } else {
    second =
      'No dimensions triggered anomaly or strong pole magnetism flags in this scoring pass; the band groups above still show ordinary spread—use them to see where you borrow structure or flow.';
  }

  return [intro, second];
}

/** Mirrors on-screen primer: how to read + spectrum caveat + Tier 2 copy. */
function buildTemperamentReportPrimerExportHtml() {
  let h = '<div class="card"><h3>How to Read This Report</h3>';
  TEMPERAMENT_REPORT_TIER1_PARAS.forEach(p => {
    h += `<p>${escapeHtml(p)}</p>`;
  });
  h += `<p><em>${escapeHtml(TEMPERAMENT_REPORT_SPECTRUM_NOTE)}</em></p>`;
  h += `<h4>${escapeHtml(TEMPERAMENT_REPORT_TIER2_SUMMARY)}</h4>`;
  TEMPERAMENT_REPORT_TIER2_PARAS.forEach(p => {
    h += `<p>${escapeHtml(p)}</p>`;
  });
  h += '</div>';
  return h;
}

/** Mirrors on-screen “Temperament Spectrum Position” block (spectrum + composite badge). */
function buildTemperamentSpectrumPositionExportHtml(data) {
  const ot = data.overallTemperament;
  if (!ot || typeof ot.normalizedScore !== 'number') return '';
  const maleTrend = EXPECTED_GENDER_TRENDS.man;
  const femaleTrend = EXPECTED_GENDER_TRENDS.woman;
  const compositeBadgeText = formatCompositePositionDescription(ot.normalizedScore);
  const cal = data.suiteCalibration;
  const calNote =
    cal?.version != null
      ? `<p style="margin:0 0 0.85rem;font-size:0.85rem;color:#555;font-style:italic;">Composite includes archetype-linked calibration (v${escapeHtml(String(cal.version))}, Δ ${escapeHtml((typeof cal.delta === 'number' ? (cal.delta * 100).toFixed(2) : '0'))} pts on 0–100 spectrum); capped so your answers stay primary.</p>`
      : '';

  return `
<div class="temperament-spectrum-container" style="background:#f8f9fb;padding:1.25rem;border-radius:8px;margin:1rem 0;">
${calNote}
  <div style="display:flex;justify-content:center;margin:0 0 1.15rem;">
    <div role="status" style="display:inline-block;max-width:100%;padding:0.85rem 1.5rem;border-radius:999px;background:linear-gradient(145deg,#f8fafc,#eef2f7);border:2px solid #1a4d8c;color:#1a1a1a;font-weight:700;font-size:1.1rem;line-height:1.3;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.12);">${escapeHtml(compositeBadgeText)}</div>
  </div>
  <div class="temperament-spectrum-large" style="position:relative;height:40px;background:linear-gradient(to right, rgba(80, 140, 255, 0.35), rgba(20, 35, 55, 0.25));border-radius:8px;margin-bottom:0.35rem;border:2px solid #c8d0dc;">
    <div style="position:absolute;top:50%;left:${maleTrend * 100}%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#4c8bff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);" title="Expected trend for males"></div>
    <div style="position:absolute;top:50%;left:${femaleTrend * 100}%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#ff7fb1;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);" title="Expected trend for females"></div>
    <div style="position:absolute;top:50%;left:${ot.normalizedScore * 100}%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #333;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#666;max-width:100%;">
    <span>Feminine-leaning</span><span>Mid</span><span>Masculine-leaning</span>
  </div>
  <p style="margin:0.75rem 0 0;font-size:0.8rem;color:#666;text-align:center;">
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff7fb1;vertical-align:middle;margin-right:0.35rem;"></span> Expected trend for females
    &nbsp;&nbsp;
    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#4c8bff;vertical-align:middle;margin-right:0.35rem;"></span> Expected trend for males
  </p>
</div>`;
}

function buildTemperamentReportBody(data) {
  let html = '';
  const ot = data.overallTemperament;
  if (ot) {
    html += '<h2>Polarity Position</h2>';
    html += `<p><strong>Category:</strong> ${escapeHtml(ot.category || 'Not specified')}</p>`;
    html += `<p>Normalized: ${(ot.normalizedScore != null ? (ot.normalizedScore * 100).toFixed(1) : '—')}% · Masculine: ${(ot.masculineScore != null ? (ot.masculineScore * 100).toFixed(1) : '—')}% · Feminine: ${(ot.feminineScore != null ? (ot.feminineScore * 100).toFixed(1) : '—')}% · Net: ${(ot.netScore != null ? (ot.netScore * 100).toFixed(1) : '—')}%</p>`;
    html += buildTemperamentSpectrumPositionExportHtml(data);
    html += buildTemperamentReportPrimerExportHtml();
  }
  if (data.crossPolarityDetected && data.crossPolarityNote) {
    html += `<div class="card"><h3>Cross-polarity finding</h3><p>${escapeHtml(data.crossPolarityNote)}</p></div>`;
  }
  html += buildTemperamentDimensionBreakdownExportHtml(data);
  const hasHyperMascRisk = Array.isArray(data.hypermascBandDimensionNames) && data.hypermascBandDimensionNames.length > 0;
  const hasHyperFemmeRisk = Array.isArray(data.hyperfemmeBandDimensionNames) && data.hyperfemmeBandDimensionNames.length > 0;
  const hasPolarityConsideration =
    data.crossPolarityDetected ||
    (Array.isArray(data.anomalousDimensionNames) && data.anomalousDimensionNames.length > 0) ||
    hasHyperMascRisk ||
    hasHyperFemmeRisk;
  if (hasPolarityConsideration) {
    html += '<div class="card"><h3>Potential polarity failure — partner fit</h3>';
    if (Array.isArray(data.anomalousDimensionNames) && data.anomalousDimensionNames.length > 0) {
      html += `<p><strong>What this flags:</strong> Dimension-level leans outside typical range for your context: <strong>${data.anomalousDimensionNames.map(n => escapeHtml(n)).join(', ')}</strong>.</p>`;
    } else {
      html += '<p><strong>What this flags:</strong> Overall pattern outside typical range for your context.</p>';
    }
    html += '<p><strong>What it is:</strong> A <strong>structural fit signal</strong> from this calibration—polarity configuration, not a moral or character assessment.</p>';
    html += '<p><strong>If partner is mismatched:</strong> Same pole with a weak opposite flattens tension here; an opposite pole at <strong>similar strength</strong> restores polarity.</p>';
    html += '<p><strong>What restores it:</strong> Complementary opposite at matched intensity or intentional calibration—often worth exploring with stress, history, and context in view.</p>';
    if (data.gender === 'man' && hasHyperMascRisk) {
      html += '<p><strong>Hyper-state concern:</strong> Hyper-masc intensity can become neglectful, rigid, or over-controlling without steady complementary feminine-leaning balance.</p>';
    } else if (data.gender === 'woman' && hasHyperFemmeRisk) {
      html += '<p><strong>Hyper-state concern:</strong> Hyper-femme intensity can become anxious, chaotic, or over-merged without stabilising complementary masculine-leaning structure.</p>';
    } else if (hasHyperMascRisk || hasHyperFemmeRisk) {
      html += '<p><strong>Hyper-state concern:</strong> Hyper-pole intensity can amplify attraction and instability together when complementary balance is missing.</p>';
    }
    html += '</div>';
  }
  const strongMascBand = Array.isArray(data.stronglyMascBandDimensionNames) ? data.stronglyMascBandDimensionNames : [];
  const hypermascBand = Array.isArray(data.hypermascBandDimensionNames) ? data.hypermascBandDimensionNames : [];
  const strongFemmeBand = Array.isArray(data.stronglyFemmeBandDimensionNames) ? data.stronglyFemmeBandDimensionNames : [];
  const hyperfemmeBand = Array.isArray(data.hyperfemmeBandDimensionNames) ? data.hyperfemmeBandDimensionNames : [];
  const femmeBand = Array.isArray(data.femmeBandDimensionNames) ? data.femmeBandDimensionNames : [];
  const strongMascKeys = Array.isArray(data.stronglyMascBandDimensionKeys) ? data.stronglyMascBandDimensionKeys : [];
  const hypermascKeys = Array.isArray(data.hypermascBandDimensionKeys) ? data.hypermascBandDimensionKeys : [];
  const strongFemmeKeys = Array.isArray(data.stronglyFemmeBandDimensionKeys) ? data.stronglyFemmeBandDimensionKeys : [];
  const hyperfemmeKeys = Array.isArray(data.hyperfemmeBandDimensionKeys) ? data.hyperfemmeBandDimensionKeys : [];
  const femmeKeys = Array.isArray(data.femmeBandDimensionKeys) ? data.femmeBandDimensionKeys : [];
  const alignedKeys = Array.isArray(data.stronglyAlignedDimensionKeys) ? data.stronglyAlignedDimensionKeys : [];
  const anyStrongAlign =
    (Array.isArray(data.stronglyAlignedDimensionNames) && data.stronglyAlignedDimensionNames.length > 0) ||
    strongMascBand.length > 0 ||
    hypermascBand.length > 0 ||
    strongFemmeBand.length > 0 ||
    hyperfemmeBand.length > 0 ||
    femmeBand.length > 0;
  if (anyStrongAlign) {
    const complementLabel = data.gender === 'man' ? 'feminine-leaning' : data.gender === 'woman' ? 'masculine-leaning' : 'complementary';
    if (data.gender === 'man' && (strongMascBand.length > 0 || hypermascBand.length > 0)) {
      html += '<div class="card"><h3>Polarity magnetism</h3>';
      if (strongMascBand.length > 0) {
        const preview =
          strongMascKeys.length > 0
            ? formatMagnetDimensionKeysHtmlExport(data, strongMascKeys)
            : formatMagnetListExport(strongMascBand);
        html += `<p><strong>Strongly Masc (${strongMascBand.length}):</strong> ${preview}</p>`;
      }
      if (hypermascBand.length > 0) {
        const preview =
          hypermascKeys.length > 0
            ? formatMagnetDimensionKeysHtmlExport(data, hypermascKeys)
            : formatMagnetListExport(hypermascBand);
        html += `<p><strong>Hyper-masc (${hypermascBand.length}):</strong> ${preview}</p>`;
      }
      html += `<p>Pull is strongest on these axes—in each title above, the emphasized fragment is the masculine side of that dimension where you lean. It lands when a partner holds the <strong>${escapeHtml(complementLabel)}</strong> side with enough strength; weak complement reads as strain or over-functioning.</p></div>`;
    } else if (data.gender === 'man' && Array.isArray(data.stronglyAlignedDimensionNames) && data.stronglyAlignedDimensionNames.length > 0) {
      html += `<div class="card"><h3>Polarity magnetism</h3>`;
      const preview =
        alignedKeys.length > 0
          ? formatMagnetDimensionKeysHtmlExport(data, alignedKeys)
          : formatMagnetListExport(data.stronglyAlignedDimensionNames);
      html += `<p><strong>Aligned (${data.stronglyAlignedDimensionNames.length}):</strong> ${preview}</p>`;
      html += `<p>Pull is strongest on these axes—in each title above, the emphasized fragment is the masculine side of that dimension where you lean. It lands when a partner holds the <strong>${escapeHtml(complementLabel)}</strong> side with enough strength; weak complement reads as strain or over-functioning.</p></div>`;
    } else if (data.gender === 'woman' && (strongFemmeBand.length > 0 || hyperfemmeBand.length > 0 || femmeBand.length > 0)) {
      html += `<div class="card"><h3>${escapeHtml('Polarity magnetism')}</h3>`;
      if (hyperfemmeBand.length > 0) {
        const preview =
          hyperfemmeKeys.length > 0
            ? formatMagnetDimensionKeysHtmlExport(data, hyperfemmeKeys)
            : formatMagnetListExport(hyperfemmeBand);
        html += `<p><strong>Hyper-femme (${hyperfemmeBand.length}):</strong> ${preview}</p>`;
      }
      if (strongFemmeBand.length > 0) {
        const preview =
          strongFemmeKeys.length > 0
            ? formatMagnetDimensionKeysHtmlExport(data, strongFemmeKeys)
            : formatMagnetListExport(strongFemmeBand);
        html += `<p><strong>Strongly Femme (${strongFemmeBand.length}):</strong> ${preview}</p>`;
      }
      if (femmeBand.length > 0) {
        const preview =
          femmeKeys.length > 0 ? formatMagnetDimensionKeysHtmlExport(data, femmeKeys) : formatMagnetListExport(femmeBand);
        html += `<p><strong>Femme (${femmeBand.length}):</strong> ${preview}</p>`;
      }
      html += `<p>Pull is strongest on these axes—in each title above, the emphasized fragment is the feminine side of that dimension where you lean. It lands when a partner holds the <strong>${escapeHtml(complementLabel)}</strong> side with enough strength; weak complement reads as strain or over-functioning.</p></div>`;
    } else if (data.gender === 'woman' && Array.isArray(data.stronglyAlignedDimensionNames) && data.stronglyAlignedDimensionNames.length > 0) {
      html += `<div class="card"><h3>${escapeHtml('Polarity magnetism')}</h3>`;
      const preview =
        alignedKeys.length > 0
          ? formatMagnetDimensionKeysHtmlExport(data, alignedKeys)
          : formatMagnetListExport(data.stronglyAlignedDimensionNames);
      html += `<p><strong>Aligned (${data.stronglyAlignedDimensionNames.length}):</strong> ${preview}</p>`;
      html += `<p>Pull is strongest on these axes—in each title above, the emphasized fragment is the feminine side of that dimension where you lean. It lands when a partner holds the <strong>${escapeHtml(complementLabel)}</strong> side with enough strength; weak complement reads as strain or over-functioning.</p></div>`;
    } else if (Array.isArray(data.stronglyAlignedDimensionNames) && data.stronglyAlignedDimensionNames.length > 0) {
      html += `<div class="card"><h3>Polarity magnetism</h3>`;
      const preview =
        alignedKeys.length > 0
          ? formatMagnetDimensionKeysHtmlExport(data, alignedKeys)
          : formatMagnetListExport(data.stronglyAlignedDimensionNames);
      html += `<p><strong>Aligned (${data.stronglyAlignedDimensionNames.length}):</strong> ${preview}</p>`;
      html += `<p>Pull lands best when a partner holds a <strong>${escapeHtml(complementLabel)}</strong> side with enough strength; weak complement reads as strain or over-functioning.</p></div>`;
    }
  }
  const ti = data.temperamentInterpretation;
  const synthParas =
    Array.isArray(ti?.synthesisParagraphs) && ti.synthesisParagraphs.length
      ? ti.synthesisParagraphs
      : buildTemperamentSynthesisPlainParagraphs(data);
  html += '<div class="card temperament-profile-synthesis"><h3>Reading your profile together</h3>';
  synthParas.forEach(p => {
    if (p) html += `<p>${escapeHtml(p)}</p>`;
  });
  if (ti && Array.isArray(ti.characteristics) && ti.characteristics.length) {
    html += '<h4>Aggregate themes (average across dimensions)</h4><ul>';
    ti.characteristics.forEach(c => {
      html += `<li>${escapeHtml(c)}</li>`;
    });
    html += '</ul>';
  }
  if (ti?.variations) {
    html += `<p class="muted"><strong>Note:</strong> ${escapeHtml(ti.variations)}</p>`;
  }
  html += '</div>';
  if (data.contextSensitivity && data.contextSensitivity.detected && data.contextSensitivity.message) {
    html += `<p class="muted"><strong>Context-responsive:</strong> ${escapeHtml(data.contextSensitivity.message)}</p>`;
  }
  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

function buildArchetypeProfileSummaryExportHtml(data) {
  const primary = data.primaryArchetype;
  const secondary = data.secondaryArchetype;
  const tertiary = data.tertiaryArchetype;
  if (!primary?.name) return '';
  const sName = secondary?.name ? String(secondary.name).trim() : '';
  const tName = tertiary?.name ? String(tertiary.name).trim() : '';
  const pillBase =
    'display:inline-block;vertical-align:middle;margin:0 0.1rem;padding:0.15rem 0.5rem;border-radius:999px;font-size:0.88em;font-weight:600;border:1px solid #1a4d8c;background:linear-gradient(145deg,#f8fafc,#eef2f7);color:#1a1a1a;';
  const pillSecondary = (n) => `<span style="${pillBase}opacity:0.7;">${escapeHtml(n)}</span>`;
  const pillTertiary = (n) => `<span style="${pillBase}opacity:0.4;">${escapeHtml(n)}</span>`;
  let qual = '';
  if (sName && tName) {
    qual = `<p style="margin:0.65rem 0 0;color:#666;font-size:1rem;line-height:1.6;">with qualities of ${pillSecondary(sName)} and ${pillTertiary(tName)}</p>`;
  } else if (sName) {
    qual = `<p style="margin:0.65rem 0 0;color:#666;font-size:1rem;line-height:1.6;">with qualities of ${pillSecondary(sName)}</p>`;
  } else if (tName) {
    qual = `<p style="margin:0.65rem 0 0;color:#666;font-size:1rem;line-height:1.6;">with qualities of ${pillTertiary(tName)}</p>`;
  }
  return `
<div style="text-align:center;margin-bottom:1.5rem;">
  <div style="display:flex;justify-content:center;margin:0 0 0.5rem;">
    <div role="status" style="display:inline-block;max-width:100%;padding:0.85rem 1.5rem;border-radius:999px;background:linear-gradient(145deg,#f8fafc,#eef2f7);border:2px solid #1a4d8c;color:#1a1a1a;font-weight:700;font-size:1.1rem;line-height:1.3;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,0.12);">${escapeHtml(primary.name)}</div>
  </div>
  ${qual}
</div>`;
}

function buildArchetypeReportBody(data) {
  let html = '';
  const primary = data.primaryArchetype;
  const secondary = data.secondaryArchetype;
  const tertiary = data.tertiaryArchetype;
  if (primary) {
    html += buildArchetypeProfileSummaryExportHtml(data);
    if (data.profileDecisiveness) {
      const decLine = formatProfileDecisivenessExportLine(data.profileDecisiveness);
      if (decLine) {
        html += `<p class="muted">${escapeHtml(decLine)}</p>`;
        html +=
          '<p class="muted" style="font-size:0.9em;font-style:italic;">Reflects how close your top scores were in this run—not a guarantee about how stable the label would be in real life over time.</p>';
      }
    }
    if (data.archetypeLayering) {
      const layPara = formatArchetypeLayeringExportParagraph(data.archetypeLayering);
      if (layPara) {
        html += `<h3 style="font-size:1rem;margin:1rem 0 0.35rem;">Profile layering (context)</h3>`;
        html += `<p class="muted" style="font-size:0.9em;line-height:1.55;">${escapeHtml(layPara)}</p>`;
      }
    }
    html += '<h2>Primary archetype</h2>';
    if (primary.confidence != null) {
      html += `<p><strong>Confidence:</strong> ${Number(primary.confidence).toFixed(0)}%</p>`;
    }
    if (primary.description) html += `<p>${escapeHtml(primary.description)}</p>`;
    if (primary.socialRole) html += `<p class="muted">Social role: ${escapeHtml(primary.socialRole)}</p>`;
    if (Array.isArray(primary.behavioralTraits) && primary.behavioralTraits.length) {
      html += '<p><strong>Key characteristics:</strong></p><ul>';
      primary.behavioralTraits.forEach(t => { html += `<li>${escapeHtml(t)}</li>`; });
      html += '</ul>';
    }
    if (primary.stressResponse) html += `<p><strong>Stress response:</strong> ${escapeHtml(primary.stressResponse)}</p>`;
    if (primary.growthEdge) html += `<p><strong>Growth edge:</strong> ${escapeHtml(primary.growthEdge)}</p>`;
  }
  if (secondary) {
    html += '<h2>Secondary archetype</h2>';
    html += `<p><strong>${escapeHtml(secondary.name || '')}</strong>${secondary.confidence != null ? ` (${Number(secondary.confidence).toFixed(0)}%)` : ''}</p>`;
    if (secondary.description) html += `<p>${escapeHtml(secondary.description)}</p>`;
  }
  if (tertiary) {
    html += '<h2>Tertiary archetype</h2>';
    html += `<p><strong>${escapeHtml(tertiary.name || '')}</strong>${tertiary.confidence != null ? ` (${Number(tertiary.confidence).toFixed(0)}%)` : ''}</p>`;
    if (tertiary.description) html += `<p>${escapeHtml(tertiary.description)}</p>`;
  }
  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

/**
 * Generates a single readable HTML document that records the report details for the given assessment.
 * Use this for "Save results" — the primary way users keep a record of their report.
 * @param {Object} assessmentData - The assessment result data (analysisData or equivalent)
 * @param {string} systemType - 'relationship' | 'attraction' | 'temperament' | 'temperament-analysis' | 'archetype' | 'archetype-analysis' | 'modern-archetype-identification'
 * @param {string} systemName - Display name for the report (e.g. 'Relationships Analysis')
 * @returns {string} HTML string (full document)
 */
export function generateReadableReport(assessmentData, systemType, systemName) {
  const title = `${systemName} — Report`;
  const genderGlyphHtml = reportGenderGlyphHtml(assessmentData?.gender);
  let body = '';
  const type = systemType === 'temperament-analysis' ? 'temperament' : systemType === 'archetype-analysis' || systemType === 'modern-archetype-identification' ? 'archetype' : systemType;
  if (type === 'relationship') {
    body = buildRelationshipReportBody(assessmentData);
  } else if (type === 'attraction') {
    body = buildAttractionReportBody(assessmentData);
  } else if (type === 'temperament') {
    body = buildTemperamentReportBody(assessmentData);
  } else if (type === 'archetype') {
    body = buildArchetypeReportBody(assessmentData);
  } else {
    body = '<p>Report format not available for this assessment type.</p>';
  }
  let mainHeading = systemName;
  let headLayout = 'default';
  if (type === 'temperament') {
    mainHeading = 'Your Temperament Analysis:';
    headLayout = 'suite';
  } else if (type === 'attraction') {
    mainHeading = 'Your Sexual Market Value Profile:';
    headLayout = 'suite';
  } else if (type === 'archetype') {
    mainHeading = 'Your Archetype Profile:';
    headLayout = 'suite';
  }
  return reportDocHead(title, mainHeading, genderGlyphHtml, headLayout) + body + reportDocFoot();
}

