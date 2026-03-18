import { computeCryptoScenarioLab } from '../../lib/engines/crypto-scenario.js';

const CRYPTO_HOLDINGS = [
  { name: 'BTC', ticker: 'BTC', val: 30000, sleeve: 'Crypto' },
  { name: 'ETH', ticker: 'ETH', val: 10000, sleeve: 'Crypto' },
  { name: 'SOL', ticker: 'SOL', val: 5000, sleeve: 'Crypto' },
  { name: 'AVAX', ticker: 'AVAX', val: 5000, sleeve: 'Crypto' },
];

describe('computeCryptoScenarioLab', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(computeCryptoScenarioLab(null)).toBeNull();
    expect(computeCryptoScenarioLab(undefined)).toBeNull();
    expect(computeCryptoScenarioLab([])).toBeNull();
  });

  test('returns null for non-crypto holdings', () => {
    const holdings = [{ name: 'VWRL', ticker: 'VWRL', val: 50000, sleeve: 'Equity' }];
    expect(computeCryptoScenarioLab(holdings)).toBeNull();
  });

  test('returns complete state for crypto holdings', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(state).not.toBeNull();
    expect(state.currentValue).toBeGreaterThan(0);
    expect(state.holdingCount).toBe(4);
    expect(state.scenarios).toBeDefined();
    expect(Array.isArray(state.scenarios)).toBe(true);
    expect(state.scenarios.length).toBe(5);
    expect(state.worstCase).toBeDefined();
    expect(state.bestCase).toBeDefined();
    expect(state.maxDrawdown).toBeDefined();
    expect(state.maxGain).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('scenarios have required fields', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    state.scenarios.forEach(s => {
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(typeof s.portfolioImpact).toBe('number');
      expect(typeof s.portfolioValue).toBe('number');
      expect(typeof s.gainLoss).toBe('number');
    });
  });

  test('Black Swan is the worst-case scenario', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(state.worstCase.name).toBe('Black Swan');
    expect(state.worstCase.impact).toBeLessThan(-70);
  });

  test('BTC Supercycle is the best-case scenario', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(state.bestCase.name).toBe('BTC Supercycle');
    expect(state.bestCase.impact).toBeGreaterThan(100);
  });

  test('maxDrawdown is negative for bear scenarios', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(state.maxDrawdown).toBeLessThan(0);
  });

  test('maxGain is positive for bull scenarios', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(state.maxGain).toBeGreaterThan(0);
  });

  test('scenario values are non-negative (floor at 0)', () => {
    const state = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    state.scenarios.forEach(s => {
      expect(s.portfolioValue).toBeGreaterThanOrEqual(0);
    });
  });

  test('returns null for zero-value crypto holdings', () => {
    const holdings = [{ name: 'BTC', ticker: 'BTC', val: 0, sleeve: 'Crypto' }];
    expect(computeCryptoScenarioLab(holdings)).toBeNull();
  });

  test('is deterministic', () => {
    const a = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    const b = computeCryptoScenarioLab(CRYPTO_HOLDINGS, {});
    expect(a.currentValue).toBe(b.currentValue);
    expect(a.maxDrawdown).toBe(b.maxDrawdown);
    expect(a.worstCase.impact).toBe(b.worstCase.impact);
  });
});
