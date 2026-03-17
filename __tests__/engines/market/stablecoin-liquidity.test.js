import { computeStablecoinLiquidityState } from '../../../lib/engines/market/stablecoin-liquidity.js';

describe('computeStablecoinLiquidityState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeStablecoinLiquidityState(null)).toBeNull();
    expect(computeStablecoinLiquidityState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeStablecoinLiquidityState({});
    expect(state).not.toBeNull();
    expect(state.totalSupply).toBeDefined();
    expect(state.usdtSupply).toBeDefined();
    expect(state.usdcSupply).toBeDefined();
    expect(state.dominance).toBeDefined();
    expect(state.dominanceZone).toBeTruthy();
    expect(state.dominanceSignal).toBeTruthy();
    expect(state.dexTVL).toBeDefined();
    expect(state.dexLiquidity).toBeTruthy();
    expect(state.dryPowder).toBeTruthy();
    expect(state.liquidityScore).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies high dominance zone correctly', () => {
    const state = computeStablecoinLiquidityState({ stablecoinDom: 14 });
    expect(state.dominanceZone).toBe('HIGH');
  });

  test('classifies low dominance zone correctly', () => {
    const state = computeStablecoinLiquidityState({ stablecoinDom: 3 });
    expect(state.dominanceZone).toBe('LOW');
  });

  test('classifies strong DEX TVL correctly', () => {
    const state = computeStablecoinLiquidityState({ dexTVL: 200 });
    expect(state.dexLiquidity).toBe('STRONG');
  });

  test('classifies critical DEX TVL correctly', () => {
    const state = computeStablecoinLiquidityState({ dexTVL: 20 });
    expect(state.dexLiquidity).toBe('CRITICAL');
  });

  test('detects high dry powder conditions', () => {
    const state = computeStablecoinLiquidityState({
      usdtSupply: 100, usdcSupply: 50,
      prevStablecoinSupply: 130, // ~15% growth
      stablecoinDom: 10,
    });
    expect(state.dryPowder).toBe('high');
    expect(state.implication).toContain('Stablecoin supply expanding');
  });

  test('detects low dry powder conditions', () => {
    const state = computeStablecoinLiquidityState({
      usdtSupply: 100, usdcSupply: 50,
      prevStablecoinSupply: 160, // shrinking
      stablecoinDom: 3,
    });
    expect(state.dryPowder).toBe('low');
    expect(state.implication).toContain('Stablecoin supply flat or shrinking');
  });

  test('totalSupply sums USDT and USDC', () => {
    const state = computeStablecoinLiquidityState({ usdtSupply: 80, usdcSupply: 30 });
    expect(state.totalSupply).toBe(110);
  });

  test('liquidity score stays in 0-100 range', () => {
    const high = computeStablecoinLiquidityState({ usdtSupply: 200, usdcSupply: 100, stablecoinDom: 20, dexTVL: 300 });
    expect(high.liquidityScore).toBeGreaterThanOrEqual(0);
    expect(high.liquidityScore).toBeLessThanOrEqual(100);

    const low = computeStablecoinLiquidityState({ usdtSupply: 10, usdcSupply: 5, stablecoinDom: 1, dexTVL: 10 });
    expect(low.liquidityScore).toBeGreaterThanOrEqual(0);
    expect(low.liquidityScore).toBeLessThanOrEqual(100);
  });

  test('is deterministic', () => {
    const input = { usdtSupply: 85, usdcSupply: 35, stablecoinDom: 7, dexTVL: 100 };
    const a = computeStablecoinLiquidityState(input);
    const b = computeStablecoinLiquidityState(input);
    expect(a.liquidityScore).toBe(b.liquidityScore);
    expect(a.dryPowder).toBe(b.dryPowder);
  });
});
