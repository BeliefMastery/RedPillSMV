// Shared Export Utilities
// Standardized export functionality with AI agent instructions for all questionnaire systems

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
      const statePart = link.stateLabel ? ` — ${link.stateLabel}${link.rangeStr ? ` (${link.rangeStr})` : ''}` : '';
      highlights.push(`Relationship strain: ${link.name} (${link.rawScore}/10)${statePart}`);
    });
  }
  if (data.viabilityBand) {
    const bandLabels = { 'consider-stepping-away': 'Consider stepping away', 'unclear-use-reflection': 'Unclear — use reflection', 'worth-investing': 'Worth investing in resolution' };
    highlights.push(`Viability: ${bandLabels[data.viabilityBand] || data.viabilityBand}`);
  }
  if (data.viabilityScoresByDimension && typeof data.viabilityScoresByDimension === 'object' && Object.keys(data.viabilityScoresByDimension).length > 0) {
    const scores = Object.entries(data.viabilityScoresByDimension).filter(([, v]) => typeof v === 'number');
    if (scores.length) {
      const avg = scores.reduce((a, [, v]) => a + v, 0) / scores.length;
      highlights.push(`Viability dimensions average: ${avg.toFixed(1)}/10`);
    }
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
    csv += 'Question ID,Question Text,Answer (0-10),Type,Dimension/Category,Dimension Name/Category Name\n';
    data.questionSequence.forEach(q => {
      const answer = data.allAnswers && data.allAnswers[q.id] !== undefined ? data.allAnswers[q.id] : 'Not answered';
      const questionText = q.question || q.questionText || '';
      const dimensionOrCategory = q.dimension || q.category || '';
      const name = q.dimensionName || q.categoryName || q.name || '';
      csv += `"${q.id}","${questionText.replace(/"/g, '""')}",${answer},"${q.type || ''}","${dimensionOrCategory}","${name.replace(/"/g, '""')}"\n`;
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
  
  if (data.overallTemperament) {
    csv += '\n=== OVERALL TEMPERAMENT ===\n';
    csv += `Category: ${data.overallTemperament.category || 'Not specified'}\n`;
    csv += `Normalized Score: ${(data.overallTemperament.normalizedScore * 100).toFixed(1)}%\n`;
    csv += `Masculine Score: ${(data.overallTemperament.masculineScore * 100).toFixed(1)}%\n`;
    csv += `Feminine Score: ${(data.overallTemperament.feminineScore * 100).toFixed(1)}%\n`;
    csv += `Net Score: ${(data.overallTemperament.netScore * 100).toFixed(1)}%\n`;
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

function reportDocHead(title, systemName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 1.5rem; background: #fff; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { font-size: 0.875rem; color: #666; margin-bottom: 1.5rem; }
    h2 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #eee; }
    h3 { font-size: 1.05rem; margin-top: 1rem; }
    ul, ol { margin: 0.5rem 0 1rem 1.5rem; }
    li { margin-bottom: 0.35rem; }
    .card { background: #f8f9fa; border-left: 4px solid #0d6efd; border-radius: 4px; padding: 1rem; margin: 1rem 0; }
    .muted { color: #666; font-size: 0.9rem; }
    .strong { font-weight: 600; }
    @media print { body { max-width: 100%; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(systemName)}</h1>
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
      html += '<p class="muted">Scores by dimension:</p><ul>';
      Object.entries(data.viabilityScoresByDimension).forEach(([dimId, score]) => {
        if (typeof score !== 'number') return;
        html += `<li>${escapeHtml(dimId)}: ${Number(score).toFixed(1)}/10</li>`;
      });
      html += '</ul>';
    }
  }

  const weakestLinks = data.weakestLinks || [];
  if (weakestLinks.length > 0) {
    html += '<h2>Strain Points (Priority Areas)</h2><p class="muted">Areas of compatibility strain, ranked by impact. Address these for greatest effect.</p>';
    weakestLinks.forEach((link, index) => {
      const statePart = link.stateLabel ? ` — ${escapeHtml(link.stateLabel)}${link.rangeStr ? ` (${escapeHtml(link.rangeStr)})` : ''}` : '';
      html += `<div class="card"><h3>${index + 1}. ${escapeHtml(link.name || '')}</h3>`;
      html += `<p><strong>Impact:</strong> ${escapeHtml(link.impactTier || '')} · <strong>Score:</strong> ${link.rawScore}/10${statePart}</p>`;
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

  if (data.compatibilityScores && Object.keys(data.compatibilityScores).length > 0) {
    html += '<h2>Compatibility Overview</h2><p class="muted">All areas ranked by impact:</p><ul>';
    const sorted = Object.entries(data.compatibilityScores)
      .map(([key, s]) => ({ key, ...s }))
      .sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));
    sorted.forEach(item => {
      html += `<li><strong>${escapeHtml(item.name || item.key)}</strong> — ${escapeHtml(item.impactTier || '')} impact</li>`;
    });
    html += '</ul>';
  }

  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

function buildAttractionReportBody(data) {
  const overall = typeof data.overall === 'number' ? Math.round(data.overall) : null;
  const marketPosition = data.marketPosition || '';
  const delusionIndex = typeof data.delusionIndex === 'number' ? Math.round(data.delusionIndex) : null;
  const rec = data.recommendation || {};
  let html = '';

  if (overall != null) {
    html += `<h2>Sexual Market Value Profile</h2><p><strong>Overall:</strong> ~${overall}th percentile${marketPosition ? ` (${escapeHtml(marketPosition)})` : ''}</p>`;
    if (data.gender) html += `<p class="muted">Gender: ${escapeHtml(data.gender)}</p>`;
  }

  if (data.clusters && typeof data.clusters === 'object') {
    const clusterNames = { coalitionRank: 'Coalition Rank', reproductiveConfidence: 'Reproductive Confidence', axisOfAttraction: 'Axis of Attraction' };
    html += '<h3>Clusters</h3><ul>';
    Object.entries(data.clusters).forEach(([k, v]) => {
      if (typeof v === 'number') html += `<li>${escapeHtml(clusterNames[k] || k)}: ~${Math.round(v)}th percentile</li>`;
    });
    html += '</ul>';
  }

  if (delusionIndex != null && delusionIndex > 30) {
    html += `<div class="card" style="border-left-color: #dc3545;"><h3>Delusion Index: ${delusionIndex}%</h3><p class="muted">Expectations vs. reality mismatch — consider adjusting standards or improving SMV.</p></div>`;
  }

  if (data.levelClassification) html += `<p><strong>Developmental level:</strong> ${escapeHtml(data.levelClassification)}</p>`;

  if (data.targetMarket && (data.targetMarket.realistic || data.targetMarket.aspirational)) {
    html += '<h3>Market Position</h3><ul>';
    if (data.targetMarket.realistic) html += `<li><strong>Realistic target:</strong> ${escapeHtml(data.targetMarket.realistic)}</li>`;
    if (data.targetMarket.aspirational) html += `<li><strong>Aspirational:</strong> ${escapeHtml(data.targetMarket.aspirational)}</li>`;
    html += '</ul>';
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
      html += '<p><strong>Immediate actions:</strong></p><ol>';
      rec.tactical.forEach(a => { html += `<li>${escapeHtml(a)}</li>`; });
      html += '</ol>';
    }
  }

  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

/** Fallback display name for a dimension key when no name map is present (e.g. older saved reports). */
function dimensionKeyToDisplayName(key) {
  if (key == null || key === '') return '';
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildTemperamentReportBody(data) {
  let html = '';
  const ot = data.overallTemperament;
  if (ot) {
    html += '<h2>Polarity Position</h2>';
    html += `<p><strong>Category:</strong> ${escapeHtml(ot.category || 'Not specified')}</p>`;
    html += `<p>Normalized: ${(ot.normalizedScore != null ? (ot.normalizedScore * 100).toFixed(1) : '—')}% · Masculine: ${(ot.masculineScore != null ? (ot.masculineScore * 100).toFixed(1) : '—')}% · Feminine: ${(ot.feminineScore != null ? (ot.feminineScore * 100).toFixed(1) : '—')}% · Net: ${(ot.netScore != null ? (ot.netScore * 100).toFixed(1) : '—')}%</p>`;
  }
  if (data.crossPolarityDetected && data.crossPolarityNote) {
    html += `<div class="card"><h3>Cross-polarity finding</h3><p>${escapeHtml(data.crossPolarityNote)}</p></div>`;
  }
  const hasPolarityConsideration = data.crossPolarityDetected || (Array.isArray(data.anomalousDimensionNames) && data.anomalousDimensionNames.length > 0);
  if (hasPolarityConsideration) {
    html += '<div class="card"><h3>Temperament anomaly</h3>';
    if (Array.isArray(data.anomalousDimensionNames) && data.anomalousDimensionNames.length > 0) {
      html += `<p>One or more dimensions show a significant swing from typical gender norms: <strong>${data.anomalousDimensionNames.map(n => escapeHtml(n)).join(', ')}</strong>.</p>`;
    } else {
      html += '<p>One or more dimensions show a significant swing from typical gender norms.</p>';
    }
    html += '<p>These dimensions can create a <strong>non-standard polarity dynamic</strong> or, depending on your partner, a <strong>polarity breakdown</strong>. If your partner has a <strong>complementary opposite</strong> anomaly, the dynamic can work and polarity is restored in a non-standard way. If your partner <strong>shares the same pole</strong> in this dimension, the relationship can still be functional but may have reduced hormonal leverage (less tension and attraction in that area). This is not inherently destabilizing but worth investigating — often connected to trauma response, unhealed wounds, or context-dependent adaptation.</p></div>';
  }
  if (data.dimensionScores && Object.keys(data.dimensionScores).length > 0) {
    const displayNames = data.dimensionDisplayNames && typeof data.dimensionDisplayNames === 'object' ? data.dimensionDisplayNames : {};
    html += '<h3>Dimension scores</h3><ul>';
    Object.entries(data.dimensionScores).forEach(([dim, score]) => {
      if (score && typeof score.net === 'number') {
        const displayName = displayNames[dim] || dimensionKeyToDisplayName(dim);
        html += `<li>${escapeHtml(displayName)}: net ${(score.net * 100).toFixed(1)}%</li>`;
      }
    });
    html += '</ul>';
  }
  if (data.contextSensitivity && data.contextSensitivity.detected && data.contextSensitivity.message) {
    html += `<p class="muted"><strong>Context-responsive:</strong> ${escapeHtml(data.contextSensitivity.message)}</p>`;
  }
  return html || '<p>No report data available. Complete the assessment to generate a full report.</p>';
}

function buildArchetypeReportBody(data) {
  let html = '';
  const primary = data.primaryArchetype;
  const secondary = data.secondaryArchetype;
  const tertiary = data.tertiaryArchetype;
  if (primary) {
    html += '<h2>Primary archetype</h2>';
    html += `<p><strong>${escapeHtml(primary.name || '')}</strong>${primary.confidence != null ? ` (confidence ${Number(primary.confidence).toFixed(0)}%)` : ''}</p>`;
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
  return reportDocHead(title, systemName) + body + reportDocFoot();
}

