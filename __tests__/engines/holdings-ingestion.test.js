import { normalizeHoldings, validateHoldings } from '../../lib/engines/holdings-ingestion.js';

const RAW_HOLDINGS = [
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, wrapper: 'ISA', currency: 'GBP' },
  { ticker: 'BTC', name: 'Bitcoin', value: 20000, wrapper: 'GIA', currency: 'USD' },
  { ticker: 'CSH2', name: 'Cash Fund', value: 10000, wrapper: 'ISA', currency: 'GBP' },
];

describe('normalizeHoldings', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(normalizeHoldings(null)).toBeNull();
    expect(normalizeHoldings(undefined)).toBeNull();
    expect(normalizeHoldings([])).toBeNull();
  });

  test('returns complete state for valid holdings', () => {
    const result = normalizeHoldings(RAW_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.holdings).toBeDefined();
    expect(result.holdings.length).toBe(3);
    expect(result.totalValue).toBeGreaterThan(0);
    expect(result.invalidCount).toBe(0);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  test('normalizes tickers to uppercase', () => {
    const result = normalizeHoldings([{ ticker: 'vwrl', name: 'Test', value: 100, wrapper: 'ISA', currency: 'GBP' }]);
    expect(result.holdings[0].ticker).toBe('VWRL');
  });

  test('infers asset class from ticker pattern', () => {
    const result = normalizeHoldings(RAW_HOLDINGS);
    const vwrl = result.holdings.find(h => h.ticker === 'VWRL');
    expect(vwrl.assetClass).toBe('Equity');
    const btc = result.holdings.find(h => h.ticker === 'BTC');
    expect(btc.assetClass).toBe('Crypto');
    const cash = result.holdings.find(h => h.ticker === 'CSH2');
    expect(cash.assetClass).toBe('Cash & Equivalents');
  });

  test('computes weights that sum to approximately 100%', () => {
    const result = normalizeHoldings(RAW_HOLDINGS);
    const totalWeight = result.holdings.reduce((sum, h) => sum + h.weight, 0);
    expect(totalWeight).toBeCloseTo(100, 0);
  });

  test('handles missing ticker gracefully', () => {
    const result = normalizeHoldings([{ name: 'Mystery Fund', value: 5000, wrapper: 'GIA', currency: 'GBP' }]);
    expect(result.holdings[0].ticker).toBe('');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('handles string values by parsing to float', () => {
    const result = normalizeHoldings([{ ticker: 'VWRL', name: 'Test', value: '5000.50', wrapper: 'ISA', currency: 'GBP' }]);
    expect(result.holdings[0].value).toBe(5000.50);
  });

  test('flags invalid holdings with negative values', () => {
    const result = normalizeHoldings([{ ticker: 'VWRL', name: 'Test', value: -100, wrapper: 'ISA', currency: 'GBP' }]);
    expect(result.invalidCount).toBe(1);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('defaults wrapper to GIA and currency to GBP', () => {
    const result = normalizeHoldings([{ ticker: 'VWRL', name: 'Test', value: 1000 }]);
    expect(result.holdings[0].wrapper).toBe('GIA');
    expect(result.holdings[0].currency).toBe('GBP');
  });
});

describe('validateHoldings', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(validateHoldings(null)).toBeNull();
    expect(validateHoldings(undefined)).toBeNull();
    expect(validateHoldings([])).toBeNull();
  });

  test('returns complete validation report', () => {
    const result = validateHoldings(RAW_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.totalHoldings).toBe(3);
    expect(result.validCount).toBeDefined();
    expect(result.invalidCount).toBeDefined();
    expect(result.dataQualityScore).toBeDefined();
    expect(result.totalValue).toBeGreaterThan(0);
  });

  test('data quality score stays in 0-100 range', () => {
    const result = validateHoldings(RAW_HOLDINGS);
    expect(result.dataQualityScore).toBeGreaterThanOrEqual(0);
    expect(result.dataQualityScore).toBeLessThanOrEqual(100);
  });

  test('counts missing tickers correctly', () => {
    const holdings = [
      { name: 'No Ticker', value: 100, wrapper: 'ISA', currency: 'GBP' },
      { ticker: 'VWRL', name: 'Has Ticker', value: 200, wrapper: 'ISA', currency: 'GBP' },
    ];
    const result = validateHoldings(holdings);
    expect(result.missingTickers).toBe(1);
  });
});
