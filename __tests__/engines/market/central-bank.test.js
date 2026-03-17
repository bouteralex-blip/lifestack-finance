import { computeCentralBankState } from '../../../lib/engines/market/central-bank.js';

describe('computeCentralBankState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCentralBankState(null)).toBeNull();
    expect(computeCentralBankState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCentralBankState({});
    expect(state).not.toBeNull();
    expect(state.currentRate).toBeDefined();
    expect(state.impliedPath).toBeDefined();
    expect(state.cutsExpected).toBeDefined();
    expect(state.stance).toBeTruthy();
    expect(state.nextMeeting).toBeDefined();
    expect(state.nextMeeting.days).toBeDefined();
    expect(state.nextMeeting.expectedAction).toBeTruthy();
    expect(state.surprise).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies dovish stance with high cut probability', () => {
    const state = computeCentralBankState({ cutProbability: 80, fedFunds: 5.0, marketImpliedRate: 4.0 });
    expect(state.stance).toBe('dovish');
    expect(state.implication).toContain('Dovish');
  });

  test('classifies hawkish stance with low cut probability', () => {
    const state = computeCentralBankState({ cutProbability: 15, fedFunds: 4.5, marketImpliedRate: 4.75 });
    expect(state.stance).toBe('hawkish');
    expect(state.implication).toContain('Hawkish');
  });

  test('classifies neutral stance', () => {
    const state = computeCentralBankState({ cutProbability: 50, fedFunds: 4.5, marketImpliedRate: 4.35 });
    expect(state.stance).toBe('neutral');
  });

  test('computes cuts expected from rate differential', () => {
    const state = computeCentralBankState({ fedFunds: 5.0, marketImpliedRate: 4.0 });
    expect(state.cutsExpected).toBe(4); // (5.0 - 4.0) / 0.25
  });

  test('classifies expected action as cut for high probability', () => {
    const state = computeCentralBankState({ cutProbability: 75 });
    expect(state.nextMeeting.expectedAction).toBe('cut');
  });

  test('classifies expected action as hike for low probability', () => {
    const state = computeCentralBankState({ cutProbability: 10 });
    expect(state.nextMeeting.expectedAction).toBe('hike');
  });

  test('classifies expected action as hold for moderate probability', () => {
    const state = computeCentralBankState({ cutProbability: 50 });
    expect(state.nextMeeting.expectedAction).toBe('hold');
  });

  test('surprise magnitude stays in 0-100 range', () => {
    const state = computeCentralBankState({ fedDotMedian: 5.0, marketImpliedRate: 3.0 });
    expect(state.surprise.magnitude).toBeGreaterThanOrEqual(0);
    expect(state.surprise.magnitude).toBeLessThanOrEqual(100);
  });

  test('is deterministic', () => {
    const input = { fedFunds: 4.5, cutProbability: 55, marketImpliedRate: 4.0 };
    const a = computeCentralBankState(input);
    const b = computeCentralBankState(input);
    expect(a.stance).toBe(b.stance);
    expect(a.cutsExpected).toBe(b.cutsExpected);
  });
});
