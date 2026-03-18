import { normalizePositions, deduplicatePositions } from '../../lib/engines/position-normalizer.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 30000, wrapper: 'ISA' },
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 20000, wrapper: 'SIPP' },
  { ticker: 'VUSA', name: 'Vanguard S&P 500', value: 15000, wrapper: 'ISA' },
  { ticker: 'CSH2', name: 'Cash Fund', value: 5000, wrapper: 'ISA' },
];

describe('normalizePositions', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(normalizePositions(null)).toBeNull();
    expect(normalizePositions(undefined)).toBeNull();
    expect(normalizePositions([])).toBeNull();
  });

  test('returns complete state for valid holdings', () => {
    const result = normalizePositions(SAMPLE_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.normalized).toBeDefined();
    expect(Array.isArray(result.normalized)).toBe(true);
    expect(result.duplicates).toBeDefined();
    expect(result.totalPositions).toBeDefined();
    expect(result.originalCount).toBe(4);
    expect(result.consolidatedCount).toBeDefined();
  });

  test('groups same ticker across different wrappers', () => {
    const result = normalizePositions(SAMPLE_HOLDINGS);
    const vwrl = result.normalized.find(n => n.ticker === 'VWRL');
    expect(vwrl).toBeDefined();
    expect(vwrl.totalValue).toBe(50000);
    expect(vwrl.wrappers.length).toBe(2);
  });

  test('normalizes tickers to uppercase', () => {
    const result = normalizePositions([
      { ticker: 'vwrl', name: 'Test', value: 100, wrapper: 'ISA' },
    ]);
    expect(result.normalized[0].ticker).toBe('VWRL');
  });

  test('computes consolidated weights that sum to ~100%', () => {
    const result = normalizePositions(SAMPLE_HOLDINGS);
    const totalWeight = result.normalized.reduce((s, n) => s + n.consolidatedWeight, 0);
    expect(totalWeight).toBeCloseTo(100, 0);
  });

  test('sorts by totalValue descending', () => {
    const result = normalizePositions(SAMPLE_HOLDINGS);
    for (let i = 1; i < result.normalized.length; i++) {
      expect(result.normalized[i - 1].totalValue).toBeGreaterThanOrEqual(result.normalized[i].totalValue);
    }
  });

  test('skips holdings without ticker', () => {
    const result = normalizePositions([
      { ticker: 'VWRL', name: 'Test', value: 100, wrapper: 'ISA' },
      { name: 'No Ticker', value: 200, wrapper: 'GIA' },
    ]);
    expect(result.totalPositions).toBe(1);
  });

  test('returns null for holdings with zero total value', () => {
    const result = normalizePositions([
      { ticker: 'VWRL', name: 'Test', value: 0, wrapper: 'ISA' },
    ]);
    expect(result).toBeNull();
  });

  test('detects duplicates in same wrapper', () => {
    const result = normalizePositions([
      { ticker: 'VWRL', name: 'Test', value: 100, wrapper: 'ISA' },
      { ticker: 'VWRL', name: 'Test', value: 200, wrapper: 'ISA' },
    ]);
    expect(result.duplicates.length).toBeGreaterThan(0);
  });

  test('is deterministic', () => {
    const a = normalizePositions(SAMPLE_HOLDINGS);
    const b = normalizePositions(SAMPLE_HOLDINGS);
    expect(a.totalPositions).toBe(b.totalPositions);
    expect(a.normalized.length).toBe(b.normalized.length);
  });
});

describe('deduplicatePositions', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(deduplicatePositions(null)).toBeNull();
    expect(deduplicatePositions(undefined)).toBeNull();
    expect(deduplicatePositions([])).toBeNull();
  });

  test('returns complete state for valid holdings', () => {
    const result = deduplicatePositions(SAMPLE_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.holdings).toBeDefined();
    expect(result.duplicatesFound).toBeDefined();
    expect(result.duplicates).toBeDefined();
    expect(result.originalCount).toBe(4);
    expect(result.deduplicatedCount).toBeDefined();
    expect(result.totalValue).toBeGreaterThan(0);
  });

  test('merges same ticker in same wrapper', () => {
    const holdings = [
      { ticker: 'VWRL', name: 'Test', value: 100, wrapper: 'ISA' },
      { ticker: 'VWRL', name: 'Test', value: 200, wrapper: 'ISA' },
    ];
    const result = deduplicatePositions(holdings);
    expect(result.duplicatesFound).toBe(1);
    expect(result.deduplicatedCount).toBe(1);
    const merged = result.holdings.find(h => h.ticker === 'VWRL');
    expect(merged.value).toBe(300);
  });

  test('preserves different wrappers for same ticker', () => {
    const holdings = [
      { ticker: 'VWRL', name: 'Test', value: 100, wrapper: 'ISA' },
      { ticker: 'VWRL', name: 'Test', value: 200, wrapper: 'SIPP' },
    ];
    const result = deduplicatePositions(holdings);
    expect(result.duplicatesFound).toBe(0);
    expect(result.deduplicatedCount).toBe(2);
  });

  test('preserves holdings without ticker', () => {
    const holdings = [
      { name: 'Mystery', value: 100, wrapper: 'GIA' },
      { ticker: 'VWRL', name: 'Test', value: 200, wrapper: 'ISA' },
    ];
    const result = deduplicatePositions(holdings);
    expect(result.deduplicatedCount).toBe(2);
  });

  test('is deterministic', () => {
    const a = deduplicatePositions(SAMPLE_HOLDINGS);
    const b = deduplicatePositions(SAMPLE_HOLDINGS);
    expect(a.duplicatesFound).toBe(b.duplicatesFound);
    expect(a.totalValue).toBe(b.totalValue);
  });
});
