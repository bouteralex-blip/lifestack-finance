import { computeEarningsRevisionState } from '../../../lib/engines/market/earnings-revision.js';

describe('computeEarningsRevisionState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeEarningsRevisionState(null)).toBeNull();
    expect(computeEarningsRevisionState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeEarningsRevisionState({});
    expect(state).not.toBeNull();
    expect(state.breadth).toBeDefined();
    expect(state.direction).toBeTruthy();
    expect(state.forwardPE).toBeDefined();
    expect(state.earningsGrowth).toBeDefined();
    expect(state.riskLevel).toBeTruthy();
    expect(state.implication).toBeTruthy();
  });

  test('classifies upgrading direction for breadth > 55', () => {
    const state = computeEarningsRevisionState({ epsRevisionBreadth: 65 });
    expect(state.direction).toBe('upgrading');
    expect(state.implication).toContain('Earnings upgrades');
  });

  test('classifies downgrading direction for breadth < 45', () => {
    const state = computeEarningsRevisionState({ epsRevisionBreadth: 35 });
    expect(state.direction).toBe('downgrading');
  });

  test('classifies stable direction for breadth 45-55', () => {
    const state = computeEarningsRevisionState({ epsRevisionBreadth: 50 });
    expect(state.direction).toBe('stable');
  });

  test('classifies high risk for expensive + downgrading', () => {
    const state = computeEarningsRevisionState({
      epsRevisionBreadth: 35, sp500ForwardPE: 25, earningsGrowth: 3,
    });
    expect(state.riskLevel).toBe('high');
    expect(state.implication).toContain('drawdown risk');
  });

  test('classifies low risk for cheap + upgrading', () => {
    const state = computeEarningsRevisionState({
      epsRevisionBreadth: 65, sp500ForwardPE: 14, earningsGrowth: 12,
    });
    expect(state.riskLevel).toBe('low');
  });

  test('classifies elevated risk for expensive + low growth', () => {
    const state = computeEarningsRevisionState({
      epsRevisionBreadth: 50, sp500ForwardPE: 22, earningsGrowth: 3,
    });
    expect(state.riskLevel).toBe('elevated');
  });

  test('is deterministic', () => {
    const input = { epsRevisionBreadth: 48, sp500ForwardPE: 19, earningsGrowth: 8 };
    const a = computeEarningsRevisionState(input);
    const b = computeEarningsRevisionState(input);
    expect(a.direction).toBe(b.direction);
    expect(a.riskLevel).toBe(b.riskLevel);
  });
});
