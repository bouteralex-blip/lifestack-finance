import { computeAgentEvaluation } from '../../../lib/engines/agents/agent-evaluation.js';

const MOCK_AGENT_STATE = {
  driftMonitor: { maxDrift: 3.5, urgency: 'Normal', driftScore: 4 },
  concentration: { hhi: 1500, effectivePositions: 12 },
  debtPriority: { totalDebt: 5000, highestAPR: 10, totalAnnualInterest: 500 },
  isaPensionRouting: { isaHeadroom: { remaining: 10000 }, daysUntilTaxYearEnd: 60 },
  stress: { compositeScore: 35, compositeLevel: 'Normal' },
  regime: { regime: 'Expansion', riskPosture: 'Risk On' },
};

const MOCK_DECISIONS = [
  { agent: 'driftMonitor', correct: true, confidence: 70 },
  { agent: 'driftMonitor', correct: true, confidence: 80 },
  { agent: 'driftMonitor', correct: false, confidence: 60 },
  { agent: 'concentration', correct: true, confidence: 90 },
  { agent: 'concentration', correct: true, confidence: 85 },
];

describe('computeAgentEvaluation', () => {
  test('returns null for null agentState', () => {
    expect(computeAgentEvaluation(null, null)).toBeNull();
    expect(computeAgentEvaluation(undefined, null)).toBeNull();
  });

  test('returns valid structure with empty state', () => {
    const result = computeAgentEvaluation({}, null);
    expect(result).toBeDefined();
    expect(result.agents).toEqual([]);
    expect(result.overallScore).toBe(0);
    expect(result.totalAgents).toBe(0);
    expect(result.timestamp).toBeTruthy();
  });

  test('returns complete structure with mock state', () => {
    const result = computeAgentEvaluation(MOCK_AGENT_STATE, MOCK_DECISIONS);
    expect(result).not.toBeNull();
    expect(result.agents.length).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.bestAgent).toBeDefined();
    expect(result.worstAgent).toBeDefined();
    expect(result.implication).toBeTruthy();
    expect(result.totalAgents).toBe(result.agents.length);
  });

  test('each scored agent has required fields', () => {
    const result = computeAgentEvaluation(MOCK_AGENT_STATE, MOCK_DECISIONS);
    result.agents.forEach(agent => {
      expect(agent.name).toBeTruthy();
      expect(typeof agent.score).toBe('number');
      expect(typeof agent.accuracy).toBe('number');
      expect(typeof agent.decisionCount).toBe('number');
      expect(typeof agent.avgConfidence).toBe('number');
    });
  });

  test('bestAgent has highest score and worstAgent has lowest', () => {
    const result = computeAgentEvaluation(MOCK_AGENT_STATE, MOCK_DECISIONS);
    const scores = result.agents.map(a => a.score);
    expect(result.bestAgent.score).toBe(Math.max(...scores));
    expect(result.worstAgent.score).toBe(Math.min(...scores));
  });

  test('overallScore is clamped between 1 and 10 for scored agents', () => {
    const result = computeAgentEvaluation(MOCK_AGENT_STATE, MOCK_DECISIONS);
    result.agents.forEach(agent => {
      expect(agent.score).toBeGreaterThanOrEqual(1);
      expect(agent.score).toBeLessThanOrEqual(10);
    });
  });
});
