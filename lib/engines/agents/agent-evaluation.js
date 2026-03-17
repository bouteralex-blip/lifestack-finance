// =========================================================================
// LIFESTACK OS — AGENT EVALUATION ENGINE
// Phase 4: Research & Decisioning
// Scores how well each agent engine is performing based on historical
// decision accuracy and output quality
// =========================================================================

const AGENT_NAMES = [
  'Drift Monitor',
  'Concentration Engine',
  'Debt Priority',
  'ISA/Pension Router',
  'Wrapper Exposure',
  'Currency Exposure',
  'Regime Detector',
  'Stress Monitor',
  'BTC Cycle',
  'Credit Stress',
  'Yield Curve',
  'Sector Leadership',
  'Rebalance Proposal',
  'Trigger Alerts',
  'Opportunity Ranker',
  'Action Queue',
];

/**
 * Compute evaluation scores for all agent engines
 * Assesses accuracy, decision count, average confidence, and overall score
 */
export function computeAgentEvaluation(agentState, historicalDecisions) {
  if (!agentState) return null;

  const agents = AGENT_NAMES.map(name => {
    const key = nameToKey(name);
    const state = findAgentState(key, agentState);
    const decisions = findAgentDecisions(key, historicalDecisions);
    const evaluation = evaluateAgent(name, state, decisions);
    return evaluation;
  });

  // Filter to agents with data
  const scoredAgents = agents.filter(a => a.score > 0);

  // Find best and worst
  const sorted = [...scoredAgents].sort((a, b) => b.score - a.score);
  const bestAgent = sorted[0] || null;
  const worstAgent = sorted[sorted.length - 1] || null;

  const overallScore = scoredAgents.length > 0
    ? +(scoredAgents.reduce((sum, a) => sum + a.score, 0) / scoredAgents.length).toFixed(1)
    : 0;

  const implication = overallScore >= 7
    ? 'Agent ensemble performing well. High-confidence outputs can be trusted.'
    : overallScore >= 5
      ? 'Agent performance adequate. Cross-validate critical decisions.'
      : 'Agent performance below threshold. Manual review recommended for all outputs.';

  return {
    agents: scoredAgents,
    bestAgent: bestAgent ? { name: bestAgent.name, score: bestAgent.score } : null,
    worstAgent: worstAgent ? { name: worstAgent.name, score: worstAgent.score } : null,
    overallScore,
    implication,
    totalAgents: scoredAgents.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert agent display name to engine state key
 */
function nameToKey(name) {
  const keyMap = {
    'Drift Monitor': 'driftMonitor',
    'Concentration Engine': 'concentration',
    'Debt Priority': 'debtPriority',
    'ISA/Pension Router': 'isaPensionRouting',
    'Wrapper Exposure': 'wrapperExposure',
    'Currency Exposure': 'currencyExposure',
    'Regime Detector': 'regime',
    'Stress Monitor': 'stress',
    'BTC Cycle': 'btcCycle',
    'Credit Stress': 'creditStress',
    'Yield Curve': 'yieldCurve',
    'Sector Leadership': 'sectorLeadership',
    'Rebalance Proposal': 'rebalanceProposal',
    'Trigger Alerts': 'triggerAlerts',
    'Opportunity Ranker': 'opportunityRanker',
    'Action Queue': 'actionQueue',
  };
  return keyMap[name] || name.toLowerCase().replace(/\s+/g, '');
}

/**
 * Find agent state data from the combined state object
 */
function findAgentState(key, agentState) {
  if (!agentState) return null;

  // Check direct keys
  if (agentState[key]) return agentState[key];

  // Check nested engine states
  if (agentState.engineState?.[key]) return agentState.engineState[key];
  if (agentState.marketState?.[key]) return agentState.marketState[key];

  return null;
}

/**
 * Find historical decisions for an agent
 */
function findAgentDecisions(key, historicalDecisions) {
  if (!historicalDecisions) return [];
  if (Array.isArray(historicalDecisions)) {
    return historicalDecisions.filter(d => d.agent === key || d.source === key);
  }
  if (historicalDecisions[key]) return historicalDecisions[key];
  return [];
}

/**
 * Evaluate a single agent
 */
function evaluateAgent(name, state, decisions) {
  let score = 5; // base score
  let accuracy = 0;
  let avgConfidence = 0;
  let decisionCount = decisions.length;

  // Score based on state availability
  if (!state) {
    return { name, accuracy: 0, decisionCount: 0, avgConfidence: 0, score: 0, note: 'No state data available' };
  }

  // Availability bonus
  score += 1;

  // Decision history scoring
  if (decisionCount > 0) {
    const correct = decisions.filter(d => d.correct || d.outcome === 'correct' || d.accuracy > 0.5);
    accuracy = +(correct.length / decisionCount * 100).toFixed(1);
    avgConfidence = +(decisions.reduce((sum, d) => sum + (d.confidence || 50), 0) / decisionCount).toFixed(1);

    // Accuracy bonus/penalty
    if (accuracy >= 80) score += 2;
    else if (accuracy >= 60) score += 1;
    else if (accuracy < 40) score -= 1;

    // Volume bonus (more decisions = more signal)
    if (decisionCount >= 20) score += 1;
    else if (decisionCount >= 10) score += 0.5;

    // Calibration: confidence vs accuracy alignment
    const calibrationGap = Math.abs(accuracy - avgConfidence);
    if (calibrationGap < 10) score += 1; // well-calibrated
    else if (calibrationGap > 30) score -= 1; // poorly calibrated
  }

  // State quality scoring
  const stateQuality = assessStateQuality(state);
  score += stateQuality.bonus;

  return {
    name,
    accuracy,
    decisionCount,
    avgConfidence,
    score: +Math.max(1, Math.min(10, score)).toFixed(1),
    note: stateQuality.note,
  };
}

/**
 * Assess the quality of an agent's current state output
 */
function assessStateQuality(state) {
  if (!state || typeof state !== 'object') {
    return { bonus: -1, note: 'Invalid state output' };
  }

  const keys = Object.keys(state);
  if (keys.length === 0) {
    return { bonus: -1, note: 'Empty state output' };
  }

  // Check for null values
  const nullCount = keys.filter(k => state[k] == null).length;
  const nullPct = (nullCount / keys.length) * 100;

  if (nullPct > 50) {
    return { bonus: -1, note: `${nullPct.toFixed(0)}% null values — degraded output` };
  }
  if (nullPct > 20) {
    return { bonus: 0, note: `${nullPct.toFixed(0)}% null values — partial output` };
  }

  return { bonus: 1, note: 'Complete output — all fields populated' };
}
