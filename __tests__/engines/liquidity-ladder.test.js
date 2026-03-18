import { computeLiquidityLadderState } from '../../lib/engines/liquidity-ladder.js';

const SAMPLE_HOLDINGS = [
  { ticker: 'GBP', name: 'Cash Deposit', value: 15000, assetClass: 'Cash' },
  { ticker: 'CSH2', name: 'Cash Fund', value: 10000, assetClass: 'Fixed Income' },
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, assetClass: 'Equity' },
  { ticker: 'PROP', name: 'Property Fund', value: 25000, assetClass: 'Real Estate' },
];

const SAMPLE_PORT = {
  monthlyExpenses: 3000,
  targetEmergencyMonths: 6,
};

describe('computeLiquidityLadderState', () => {
  test('returns null for null/undefined/empty holdings', () => {
    expect(computeLiquidityLadderState(null)).toBeNull();
    expect(computeLiquidityLadderState(undefined)).toBeNull();
    expect(computeLiquidityLadderState([])).toBeNull();
  });

  test('returns complete state for valid holdings', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    expect(result).not.toBeNull();
    expect(result.tiers).toBeDefined();
    expect(Array.isArray(result.tiers)).toBe(true);
    expect(result.tiers.length).toBe(4);
    expect(typeof result.totalLiquid).toBe('number');
    expect(typeof result.totalIlliquid).toBe('number');
    expect(typeof result.emergencyFundMonths).toBe('number');
    expect(typeof result.liquidityScore).toBe('number');
    expect(typeof result.shortfall).toBe('number');
    expect(result.implication).toBeTruthy();
  });

  test('tiers have T0 through T3', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    const tierNames = result.tiers.map(t => t.tier);
    expect(tierNames).toContain('T0');
    expect(tierNames).toContain('T1');
    expect(tierNames).toContain('T2');
    expect(tierNames).toContain('T3');
  });

  test('each tier has required fields', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    result.tiers.forEach(t => {
      expect(t.tier).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.horizon).toBeTruthy();
      expect(typeof t.value).toBe('number');
      expect(typeof t.pct).toBe('number');
    });
  });

  test('tier percentages sum to approximately 100', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    const totalPct = result.tiers.reduce((s, t) => s + t.pct, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });

  test('liquidity score stays in 0-100 range', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    expect(result.liquidityScore).toBeGreaterThanOrEqual(0);
    expect(result.liquidityScore).toBeLessThanOrEqual(100);
  });

  test('cash classified into T0', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    const t0 = result.tiers.find(t => t.tier === 'T0');
    expect(t0.value).toBeGreaterThan(0);
  });

  test('shortfall computed when emergency fund is below target', () => {
    const lowCash = [
      { ticker: 'GBP', name: 'Cash Deposit', value: 5000, assetClass: 'Cash' },
      { ticker: 'VWRL', name: 'Equity', value: 50000, assetClass: 'Equity' },
    ];
    const result = computeLiquidityLadderState(lowCash, { monthlyExpenses: 3000, targetEmergencyMonths: 6 });
    expect(result.shortfall).toBeGreaterThan(0);
  });

  test('returns null for zero total value', () => {
    const result = computeLiquidityLadderState([{ ticker: 'X', value: 0, assetClass: 'Cash' }], SAMPLE_PORT);
    expect(result).toBeNull();
  });

  test('works without portConfig', () => {
    const result = computeLiquidityLadderState(SAMPLE_HOLDINGS);
    expect(result).not.toBeNull();
  });

  test('is deterministic', () => {
    const a = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    const b = computeLiquidityLadderState(SAMPLE_HOLDINGS, SAMPLE_PORT);
    expect(a.liquidityScore).toBe(b.liquidityScore);
    expect(a.emergencyFundMonths).toBe(b.emergencyFundMonths);
  });
});
