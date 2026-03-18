import { computeNarrativePulseState } from '../../../lib/engines/market/narrative-pulse.js';

describe('computeNarrativePulseState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeNarrativePulseState(null)).toBeNull();
    expect(computeNarrativePulseState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data (uses defaults)', () => {
    const state = computeNarrativePulseState({});
    expect(state).not.toBeNull();
    expect(state.topNarratives).toBeDefined();
    expect(Array.isArray(state.topNarratives)).toBe(true);
    expect(state.topNarratives.length).toBeGreaterThan(0);
    expect(state.dominantTheme).toBeTruthy();
    expect(state.riskNarrative).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('narratives sorted by momentum descending', () => {
    const state = computeNarrativePulseState({});
    for (let i = 1; i < state.topNarratives.length; i++) {
      expect(state.topNarratives[i - 1].momentum).toBeGreaterThanOrEqual(state.topNarratives[i].momentum);
    }
  });

  test('each narrative has required fields', () => {
    const state = computeNarrativePulseState({});
    state.topNarratives.forEach(n => {
      expect(n.theme).toBeTruthy();
      expect(typeof n.momentum).toBe('number');
      expect(typeof n.sentiment).toBe('number');
      expect(n.phase).toBeTruthy();
    });
  });

  test('classifies euphoria phase correctly', () => {
    const state = computeNarrativePulseState({
      narratives: [{ theme: 'Test', momentum: 85, sentiment: 60 }],
    });
    expect(state.topNarratives[0].phase).toBe('euphoria');
  });

  test('classifies skepticism phase correctly', () => {
    const state = computeNarrativePulseState({
      narratives: [{ theme: 'Test', momentum: 55, sentiment: -20 }],
    });
    expect(state.topNarratives[0].phase).toBe('skepticism');
  });

  test('classifies exhaustion phase correctly', () => {
    const state = computeNarrativePulseState({
      narratives: [{ theme: 'Test', momentum: 20, sentiment: -30 }],
    });
    expect(state.topNarratives[0].phase).toBe('exhaustion');
  });

  test('identifies risk narrative with negative sentiment and notable momentum', () => {
    const state = computeNarrativePulseState({
      narratives: [
        { theme: 'Bull Theme', momentum: 80, sentiment: 60 },
        { theme: 'Risk Theme', momentum: 50, sentiment: -50 },
      ],
    });
    expect(state.riskNarrative).toBe('Risk Theme');
  });

  test('dominant theme is highest momentum', () => {
    const state = computeNarrativePulseState({
      narratives: [
        { theme: 'A', momentum: 30, sentiment: 10 },
        { theme: 'B', momentum: 90, sentiment: 50 },
      ],
    });
    expect(state.dominantTheme).toBe('B');
  });

  test('is deterministic', () => {
    const a = computeNarrativePulseState({});
    const b = computeNarrativePulseState({});
    expect(a.dominantTheme).toBe(b.dominantTheme);
    expect(a.topNarratives.length).toBe(b.topNarratives.length);
  });
});
