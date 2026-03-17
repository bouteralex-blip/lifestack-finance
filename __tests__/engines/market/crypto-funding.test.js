import { computeCryptoFundingState } from '../../../lib/engines/market/crypto-funding.js';

describe('computeCryptoFundingState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCryptoFundingState(null)).toBeNull();
    expect(computeCryptoFundingState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCryptoFundingState({});
    expect(state).not.toBeNull();
    expect(state.funding).toBeDefined();
    expect(state.funding.btc).toBeDefined();
    expect(state.funding.eth).toBeDefined();
    expect(state.funding.aggregate).toBeDefined();
    expect(state.basis).toBeDefined();
    expect(state.leverage).toBeTruthy();
    expect(state.compositeScore).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies extreme short crowding correctly', () => {
    const state = computeCryptoFundingState({ btcFunding: -0.05, ethFunding: -0.04 });
    expect(state.funding.btc.signal).toBe('EXTREME SHORT CROWDING');
    expect(state.funding.btc.bias).toBe('contrarian_bullish');
  });

  test('classifies extreme long crowding correctly', () => {
    const state = computeCryptoFundingState({ btcFunding: 0.05, ethFunding: 0.04 });
    expect(state.funding.btc.signal).toBe('EXTREME LONG CROWDING');
    expect(state.funding.btc.bias).toBe('contrarian_bearish');
  });

  test('classifies neutral funding correctly', () => {
    const state = computeCryptoFundingState({ btcFunding: 0.005, ethFunding: 0.005 });
    expect(state.funding.btc.signal).toBe('NEUTRAL');
    expect(state.funding.btc.bias).toBe('neutral');
  });

  test('classifies backwardation in basis correctly', () => {
    const state = computeCryptoFundingState({ btcBasis: -2, ethBasis: -1 });
    expect(state.basis.btc.signal).toBe('BACKWARDATION');
    expect(state.basis.btc.condition).toBe('capitulation');
  });

  test('classifies extreme contango correctly', () => {
    const state = computeCryptoFundingState({ btcBasis: 20, ethBasis: 18 });
    expect(state.basis.btc.signal).toBe('EXTREME CONTANGO');
    expect(state.basis.btc.condition).toBe('overheated');
  });

  test('detects overleveraged conditions', () => {
    const state = computeCryptoFundingState({
      btcFunding: 0.04, ethFunding: 0.03,
      btcBasis: 16, ethBasis: 14,
    });
    expect(state.leverage).toBe('overleveraged');
    expect(state.implication).toContain('overleveraged');
  });

  test('detects underleveraged conditions', () => {
    const state = computeCryptoFundingState({
      btcFunding: -0.02, ethFunding: -0.02,
      btcBasis: 1, ethBasis: 1,
    });
    expect(state.leverage).toBe('underleveraged');
    expect(state.implication).toContain('underleveraged');
  });

  test('composite score stays in 0-100 range', () => {
    const extreme = computeCryptoFundingState({ btcFunding: 0.1, ethFunding: 0.1, btcBasis: 30, ethBasis: 30 });
    expect(extreme.compositeScore).toBeGreaterThanOrEqual(0);
    expect(extreme.compositeScore).toBeLessThanOrEqual(100);
  });

  test('is deterministic', () => {
    const input = { btcFunding: 0.01, ethFunding: 0.005, btcBasis: 8, ethBasis: 6 };
    const a = computeCryptoFundingState(input);
    const b = computeCryptoFundingState(input);
    expect(a.compositeScore).toBe(b.compositeScore);
    expect(a.leverage).toBe(b.leverage);
  });
});
