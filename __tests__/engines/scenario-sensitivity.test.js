import { computeScenarioSensitivity } from '../../lib/engines/scenario-sensitivity.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, assetClass: 'Equity' },
  { ticker: 'VAGP', name: 'Vanguard Global Agg', value: 30000, assetClass: 'Fixed Income' },
  { ticker: 'GLD', name: 'Gold ETF', value: 10000, assetClass: 'Commodities' },
  { ticker: 'BTC', name: 'Bitcoin', value: 10000, assetClass: 'Crypto' },
];

const SAMPLE_SCENARIOS = [
  { name: 'Rate Shock', description: 'Rates +200bp', shocks: { Equity: -15, 'Fixed Income': -10, Commodities: 5, Crypto: -25 } },
  { name: 'Risk-Off', description: 'Flight to safety', shocks: { Equity: -20, 'Fixed Income': 5, Commodities: 10, Crypto: -40 } },
  { name: 'Goldilocks', description: 'Soft landing', shocks: { Equity: 10, 'Fixed Income': 3, Commodities: 2, Crypto: 15 } },
];

describe('computeScenarioSensitivity', () => {
  test('returns null for null/undefined/empty holdings', () => {
    expect(computeScenarioSensitivity(null, SAMPLE_SCENARIOS)).toBeNull();
    expect(computeScenarioSensitivity(undefined, SAMPLE_SCENARIOS)).toBeNull();
    expect(computeScenarioSensitivity([], SAMPLE_SCENARIOS)).toBeNull();
  });

  test('returns null for null/undefined/empty scenarios', () => {
    expect(computeScenarioSensitivity(SAMPLE_HOLDINGS, null)).toBeNull();
    expect(computeScenarioSensitivity(SAMPLE_HOLDINGS, undefined)).toBeNull();
    expect(computeScenarioSensitivity(SAMPLE_HOLDINGS, [])).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    expect(result).not.toBeNull();
    expect(result.scenarios).toBeDefined();
    expect(result.scenarios.length).toBe(3);
    expect(result.worstCase).toBeDefined();
    expect(result.bestCase).toBeDefined();
    expect(typeof result.avgDownside).toBe('number');
    expect(result.scenarioCount).toBe(3);
    expect(result.implication).toBeTruthy();
  });

  test('scenarios sorted by portfolioImpact ascending (worst first)', () => {
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    for (let i = 1; i < result.scenarios.length; i++) {
      expect(result.scenarios[i - 1].portfolioImpact).toBeLessThanOrEqual(result.scenarios[i].portfolioImpact);
    }
  });

  test('worst case has lowest impact', () => {
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    expect(result.worstCase.impact).toBeLessThanOrEqual(result.bestCase.impact);
  });

  test('each scenario has required fields', () => {
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    result.scenarios.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(typeof s.portfolioImpact).toBe('number');
      expect(typeof s.absoluteImpact).toBe('number');
      expect(s.topLosers).toBeDefined();
      expect(s.topGainers).toBeDefined();
    });
  });

  test('goldilocks scenario has positive portfolio impact', () => {
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    const goldi = result.scenarios.find(s => s.name === 'Goldilocks');
    expect(goldi.portfolioImpact).toBeGreaterThan(0);
  });

  test('returns null for zero total value holdings', () => {
    const result = computeScenarioSensitivity([{ ticker: 'X', value: 0 }], SAMPLE_SCENARIOS);
    expect(result).toBeNull();
  });

  test('handles scenario with no matching shocks', () => {
    const scenarios = [{ name: 'Empty', shocks: {} }];
    const result = computeScenarioSensitivity(SAMPLE_HOLDINGS, scenarios);
    expect(result).not.toBeNull();
    expect(result.scenarios[0].portfolioImpact).toBe(0);
  });

  test('is deterministic', () => {
    const a = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    const b = computeScenarioSensitivity(SAMPLE_HOLDINGS, SAMPLE_SCENARIOS);
    expect(a.worstCase.impact).toBe(b.worstCase.impact);
    expect(a.avgDownside).toBe(b.avgDownside);
  });
});
