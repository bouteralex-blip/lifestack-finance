import { computeLiquidityDivergenceState } from '../../../lib/engines/market/liquidity-divergence.js';

describe('computeLiquidityDivergenceState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeLiquidityDivergenceState(null)).toBeNull();
    expect(computeLiquidityDivergenceState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeLiquidityDivergenceState({});
    expect(state).not.toBeNull();
    expect(state.globalM2).toBeDefined();
    expect(state.m2MomentumSignal).toBeTruthy();
    expect(state.balanceSheetNet).toBeDefined();
    expect(state.divergence).toBeDefined();
    expect(state.divergence.region).toBeTruthy();
    expect(state.divergence.direction).toBeTruthy();
    expect(state.liquidityScore).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies expanding M2 momentum', () => {
    const state = computeLiquidityDivergenceState({ m2Growth: 5.0 });
    expect(state.m2MomentumSignal).toBe('expanding');
  });

  test('classifies contracting M2 momentum', () => {
    const state = computeLiquidityDivergenceState({ m2Growth: -3.0 });
    expect(state.m2MomentumSignal).toBe('contracting');
  });

  test('classifies neutral M2 momentum', () => {
    const state = computeLiquidityDivergenceState({ m2Growth: 1.5 });
    expect(state.m2MomentumSignal).toBe('neutral');
  });

  test('detects divergent region correctly', () => {
    const state = computeLiquidityDivergenceState({
      fedBS: 10.0, ecbBS: 6.0, bojBS: 5.0, pbocBS: 5.5,
    });
    // Fed at 10 is the outlier
    expect(state.divergence.region).toBe('Fed');
    expect(state.divergence.direction).toBe('expanding');
  });

  test('liquidity score stays in 0-100 range', () => {
    const high = computeLiquidityDivergenceState({ m2Growth: 15 });
    expect(high.liquidityScore).toBeGreaterThanOrEqual(0);
    expect(high.liquidityScore).toBeLessThanOrEqual(100);

    const low = computeLiquidityDivergenceState({ m2Growth: -10 });
    expect(low.liquidityScore).toBeGreaterThanOrEqual(0);
    expect(low.liquidityScore).toBeLessThanOrEqual(100);
  });

  test('high liquidity score triggers risk-on implication', () => {
    const state = computeLiquidityDivergenceState({ m2Growth: 8, fedBS: 9, ecbBS: 8, bojBS: 7, pbocBS: 7 });
    expect(state.liquidityScore).toBeGreaterThan(65);
    expect(state.implication).toContain('Liquidity expanding');
  });

  test('is deterministic', () => {
    const input = { m2Growth: 2.5, fedBS: 7, ecbBS: 6.5, bojBS: 5.5, pbocBS: 5.8 };
    const a = computeLiquidityDivergenceState(input);
    const b = computeLiquidityDivergenceState(input);
    expect(a.liquidityScore).toBe(b.liquidityScore);
    expect(a.divergence.region).toBe(b.divergence.region);
  });
});
