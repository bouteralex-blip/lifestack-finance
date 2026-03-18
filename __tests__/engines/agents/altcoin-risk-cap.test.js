import { computeAltcoinRiskCap } from '../../../lib/engines/agents/altcoin-risk-cap.js';

const HOLDINGS_WITH_ALTCOINS = [
  { name: 'BTC', ticker: 'BTC', val: 30000, sleeve: 'Crypto' },
  { name: 'ETH', ticker: 'ETH', val: 10000, sleeve: 'Crypto' },
  { name: 'SOL', ticker: 'SOL', val: 5000, sleeve: 'Crypto' },
  { name: 'AVAX', ticker: 'AVAX', val: 3000, sleeve: 'Crypto' },
  { name: 'LINK', ticker: 'LINK', val: 2000, sleeve: 'Crypto' },
  { name: 'VWRL', ticker: 'VWRL', val: 50000, sleeve: 'Equity' },
];

describe('computeAltcoinRiskCap', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(computeAltcoinRiskCap(null)).toBeNull();
    expect(computeAltcoinRiskCap(undefined)).toBeNull();
    expect(computeAltcoinRiskCap([])).toBeNull();
  });

  test('returns complete state for holdings with altcoins', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, {});
    expect(state).not.toBeNull();
    expect(state.currentAltcoinPct).toBeDefined();
    expect(state.capPct).toBeDefined();
    expect(state.isBreached).toBeDefined();
    expect(state.altcoinCount).toBeDefined();
    expect(state.altcoinValue).toBeDefined();
    expect(state.implication).toBeTruthy();
  });

  test('correctly identifies altcoins (non BTC/ETH crypto)', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, {});
    // SOL, AVAX, LINK are altcoins = 10000
    expect(state.altcoinCount).toBe(3);
    expect(state.altcoinValue).toBe(10000);
  });

  test('detects cap breach when altcoin exposure exceeds cap', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 5 });
    // Total portfolio = 100000, altcoins = 10000 = 10%
    expect(state.isBreached).toBe(true);
    expect(state.excess).toBeGreaterThan(0);
    expect(state.excessValue).toBeGreaterThan(0);
  });

  test('no breach when altcoin exposure is within cap', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 15 });
    expect(state.isBreached).toBe(false);
    expect(state.excess).toBe(0);
    expect(state.excessValue).toBe(0);
  });

  test('generates trim recommendations when breached', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 5 });
    expect(state.holdingsToTrim.length).toBeGreaterThan(0);
    state.holdingsToTrim.forEach(h => {
      expect(h.ticker).toBeTruthy();
      expect(h.trimAmount).toBeGreaterThan(0);
    });
  });

  test('no trim recommendations when not breached', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 15 });
    expect(state.holdingsToTrim).toEqual([]);
  });

  test('defaults to 5% cap when no config provided', () => {
    const state = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS);
    expect(state.capPct).toBe(5);
  });

  test('BTC and ETH are excluded from altcoin count', () => {
    const holdings = [
      { name: 'BTC', ticker: 'BTC', val: 50000, sleeve: 'Crypto' },
      { name: 'ETH', ticker: 'ETH', val: 20000, sleeve: 'Crypto' },
      { name: 'Cash', ticker: 'GBP', val: 30000, sleeve: 'Cash' },
    ];
    const state = computeAltcoinRiskCap(holdings, {});
    expect(state.altcoinCount).toBe(0);
    expect(state.isBreached).toBe(false);
  });

  test('returns null for zero total portfolio value', () => {
    const holdings = [{ name: 'BTC', ticker: 'BTC', val: 0, sleeve: 'Crypto' }];
    expect(computeAltcoinRiskCap(holdings, {})).toBeNull();
  });

  test('implication reflects breach status', () => {
    const breached = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 5 });
    expect(breached.implication).toContain('exceeds');

    const compliant = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 20 });
    expect(compliant.implication).toContain('within');
  });

  test('is deterministic', () => {
    const a = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 5 });
    const b = computeAltcoinRiskCap(HOLDINGS_WITH_ALTCOINS, { altcoinCapPct: 5 });
    expect(a.currentAltcoinPct).toBe(b.currentAltcoinPct);
    expect(a.isBreached).toBe(b.isBreached);
  });
});
