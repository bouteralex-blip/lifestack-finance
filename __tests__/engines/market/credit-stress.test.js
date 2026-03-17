import { computeCreditStressState } from '../../../lib/engines/market/credit-stress.js';
import { DEFAULT_MARKET, DEFAULT_CREDIT_TL } from '../../../lib/defaults.js';

describe('computeCreditStressState', () => {
  test('returns null for null market data', () => {
    expect(computeCreditStressState(null)).toBeNull();
  });

  test('returns complete state for default market data', () => {
    const state = computeCreditStressState(DEFAULT_MARKET, DEFAULT_CREDIT_TL);
    expect(state).not.toBeNull();
    expect(state.ig).toBeDefined();
    expect(state.ig.oas).toBe(DEFAULT_MARKET.igOAS);
    expect(state.hy).toBeDefined();
    expect(state.hy.oas).toBe(DEFAULT_MARKET.hyOAS);
    expect(state.bbb).toBeDefined();
    expect(state.bbb.oas).toBe(DEFAULT_MARKET.bbbOAS);
    expect(typeof state.hyIgSpread).toBe('number');
    expect(['COMPRESSED', 'NORMAL', 'DECOMPRESSED']).toContain(state.spreadCompression);
    expect(typeof state.compositeScore).toBe('number');
    expect(state.compositeScore).toBeGreaterThanOrEqual(0);
    expect(['BENIGN', 'NORMAL', 'STRESSED', 'CRISIS']).toContain(state.compositeLevel);
    expect(['stable', 'widening', 'tightening']).toContain(state.trend);
    expect(state.portfolioImplication).toBeTruthy();
    expect(state.timeline).toBeDefined();
  });

  test('classifies spreads by level', () => {
    const state = computeCreditStressState(DEFAULT_MARKET, DEFAULT_CREDIT_TL);
    // IG at 95 => NORMAL (80-120)
    expect(state.ig.level).toBe('NORMAL');
    // HY at 340 => NORMAL (250-400)
    expect(state.hy.level).toBe('NORMAL');
    // BBB at 145 => NORMAL (100-160)
    expect(state.bbb.level).toBe('NORMAL');
  });

  test('crisis-level spreads produce high composite score', () => {
    const crisis = { igOAS: 300, hyOAS: 900, bbbOAS: 400 };
    const state = computeCreditStressState(crisis);
    expect(state.compositeScore).toBeGreaterThan(60);
    expect(state.compositeLevel).toBe('CRISIS');
    expect(state.portfolioImplication).toContain('Reduce');
  });

  test('tight spreads produce low composite score', () => {
    const tight = { igOAS: 50, hyOAS: 180, bbbOAS: 60 };
    const state = computeCreditStressState(tight);
    expect(state.compositeScore).toBeLessThan(25);
    expect(state.compositeLevel).toBe('BENIGN');
  });

  test('detects widening trend from timeline', () => {
    const timeline = [
      { d: 'Jan', ig: 80, hy: 300 },
      { d: 'Feb', ig: 95, hy: 340 },
    ];
    const state = computeCreditStressState(DEFAULT_MARKET, timeline);
    expect(state.trend).toBe('widening');
  });

  test('detects tightening trend from timeline', () => {
    const timeline = [
      { d: 'Jan', ig: 120, hy: 400 },
      { d: 'Feb', ig: 95, hy: 340 },
    ];
    const state = computeCreditStressState(DEFAULT_MARKET, timeline);
    expect(state.trend).toBe('tightening');
  });

  test('stable trend when spread change is small', () => {
    const timeline = [
      { d: 'Jan', ig: 93, hy: 338 },
      { d: 'Feb', ig: 95, hy: 340 },
    ];
    const state = computeCreditStressState(DEFAULT_MARKET, timeline);
    expect(state.trend).toBe('stable');
  });

  test('is deterministic', () => {
    const a = computeCreditStressState(DEFAULT_MARKET, DEFAULT_CREDIT_TL);
    const b = computeCreditStressState(DEFAULT_MARKET, DEFAULT_CREDIT_TL);
    expect(a.compositeScore).toBe(b.compositeScore);
    expect(a.compositeLevel).toBe(b.compositeLevel);
    expect(a.trend).toBe(b.trend);
  });
});
