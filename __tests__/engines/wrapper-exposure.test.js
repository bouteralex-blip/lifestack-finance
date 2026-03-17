import {
  computeWrapperExposureState,
  inferWrapper,
  segmentByWrapper,
  estimateCGTDrag,
  computeWrapperEfficiency,
  identifyReallocationOpps,
} from '../../lib/engines/wrapper-exposure.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- inferWrapper ----
describe('inferWrapper', () => {
  test('returns GIA for null input', () => {
    expect(inferWrapper(null)).toBe('GIA');
  });

  test('detects Pension from name', () => {
    expect(inferWrapper({ name: 'Daiwa Pension' })).toBe('Pension');
  });

  test('detects ISA from name', () => {
    expect(inferWrapper({ name: 'My ISA Fund' })).toBe('ISA');
  });

  test('detects SIPP from name', () => {
    expect(inferWrapper({ name: 'SIPP Holdings' })).toBe('SIPP');
  });

  test('defaults to GIA for unrecognized names', () => {
    expect(inferWrapper({ name: 'BTC (Bitcoin)' })).toBe('GIA');
  });

  test('uses explicit wrapper property if present', () => {
    expect(inferWrapper({ name: 'Something', wrapper: 'ISA' })).toBe('ISA');
  });
});

// ---- segmentByWrapper ----
describe('segmentByWrapper', () => {
  test('returns empty object for null/empty input', () => {
    expect(segmentByWrapper(null)).toEqual({});
    expect(segmentByWrapper([])).toEqual({});
  });

  test('segments default holdings into wrappers', () => {
    const segments = segmentByWrapper(DEFAULT_HOLDINGS);
    expect(Object.keys(segments).length).toBeGreaterThan(0);
    // Should have at least Pension and GIA
    expect(segments['Pension']).toBeDefined();
    expect(segments['GIA']).toBeDefined();
  });

  test('weights sum to approximately 100', () => {
    const segments = segmentByWrapper(DEFAULT_HOLDINGS);
    const totalWeight = Object.values(segments).reduce((s, w) => s + w.weight, 0);
    expect(totalWeight).toBeCloseTo(100, 0);
  });
});

// ---- estimateCGTDrag ----
describe('estimateCGTDrag', () => {
  test('returns zero drag for empty GIA holdings', () => {
    const result = estimateCGTDrag([]);
    expect(result.annualDrag).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  test('computes positive drag for GIA holdings', () => {
    const holdings = [{ name: 'A', value: 100000, cls: 'ETF' }];
    const result = estimateCGTDrag(holdings);
    expect(result.annualDrag).toBeGreaterThanOrEqual(0);
    expect(result.estimatedGains).toBeGreaterThan(0);
  });

  test('respects CGT allowance', () => {
    // Small enough gains that allowance covers everything
    const result = estimateCGTDrag([{ name: 'A', value: 1000, cls: 'ETF' }]);
    expect(result.annualDrag).toBe(0); // gains should be below allowance
  });
});

// ---- computeWrapperEfficiency ----
describe('computeWrapperEfficiency', () => {
  test('returns zero score for empty segments', () => {
    expect(computeWrapperEfficiency({}).score).toBe(0);
  });

  test('100% ISA gives score of 10', () => {
    const segments = { ISA: { value: 100000 } };
    const result = computeWrapperEfficiency(segments);
    expect(result.score).toBe(10);
    expect(result.taxEfficientPct).toBe(100);
  });

  test('100% GIA gives score of 0', () => {
    const segments = { GIA: { value: 100000 } };
    const result = computeWrapperEfficiency(segments);
    expect(result.score).toBe(0);
    expect(result.giaExposurePct).toBe(100);
  });

  test('mixed wrappers give intermediate score', () => {
    const segments = {
      ISA: { value: 50000 },
      GIA: { value: 50000 },
    };
    const result = computeWrapperEfficiency(segments);
    expect(result.score).toBe(5);
  });
});

// ---- computeWrapperExposureState (master function) ----
describe('computeWrapperExposureState', () => {
  test('returns null for null/empty input', () => {
    expect(computeWrapperExposureState(null)).toBeNull();
    expect(computeWrapperExposureState([])).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const state = computeWrapperExposureState(DEFAULT_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.totalValue).toBeGreaterThan(0);
    expect(state.wrappers.length).toBeGreaterThan(0);
    expect(state.efficiency).toBeDefined();
    expect(state.efficiency.score).toBeGreaterThanOrEqual(0);
    expect(state.cgtDrag).toBeDefined();
    expect(state.structuralAlphaOpportunity).toBeTruthy();
  });

  test('is deterministic', () => {
    const a = computeWrapperExposureState(DEFAULT_HOLDINGS);
    const b = computeWrapperExposureState(DEFAULT_HOLDINGS);
    expect(a.totalValue).toBe(b.totalValue);
    expect(a.efficiency.score).toBe(b.efficiency.score);
  });

  test('reallocation opportunities respect ISA allowance', () => {
    const state = computeWrapperExposureState(DEFAULT_HOLDINGS, 5000);
    const totalTransfer = state.reallocationOpportunities.reduce((s, o) => s + o.transferAmount, 0);
    expect(totalTransfer).toBeLessThanOrEqual(5000);
  });
});
