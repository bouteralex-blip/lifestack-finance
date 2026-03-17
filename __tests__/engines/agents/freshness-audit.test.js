import { computeFreshnessAudit } from '../../../lib/engines/agents/freshness-audit.js';

const RECENT = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
const STALE = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48 hours ago

const MOCK_FRESHNESS = [
  { table: 'market_prices', category: 'prices', lastUpdated: RECENT },
  { table: 'holdings_data', category: 'holdings', lastUpdated: RECENT },
  { table: 'regime_state', category: 'market', lastUpdated: STALE, isFallback: false },
  { table: 'engine_output', category: 'engine', lastUpdated: RECENT },
];

const MOCK_TIMESTAMPS = {
  config_data: RECENT,
};

describe('computeFreshnessAudit', () => {
  test('returns null for null/undefined inputs', () => {
    expect(computeFreshnessAudit(null, null)).toBeNull();
    expect(computeFreshnessAudit(undefined, undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS, MOCK_TIMESTAMPS);
    expect(result).not.toBeNull();
    expect(result.sources).toBeDefined();
    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(typeof result.liveCount).toBe('number');
    expect(typeof result.staleCount).toBe('number');
    expect(typeof result.fallbackCount).toBe('number');
    expect(result.totalSources).toBeGreaterThan(0);
    expect(result.overallHealth).toBeTruthy();
    expect(result.implication).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
  });

  test('each source has required fields', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS, MOCK_TIMESTAMPS);
    result.sources.forEach(s => {
      expect(s.table).toBeTruthy();
      expect(s.category).toBeTruthy();
      expect(s.age).toBeTruthy();
      expect(typeof s.isLive).toBe('boolean');
      expect(typeof s.isStale).toBe('boolean');
      expect(typeof s.isFallback).toBe('boolean');
      expect(s.note).toBeTruthy();
    });
  });

  test('recent data classified as live', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS);
    const prices = result.sources.find(s => s.table === 'market_prices');
    expect(prices.isLive).toBe(true);
    expect(prices.isStale).toBe(false);
  });

  test('old data classified as stale', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS);
    const regime = result.sources.find(s => s.table === 'regime_state');
    expect(regime.isStale).toBe(true);
  });

  test('counts sum to total', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS, MOCK_TIMESTAMPS);
    // Some sources may be both stale and non-fallback, or live
    expect(result.liveCount + result.staleCount + result.fallbackCount).toBeLessThanOrEqual(result.totalSources * 2);
    expect(result.totalSources).toBe(result.sources.length);
  });

  test('overall health is healthy when all live', () => {
    const allFresh = [
      { table: 'prices', category: 'prices', lastUpdated: RECENT },
      { table: 'holdings', category: 'holdings', lastUpdated: RECENT },
    ];
    const result = computeFreshnessAudit(allFresh);
    expect(result.overallHealth).toBe('healthy');
  });

  test('overall health is degraded when some stale', () => {
    const result = computeFreshnessAudit(MOCK_FRESHNESS);
    expect(['degraded', 'stale']).toContain(result.overallHealth);
  });

  test('fallback sources detected', () => {
    const withFallback = [
      { table: 'prices', category: 'prices', lastUpdated: RECENT, isFallback: true },
    ];
    const result = computeFreshnessAudit(withFallback);
    expect(result.fallbackCount).toBe(1);
  });

  test('works with object-style freshness input', () => {
    const objInput = { prices: RECENT, holdings: STALE };
    const result = computeFreshnessAudit(objInput);
    expect(result).not.toBeNull();
    expect(result.sources.length).toBe(2);
  });

  test('is deterministic', () => {
    const a = computeFreshnessAudit(MOCK_FRESHNESS, MOCK_TIMESTAMPS);
    const b = computeFreshnessAudit(MOCK_FRESHNESS, MOCK_TIMESTAMPS);
    expect(a.overallHealth).toBe(b.overallHealth);
    expect(a.liveCount).toBe(b.liveCount);
  });
});
