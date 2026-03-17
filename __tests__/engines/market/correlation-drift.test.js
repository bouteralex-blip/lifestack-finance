import { computeCorrelationDriftState } from '../../../lib/engines/market/correlation-drift.js';

describe('computeCorrelationDriftState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCorrelationDriftState(null)).toBeNull();
    expect(computeCorrelationDriftState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCorrelationDriftState({});
    expect(state).not.toBeNull();
    expect(state.pairs).toBeDefined();
    expect(Array.isArray(state.pairs)).toBe(true);
    expect(state.pairs.length).toBe(4);
    expect(state.regimeBreak).toBeDefined();
    expect(state.diversificationScore).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('each pair has required fields', () => {
    const state = computeCorrelationDriftState({});
    state.pairs.forEach(p => {
      expect(p.pair).toBeTruthy();
      expect(typeof p.current).toBe('number');
      expect(typeof p.historical).toBe('number');
      expect(typeof p.drift).toBe('number');
      expect(p.regime).toBeTruthy();
    });
  });

  test('detects regime break for large correlation drift', () => {
    const state = computeCorrelationDriftState({
      correlations: { stockBond: 0.30, stockGold: -0.10, stockBTC: 0.45, bondGold: 0.20 },
    });
    // stockBond historical is -0.30, current 0.30, drift = 0.60 > 0.40 => regime break
    expect(state.regimeBreak).toBe(true);
    expect(state.implication).toContain('regime break');
  });

  test('no regime break for stable correlations', () => {
    const state = computeCorrelationDriftState({
      correlations: { stockBond: -0.25, stockGold: -0.05, stockBTC: 0.50, bondGold: 0.22 },
    });
    expect(state.regimeBreak).toBe(false);
  });

  test('diversification score stays in 0-100 range', () => {
    const state = computeCorrelationDriftState({
      correlations: { stockBond: 0.9, stockGold: 0.9, stockBTC: 0.9, bondGold: 0.9 },
    });
    expect(state.diversificationScore).toBeGreaterThanOrEqual(0);
    expect(state.diversificationScore).toBeLessThanOrEqual(100);
  });

  test('low correlation yields high diversification score', () => {
    const low = computeCorrelationDriftState({
      correlations: { stockBond: -0.3, stockGold: 0.0, stockBTC: 0.1, bondGold: 0.1 },
    });
    const high = computeCorrelationDriftState({
      correlations: { stockBond: 0.8, stockGold: 0.7, stockBTC: 0.9, bondGold: 0.8 },
    });
    expect(low.diversificationScore).toBeGreaterThan(high.diversificationScore);
  });

  test('rising stock-bond correlation triggers bond hedge warning', () => {
    const state = computeCorrelationDriftState({
      correlations: { stockBond: 0.20, stockGold: -0.10, stockBTC: 0.45, bondGold: 0.20 },
    });
    expect(state.implication.toLowerCase()).toContain('correlation');
  });

  test('is deterministic', () => {
    const input = { correlations: { stockBond: -0.15, stockGold: 0.05, stockBTC: 0.55, bondGold: 0.25 } };
    const a = computeCorrelationDriftState(input);
    const b = computeCorrelationDriftState(input);
    expect(a.diversificationScore).toBe(b.diversificationScore);
    expect(a.regimeBreak).toBe(b.regimeBreak);
  });
});
