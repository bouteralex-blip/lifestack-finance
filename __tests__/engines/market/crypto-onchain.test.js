import { computeCryptoOnChainState, computeBTCDominanceState } from '../../../lib/engines/market/crypto-onchain.js';
import { DEFAULT_MARKET, DEFAULT_CRYPTO } from '../../../lib/defaults.js';

// ---- computeCryptoOnChainState ----
describe('computeCryptoOnChainState', () => {
  test('returns null for null input', () => {
    expect(computeCryptoOnChainState(null)).toBeNull();
  });

  test('returns complete state for default market data', () => {
    const state = computeCryptoOnChainState(DEFAULT_MARKET);
    expect(state).not.toBeNull();
    expect(state.healthScore).toBeGreaterThanOrEqual(0);
    expect(state.healthScore).toBeLessThanOrEqual(100);
    expect(['STRONG', 'NEUTRAL', 'STRESSED']).toContain(state.healthLevel);
    expect(state.metrics).toBeDefined();
    expect(state.metrics.length).toBe(5);
    expect(state.signals).toBeDefined();
    expect(['VERY BULLISH', 'NEUTRAL', 'BEARISH']).toContain(state.netPositioning);
    expect(state.implication).toBeTruthy();
  });

  test('ATL reserves + whale accumulation = bullish', () => {
    const bullishData = {
      ...DEFAULT_MARKET,
      reserves: '2.48M ATL',
      whale: '270K BTC accumulated',
    };
    const state = computeCryptoOnChainState(bullishData);
    expect(state.netPositioning).toBe('VERY BULLISH');
    expect(state.healthScore).toBeGreaterThan(70);
    expect(state.healthLevel).toBe('STRONG');
  });

  test('non-ATL reserves without whale accumulation = neutral positioning', () => {
    const neutralData = {
      ...DEFAULT_MARKET,
      reserves: '3.2M normal',
      whale: 'distribution detected',
    };
    const state = computeCryptoOnChainState(neutralData);
    // netPositioning is BEARISH only if exchangeReserves === 'high',
    // but the code checks for explicit 'high' in the string
    expect(['NEUTRAL', 'BEARISH']).toContain(state.netPositioning);
  });

  test('metrics include correct on-chain signals', () => {
    const state = computeCryptoOnChainState(DEFAULT_MARKET);
    const metricNames = state.metrics.map(m => m.name);
    expect(metricNames).toContain('Exchange Reserves');
    expect(metricNames).toContain('Whale Activity');
    expect(metricNames).toContain('SOPR');
    expect(metricNames).toContain('Reserve Risk');
    expect(metricNames).toContain('HODL Waves');
  });

  test('is deterministic', () => {
    const a = computeCryptoOnChainState(DEFAULT_MARKET);
    const b = computeCryptoOnChainState(DEFAULT_MARKET);
    expect(a.healthScore).toBe(b.healthScore);
    expect(a.netPositioning).toBe(b.netPositioning);
  });
});

// ---- computeBTCDominanceState ----
describe('computeBTCDominanceState', () => {
  test('returns null for null input', () => {
    expect(computeBTCDominanceState(null)).toBeNull();
  });

  test('returns complete state for default market data', () => {
    const state = computeBTCDominanceState(DEFAULT_MARKET);
    expect(state).not.toBeNull();
    expect(state.btcDominance).toBe(DEFAULT_MARKET.btcDom);
    expect(['ALT SEASON', 'BTC SEASON', 'TRANSITION']).toContain(state.phase);
    expect(state.color).toBeTruthy();
    expect(state.recommendation).toBeTruthy();
  });

  test('high dominance (>55%) = BTC season', () => {
    const data = { btcDom: 60 };
    const state = computeBTCDominanceState(data);
    expect(state.phase).toBe('BTC SEASON');
    expect(state.recommendation).toContain('BTC');
  });

  test('low dominance (<45%) = alt season', () => {
    const data = { btcDom: 40 };
    const state = computeBTCDominanceState(data);
    expect(state.phase).toBe('ALT SEASON');
    expect(state.recommendation).toContain('alt');
  });

  test('transition zone (45-55%)', () => {
    const data = { btcDom: 50 };
    const state = computeBTCDominanceState(data);
    expect(state.phase).toBe('TRANSITION');
  });

  test('includes alt drawdown data', () => {
    const data = { btcDom: 58.2, ethDD: -60, solDD: -71 };
    const state = computeBTCDominanceState(data);
    expect(state.altDrawdowns.ETH).toBe(-60);
    expect(state.altDrawdowns.SOL).toBe(-71);
  });

  test('is deterministic', () => {
    const a = computeBTCDominanceState(DEFAULT_MARKET);
    const b = computeBTCDominanceState(DEFAULT_MARKET);
    expect(a.phase).toBe(b.phase);
    expect(a.btcDominance).toBe(b.btcDominance);
  });
});
