import { generateRebalanceApproval } from '../../../lib/engines/agents/rebalance-approval.js';

const MOCK_ENGINE = {
  driftMonitor: {
    maxDrift: 6.2,
    driftScore: 4,
    urgency: 'Action Needed',
    overweightSleeves: [{ sleeve: 'Equity', drift: 3.5 }],
    underweightSleeves: [{ sleeve: 'Fixed Income', drift: -2.7 }],
  },
  rebalanceProposal: {
    trades: [
      { ticker: 'VWRL', action: 'Sell', amount: -5000, wrapper: 'ISA', rationale: 'Trim equity' },
      { ticker: 'VAGP', action: 'Buy', amount: 5000, wrapper: 'ISA', rationale: 'Add bonds' },
    ],
    status: 'Action Recommended',
  },
  concentration: { totalValue: 200000, hhi: 1800 },
};

const MOCK_HOLDINGS = [
  { ticker: 'VWRL', name: 'All World', value: 80000, wrapper: 'ISA', gainPct: 15 },
  { ticker: 'VAGP', name: 'Global Agg', value: 40000, wrapper: 'ISA' },
  { ticker: 'VUSA', name: 'S&P 500', value: 20000, wrapper: 'GIA', gainPct: 25 },
];

describe('generateRebalanceApproval', () => {
  test('returns null for null/undefined engineState', () => {
    expect(generateRebalanceApproval(null)).toBeNull();
    expect(generateRebalanceApproval(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.driftSummary).toBeDefined();
    expect(result.trades).toBeDefined();
    expect(Array.isArray(result.trades)).toBe(true);
    expect(typeof result.totalCGT).toBe('number');
    expect(result.netBenefit).toBeDefined();
    expect(result.riskReduction).toBeDefined();
    expect(result.approvalStatus).toBeTruthy();
    expect(result.pack).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
  });

  test('drift summary includes drift data', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(result.driftSummary.available).toBe(true);
    expect(result.driftSummary.maxDrift).toBe(6.2);
    expect(result.driftSummary.overweightSleeves.length).toBe(1);
  });

  test('trades have required fields', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    result.trades.forEach(t => {
      expect(t.ticker).toBeTruthy();
      expect(t.action).toBeTruthy();
      expect(typeof t.amount).toBe('number');
      expect(t.rationale).toBeTruthy();
      expect(typeof t.cgtCost).toBe('number');
    });
  });

  test('ISA sells have zero CGT', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    const isaSell = result.trades.find(t => t.ticker === 'VWRL' && t.action === 'Sell');
    expect(isaSell.cgtCost).toBe(0);
  });

  test('net benefit computed correctly', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(typeof result.netBenefit.grossBenefit).toBe('number');
    expect(typeof result.netBenefit.netBenefit).toBe('number');
    expect(typeof result.netBenefit.isPositive).toBe('boolean');
    expect(result.netBenefit.note).toBeTruthy();
  });

  test('approval status is recommended for high drift with positive benefit', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(result.approvalStatus).toBe('recommended');
  });

  test('approval pack is a formatted string', () => {
    const result = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(result.pack).toContain('REBALANCE APPROVAL PACK');
  });

  test('returns not_needed when no trades', () => {
    const eng = { ...MOCK_ENGINE, rebalanceProposal: { trades: [] }, driftMonitor: { maxDrift: 1 } };
    const result = generateRebalanceApproval(eng, MOCK_HOLDINGS);
    expect(result.approvalStatus).toBe('not_needed');
  });

  test('is deterministic', () => {
    const a = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    const b = generateRebalanceApproval(MOCK_ENGINE, MOCK_HOLDINGS);
    expect(a.totalCGT).toBe(b.totalCGT);
    expect(a.approvalStatus).toBe(b.approvalStatus);
  });
});
