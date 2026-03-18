import { generateMonthlyLetter } from '../../../lib/engines/agents/monthly-letter.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 2.5, urgency: 'Normal' },
  concentration: { hhi: 1500, topHoldings: [{ name: 'VWRL', weight: 30 }, { name: 'VUSA', weight: 20 }] },
  rebalanceProposal: { trades: [], status: 'No Action' },
  isaPensionRouting: { isaHeadroom: { remaining: 5000 }, daysUntilTaxYearEnd: 100 },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', confidence: 70, regimeChanged: false },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  yieldCurve: { shape: 'Normal' },
  creditStress: { compositeScore: 20, compositeLevel: 'Low' },
  btcCycle: { phase: 'Accumulation' },
};

const MOCK_PORT = { netWorth: 200000 };
const MOCK_RETURNS = { portfolioReturn: 3.5, benchmarkReturn: 2.8, ytd: 8.2 };

describe('generateMonthlyLetter', () => {
  test('returns null for null/undefined engineState', () => {
    expect(generateMonthlyLetter(null)).toBeNull();
    expect(generateMonthlyLetter(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result).not.toBeNull();
    expect(result.month).toBeTruthy();
    expect(result.year).toBeDefined();
    expect(result.title).toBeTruthy();
    expect(result.date).toBeTruthy();
    expect(result.performance).toBeDefined();
    expect(result.narrative).toBeTruthy();
    expect(result.marketContext).toBeTruthy();
    expect(result.portfolioChanges).toBeDefined();
    expect(result.outlook).toBeTruthy();
    expect(result.risks).toBeDefined();
    expect(result.topHoldings).toBeDefined();
  });

  test('performance computes alpha correctly', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result.performance.alpha).toBeCloseTo(0.7, 1);
    expect(result.performance.note).toContain('outperformance');
  });

  test('narrative mentions regime', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result.narrative).toContain('Expansion');
  });

  test('top holdings limited to 10', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result.topHoldings.length).toBeLessThanOrEqual(10);
  });

  test('risks include regime change when present', () => {
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateMonthlyLetter(MOCK_ENGINE, shifted, MOCK_PORT, MOCK_RETURNS);
    expect(result.risks.some(r => r.risk === 'Regime transition')).toBe(true);
  });

  test('works without monthly returns', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result).not.toBeNull();
    expect(result.performance.note).toContain('No return data');
  });

  test('works without market state', () => {
    const result = generateMonthlyLetter(MOCK_ENGINE, null, MOCK_PORT, MOCK_RETURNS);
    expect(result).not.toBeNull();
    expect(result.marketContext).toContain('unavailable');
  });

  test('is deterministic', () => {
    const a = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    const b = generateMonthlyLetter(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(a.performance.alpha).toBe(b.performance.alpha);
    expect(a.narrative).toBe(b.narrative);
  });
});
