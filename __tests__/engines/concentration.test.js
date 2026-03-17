import {
  computeConcentrationState,
  computeHHI,
  computeEffectivePositions,
  rankByWeight,
  identifyClutter,
  flagConcentrationViolations,
} from '../../lib/engines/concentration.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- computeHHI ----
describe('computeHHI', () => {
  test('returns 0 for null/empty input', () => {
    expect(computeHHI(null)).toBe(0);
    expect(computeHHI([])).toBe(0);
    expect(computeHHI(undefined)).toBe(0);
  });

  test('computes correct HHI for default holdings', () => {
    const hhi = computeHHI(DEFAULT_HOLDINGS);
    expect(hhi).toBeGreaterThan(0);
    expect(hhi).toBeLessThan(10000);
    // With 22 diversified positions, HHI should be relatively low
    expect(hhi).toBeLessThan(1500);
  });

  test('returns 10000 for a single-position portfolio', () => {
    const single = [{ name: 'Only', val: 100000 }];
    expect(computeHHI(single)).toBe(10000);
  });

  test('returns ~5000 for two equally-weighted positions', () => {
    const two = [{ name: 'A', val: 50000 }, { name: 'B', val: 50000 }];
    expect(computeHHI(two)).toBe(5000);
  });

  test('returns 0 if total value is 0 or negative', () => {
    expect(computeHHI([{ name: 'A', val: 0 }])).toBe(0);
  });
});

// ---- computeEffectivePositions ----
describe('computeEffectivePositions', () => {
  test('returns 0 for zero or null HHI', () => {
    expect(computeEffectivePositions(0)).toBe(0);
    expect(computeEffectivePositions(null)).toBe(0);
    expect(computeEffectivePositions(-5)).toBe(0);
  });

  test('returns 1 for HHI of 10000', () => {
    expect(computeEffectivePositions(10000)).toBe(1);
  });

  test('returns 2 for HHI of 5000', () => {
    expect(computeEffectivePositions(5000)).toBe(2);
  });

  test('returns correct value for default holdings HHI', () => {
    const hhi = computeHHI(DEFAULT_HOLDINGS);
    const effPos = computeEffectivePositions(hhi);
    expect(effPos).toBeGreaterThan(5);
    expect(effPos).toBeLessThan(22); // Can't exceed actual count meaningfully
  });
});

// ---- rankByWeight ----
describe('rankByWeight', () => {
  test('returns empty array for null/empty input', () => {
    expect(rankByWeight(null)).toEqual([]);
    expect(rankByWeight([])).toEqual([]);
  });

  test('ranks default holdings in descending weight order', () => {
    const ranked = rankByWeight(DEFAULT_HOLDINGS);
    expect(ranked.length).toBe(DEFAULT_HOLDINGS.length);
    // First element should have highest weight
    expect(ranked[0].weight).toBeGreaterThanOrEqual(ranked[1].weight);
    // Ranks should be sequential
    expect(ranked[0].rank).toBe(1);
    expect(ranked[ranked.length - 1].rank).toBe(ranked.length);
  });

  test('cumWeight of last element should be approximately 100', () => {
    const ranked = rankByWeight(DEFAULT_HOLDINGS);
    const last = ranked[ranked.length - 1];
    expect(last.cumWeight).toBeCloseTo(100, 0);
  });

  test('returns empty for zero-value holdings', () => {
    expect(rankByWeight([{ name: 'A', val: 0 }])).toEqual([]);
  });
});

// ---- identifyClutter ----
describe('identifyClutter', () => {
  test('returns zero count for null/empty input', () => {
    const result = identifyClutter(null);
    expect(result.count).toBe(0);
    expect(result.holdings).toEqual([]);
  });

  test('identifies clutter positions in default holdings', () => {
    const result = identifyClutter(DEFAULT_HOLDINGS, 1.0);
    // All positions below 1% weight are clutter
    expect(result.count).toBeGreaterThanOrEqual(0);
    if (result.count > 0) {
      expect(result.totalWeight).toBeLessThan(10);
      result.holdings.forEach(h => {
        expect(h.weight).toBeLessThan(1.0);
        expect(h.recommendation).toBeTruthy();
      });
    }
  });

  test('with high threshold, most positions become clutter', () => {
    const result = identifyClutter(DEFAULT_HOLDINGS, 50);
    // Almost all positions should be below 50%
    expect(result.count).toBe(DEFAULT_HOLDINGS.length);
  });

  test('with threshold 0, nothing is clutter', () => {
    const result = identifyClutter(DEFAULT_HOLDINGS, 0);
    expect(result.count).toBe(0);
  });

  test('marks very small positions for liquidation', () => {
    const holdings = [
      { name: 'Big', val: 100000 },
      { name: 'Tiny', val: 100 },
    ];
    const result = identifyClutter(holdings, 1.0);
    expect(result.count).toBe(1);
    expect(result.holdings[0].recommendation).toBe('Liquidate');
  });
});

