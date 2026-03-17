import { computeWhatMattersNow } from '../../../lib/engines/agents/what-matters-now.js';

const MOCK_ENGINE = {
  isaPensionRouting: { isaHeadroom: { remaining: 15000 }, daysUntilTaxYearEnd: 100 },
  concentration: { hhi: 1500, violations: [] },
  debtPriority: { highestAPR: 0, totalDebt: 0, totalAnnualInterest: 0 },
  driftMonitor: { maxDrift: 2.5 },
  rebalanceProposal: { trades: [] },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false },
  stress: { compositeScore: 25, compositeLevel: 'Normal' },
};

const MOCK_AGENT = {
  triggerAlerts: { summary: { critical: 0 }, alerts: [] },
  opportunityRanker: { summary: { executeNow: 0 } },
};

describe('computeWhatMattersNow', () => {
  test('returns null for null/undefined engineState', () => {
    expect(computeWhatMattersNow(null)).toBeNull();
    expect(computeWhatMattersNow(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result).not.toBeNull();
    expect(result.topPriority).toBeDefined();
    expect(result.topPriority.title).toBeTruthy();
    expect(result.topPriority.detail).toBeTruthy();
    expect(result.topPriority.urgency).toBeTruthy();
    expect(result.topPriority.action).toBeTruthy();
    expect(result.runners).toBeDefined();
    expect(result.noise).toBeDefined();
    expect(result.timestamp).toBeTruthy();
  });

  test('ISA deadline takes highest precedence', () => {
    const isaUrgent = {
      ...MOCK_ENGINE,
      isaPensionRouting: { isaHeadroom: { remaining: 15000 }, daysUntilTaxYearEnd: 5 },
    };
    const result = computeWhatMattersNow(isaUrgent, MOCK_MARKET, MOCK_AGENT);
    expect(result.topPriority.title).toContain('ISA deadline');
    expect(result.topPriority.urgency).toBe('critical');
  });

  test('concentration breach detected', () => {
    const concentrated = {
      ...MOCK_ENGINE,
      concentration: { hhi: 3000, violations: [{ item: 'NVDA', actual: 30, limit: 15 }] },
    };
    const result = computeWhatMattersNow(concentrated, MOCK_MARKET, MOCK_AGENT);
    expect(result.topPriority.title).toContain('concentration');
  });

  test('high APR debt detected', () => {
    const indebted = {
      ...MOCK_ENGINE,
      debtPriority: { highestAPR: 22, totalDebt: 5000, totalAnnualInterest: 1100 },
    };
    const result = computeWhatMattersNow(indebted, MOCK_MARKET, MOCK_AGENT);
    expect(result.topPriority.title).toContain('debt');
  });

  test('rebalance need detected', () => {
    const drifted = {
      ...MOCK_ENGINE,
      driftMonitor: { maxDrift: 7.5 },
      rebalanceProposal: { trades: [{ ticker: 'VWRL' }] },
    };
    const result = computeWhatMattersNow(drifted, MOCK_MARKET, MOCK_AGENT);
    expect(result.topPriority.title).toContain('Rebalance');
  });

  test('market stress detected', () => {
    const stressed = { ...MOCK_MARKET, stress: { compositeScore: 75, compositeLevel: 'Elevated' } };
    const result = computeWhatMattersNow(MOCK_ENGINE, stressed, MOCK_AGENT);
    expect(result.topPriority.title).toContain('stress');
  });

  test('all clear when nothing urgent', () => {
    const result = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.topPriority.title).toBe('All clear');
    expect(result.topPriority.urgency).toBe('low');
  });

  test('noise items identified for quiet conditions', () => {
    const result = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.noise.length).toBeGreaterThan(0);
  });

  test('runners limited to 3 items', () => {
    const result = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.runners.length).toBeLessThanOrEqual(3);
  });

  test('is deterministic', () => {
    const a = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    const b = computeWhatMattersNow(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(a.topPriority.title).toBe(b.topPriority.title);
    expect(a.topPriority.urgency).toBe(b.topPriority.urgency);
  });
});
