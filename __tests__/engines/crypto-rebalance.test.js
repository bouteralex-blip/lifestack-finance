import { computeCryptoRebalanceState } from '../../lib/engines/crypto-rebalance.js';

const CRYPTO_HOLDINGS = [
  { name: 'BTC', ticker: 'BTC', val: 30000, sleeve: 'Crypto' },
  { name: 'ETH', ticker: 'ETH', val: 10000, sleeve: 'Crypto' },
  { name: 'SOL', ticker: 'SOL', val: 5000, sleeve: 'Crypto' },
  { name: 'AVAX', ticker: 'AVAX', val: 5000, sleeve: 'Crypto' },
];

const NON_CRYPTO_HOLDINGS = [
  { name: 'VWRL', ticker: 'VWRL', val: 50000, sleeve: 'Equity' },
  { name: 'Cash', ticker: 'GBP', val: 10000, sleeve: 'Cash' },
];

describe('computeCryptoRebalanceState', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(computeCryptoRebalanceState(null)).toBeNull();
    expect(computeCryptoRebalanceState(undefined)).toBeNull();
    expect(computeCryptoRebalanceState([])).toBeNull();
  });

  test('returns null for holdings with no crypto', () => {
    expect(computeCryptoRebalanceState(NON_CRYPTO_HOLDINGS)).toBeNull();
  });

  test('returns complete state for crypto holdings', () => {
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.totalCryptoValue).toBeGreaterThan(0);
    expect(state.allocations).toBeDefined();
    expect(Array.isArray(state.allocations)).toBe(true);
    expect(state.trades).toBeDefined();
    expect(state.maxDrift).toBeDefined();
    expect(state.needsRebalance).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('allocations sum to approximately 100%', () => {
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    const totalActual = state.allocations.reduce((sum, a) => sum + a.actual, 0);
    expect(totalActual).toBeCloseTo(100, 0);
  });

  test('detects drift from default targets (BTC 70%)', () => {
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    // BTC is 30000/50000 = 60%, target is 70%, so drift = -10
    const btcAlloc = state.allocations.find(a => a.asset === 'BTC');
    expect(btcAlloc).toBeDefined();
    expect(btcAlloc.actual).toBe(60);
    expect(btcAlloc.drift).toBe(-10);
    expect(btcAlloc.direction).toBe('UW');
  });

  test('generates trade recommendations for meaningful drifts', () => {
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    expect(state.trades.length).toBeGreaterThan(0);
    state.trades.forEach(t => {
      expect(['BUY', 'SELL']).toContain(t.action);
      expect(t.amount).toBeGreaterThan(0);
      expect(t.pct).toBeGreaterThan(1);
    });
  });

  test('respects custom targets', () => {
    const customTargets = { BTC: 50, ETH: 30, SOL: 10, OTHER: 10 };
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS, customTargets);
    const btcAlloc = state.allocations.find(a => a.asset === 'BTC');
    expect(btcAlloc.target).toBe(50);
  });

  test('maps canonical tickers correctly (IBIT -> BTC)', () => {
    const holdings = [
      { name: 'iShares BTC ETF', ticker: 'IBIT', val: 35000, sleeve: 'Crypto' },
      { name: 'ETH', ticker: 'ETH', val: 10000, sleeve: 'Crypto' },
      { name: 'SOL', ticker: 'SOL', val: 5000, sleeve: 'Crypto' },
    ];
    const state = computeCryptoRebalanceState(holdings);
    const btcAlloc = state.allocations.find(a => a.asset === 'BTC');
    expect(btcAlloc).toBeDefined();
    expect(btcAlloc.actualValue).toBe(35000);
  });

  test('returns null for zero-value crypto holdings', () => {
    const zeroHoldings = [{ name: 'BTC', ticker: 'BTC', val: 0, sleeve: 'Crypto' }];
    expect(computeCryptoRebalanceState(zeroHoldings)).toBeNull();
  });

  test('allocations sorted by absolute drift descending', () => {
    const state = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    for (let i = 1; i < state.allocations.length; i++) {
      expect(state.allocations[i - 1].absDrift).toBeGreaterThanOrEqual(state.allocations[i].absDrift);
    }
  });

  test('is deterministic', () => {
    const a = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    const b = computeCryptoRebalanceState(CRYPTO_HOLDINGS);
    expect(a.totalCryptoValue).toBe(b.totalCryptoValue);
    expect(a.maxDrift).toBe(b.maxDrift);
    expect(a.trades.length).toBe(b.trades.length);
  });
});
