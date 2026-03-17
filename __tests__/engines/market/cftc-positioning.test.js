import { computeCFTCPositioningState } from '../../../lib/engines/market/cftc-positioning.js';

describe('computeCFTCPositioningState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCFTCPositioningState(null)).toBeNull();
    expect(computeCFTCPositioningState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data (uses defaults)', () => {
    const state = computeCFTCPositioningState({});
    expect(state).not.toBeNull();
    expect(state.positions).toBeDefined();
    expect(Array.isArray(state.positions)).toBe(true);
    expect(state.positions.length).toBeGreaterThan(0);
    expect(state.extremes).toBeDefined();
    expect(state.contrarianSignals).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('each position has required fields', () => {
    const state = computeCFTCPositioningState({});
    state.positions.forEach(p => {
      expect(p.asset).toBeTruthy();
      expect(typeof p.netLong).toBe('number');
      expect(typeof p.percentile).toBe('number');
      expect(p.crowdedness).toBeTruthy();
    });
  });

  test('classifies extremely crowded long for percentile >= 90', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [{ asset: 'Test', netLong: 200000, percentile: 95 }],
    });
    expect(state.positions[0].crowdedness).toBe('extremely crowded long');
  });

  test('classifies extremely crowded short for percentile <= 10', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [{ asset: 'Test', netLong: -200000, percentile: 5 }],
    });
    expect(state.positions[0].crowdedness).toBe('extremely crowded short');
  });

  test('classifies neutral for mid-range percentiles', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [{ asset: 'Test', netLong: 50000, percentile: 50 }],
    });
    expect(state.positions[0].crowdedness).toBe('neutral');
  });

  test('extremes contain only positions with percentile >= 90 or <= 10', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [
        { asset: 'A', netLong: 100, percentile: 95 },
        { asset: 'B', netLong: 100, percentile: 50 },
        { asset: 'C', netLong: -100, percentile: 5 },
      ],
    });
    expect(state.extremes.length).toBe(2);
    expect(state.extremes.map(e => e.asset)).toContain('A');
    expect(state.extremes.map(e => e.asset)).toContain('C');
  });

  test('contrarian signals generated for extremes', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [{ asset: 'Gold', netLong: 300000, percentile: 95 }],
    });
    expect(state.contrarianSignals.length).toBe(1);
    expect(state.contrarianSignals[0].signal).toContain('contrarian short');
  });

  test('multiple extremes trigger mean-reversion warning', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [
        { asset: 'A', percentile: 95 },
        { asset: 'B', percentile: 5 },
        { asset: 'C', percentile: 92 },
      ],
    });
    expect(state.implication).toContain('Multiple positioning extremes');
  });

  test('percentile clamped to 0-100', () => {
    const state = computeCFTCPositioningState({
      cftcPositions: [{ asset: 'Test', netLong: 100, percentile: 150 }],
    });
    expect(state.positions[0].percentile).toBeLessThanOrEqual(100);
  });

  test('is deterministic', () => {
    const a = computeCFTCPositioningState({});
    const b = computeCFTCPositioningState({});
    expect(a.positions.length).toBe(b.positions.length);
    expect(a.extremes.length).toBe(b.extremes.length);
  });
});
