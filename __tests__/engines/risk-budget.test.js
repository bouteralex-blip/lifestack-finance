import { computeRiskBudgetState } from '../../lib/engines/risk-budget.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, wrapper: 'ISA' },
  { ticker: 'VUSA', name: 'Vanguard S&P 500', value: 30000, wrapper: 'ISA' },
  { ticker: 'VAGP', name: 'Vanguard Global Agg', value: 20000, wrapper: 'SIPP' },
];

const SAMPLE_RISK = {
  vol: 14,
  beta: 1.05,
  returnAnnualized: 8,
  factorExposures: { momentum: 15, value: 10, quality: 20, size: 5, volatility: 8 },
};

const SAMPLE_PORT = {
  targetVol: 12,
  maxBeta: 1.2,
};

describe('computeRiskBudgetState', () => {
  test('returns null for null/undefined/empty holdings', () => {
    expect(computeRiskBudgetState(null, SAMPLE_RISK, SAMPLE_PORT)).toBeNull();
    expect(computeRiskBudgetState(undefined, SAMPLE_RISK, SAMPLE_PORT)).toBeNull();
    expect(computeRiskBudgetState([], SAMPLE_RISK, SAMPLE_PORT)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, SAMPLE_RISK, SAMPLE_PORT);
    expect(result).not.toBeNull();
    expect(result.portfolioVol).toBeDefined();
    expect(result.volBudget).toBeDefined();
    expect(result.volBudget.used).toBeDefined();
    expect(result.volBudget.remaining).toBeDefined();
    expect(result.volBudget.target).toBeDefined();
    expect(result.volBudget.utilization).toBeDefined();
    expect(result.betaBudget).toBeDefined();
    expect(result.factorLoads).toBeDefined();
    expect(result.riskBudgetScore).toBeDefined();
    expect(result.implication).toBeTruthy();
  });

  test('vol utilization computed correctly', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 12 }, { targetVol: 12 });
    expect(result.volBudget.utilization).toBeCloseTo(100, 0);
  });

  test('vol remaining is zero when vol exceeds target', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 18 }, { targetVol: 12 });
    expect(result.volBudget.remaining).toBe(0);
  });

  test('beta budget headroom computed correctly', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { beta: 1.0 }, { maxBeta: 1.2 });
    expect(result.betaBudget.headroom).toBeCloseTo(0.2, 1);
    expect(result.betaBudget.status).toBe('OK');
  });

  test('beta breach detected when current exceeds max', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { beta: 1.5 }, { maxBeta: 1.2 });
    expect(result.betaBudget.status).toBe('Breached');
  });

  test('factor loads sorted by utilization descending', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, SAMPLE_RISK, SAMPLE_PORT);
    for (let i = 1; i < result.factorLoads.length; i++) {
      expect(result.factorLoads[i - 1].utilization).toBeGreaterThanOrEqual(result.factorLoads[i].utilization);
    }
  });

  test('risk budget score stays in 0-10 range', () => {
    const high = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 30, beta: 2.0 }, { targetVol: 12, maxBeta: 1.2 });
    expect(high.riskBudgetScore).toBeGreaterThanOrEqual(0);
    expect(high.riskBudgetScore).toBeLessThanOrEqual(10);

    const low = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 6, beta: 0.5 }, { targetVol: 12, maxBeta: 1.2 });
    expect(low.riskBudgetScore).toBeGreaterThanOrEqual(0);
    expect(low.riskBudgetScore).toBeLessThanOrEqual(10);
  });

  test('high vol triggers de-risking implication', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 20 }, { targetVol: 12 });
    expect(result.implication).toContain('de-risking');
  });

  test('low vol triggers room-to-add implication', () => {
    const result = computeRiskBudgetState(SAMPLE_HOLDINGS, { vol: 4 }, { targetVol: 12 });
    expect(result.implication).toContain('room to add');
  });

  test('is deterministic', () => {
    const a = computeRiskBudgetState(SAMPLE_HOLDINGS, SAMPLE_RISK, SAMPLE_PORT);
    const b = computeRiskBudgetState(SAMPLE_HOLDINGS, SAMPLE_RISK, SAMPLE_PORT);
    expect(a.riskBudgetScore).toBe(b.riskBudgetScore);
    expect(a.portfolioVol).toBe(b.portfolioVol);
  });
});