// ---- flagConcentrationViolations ----
describe('flagConcentrationViolations', () => {
  test('returns empty violations for null/empty input', () => {
    const result = flagConcentrationViolations(null);
    expect(result.violations).toEqual([]);
    expect(result.score).toBe(10);
  });

  test('detects violations in a concentrated portfolio', () => {
    const concentrated = [
      { name: 'A', val: 60000, cls: 'ETF', geo: 'US' },
      { name: 'B', val: 30000, cls: 'ETF', geo: 'US' },
      { name: 'C', val: 10000, cls: 'Cash', geo: 'UK' },
    ];
    const result = flagConcentrationViolations(concentrated);
    expect(result.violations.length).toBeGreaterThan(0);
    // A is 60%, should trigger single_position violation
    const singleViolation = result.violations.find(v => v.type === 'single_position');
    expect(singleViolation).toBeTruthy();
    expect(singleViolation.actual).toBe(60);
    expect(result.score).toBeLessThan(10);
  });

  test('no violations for well-diversified portfolio', () => {
    const diversified = Array.from({ length: 20 }, (_, i) => ({
      name: `Pos${i}`, val: 5000, cls: `Cls${i % 5}`, geo: `Geo${i % 5}`,
    }));
    const result = flagConcentrationViolations(diversified);
    expect(result.violations.length).toBe(0);
    expect(result.score).toBe(10);
  });

  test('respects custom limits', () => {
    const holdings = [
      { name: 'A', val: 20000, cls: 'ETF', geo: 'UK' },
      { name: 'B', val: 80000, cls: 'ETF', geo: 'UK' },
    ];
    // With a low cap, more violations appear
    const result = flagConcentrationViolations(holdings, { singlePositionCap: 10 });
    expect(result.violations.some(v => v.type === 'single_position')).toBe(true);
  });
});

// ---- computeConcentrationState (master function) ----
describe('computeConcentrationState', () => {
  test('returns null for null/empty input', () => {
    expect(computeConcentrationState(null)).toBeNull();
    expect(computeConcentrationState([])).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const state = computeConcentrationState(DEFAULT_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.hhi).toBeGreaterThan(0);
    expect(state.effectivePositions).toBeGreaterThan(0);
    expect(state.totalPositions).toBe(DEFAULT_HOLDINGS.length);
    expect(state.top3Weight).toBeGreaterThan(0);
    expect(state.top5Weight).toBeGreaterThanOrEqual(state.top3Weight);
    expect(state.top10Weight).toBeGreaterThanOrEqual(state.top5Weight);
    expect(state.top3).toHaveLength(3);
    expect(state.top5).toHaveLength(5);
    expect(state.clutter).toBeDefined();
    expect(state.violations).toBeDefined();
    expect(state.concentrationScore).toBeDefined();
    expect(['Well Diversified', 'Moderate', 'Concentrated', 'Highly Concentrated'])
      .toContain(state.diversificationRating);
  });

  test('is deterministic — same input produces same output', () => {
    const a = computeConcentrationState(DEFAULT_HOLDINGS);
    const b = computeConcentrationState(DEFAULT_HOLDINGS);
    expect(a.hhi).toBe(b.hhi);
    expect(a.effectivePositions).toBe(b.effectivePositions);
    expect(a.top3Weight).toBe(b.top3Weight);
    expect(a.concentrationScore).toBe(b.concentrationScore);
  });

  test('single holding produces maximum concentration', () => {
    const single = [{ name: 'Solo', val: 100000, cls: 'ETF', geo: 'US' }];
    const state = computeConcentrationState(single);
    expect(state.hhi).toBe(10000);
    expect(state.effectivePositions).toBe(1);
    expect(state.diversificationRating).toBe('Highly Concentrated');
  });
});
