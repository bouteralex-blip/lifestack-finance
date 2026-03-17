import { computeOpportunityRadar } from '../../../lib/engines/agents/opportunity-radar.js';

const MOCK_ENGINE = {
  debtPriority: { actions: [{ name: 'Credit Card', apr: 22, balance: 3000, annualInterest: 660 }] },
  isaPensionRouting: { isaHeadroom: { remaining: 15000 }, daysUntilTaxYearEnd: 20, salarySacrificeValue: { totalSaving: 5000, inTaperZone: false } },
  rebalanceProposal: { trades: [{ ticker: 'VWRL', action: 'Buy', amount: 2000 }], status: 'Action Recommended' },
  driftMonitor: { maxDrift: 4.5 },
  concentration: { hhi: 1800, clutter: { count: 3, totalValue: 500 }, violations: [] },
  wrapperExposure: { reallocationOpportunities: [], totalAnnualBenefitFromReallocation: 0 },
};

const MOCK_MARKET = {
  btcCycle: { phase: 'Accumulation', bias: 3, confidence: 65, posture: 'Accumulate' },
  stress: { compositeScore: 30 },
};

describe('computeOpportunityRadar', () => {
  test('returns null for null/undefined engineState', () => {
    expect(computeOpportunityRadar(null)).toBeNull();
    expect(computeOpportunityRadar(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    expect(result).not.toBeNull();
    expect(result.opportunities).toBeDefined();
    expect(Array.isArray(result.opportunities)).toBe(true);
    expect(result.totalOpportunities).toBeGreaterThan(0);
    expect(result.topPick).toBeDefined();
    expect(result.timestamp).toBeTruthy();
  });

  test('opportunities are ranked', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    result.opportunities.forEach((opp, i) => {
      expect(opp.rank).toBe(i + 1);
    });
  });

  test('each opportunity has required fields', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    result.opportunities.forEach(opp => {
      expect(opp.id).toBeTruthy();
      expect(opp.title).toBeTruthy();
      expect(opp.source).toBeTruthy();
      expect(typeof opp.conviction).toBe('number');
      expect(typeof opp.timing).toBe('number');
      expect(typeof opp.expectedValue).toBe('number');
      expect(opp.action).toBeTruthy();
      expect(opp.rationale).toBeTruthy();
    });
  });

  test('debt opportunities detected', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    expect(result.opportunities.some(o => o.source === 'Debt Engine')).toBe(true);
  });

  test('ISA opportunities detected', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    expect(result.opportunities.some(o => o.source === 'ISA Engine')).toBe(true);
  });

  test('BTC accumulation opportunity detected when bias >= 3', () => {
    const result = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    expect(result.opportunities.some(o => o.source === 'BTC Cycle Engine')).toBe(true);
  });

  test('returns empty opportunities when no signals', () => {
    const minimal = { driftMonitor: {}, concentration: {}, isaPensionRouting: {}, debtPriority: {}, rebalanceProposal: {}, wrapperExposure: {} };
    const result = computeOpportunityRadar(minimal, {}, []);
    expect(result.totalOpportunities).toBe(0);
  });

  test('is deterministic', () => {
    const a = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    const b = computeOpportunityRadar(MOCK_ENGINE, MOCK_MARKET, []);
    expect(a.totalOpportunities).toBe(b.totalOpportunities);
    expect(a.topPick?.title).toBe(b.topPick?.title);
  });
});
