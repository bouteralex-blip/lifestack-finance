import {
  computeRebalanceProposalState,
  generateRebalanceTrades,
  calculateCGTPerTrade,
  rankTradesByEfficiency,
  produceApprovalPack,
} from '../../lib/engines/rebalance-proposal.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- calculateCGTPerTrade ----
describe('calculateCGTPerTrade', () => {
  test('returns 0 for trades inside a wrapper', () => {
    expect(calculateCGTPerTrade(10000, 0.08, 0.24, true)).toBe(0);
  });

  test('estimates CGT for GIA trades', () => {
    const cgt = calculateCGTPerTrade(10000, 0.08, 0.24, false);
    // 10000 * 0.08 * 0.24 = 192
    expect(cgt).toBe(192);
  });

  test('returns 0 for zero trade amount', () => {
    expect(calculateCGTPerTrade(0, 0.08, 0.24, false)).toBe(0);
  });
});

// ---- rankTradesByEfficiency ----
describe('rankTradesByEfficiency', () => {
  test('returns empty for null/empty trades', () => {
    expect(rankTradesByEfficiency(null)).toEqual([]);
    expect(rankTradesByEfficiency([])).toEqual([]);
  });

  test('assigns execution priorities', () => {
    const trades = [
      { amount: 5000, taxEfficiency: 9, urgency: 'High' },
      { amount: 3000, taxEfficiency: 3, urgency: 'Medium' },
    ];
    const ranked = rankTradesByEfficiency(trades);
    expect(ranked.length).toBe(2);
    ranked.forEach(t => {
      expect(t.executionPriority).toBeGreaterThanOrEqual(1);
      expect(t.executionPriority).toBeLessThanOrEqual(4);
      expect(typeof t.estimatedCGT).toBe('number');
    });
  });

  test('wrapper trades get zero CGT', () => {
    const trades = [{ amount: 10000, taxEfficiency: 9, urgency: 'High' }];
    const ranked = rankTradesByEfficiency(trades);
    expect(ranked[0].estimatedCGT).toBe(0); // taxEfficiency >= 8 = in wrapper
  });

  test('GIA trades get positive CGT', () => {
    const trades = [{ amount: 10000, taxEfficiency: 3, urgency: 'Medium' }];
    const ranked = rankTradesByEfficiency(trades);
    expect(ranked[0].estimatedCGT).toBeGreaterThan(0);
  });
});

// ---- produceApprovalPack ----
describe('produceApprovalPack', () => {
  test('returns null for empty trades', () => {
    expect(produceApprovalPack([], 100000, [])).toBeNull();
    expect(produceApprovalPack(null, 100000, [])).toBeNull();
  });

  test('produces summary for valid trades', () => {
    const trades = [
      { amount: 5000, estimatedCGT: 0, driftReduction: 2.5 },
      { amount: 3000, estimatedCGT: 57.6, driftReduction: 1.5 },
    ];
    const drifts = [{ absDrift: 6 }];
    const pack = produceApprovalPack(trades, 100000, drifts);
    expect(pack).not.toBeNull();
    expect(pack.tradeCount).toBe(2);
    expect(pack.totalTradeValue).toBe(8000);
    expect(pack.totalEstimatedCGT).toBeGreaterThanOrEqual(0);
    expect(pack.driftReduction).toBe(4);
    expect(pack.turnover).toBeCloseTo(8, 0);
    expect(typeof pack.approvalRequired).toBe('boolean');
    expect(['This week', 'By month-end', 'Next rebalance cycle']).toContain(pack.executionWindow);
  });
});

// ---- generateRebalanceTrades ----
describe('generateRebalanceTrades', () => {
  test('returns empty for null/empty holdings', () => {
    expect(generateRebalanceTrades(null, {}, null)).toEqual([]);
    expect(generateRebalanceTrades([], {}, null)).toEqual([]);
  });

  test('generates trades for default holdings with standard targets', () => {
    const targets = {
      'Equity': 40, 'Pension': 22, 'Cash & Equivalents': 16,
      'Crypto': 13, 'Multi-Asset': 5, 'Real Assets': 2, 'Fixed Income': 2,
    };
    const trades = generateRebalanceTrades(DEFAULT_HOLDINGS, targets, null);
    // Should generate some trades since actual allocation differs from targets
    expect(Array.isArray(trades)).toBe(true);
  });
});

// ---- computeRebalanceProposalState (master function) ----
describe('computeRebalanceProposalState', () => {
  test('returns null for null/empty input', () => {
    expect(computeRebalanceProposalState(null, {})).toBeNull();
    expect(computeRebalanceProposalState([], {})).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const targets = {
      'Equity': 40, 'Pension': 22, 'Cash & Equivalents': 16,
      'Crypto': 13, 'Multi-Asset': 5, 'Real Assets': 2, 'Fixed Income': 2,
    };
    const state = computeRebalanceProposalState(DEFAULT_HOLDINGS, targets, null);
    expect(state).not.toBeNull();
    expect(state.maxDrift).toBeGreaterThanOrEqual(0);
    expect(['No Action Needed', 'Action Recommended', 'Monitor']).toContain(state.status);
    expect(state.trades).toBeDefined();
  });

  test('is deterministic', () => {
    const targets = { 'Equity': 40, 'Crypto': 13, 'Cash & Equivalents': 16 };
    const a = computeRebalanceProposalState(DEFAULT_HOLDINGS, targets, null);
    const b = computeRebalanceProposalState(DEFAULT_HOLDINGS, targets, null);
    expect(a.maxDrift).toBe(b.maxDrift);
    expect(a.status).toBe(b.status);
    expect(a.trades.length).toBe(b.trades.length);
  });

  test('returns No Action Needed when targets match actuals', () => {
    // Create holdings all in one sleeve for simplicity
    const holdings = [{ name: 'A', val: 100, cls: 'ETF' }];
    const targets = { 'Equity': 100 };
    const state = computeRebalanceProposalState(holdings, targets, null);
    expect(state.status).toBe('No Action Needed');
    expect(state.trades).toEqual([]);
  });
});
