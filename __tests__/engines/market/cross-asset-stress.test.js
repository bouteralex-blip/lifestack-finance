import { computeCrossAssetStressState } from '../../../lib/engines/market/cross-asset-stress.js';
import { DEFAULT_MARKET } from '../../../lib/defaults.js';

describe('computeCrossAssetStressState', () => {
  test('returns null for null input', () => {
    expect(computeCrossAssetStressState(null)).toBeNull();
  });

  test('returns complete state for default market data', () => {
    const state = computeCrossAssetStressState(DEFAULT_MARKET);
    expect(state).not.toBeNull();
    expect(state.compositeScore).toBeGreaterThanOrEqual(0);
    expect(state.compositeScore).toBeLessThanOrEqual(100);
    expect(['CALM', 'MODERATE', 'ELEVATED', 'EXTREME']).toContain(state.compositeLevel);
    expect(state.compositeColor).toBeTruthy();
    expect(state.compositeAction).toBeTruthy();
    expect(state.assets).toHaveLength(7); // vix, move, igOAS, hyOAS, dxy, brent, gold
    expect(state.topStressors).toBeDefined();
    expect(state.topStressors.length).toBeLessThanOrEqual(3);
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(state.contagionRisk);
    expect(state.timestamp).toBeTruthy();
  });

  test('each asset has score, level, and weight', () => {
    const state = computeCrossAssetStressState(DEFAULT_MARKET);
    state.assets.forEach(a => {
      expect(a.key).toBeTruthy();
      expect(a.label).toBeTruthy();
      expect(a.score).toBeGreaterThanOrEqual(0);
      expect(['CALM', 'MODERATE', 'ELEVATED', 'EXTREME']).toContain(a.level);
      expect(a.weight).toBeGreaterThan(0);
    });
  });

  test('extreme market conditions produce high composite score', () => {
    const extreme = {
      vix: 50, move: 180, igOAS: 200, hyOAS: 700,
      dxy: 110, brent: 120, gold: 6000,
    };
    const state = computeCrossAssetStressState(extreme);
    expect(state.compositeScore).toBeGreaterThan(60);
    expect(state.compositeLevel).toBe('EXTREME');
  });

  test('calm market conditions produce low composite score', () => {
    const calm = {
      vix: 12, move: 70, igOAS: 60, hyOAS: 200,
      dxy: 95, brent: 75, gold: 2500,
    };
    const state = computeCrossAssetStressState(calm);
    expect(state.compositeScore).toBeLessThan(30);
    expect(state.compositeLevel).toBe('CALM');
  });

  test('is deterministic', () => {
    const a = computeCrossAssetStressState(DEFAULT_MARKET);
    const b = computeCrossAssetStressState(DEFAULT_MARKET);
    expect(a.compositeScore).toBe(b.compositeScore);
    expect(a.compositeLevel).toBe(b.compositeLevel);
    expect(a.contagionRisk).toBe(b.contagionRisk);
  });

  test('handles zero/missing values gracefully', () => {
    const state = computeCrossAssetStressState({});
    expect(state).not.toBeNull();
    expect(state.compositeScore).toBeGreaterThanOrEqual(0);
  });
});
