import { generateMonthlyReview } from '../../../lib/engines/agents/monthly-review.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 2.5, urgency: 'Normal' },
  concentration: { hhi: 1500, effectivePositions: 8, diversificationRating: 'Good', violations: [] },
  rebalanceProposal: { trades: [], status: 'No Action' },
  debtPriority: { highestAPR: 0, totalDebt: 0 },
  isaPensionRouting: { isaHeadroom: { remaining: 5000 }, daysUntilTaxYearEnd: 100, salarySacrificeValue: {} },
  wrapperExposure: { efficiency: { score: 7, giaExposurePct: 20 }, reallocationOpportunities: [] },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  creditStress: { compositeScore: 20, compositeLevel: 'Low' },
};

const MOCK_PORT = { netWorth: 200000 };
const MOCK_RETURNS = { portfolioReturn: 2.5, benchmarkReturn: 2.0 };

describe('generateMonthlyReview', () => {
  test('returns null for null/undefined engineState', () => {
    expect(generateMonthlyReview(null)).toBeNull();
    expect(generateMonthlyReview(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result).not.toBeNull();
    expect(result.month).toBeTruthy();
    expect(result.date).toBeTruthy();
    expect(result.scorecard).toBeDefined();
    expect(result.scorecard.length).toBe(5);
    expect(typeof result.overallScore).toBe('number');
    expect(result.highlights).toBeDefined();
    expect(result.concerns).toBeDefined();
    expect(typeof result.actionsCompleted).toBe('number');
    expect(typeof result.actionsPending).toBe('number');
    expect(result.verdict).toBeTruthy();
  });

  test('scorecard areas match expected set', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    const areas = result.scorecard.map(s => s.area);
    expect(areas).toContain('Returns');
    expect(areas).toContain('Risk');
    expect(areas).toContain('Tax efficiency');
    expect(areas).toContain('Diversification');
    expect(areas).toContain('Execution');
  });

  test('each scorecard area has required fields', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    result.scorecard.forEach(s => {
      expect(s.area).toBeTruthy();
      expect(typeof s.score).toBe('number');
      expect(s.score).toBeGreaterThanOrEqual(1);
      expect(s.score).toBeLessThanOrEqual(10);
      expect(s.trend).toBeTruthy();
      expect(s.detail).toBeTruthy();
    });
  });

  test('overall score is average of area scores', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    const expected = result.scorecard.reduce((s, c) => s + c.score, 0) / 5;
    expect(result.overallScore).toBeCloseTo(expected, 0);
  });

  test('verdict reflects overall score', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    if (result.overallScore >= 7) expect(result.verdict).toBe('Strong');
    else if (result.overallScore >= 5) expect(result.verdict).toBe('Adequate');
    else expect(result.verdict).toBe('Needs Attention');
  });

  test('concerns include low-scoring areas', () => {
    const poorEngine = {
      ...MOCK_ENGINE,
      concentration: { hhi: 3000, effectivePositions: 3, diversificationRating: 'Poor', violations: [{ item: 'NVDA' }] },
      driftMonitor: { maxDrift: 8, urgency: 'Urgent' },
    };
    const result = generateMonthlyReview(poorEngine, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(result.concerns.length).toBeGreaterThan(0);
  });

  test('works without monthly returns', () => {
    const result = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT);
    expect(result).not.toBeNull();
  });

  test('is deterministic', () => {
    const a = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    const b = generateMonthlyReview(MOCK_ENGINE, MOCK_MARKET, MOCK_PORT, MOCK_RETURNS);
    expect(a.overallScore).toBe(b.overallScore);
    expect(a.verdict).toBe(b.verdict);
  });
});
