import { computeRegressionChecks } from '../../../lib/engines/agents/regression-check.js';

const MOCK_STATE = {
  driftMonitor: { maxDrift: 3.5, driftScore: 5 },
  concentration: { hhi: 1500, effectivePositions: 12 },
  debtPriority: { totalDebt: 5000, highestAPR: 10, totalAnnualInterest: 500 },
  isaPensionRouting: { daysUntilTaxYearEnd: 60 },
  wrapperExposure: { efficiency: { score: 7, giaExposurePct: 30 } },
  currencyExposure: { homeBias: 35 },
};

describe('computeRegressionChecks', () => {
  test('returns null for null engineState', () => {
    expect(computeRegressionChecks(null, null)).toBeNull();
    expect(computeRegressionChecks(undefined, {})).toBeNull();
  });

  test('returns baseline message when no prior state', () => {
    const result = computeRegressionChecks(MOCK_STATE, null);
    expect(result).toBeDefined();
    expect(result.checks).toEqual([]);
    expect(result.regressionCount).toBe(0);
    expect(result.implication).toContain('First snapshot');
    expect(result.timestamp).toBeTruthy();
  });

  test('returns stable when current matches prior', () => {
    const result = computeRegressionChecks(MOCK_STATE, MOCK_STATE);
    expect(result.regressionCount).toBe(0);
    expect(result.stableCount).toBeGreaterThan(0);
    expect(result.implication).toContain('stable');
  });

  test('detects regression when values change significantly', () => {
    const priorState = {
      ...MOCK_STATE,
      driftMonitor: { maxDrift: 1.0, driftScore: 2 },
      concentration: { hhi: 800, effectivePositions: 20 },
    };
    const result = computeRegressionChecks(MOCK_STATE, priorState);
    expect(result.regressionCount).toBeGreaterThan(0);
    const driftRegression = result.checks.find(c => c.field === 'maxDrift' && c.isRegression);
    expect(driftRegression).toBeDefined();
    expect(driftRegression.changePct).toBeGreaterThan(50);
  });

  test('each check has required fields', () => {
    const result = computeRegressionChecks(MOCK_STATE, MOCK_STATE);
    result.checks.forEach(check => {
      expect(check.engine).toBeTruthy();
      expect(check.field).toBeTruthy();
      expect(check.label).toBeTruthy();
      expect(typeof check.changePct).toBe('number');
      expect(typeof check.isRegression).toBe('boolean');
      expect(check.note).toBeTruthy();
    });
  });

  test('many regressions recommend manual review', () => {
    const drasticPrior = {
      driftMonitor: { maxDrift: 0.1, driftScore: 0.1 },
      concentration: { hhi: 100, effectivePositions: 50 },
      debtPriority: { totalDebt: 100, highestAPR: 1, totalAnnualInterest: 1 },
      isaPensionRouting: { daysUntilTaxYearEnd: 365 },
      wrapperExposure: { efficiency: { score: 1, giaExposurePct: 1 } },
      currencyExposure: { homeBias: 5 },
    };
    const result = computeRegressionChecks(MOCK_STATE, drasticPrior);
    expect(result.regressionCount).toBeGreaterThan(3);
    expect(result.implication).toContain('Manual review');
  });
});
