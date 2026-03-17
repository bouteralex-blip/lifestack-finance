import {
  computeCurrencyExposureState,
  segmentByCurrency,
  computeFXConcentration,
  flagUnintendedFXBets,
  computePortfolioFXVol,
} from '../../lib/engines/currency-exposure.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- segmentByCurrency ----
describe('segmentByCurrency', () => {
  test('returns empty object for null/empty input', () => {
    expect(segmentByCurrency(null)).toEqual({});
    expect(segmentByCurrency([])).toEqual({});
  });

  test('segments default holdings by currency', () => {
    const currencies = segmentByCurrency(DEFAULT_HOLDINGS);
    expect(Object.keys(currencies).length).toBeGreaterThan(1);
    expect(currencies['GBP']).toBeDefined();
    expect(currencies['USD']).toBeDefined();
    expect(currencies['ZAR']).toBeDefined();
  });

  test('weights sum to approximately 100', () => {
    const currencies = segmentByCurrency(DEFAULT_HOLDINGS);
    const totalWeight = Object.values(currencies).reduce((s, c) => s + c.weight, 0);
    expect(totalWeight).toBeCloseTo(100, 0);
  });

  test('each segment has vol assigned', () => {
    const currencies = segmentByCurrency(DEFAULT_HOLDINGS);
    Object.values(currencies).forEach(c => {
      expect(c.vol).toBeGreaterThanOrEqual(0);
    });
  });
});

// ---- computeFXConcentration ----
describe('computeFXConcentration', () => {
  test('returns zero for empty currencies', () => {
    const result = computeFXConcentration({});
    expect(result.homeBias).toBe(0);
    expect(result.diversificationScore).toBe(0);
    expect(result.maxExposure).toBeNull();
  });

  test('computes home bias for default holdings', () => {
    const currencies = segmentByCurrency(DEFAULT_HOLDINGS);
    const result = computeFXConcentration(currencies);
    expect(result.homeBias).toBeGreaterThan(0);
    expect(result.diversificationScore).toBeGreaterThan(0);
    expect(result.meaningfulCurrencies).toBeGreaterThan(1);
  });

  test('100% GBP portfolio has maximum home bias', () => {
    const currencies = { GBP: { currency: 'GBP', weight: 100, value: 100000 } };
    const result = computeFXConcentration(currencies);
    expect(result.homeBias).toBe(100);
    expect(result.maxExposure).toBeNull();
  });
});

// ---- flagUnintendedFXBets ----
describe('flagUnintendedFXBets', () => {
  test('returns empty for GBP-only portfolio', () => {
    const currencies = { GBP: { currency: 'GBP', weight: 100, vol: 0 } };
    expect(flagUnintendedFXBets(currencies)).toEqual([]);
  });

  test('flags large USD exposure', () => {
    const currencies = {
      GBP: { currency: 'GBP', weight: 60, vol: 0 },
      USD: { currency: 'USD', weight: 40, vol: 9.5 },
    };
    const risks = flagUnintendedFXBets(currencies, 15);
    expect(risks.length).toBe(1);
    expect(risks[0].currency).toBe('USD');
    expect(risks[0].weight).toBe(40);
  });

  test('does not flag small exposures', () => {
    const currencies = {
      GBP: { currency: 'GBP', weight: 95, vol: 0 },
      USD: { currency: 'USD', weight: 5, vol: 9.5 },
    };
    expect(flagUnintendedFXBets(currencies, 15)).toEqual([]);
  });

  test('high-vol currencies get mitigation advice', () => {
    const currencies = {
      GBP: { currency: 'GBP', weight: 60, vol: 0 },
      ZAR: { currency: 'ZAR', weight: 40, vol: 18.4 },
    };
    const risks = flagUnintendedFXBets(currencies);
    expect(risks[0].mitigation).toContain('hedge');
  });
});

// ---- computePortfolioFXVol ----
describe('computePortfolioFXVol', () => {
  test('returns 0 for empty input', () => {
    expect(computePortfolioFXVol({})).toBe(0);
  });

  test('returns 0 for 100% GBP portfolio', () => {
    const currencies = { GBP: { currency: 'GBP', weight: 100, vol: 0 } };
    expect(computePortfolioFXVol(currencies)).toBe(0);
  });

  test('increases with foreign currency exposure', () => {
    const lowFX = { GBP: { weight: 90, vol: 0 }, USD: { weight: 10, vol: 9.5 } };
    const highFX = { GBP: { weight: 50, vol: 0 }, USD: { weight: 50, vol: 9.5 } };
    expect(computePortfolioFXVol(highFX)).toBeGreaterThan(computePortfolioFXVol(lowFX));
  });
});

// ---- computeCurrencyExposureState (master function) ----
describe('computeCurrencyExposureState', () => {
  test('returns null for null/empty input', () => {
    expect(computeCurrencyExposureState(null)).toBeNull();
    expect(computeCurrencyExposureState([])).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const state = computeCurrencyExposureState(DEFAULT_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.totalValue).toBeGreaterThan(0);
    expect(state.currencies.length).toBeGreaterThan(1);
    expect(state.homeBias).toBeGreaterThan(0);
    expect(state.diversificationScore).toBeGreaterThan(0);
    expect(state.portfolioFXVol).toBeGreaterThan(0);
    expect(['Good', 'Fair', 'Needs Attention']).toContain(state.fxHealthRating);
  });

  test('currencies sorted by value descending', () => {
    const state = computeCurrencyExposureState(DEFAULT_HOLDINGS);
    for (let i = 1; i < state.currencies.length; i++) {
      expect(state.currencies[i - 1].value).toBeGreaterThanOrEqual(state.currencies[i].value);
    }
  });

  test('is deterministic', () => {
    const a = computeCurrencyExposureState(DEFAULT_HOLDINGS);
    const b = computeCurrencyExposureState(DEFAULT_HOLDINGS);
    expect(a.homeBias).toBe(b.homeBias);
    expect(a.portfolioFXVol).toBe(b.portfolioFXVol);
  });
});
