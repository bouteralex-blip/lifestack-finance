import {
  computeSleeveExposureState,
  classifyToSleeve,
  computeSleeveWeights,
  computeSleeveDeviations,
  computeSleeveRisk,
  flagDeviations,
} from '../../lib/engines/sleeve-exposure.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- classifyToSleeve ----
describe('classifyToSleeve', () => {
  test('returns Unknown for null input', () => {
    expect(classifyToSleeve(null)).toBe('Unknown');
  });

  test('classifies ETF correctly', () => {
    expect(classifyToSleeve({ cls: 'ETF' })).toBe('Equity');
  });

  test('classifies Crypto correctly', () => {
    expect(classifyToSleeve({ cls: 'Crypto' })).toBe('Crypto');
  });

  test('returns Other for unknown class', () => {
    expect(classifyToSleeve({ cls: 'AlienAsset' })).toBe('Other');
  });
});

// ---- computeSleeveWeights ----
describe('computeSleeveWeights', () => {
  test('returns empty array for null/empty input', () => {
    expect(computeSleeveWeights(null)).toEqual([]);
    expect(computeSleeveWeights([])).toEqual([]);
  });

  test('weights sum to approximately 100 for default holdings', () => {
    const sleeves = computeSleeveWeights(DEFAULT_HOLDINGS);
    const totalWeight = sleeves.reduce((s, sl) => s + sl.weight, 0);
    expect(totalWeight).toBeCloseTo(100, 0);
  });

  test('sorted by value descending', () => {
    const sleeves = computeSleeveWeights(DEFAULT_HOLDINGS);
    for (let i = 1; i < sleeves.length; i++) {
      expect(sleeves[i - 1].value).toBeGreaterThanOrEqual(sleeves[i].value);
    }
  });

  test('includes holding counts per sleeve', () => {
    const sleeves = computeSleeveWeights(DEFAULT_HOLDINGS);
    const totalCount = sleeves.reduce((s, sl) => s + sl.count, 0);
    expect(totalCount).toBe(DEFAULT_HOLDINGS.length);
  });
});

// ---- computeSleeveDeviations ----
describe('computeSleeveDeviations', () => {
  test('returns empty for empty holdings', () => {
    expect(computeSleeveDeviations([])).toEqual([]);
  });

  test('computes drift directions correctly for default holdings', () => {
    const devs = computeSleeveDeviations(DEFAULT_HOLDINGS);
    devs.forEach(d => {
      expect(['overweight', 'underweight', 'on-target']).toContain(d.driftDirection);
      expect(['significant', 'minor', 'within-tolerance']).toContain(d.driftSeverity);
      expect(d.drift).toBe(+(d.weight - d.target).toFixed(2));
    });
  });

  test('respects custom targets', () => {
    const customTargets = { Equity: 90, Crypto: 5 };
    const devs = computeSleeveDeviations(DEFAULT_HOLDINGS, customTargets);
    const equity = devs.find(d => d.name === 'Equity');
    expect(equity.target).toBe(90);
  });
});

// ---- computeSleeveRisk ----
describe('computeSleeveRisk', () => {
  test('returns empty for null/empty input', () => {
    expect(computeSleeveRisk(null)).toEqual([]);
    expect(computeSleeveRisk([])).toEqual([]);
  });

  test('adds volProxy and riskContribution to each sleeve', () => {
    const devs = computeSleeveDeviations(DEFAULT_HOLDINGS);
    const withRisk = computeSleeveRisk(devs);
    withRisk.forEach(s => {
      expect(s.volProxy).toBeGreaterThanOrEqual(0);
      expect(s.riskContribution).toBeGreaterThanOrEqual(0);
    });
    // Risk contributions should roughly sum to 100
    const totalRisk = withRisk.reduce((s, r) => s + r.riskContribution, 0);
    expect(totalRisk).toBeCloseTo(100, 0);
  });
});

// ---- flagDeviations ----
describe('flagDeviations', () => {
  test('only returns sleeves with drift exceeding threshold', () => {
    const devs = computeSleeveDeviations(DEFAULT_HOLDINGS);
    const withRisk = computeSleeveRisk(devs);
    const flagged = flagDeviations(withRisk, 2.0);
    flagged.forEach(f => {
      expect(Math.abs(f.drift)).toBeGreaterThan(2.0);
    });
  });

  test('high threshold returns fewer results', () => {
    const devs = computeSleeveDeviations(DEFAULT_HOLDINGS);
    const withRisk = computeSleeveRisk(devs);
    const low = flagDeviations(withRisk, 1.0);
    const high = flagDeviations(withRisk, 10.0);
    expect(high.length).toBeLessThanOrEqual(low.length);
  });
});

// ---- computeSleeveExposureState (master function) ----
describe('computeSleeveExposureState', () => {
  test('returns null for null/empty input', () => {
    expect(computeSleeveExposureState(null)).toBeNull();
    expect(computeSleeveExposureState([])).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const state = computeSleeveExposureState(DEFAULT_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.totalValue).toBeGreaterThan(0);
    expect(state.sleeves.length).toBeGreaterThan(0);
    expect(state.maxDrift).toBeGreaterThanOrEqual(0);
    expect(['Poor', 'Fair', 'Good', 'Excellent']).toContain(state.allocationHealth);
    expect(state.totalEquity).toBeGreaterThanOrEqual(0);
    expect(state.totalCrypto).toBeGreaterThanOrEqual(0);
    expect(state.totalCash).toBeGreaterThanOrEqual(0);
    expect(state.totalPension).toBeGreaterThanOrEqual(0);
  });

  test('is deterministic', () => {
    const a = computeSleeveExposureState(DEFAULT_HOLDINGS);
    const b = computeSleeveExposureState(DEFAULT_HOLDINGS);
    expect(a.totalValue).toBe(b.totalValue);
    expect(a.maxDrift).toBe(b.maxDrift);
    expect(a.sleeves.length).toBe(b.sleeves.length);
  });

  test('custom targets affect allocation health', () => {
    // Targets that closely match actual weights produce better health
    const sleeves = computeSleeveWeights(DEFAULT_HOLDINGS);
    const matchedTargets = {};
    sleeves.forEach(s => { matchedTargets[s.name] = s.weight; });
    const stateMatched = computeSleeveExposureState(DEFAULT_HOLDINGS, matchedTargets);
    expect(stateMatched.allocationHealth).toBe('Excellent');
  });
});
