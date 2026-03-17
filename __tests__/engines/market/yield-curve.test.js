import { computeYieldCurveState } from '../../../lib/engines/market/yield-curve.js';
import { DEFAULT_YIELD_CURVE } from '../../../lib/defaults.js';

describe('computeYieldCurveState', () => {
  test('returns null for null/empty input', () => {
    expect(computeYieldCurveState(null)).toBeNull();
    expect(computeYieldCurveState([])).toBeNull();
  });

  test('returns null if 2Y or 10Y missing', () => {
    const partial = [{ t: '3M', uk: 3.72, us: 4.35 }];
    expect(computeYieldCurveState(partial)).toBeNull();
  });

  test('returns complete state for default yield curve', () => {
    const state = computeYieldCurveState(DEFAULT_YIELD_CURVE, 'UK');
    expect(state).not.toBeNull();
    expect(state.country).toBe('UK');
    expect(['INVERTED', 'FLAT', 'STEEP', 'NORMAL']).toContain(state.shape);
    expect(state.signal).toBeTruthy();
    expect(state.implication).toBeTruthy();
    expect(typeof state.spread2s10s).toBe('number');
    expect(typeof state.steepnessScore).toBe('number');
    expect(state.steepnessScore).toBeGreaterThanOrEqual(0);
    expect(state.steepnessScore).toBeLessThanOrEqual(10);
    expect(state.keyRates).toBeDefined();
    expect(state.keyRates.twoYear).toBeDefined();
    expect(state.keyRates.tenYear).toBeDefined();
    expect(state.points.length).toBe(DEFAULT_YIELD_CURVE.length);
    expect(['Short duration', 'Long duration', 'Neutral']).toContain(state.durationBias);
  });

  test('UK default curve is normal (10Y > 2Y)', () => {
    const state = computeYieldCurveState(DEFAULT_YIELD_CURVE, 'UK');
    // UK: 2Y=3.80, 10Y=4.62, spread=0.82 => NORMAL
    expect(state.spread2s10s).toBeCloseTo(0.82, 1);
    expect(state.isInverted).toBe(false);
    expect(state.shape).toBe('NORMAL');
  });

  test('detects inverted curve', () => {
    const inverted = [
      { t: '2Y', uk: 5.0, us: 5.0 },
      { t: '10Y', uk: 4.0, us: 4.0 },
      { t: '30Y', uk: 3.5, us: 3.5 },
    ];
    const state = computeYieldCurveState(inverted, 'UK');
    expect(state.isInverted).toBe(true);
    expect(state.shape).toBe('INVERTED');
    expect(state.signal).toContain('Recession');
    expect(state.durationBias).toBe('Short duration');
  });

  test('detects steep curve', () => {
    const steep = [
      { t: '2Y', uk: 2.0, us: 2.0 },
      { t: '10Y', uk: 4.5, us: 4.5 },
      { t: '30Y', uk: 5.5, us: 5.5 },
    ];
    const state = computeYieldCurveState(steep, 'UK');
    expect(state.shape).toBe('STEEP');
    expect(state.durationBias).toBe('Long duration');
  });

  test('detects flat curve', () => {
    const flat = [
      { t: '2Y', uk: 4.0, us: 4.0 },
      { t: '10Y', uk: 4.1, us: 4.1 },
    ];
    const state = computeYieldCurveState(flat, 'UK');
    expect(state.shape).toBe('FLAT');
  });

  test('is deterministic', () => {
    const a = computeYieldCurveState(DEFAULT_YIELD_CURVE, 'UK');
    const b = computeYieldCurveState(DEFAULT_YIELD_CURVE, 'UK');
    expect(a.spread2s10s).toBe(b.spread2s10s);
    expect(a.shape).toBe(b.shape);
    expect(a.steepnessScore).toBe(b.steepnessScore);
  });

  test('computes spread between UK and US yields', () => {
    const state = computeYieldCurveState(DEFAULT_YIELD_CURVE, 'UK');
    state.points.forEach(p => {
      if (p.uk !== null && p.us !== null) {
        expect(p.spread).toBeCloseTo(p.uk - p.us, 1);
      }
    });
  });
});
