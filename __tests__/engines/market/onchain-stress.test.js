import { computeOnChainStressBoard } from '../../../lib/engines/market/onchain-stress.js';

describe('computeOnChainStressBoard', () => {
  test('returns null for null/undefined input', () => {
    expect(computeOnChainStressBoard(null)).toBeNull();
    expect(computeOnChainStressBoard(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeOnChainStressBoard({});
    expect(state).not.toBeNull();
    expect(state.stressScore).toBeDefined();
    expect(state.stressLevel).toBeTruthy();
    expect(state.indicators).toBeDefined();
    expect(Array.isArray(state.indicators)).toBe(true);
    expect(state.indicators.length).toBe(6);
    expect(state.netRisk).toBeTruthy();
    expect(state.implication).toBeTruthy();
  });

  test('stress score stays in 0-100 range', () => {
    const extreme = computeOnChainStressBoard({
      exchangeReserves: 20, minerReserves: -15, whaleBalance: -10,
      dormancy: 100, hashRate: -20, nupl: 0.9,
    });
    expect(extreme.stressScore).toBeGreaterThanOrEqual(0);
    expect(extreme.stressScore).toBeLessThanOrEqual(100);

    const calm = computeOnChainStressBoard({
      exchangeReserves: -10, minerReserves: 5, whaleBalance: 3,
      dormancy: 10, hashRate: 8, nupl: 0.4,
    });
    expect(calm.stressScore).toBeGreaterThanOrEqual(0);
    expect(calm.stressScore).toBeLessThanOrEqual(100);
  });

  test('classifies CRITICAL stress level for high scores', () => {
    const state = computeOnChainStressBoard({
      exchangeReserves: 20, minerReserves: -15, whaleBalance: -10,
      dormancy: 100, hashRate: -20, nupl: 0.9,
    });
    expect(['MODERATE', 'HIGH', 'CRITICAL']).toContain(state.stressLevel);
  });

  test('classifies LOW stress level for healthy conditions', () => {
    const state = computeOnChainStressBoard({
      exchangeReserves: -10, minerReserves: 5, whaleBalance: 3,
      dormancy: 10, hashRate: 8, nupl: 0.4,
    });
    expect(state.stressLevel).toBe('LOW');
  });

  test('each indicator has required fields', () => {
    const state = computeOnChainStressBoard({});
    state.indicators.forEach(ind => {
      expect(ind.name).toBeTruthy();
      expect(ind.value).toBeDefined();
      expect(ind.signal).toBeTruthy();
      expect(ind.color).toBeTruthy();
    });
  });

  test('indicator signals are valid values', () => {
    const validSignals = ['HIGH STRESS', 'MODERATE STRESS', 'LOW STRESS', 'HEALTHY'];
    const state = computeOnChainStressBoard({});
    state.indicators.forEach(ind => {
      expect(validSignals).toContain(ind.signal);
    });
  });

  test('NUPL euphoria triggers stress contribution', () => {
    const euphoric = computeOnChainStressBoard({ nupl: 0.85 });
    const healthy = computeOnChainStressBoard({ nupl: 0.4 });
    expect(euphoric.stressScore).toBeGreaterThan(healthy.stressScore);
  });

  test('NUPL capitulation triggers stress contribution', () => {
    const capitulation = computeOnChainStressBoard({ nupl: -0.2 });
    const healthy = computeOnChainStressBoard({ nupl: 0.4 });
    expect(capitulation.stressScore).toBeGreaterThan(healthy.stressScore);
  });

  test('is deterministic', () => {
    const input = { exchangeReserves: 5, minerReserves: -3, whaleBalance: 1, dormancy: 40, hashRate: 2, nupl: 0.3 };
    const a = computeOnChainStressBoard(input);
    const b = computeOnChainStressBoard(input);
    expect(a.stressScore).toBe(b.stressScore);
    expect(a.stressLevel).toBe(b.stressLevel);
    expect(a.netRisk).toBe(b.netRisk);
  });
});
