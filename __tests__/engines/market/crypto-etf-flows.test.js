import { computeCryptoETFFlowState } from '../../../lib/engines/market/crypto-etf-flows.js';

describe('computeCryptoETFFlowState', () => {
  test('returns null for null input', () => {
    expect(computeCryptoETFFlowState(null)).toBeNull();
    expect(computeCryptoETFFlowState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCryptoETFFlowState({});
    expect(state).not.toBeNull();
    expect(state.btcFlows).toBeDefined();
    expect(state.ethFlows).toBeDefined();
    expect(state.netSentiment).toBeTruthy();
    expect(state.netSentimentScore).toBeDefined();
    expect(state.combinedDaily).toBeDefined();
    expect(state.combinedAUM).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies strong BTC inflows as VERY BULLISH', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: 600, btcETFAUM: 50 });
    expect(state.btcFlows.trend).toBe('VERY BULLISH');
  });

  test('classifies strong outflows as VERY BEARISH', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: -300, btcETFAUM: 50 });
    expect(state.btcFlows.trend).toBe('VERY BEARISH');
  });

  test('classifies neutral flows correctly', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: 0, ethETFFlow: 0 });
    expect(state.btcFlows.trend).toBe('NEUTRAL');
    expect(state.ethFlows.trend).toBe('NEUTRAL');
  });

  test('net sentiment score stays in 0-100 range', () => {
    const extremePositive = computeCryptoETFFlowState({ btcETFFlow: 2000, ethETFFlow: 1000 });
    expect(extremePositive.netSentimentScore).toBeGreaterThanOrEqual(0);
    expect(extremePositive.netSentimentScore).toBeLessThanOrEqual(100);

    const extremeNegative = computeCryptoETFFlowState({ btcETFFlow: -2000, ethETFFlow: -1000 });
    expect(extremeNegative.netSentimentScore).toBeGreaterThanOrEqual(0);
    expect(extremeNegative.netSentimentScore).toBeLessThanOrEqual(100);
  });

  test('combined daily sums BTC and ETH flows', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: 200, ethETFFlow: 100 });
    expect(state.combinedDaily).toBe(300);
  });

  test('combined AUM sums BTC and ETH AUM', () => {
    const state = computeCryptoETFFlowState({ btcETFAUM: 50, ethETFAUM: 10 });
    expect(state.combinedAUM).toBe(60);
  });

  test('momentum is computed correctly from daily and AUM', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: 100, btcETFAUM: 10 });
    // momentum = (100 / (10 * 1000)) * 100 = 1.0
    expect(state.btcFlows.momentum).toBe(1);
  });

  test('implication reflects high inflow sentiment', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: 800, ethETFFlow: 400 });
    expect(state.implication).toContain('Institutional flows strongly positive');
  });

  test('implication reflects outflow conditions', () => {
    const state = computeCryptoETFFlowState({ btcETFFlow: -500, ethETFFlow: -300 });
    expect(state.implication).toContain('Institutional outflows detected');
  });

  test('is deterministic — same input produces same output', () => {
    const input = { btcETFFlow: 250, ethETFFlow: 50, btcETFAUM: 40, ethETFAUM: 8 };
    const a = computeCryptoETFFlowState(input);
    const b = computeCryptoETFFlowState(input);
    expect(a.netSentimentScore).toBe(b.netSentimentScore);
    expect(a.btcFlows.trend).toBe(b.btcFlows.trend);
  });
});
