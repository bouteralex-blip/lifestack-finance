import { computeFXRegimeState } from '../../../lib/engines/market/fx-regime.js';

describe('computeFXRegimeState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeFXRegimeState(null)).toBeNull();
    expect(computeFXRegimeState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeFXRegimeState({});
    expect(state).not.toBeNull();
    expect(state.dxy).toBeDefined();
    expect(state.dxyTrend).toBeTruthy();
    expect(state.pairs).toBeDefined();
    expect(Array.isArray(state.pairs)).toBe(true);
    expect(state.pairs.length).toBe(4);
    expect(state.regime).toBeTruthy();
    expect(state.implication).toBeTruthy();
  });

  test('classifies strong dollar (DXY > 106)', () => {
    const state = computeFXRegimeState({ dxy: 110 });
    expect(state.dxyTrend).toBe('strengthening');
    expect(state.implication).toContain('USD strength');
  });

  test('classifies weak dollar (DXY < 100)', () => {
    const state = computeFXRegimeState({ dxy: 95 });
    expect(state.dxyTrend).toBe('weakening');
    expect(state.implication).toContain('USD weakness');
  });

  test('classifies range-bound dollar', () => {
    const state = computeFXRegimeState({ dxy: 103 });
    expect(state.dxyTrend).toBe('range');
  });

  test('each pair has required fields', () => {
    const state = computeFXRegimeState({});
    state.pairs.forEach(p => {
      expect(p.pair).toBeTruthy();
      expect(typeof p.level).toBe('number');
      expect(p.trend).toBeTruthy();
      expect(p.signal).toBeTruthy();
    });
  });

  test('classifies GBP/USD strengthening above midpoint + range', () => {
    const state = computeFXRegimeState({ gbpusd: 1.35 });
    const gbp = state.pairs.find(p => p.pair === 'GBP/USD');
    expect(gbp.trend).toBe('strengthening');
  });

  test('classifies GBP/USD weakening below midpoint - range', () => {
    const state = computeFXRegimeState({ gbpusd: 1.18 });
    const gbp = state.pairs.find(p => p.pair === 'GBP/USD');
    expect(gbp.trend).toBe('weakening');
  });

  test('strong dollar regime produces correct description', () => {
    const state = computeFXRegimeState({ dxy: 110 });
    expect(state.regime).toContain('Strong dollar regime');
  });

  test('weak dollar regime produces correct description', () => {
    const state = computeFXRegimeState({ dxy: 95 });
    expect(state.regime).toContain('Weak dollar regime');
  });

  test('is deterministic', () => {
    const input = { dxy: 104, gbpusd: 1.27, eurusd: 1.08, usdjpy: 150, emfxIndex: 98 };
    const a = computeFXRegimeState(input);
    const b = computeFXRegimeState(input);
    expect(a.dxyTrend).toBe(b.dxyTrend);
    expect(a.regime).toBe(b.regime);
  });
});
