import { computeCapitalEfficiencyState } from '../../lib/engines/capital-efficiency.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 40000, wrapper: 'ISA', assetClass: 'Equity', ter: 0.0022 },
  { ticker: 'VUSA', name: 'Vanguard S&P 500', value: 25000, wrapper: 'SIPP', assetClass: 'Equity', ter: 0.0007 },
  { ticker: 'VAGP', name: 'Vanguard Global Agg', value: 15000, wrapper: 'ISA', assetClass: 'Fixed Income', ter: 0.0015 },
  { ticker: 'CSH2', name: 'Cash Fund', value: 10000, wrapper: 'GIA', assetClass: 'Cash' },
  { ticker: 'BTC', name: 'Bitcoin', value: 10000, wrapper: 'GIA', assetClass: 'Crypto' },
];

const SAMPLE_PORT = {
  monthlyExpenses: 3000,
};

const SAMPLE_RISK = {
  returnAnnualized: 10,
  vol: 12,
  riskFreeRate: 4.5,
};

describe('computeCapitalEfficiencyState', () => {
  test('returns null for null/undefined/empty holdings', () => {
    expect(computeCapitalEfficiencyState(null)).toBeNull();
    expect(computeCapitalEfficiencyState(undefined)).toBeNull();
    expect(computeCapitalEfficiencyState([])).toBeNull();
  });

  test('returns null for zero total value', () => {
    expect(computeCapitalEfficiencyState([{ ticker: 'X', value: 0 }])).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    expect(result).not.toBeNull();
    expect(typeof result.score).toBe('number');
    expect(result.grade).toBeTruthy();
    expect(result.components).toBeDefined();
    expect(result.components.length).toBe(5);
    expect(result.weakestLink).toBeDefined();
    expect(result.strongestArea).toBeDefined();
    expect(result.implication).toBeTruthy();
  });

  test('each component has required fields', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    result.components.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(typeof c.score).toBe('number');
      expect(typeof c.weight).toBe('number');
      expect(c.detail).toBeTruthy();
    });
  });

  test('component weights sum to 1', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    const totalWeight = result.components.reduce((s, c) => s + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 2);
  });

  test('overall score stays in 0-10 range', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  test('grade matches score', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    if (result.score >= 8.5) expect(result.grade).toBe('A');
    else if (result.score >= 7) expect(result.grade).toBe('B');
    else if (result.score >= 5) expect(result.grade).toBe('C');
    else if (result.score >= 3) expect(result.grade).toBe('D');
    else expect(result.grade).toBe('F');
  });

  test('weakest link has lowest score among components', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    const minScore = Math.min(...result.components.map(c => c.score));
    expect(result.weakestLink.score).toBe(minScore);
  });

  test('strongest area has highest score among components', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    const maxScore = Math.max(...result.components.map(c => c.score));
    expect(result.strongestArea.score).toBe(maxScore);
  });

  test('works without portConfig and riskMetrics', () => {
    const result = computeCapitalEfficiencyState(SAMPLE_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('is deterministic', () => {
    const a = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    const b = computeCapitalEfficiencyState(SAMPLE_HOLDINGS, SAMPLE_PORT, SAMPLE_RISK);
    expect(a.score).toBe(b.score);
    expect(a.grade).toBe(b.grade);
  });
});
