import { generateQuarterlyReview } from '../../../lib/engines/agents/quarterly-review.js';

const MOCK_ENGINE = {
  driftMonitor: {
    maxDrift: 3.5,
    sleeves: [
      { sleeve: 'Equity', current: 63, target: 60 },
      { sleeve: 'Fixed Income', current: 22, target: 25 },
      { sleeve: 'Crypto', current: 8, target: 5 },
      { sleeve: 'Cash', current: 7, target: 10 },
    ],
  },
  concentration: { hhi: 1500, violations: [] },
  wrapperExposure: { efficiency: { giaExposurePct: 25 } },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  btcCycle: { phase: 'Accumulation', bias: 3 },
  creditStress: { compositeScore: 20, compositeLevel: 'Low' },
  yieldCurve: { shape: 'Normal' },
  sectorLeadership: { marketBreadth: 'Healthy' },
};

const MOCK_PORT = { netWorth: 200000 };

describe('generateQuarterlyReview', () => {
  test('returns null for null/undefined engineState', () => {
    expect(generateQuarterlyReview(null)).toBeNull();
    expect(generateQuarterlyReview(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result).not.toBeNull();
    expect(result.quarter).toBeTruthy();
    expect(result.date).toBeTruthy();
    expect(result.allocations).toBeDefined();
    expect(Array.isArray(result.allocations)).toBe(true);
    expect(result.themeReview).toBeDefined();
    expect(result.riskBudgetUsage).toBeDefined();
    expect(result.strategicChanges).toBeDefined();
    expect(result.verdict).toBeDefined();
  });

  test('allocations have required fields', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    result.allocations.forEach(a => {
      expect(a.sleeve).toBeTruthy();
      expect(typeof a.current).toBe('number');
      expect(typeof a.target).toBe('number');
      expect(typeof a.drift).toBe('number');
      expect(a.recommendation).toBeTruthy();
    });
  });

  test('overweight sleeves get trim recommendation', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    const crypto = result.allocations.find(a => a.sleeve === 'Crypto');
    expect(crypto.recommendation).toContain('overweight');
  });

  test('theme review includes standard themes', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result.themeReview.length).toBeGreaterThanOrEqual(5);
    result.themeReview.forEach(t => {
      expect(t.theme).toBeTruthy();
      expect(t.status).toBeTruthy();
      expect(t.review).toBeTruthy();
    });
  });

  test('risk budget usage in 0-100 range', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result.riskBudgetUsage.overall).toBeGreaterThanOrEqual(0);
    expect(result.riskBudgetUsage.overall).toBeLessThanOrEqual(100);
  });

  test('regime shift triggers strategic change', () => {
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateQuarterlyReview(MOCK_ENGINE, shifted, MOCK_PORT);
    expect(result.strategicChanges.some(c => c.priority === 'High')).toBe(true);
  });

  test('verdict has level, message, and action', () => {
    const result = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result.verdict.level).toBeTruthy();
    expect(result.verdict.message).toBeTruthy();
    expect(result.verdict.action).toBeTruthy();
  });

  test('is deterministic', () => {
    const a = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    const b = generateQuarterlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(a.riskBudgetUsage.overall).toBe(b.riskBudgetUsage.overall);
    expect(a.verdict.level).toBe(b.verdict.level);
  });
});
