import { computeFactorRotationState } from '../../../lib/engines/market/factor-rotation.js';

describe('computeFactorRotationState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeFactorRotationState(null)).toBeNull();
    expect(computeFactorRotationState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data (uses defaults)', () => {
    const state = computeFactorRotationState({});
    expect(state).not.toBeNull();
    expect(state.factors).toBeDefined();
    expect(Array.isArray(state.factors)).toBe(true);
    expect(state.leadingFactor).toBeTruthy();
    expect(state.rotationSignal).toBeTruthy();
    expect(state.regime).toBeTruthy();
    expect(state.implication).toBeTruthy();
  });

  test('factors sorted by 3m return descending', () => {
    const state = computeFactorRotationState({});
    for (let i = 1; i < state.factors.length; i++) {
      expect(state.factors[i - 1].return3m).toBeGreaterThanOrEqual(state.factors[i].return3m);
    }
  });

  test('each factor has required fields', () => {
    const state = computeFactorRotationState({});
    state.factors.forEach(f => {
      expect(f.name).toBeTruthy();
      expect(typeof f.return1m).toBe('number');
      expect(typeof f.return3m).toBe('number');
      expect(typeof f.momentum).toBe('number');
      expect(f.signal).toBeTruthy();
    });
  });

  test('classifies strong signal correctly', () => {
    const state = computeFactorRotationState({
      factorReturns: { test: { return1m: 3.0, return3m: 5.0 } },
    });
    expect(state.factors[0].signal).toBe('strong');
  });

  test('classifies weak signal correctly', () => {
    const state = computeFactorRotationState({
      factorReturns: { test: { return1m: -2.0, return3m: -4.0 } },
    });
    expect(state.factors[0].signal).toBe('weak');
  });

  test('detects extreme dispersion rotation signal', () => {
    const state = computeFactorRotationState({
      factorReturns: {
        value: { return1m: 5, return3m: 10 },
        growth: { return1m: -5, return3m: -5 },
      },
    });
    expect(state.rotationSignal).toBe('extreme');
  });

  test('detects low dispersion rotation signal', () => {
    const state = computeFactorRotationState({
      factorReturns: {
        value: { return1m: 0.5, return3m: 1 },
        growth: { return1m: 0.3, return3m: 0.5 },
      },
    });
    expect(state.rotationSignal).toBe('low');
  });

  test('leading factor matches top 3m return', () => {
    const state = computeFactorRotationState({
      factorReturns: {
        value: { return1m: 1, return3m: 8 },
        growth: { return1m: 2, return3m: 3 },
      },
    });
    expect(state.leadingFactor).toBe('value');
  });

  test('is deterministic', () => {
    const a = computeFactorRotationState({});
    const b = computeFactorRotationState({});
    expect(a.leadingFactor).toBe(b.leadingFactor);
    expect(a.rotationSignal).toBe(b.rotationSignal);
  });
});
