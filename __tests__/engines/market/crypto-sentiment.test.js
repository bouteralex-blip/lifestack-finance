import { computeCryptoSentimentState } from '../../../lib/engines/market/crypto-sentiment.js';

describe('computeCryptoSentimentState', () => {
  test('returns null for null/undefined input', () => {
    expect(computeCryptoSentimentState(null)).toBeNull();
    expect(computeCryptoSentimentState(undefined)).toBeNull();
  });

  test('returns complete state for empty market data', () => {
    const state = computeCryptoSentimentState({});
    expect(state).not.toBeNull();
    expect(state.fearGreed).toBeDefined();
    expect(state.sentimentZone).toBeTruthy();
    expect(state.sentimentColor).toBeTruthy();
    expect(state.divergenceType).toBeTruthy();
    expect(state.divergenceStrength).toBeTruthy();
    expect(state.contrarian).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('classifies extreme fear zone correctly', () => {
    const state = computeCryptoSentimentState({ fearGreed: 5 });
    expect(state.sentimentZone).toBe('EXTREME FEAR');
  });

  test('classifies extreme greed zone correctly', () => {
    const state = computeCryptoSentimentState({ fearGreed: 95 });
    expect(state.sentimentZone).toBe('EXTREME GREED');
  });

  test('detects bullish divergence (fear + positive flows)', () => {
    const state = computeCryptoSentimentState({
      fearGreed: 10, btcETFFlow: 300, btcDD: -40,
    });
    expect(state.divergenceType).toBe('bullish_divergence');
    expect(state.implication).toContain('Bullish divergence');
  });

  test('detects bearish divergence (greed + outflows)', () => {
    const state = computeCryptoSentimentState({
      fearGreed: 90, btcETFFlow: -200, btcDD: -5,
    });
    expect(state.divergenceType).toBe('bearish_divergence');
    expect(state.implication).toContain('Bearish divergence');
  });

  test('returns no divergence for neutral sentiment', () => {
    const state = computeCryptoSentimentState({ fearGreed: 50, btcETFFlow: 0 });
    expect(state.divergenceType).toBe('none');
  });

  test('contrarian direction is BUY on bullish divergence with strong score', () => {
    const state = computeCryptoSentimentState({
      fearGreed: 10, btcETFFlow: 300,
    });
    expect(state.contrarian.direction).toBe('BUY');
    expect(state.contrarian.score).toBeGreaterThan(20);
  });

  test('contrarian direction is SELL on bearish divergence with strong score', () => {
    const state = computeCryptoSentimentState({
      fearGreed: 90, btcETFFlow: -300,
    });
    expect(state.contrarian.direction).toBe('SELL');
    expect(state.contrarian.score).toBeLessThan(-20);
  });

  test('fear/greed is clamped to 0-100', () => {
    const high = computeCryptoSentimentState({ fearGreed: 150 });
    expect(high.fearGreed).toBeLessThanOrEqual(100);

    const low = computeCryptoSentimentState({ fearGreed: -50 });
    expect(low.fearGreed).toBeGreaterThanOrEqual(0);
  });

  test('is deterministic', () => {
    const input = { fearGreed: 30, btcETFFlow: 100, btcDD: -20, socialSentiment: 40 };
    const a = computeCryptoSentimentState(input);
    const b = computeCryptoSentimentState(input);
    expect(a.sentimentZone).toBe(b.sentimentZone);
    expect(a.divergenceType).toBe(b.divergenceType);
    expect(a.contrarian.score).toBe(b.contrarian.score);
  });
});
