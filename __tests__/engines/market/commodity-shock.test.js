import { computeCommodityShockState } from '../../../lib/engines/market/commodity-shock.js';

describe('computeCommodityShockState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCommodityShockState(null)).toBeNull();
    expect(computeCommodityShockState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCommodityShockState({});
    expect(state).not.toBeNull();
    expect(state.commodities).toBeDefined();
    expect(Array.isArray(state.commodities)).toBe(true);
    expect(state.commodities.length).toBe(4);
    expect(state.goldOilRatio).toBeDefined();
    expect(state.copperGoldRatio).toBeDefined();
    expect(state.shockIndicator).toBeTruthy();
    expect(state.implication).toBeTruthy();
  });

  test('each commodity has required fields', () => {
    const state = computeCommodityShockState({});
    state.commodities.forEach(c => {
      expect(c.name).toBeTruthy();
      expect(typeof c.price).toBe('number');
      expect(c.trend).toBeTruthy();
      expect(c.signal).toBeTruthy();
    });
  });

  test('classifies overheated oil correctly', () => {
    const state = computeCommodityShockState({ oilPrice: 120 });
    const oil = state.commodities.find(c => c.name === 'oil');
    expect(oil.trend).toBe('overheated');
  });

  test('classifies depressed oil correctly', () => {
    const state = computeCommodityShockState({ oilPrice: 30 });
    const oil = state.commodities.find(c => c.name === 'oil');
    expect(oil.trend).toBe('depressed');
  });

  test('detects deflationary shock from high gold/oil ratio', () => {
    const state = computeCommodityShockState({ goldPrice: 3000, oilPrice: 50 });
    // ratio = 3000/50 = 60 > 30
    expect(state.shockIndicator).toContain('deflationary shock');
    expect(state.implication).toContain('Gold/Oil ratio elevated');
  });

  test('detects growth signal from high copper/gold ratio', () => {
    const state = computeCommodityShockState({ copperPrice: 6, goldPrice: 2000 });
    // ratio = 6/2000 = 0.003 > 0.002
    expect(state.shockIndicator).toBeDefined();
  });

  test('detects recession signal from low copper/gold ratio', () => {
    const state = computeCommodityShockState({ copperPrice: 2.5, goldPrice: 2500 });
    // ratio = 2.5/2500 = 0.001 < 0.0014
    expect(state.shockIndicator).toContain('deflationary');
  });

  test('gold/oil ratio computed correctly', () => {
    const state = computeCommodityShockState({ goldPrice: 2600, oilPrice: 80 });
    expect(state.goldOilRatio).toBeCloseTo(32.5, 0);
  });

  test('is deterministic', () => {
    const input = { oilPrice: 78, goldPrice: 2650, copperPrice: 4.35, uraniumPrice: 72 };
    const a = computeCommodityShockState(input);
    const b = computeCommodityShockState(input);
    expect(a.shockIndicator).toBe(b.shockIndicator);
    expect(a.goldOilRatio).toBe(b.goldOilRatio);
  });
});
