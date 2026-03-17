import { computeMonteCarloState } from '../../lib/engines/monte-carlo.js';

const SAMPLE_PORT = {
  netWorth: 200000,
  monthlySaving: 2000,
  targetReturn: 7,
  targetNW: 1000000,
  horizonYears: 10,
  monthlyExpenses: 3000,
  grossIncome: 80000,
};

const SAMPLE_RISK = {
  vol: 15,
};

describe('computeMonteCarloState', () => {
  test('returns null for null/undefined portConfig', () => {
    expect(computeMonteCarloState(null, SAMPLE_RISK)).toBeNull();
    expect(computeMonteCarloState(undefined, SAMPLE_RISK)).toBeNull();
  });

  test('returns null when netWorth and monthlySaving are both zero', () => {
    const result = computeMonteCarloState({ netWorth: 0, monthlySaving: 0 }, SAMPLE_RISK);
    expect(result).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(result).not.toBeNull();
    expect(result.paths).toBeDefined();
    expect(result.paths.p10).toBeDefined();
    expect(result.paths.p25).toBeDefined();
    expect(result.paths.p50).toBeDefined();
    expect(result.paths.p75).toBeDefined();
    expect(result.paths.p90).toBeDefined();
    expect(result.terminalValues).toBeDefined();
    expect(result.targetHit).toBeDefined();
    expect(result.fiNumber).toBeDefined();
    expect(typeof result.savingsRate).toBe('number');
    expect(result.horizonYears).toBe(10);
    expect(result.assumptions).toBeDefined();
    expect(result.implication).toBeTruthy();
  });

  test('paths have correct length (horizon + 1 for start)', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    // horizonYears = 10, so 10 yearly snapshots + starting value = 11
    expect(result.paths.p50.length).toBe(11);
  });

  test('p90 terminal > p50 terminal > p10 terminal', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(result.terminalValues.p90).toBeGreaterThan(result.terminalValues.p50);
    expect(result.terminalValues.p50).toBeGreaterThan(result.terminalValues.p10);
  });

  test('FI number computed from monthly expenses (25x)', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(result.fiNumber).toBe(3000 * 12 * 25);
  });

  test('savings rate computed correctly', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    const expectedRate = (2000 * 12 / 80000) * 100;
    expect(result.savingsRate).toBeCloseTo(expectedRate, 0);
  });

  test('target hit probability in valid range', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(result.targetHit.probability).toBeGreaterThanOrEqual(0);
    expect(result.targetHit.probability).toBeLessThanOrEqual(100);
  });

  test('works with only monthlySaving (no starting NW)', () => {
    const result = computeMonteCarloState({ netWorth: 0, monthlySaving: 2000 }, SAMPLE_RISK);
    expect(result).not.toBeNull();
    expect(result.terminalValues.p50).toBeGreaterThan(0);
  });

  test('assumptions reflect input values', () => {
    const result = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(result.assumptions.expectedReturn).toBe(7);
    expect(result.assumptions.volatility).toBe(15);
    expect(result.assumptions.monthlySaving).toBe(2000);
    expect(result.assumptions.startingNW).toBe(200000);
  });

  test('is deterministic', () => {
    const a = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    const b = computeMonteCarloState(SAMPLE_PORT, SAMPLE_RISK);
    expect(a.terminalValues.p50).toBe(b.terminalValues.p50);
    expect(a.targetHit.probability).toBe(b.targetHit.probability);
  });
});
