import { computeInflationShockState } from '../../../lib/engines/market/inflation-shock.js';

describe('computeInflationShockState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeInflationShockState(null)).toBeNull();
    expect(computeInflationShockState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeInflationShockState({});
    expect(state).not.toBeNull();
    expect(state.headline).toBeDefined();
    expect(state.core).toBeDefined();
    expect(state.trend).toBeTruthy();
    expect(state.breakeven).toBeDefined();
    expect(state.energyPassThrough).toBeDefined();
    expect(state.shockProbability).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies accelerating trend when CPI > core + 0.3', () => {
    const state = computeInflationShockState({ cpi: 5.0, coreCPI: 4.0, pceDeflator: 4.5 });
    expect(state.trend).toBe('accelerating');
  });

  test('classifies decelerating trend when CPI < core - 0.3', () => {
    const state = computeInflationShockState({ cpi: 2.0, coreCPI: 3.0, pceDeflator: 2.0 });
    expect(state.trend).toBe('decelerating');
  });

  test('shock probability stays in 0-100 range', () => {
    const high = computeInflationShockState({ cpi: 8, coreCPI: 7, breakeven5Y: 5, oilPrice: 150, natGasPrice: 8 });
    expect(high.shockProbability).toBeGreaterThanOrEqual(0);
    expect(high.shockProbability).toBeLessThanOrEqual(100);

    const low = computeInflationShockState({ cpi: 1.5, coreCPI: 1.5, breakeven5Y: 1.5, oilPrice: 40, natGasPrice: 1.5 });
    expect(low.shockProbability).toBeGreaterThanOrEqual(0);
    expect(low.shockProbability).toBeLessThanOrEqual(100);
  });

  test('high shock probability triggers inflation warning', () => {
    const state = computeInflationShockState({ cpi: 6, coreCPI: 5.5, breakeven5Y: 4, oilPrice: 120, natGasPrice: 6 });
    expect(state.shockProbability).toBeGreaterThan(65);
    expect(state.implication).toContain('Inflation shock risk elevated');
  });

  test('low shock probability is supportive for bonds', () => {
    const state = computeInflationShockState({ cpi: 1.5, coreCPI: 1.5, breakeven5Y: 1.5, oilPrice: 40, natGasPrice: 1.5 });
    expect(state.shockProbability).toBeLessThan(35);
    expect(state.implication).toContain('Inflation contained');
  });

  test('energy pass-through increases with high oil and gas prices', () => {
    const high = computeInflationShockState({ oilPrice: 120, natGasPrice: 6 });
    const low = computeInflationShockState({ oilPrice: 50, natGasPrice: 2 });
    expect(high.energyPassThrough).toBeGreaterThan(low.energyPassThrough);
  });

  test('is deterministic', () => {
    const input = { cpi: 3.5, coreCPI: 3.2, breakeven5Y: 2.5, oilPrice: 80, natGasPrice: 3.5 };
    const a = computeInflationShockState(input);
    const b = computeInflationShockState(input);
    expect(a.shockProbability).toBe(b.shockProbability);
    expect(a.trend).toBe(b.trend);
  });
});
