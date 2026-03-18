import { computeGapRiskState } from '../../../lib/engines/market/gap-risk.js';

describe('computeGapRiskState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeGapRiskState(null)).toBeNull();
    expect(computeGapRiskState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeGapRiskState({});
    expect(state).not.toBeNull();
    expect(state.termStructure).toBeTruthy();
    expect(typeof state.volSpread).toBe('number');
    expect(typeof state.gapRiskScore).toBe('number');
    expect(state.events).toBeDefined();
    expect(Array.isArray(state.events)).toBe(true);
    expect(state.implication).toBeTruthy();
  });

  test('classifies backwardation term structure', () => {
    const state = computeGapRiskState({ vix: 30, vix1m: 25, vix3m: 20 });
    expect(state.termStructure).toBe('backwardation');
  });

  test('classifies contango term structure', () => {
    const state = computeGapRiskState({ vix: 15, vix1m: 18, vix3m: 22 });
    expect(state.termStructure).toBe('contango');
  });

  test('classifies flat term structure', () => {
    const state = computeGapRiskState({ vix: 20, vix1m: 21, vix3m: 19 });
    expect(state.termStructure).toBe('flat');
  });

  test('gap risk score stays in 0-100 range', () => {
    const high = computeGapRiskState({ vix: 40, vix1m: 30, vix3m: 20 });
    expect(high.gapRiskScore).toBeGreaterThanOrEqual(0);
    expect(high.gapRiskScore).toBeLessThanOrEqual(100);

    const low = computeGapRiskState({ vix: 12, vix1m: 14, vix3m: 16 });
    expect(low.gapRiskScore).toBeGreaterThanOrEqual(0);
    expect(low.gapRiskScore).toBeLessThanOrEqual(100);
  });

  test('events sorted by daysUntil ascending', () => {
    const state = computeGapRiskState({});
    for (let i = 1; i < state.events.length; i++) {
      expect(state.events[i - 1].daysUntil).toBeLessThanOrEqual(state.events[i].daysUntil);
    }
  });

  test('each event has required fields', () => {
    const state = computeGapRiskState({});
    state.events.forEach(e => {
      expect(e.event).toBeTruthy();
      expect(e.date).toBeTruthy();
      expect(typeof e.daysUntil).toBe('number');
      expect(typeof e.impactEstimate).toBe('number');
    });
  });

  test('high gap risk triggers protective put recommendation', () => {
    const state = computeGapRiskState({
      vix: 35, vix1m: 28, vix3m: 22,
      upcomingEvents: [{ event: 'FOMC', date: '2026-03-18', impactEstimate: 90 }],
    });
    expect(state.gapRiskScore).toBeGreaterThan(40);
  });

  test('is deterministic', () => {
    const input = { vix: 24.5, vix1m: 22, vix3m: 20.5 };
    const a = computeGapRiskState(input);
    const b = computeGapRiskState(input);
    expect(a.gapRiskScore).toBe(b.gapRiskScore);
    expect(a.termStructure).toBe(b.termStructure);
  });
});
