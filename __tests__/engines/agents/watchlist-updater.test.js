import { computeWatchlistState } from '../../../lib/engines/agents/watchlist-updater.js';

const MOCK_MARKET_DATA = {
  prices: {
    NVDA: { price: 850, change: 25, changePct: 3.0, volume: 50000000 },
    BTC: { price: 95000, change: -2000, changePct: -2.1, volume: 1000000 },
    VWRL: { price: 112.5, change: 0.3, changePct: 0.27, volume: 200000 },
  },
};

const MOCK_WATCHLIST = [
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', alertBelow: 700, alertAbove: 900 },
  { ticker: 'BTC', name: 'Bitcoin', sector: 'Crypto', alertBelow: 80000, alertAbove: 100000 },
  { ticker: 'VWRL', name: 'Vanguard FTSE All-World', sector: 'ETF', alertBelow: null, alertAbove: null },
];

describe('computeWatchlistState', () => {
  test('returns null for null/undefined marketData', () => {
    expect(computeWatchlistState(null, null)).toBeNull();
    expect(computeWatchlistState([], undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    expect(result).not.toBeNull();
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBe(3);
    expect(typeof result.alertCount).toBe('number');
    expect(result.lastUpdated).toBeTruthy();
    expect(result.totalItems).toBe(3);
  });

  test('each item has required fields', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    result.items.forEach(item => {
      expect(item.ticker).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.sector).toBeTruthy();
      expect(typeof item.price).toBe('number');
      expect(typeof item.changePct).toBe('number');
      expect(item.signal).toBeTruthy();
    });
  });

  test('detects alert triggers', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    // NVDA at 850 is below alertAbove 900, above alertBelow 700 — no trigger
    const nvda = result.items.find(i => i.ticker === 'NVDA');
    expect(nvda.alertTriggered).toBe(false);
  });

  test('classifies strong price moves', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    const nvda = result.items.find(i => i.ticker === 'NVDA');
    expect(nvda.signal).toBe('Gaining');
  });

  test('classifies flat price moves', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    const vwrl = result.items.find(i => i.ticker === 'VWRL');
    expect(vwrl.signal).toBe('Flat');
  });

  test('identifies top mover', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    expect(result.topMover).not.toBeNull();
    expect(result.topMover.ticker).toBeTruthy();
    expect(typeof result.topMover.changePct).toBe('number');
  });

  test('uses default watchlist when none provided', () => {
    const result = computeWatchlistState(null, MOCK_MARKET_DATA);
    expect(result).not.toBeNull();
    expect(result.items.length).toBeGreaterThan(0);
  });

  test('handles missing price data gracefully', () => {
    const result = computeWatchlistState(MOCK_WATCHLIST, { prices: {} });
    expect(result).not.toBeNull();
    result.items.forEach(item => {
      expect(item.signal).toBe('No data');
    });
  });

  test('is deterministic', () => {
    const a = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    const b = computeWatchlistState(MOCK_WATCHLIST, MOCK_MARKET_DATA);
    expect(a.alertCount).toBe(b.alertCount);
    expect(a.topMover?.ticker).toBe(b.topMover?.ticker);
  });
});
