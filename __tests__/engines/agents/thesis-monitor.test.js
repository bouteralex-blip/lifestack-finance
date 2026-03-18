import { computeThesisMonitorState } from '../../../lib/engines/agents/thesis-monitor.js';

const MOCK_DECISION_LOG = [
  {
    id: 'buy-btc-2024',
    action: 'Buy BTC',
    thesis: {
      rationale: 'Post-halving cycle thesis',
      timeHorizon: '1-2 years',
      conviction: 7,
      conditions: [
        { metric: 'btcCycle.bias', operator: '>=', target: 3 },
      ],
    },
    timestamp: new Date().toISOString(),
  },
  {
    id: 'trim-equity-2024',
    action: 'Trim equity to 60%',
    thesis: {
      rationale: 'Late cycle positioning',
      expectedOutcome: 'Reduce drawdown risk',
      conviction: 6,
    },
    timestamp: new Date().toISOString(),
  },
];

const MOCK_ENGINE = {
  concentration: { hhi: 1500 },
  driftMonitor: { maxDrift: 2 },
};

const MOCK_MARKET = {
  btcCycle: { bias: 4, phase: 'Accumulation' },
  regime: { regime: 'Expansion' },
};

describe('computeThesisMonitorState', () => {
  test('returns null for null/undefined/empty decisionLog', () => {
    expect(computeThesisMonitorState(null)).toBeNull();
    expect(computeThesisMonitorState(undefined)).toBeNull();
    expect(computeThesisMonitorState([])).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    expect(result).not.toBeNull();
    expect(result.theses).toBeDefined();
    expect(Array.isArray(result.theses)).toBe(true);
    expect(result.theses.length).toBe(2);
    expect(typeof result.activeCount).toBe('number');
    expect(typeof result.validatedCount).toBe('number');
    expect(typeof result.invalidatedCount).toBe('number');
    expect(typeof result.expiredCount).toBe('number');
    expect(typeof result.hitRate).toBe('number');
    expect(result.implication).toBeTruthy();
  });

  test('each thesis has required fields', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    result.theses.forEach(t => {
      expect(t.id).toBeTruthy();
      expect(t.action).toBeTruthy();
      expect(t.status).toBeTruthy();
      expect(t.evidence).toBeTruthy();
      expect(typeof t.conviction).toBe('number');
    });
  });

  test('validates thesis when all conditions met', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    const btcThesis = result.theses.find(t => t.id === 'buy-btc-2024');
    // btcCycle.bias = 4 >= 3, so condition met => validated
    expect(btcThesis.status).toBe('validated');
  });

  test('thesis without conditions stays tracking', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    const equityThesis = result.theses.find(t => t.id === 'trim-equity-2024');
    expect(equityThesis.status).toBe('tracking');
  });

  test('hit rate in 0-100 range', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    expect(result.hitRate).toBeGreaterThanOrEqual(0);
    expect(result.hitRate).toBeLessThanOrEqual(100);
  });

  test('counts match total', () => {
    const result = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    expect(result.activeCount + result.validatedCount + result.invalidatedCount + result.expiredCount).toBe(result.totalCount);
  });

  test('filters out entries without thesis data', () => {
    const log = [...MOCK_DECISION_LOG, { id: 'no-thesis', action: 'Random' }];
    const result = computeThesisMonitorState(log, MOCK_ENGINE, MOCK_MARKET);
    expect(result.theses.length).toBe(2);
  });

  test('is deterministic', () => {
    const a = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    const b = computeThesisMonitorState(MOCK_DECISION_LOG, MOCK_ENGINE, MOCK_MARKET);
    expect(a.hitRate).toBe(b.hitRate);
    expect(a.activeCount).toBe(b.activeCount);
  });
});
