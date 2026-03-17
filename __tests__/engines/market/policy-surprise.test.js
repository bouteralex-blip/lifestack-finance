import { computePolicySurpriseState } from '../../../lib/engines/market/policy-surprise.js';

describe('computePolicySurpriseState', () => {
  test('returns null for null/undefined input', () => {
    expect(computePolicySurpriseState(null)).toBeNull();
    expect(computePolicySurpriseState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data (uses defaults)', () => {
    const state = computePolicySurpriseState({});
    expect(state).not.toBeNull();
    expect(state.surprises).toBeDefined();
    expect(Array.isArray(state.surprises)).toBe(true);
    expect(typeof state.netSurpriseIndex).toBe('number');
    expect(state.implication).toBeTruthy();
  });

  test('each surprise has required fields', () => {
    const state = computePolicySurpriseState({});
    state.surprises.forEach(s => {
      expect(s.event).toBeTruthy();
      expect(s.direction).toBeTruthy();
      expect(typeof s.magnitude).toBe('number');
      expect(s.marketImpact).toBeTruthy();
    });
  });

  test('inline events have zero magnitude', () => {
    const state = computePolicySurpriseState({
      policyEvents: [{ event: 'Fed', expected: 'hold', actual: 'hold', impact: 0 }],
    });
    expect(state.surprises[0].direction).toBe('inline');
    expect(state.surprises[0].magnitude).toBe(0);
  });

  test('high impact events classified as high market impact', () => {
    const state = computePolicySurpriseState({
      policyEvents: [{ event: 'Shock', expected: 'a', actual: 'b', impact: 60 }],
    });
    expect(state.surprises[0].marketImpact).toBe('high');
  });

  test('net surprise index clamped to -100 to 100', () => {
    const state = computePolicySurpriseState({
      policyEvents: [
        { event: 'A', expected: 'x', actual: 'y', impact: 80 },
        { event: 'B', expected: 'x', actual: 'y', impact: 80 },
      ],
    });
    expect(state.netSurpriseIndex).toBeLessThanOrEqual(100);
    expect(state.netSurpriseIndex).toBeGreaterThanOrEqual(-100);
  });

  test('hawkish net surprise triggers risk warning', () => {
    const state = computePolicySurpriseState({
      policyEvents: [{ event: 'A', expected: 'x', actual: 'y', impact: 50 }],
    });
    expect(state.implication).toContain('hawkish');
  });

  test('identifies recent shock from significant surprises', () => {
    const state = computePolicySurpriseState({
      policyEvents: [{ event: 'Big Event', expected: 'a', actual: 'b', impact: 40 }],
    });
    expect(state.recentShock).not.toBeNull();
    expect(state.recentShock.event).toBe('Big Event');
  });

  test('no recent shock when all impacts below 20', () => {
    const state = computePolicySurpriseState({
      policyEvents: [{ event: 'Small', expected: 'a', actual: 'b', impact: 10 }],
    });
    expect(state.recentShock).toBeNull();
  });

  test('is deterministic', () => {
    const a = computePolicySurpriseState({});
    const b = computePolicySurpriseState({});
    expect(a.netSurpriseIndex).toBe(b.netSurpriseIndex);
    expect(a.surprises.length).toBe(b.surprises.length);
  });
});
