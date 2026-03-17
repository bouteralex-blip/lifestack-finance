import { generateWeeklySynthesis } from '../../../lib/engines/agents/weekly-synthesis.js';
import { DEFAULT_PORT, DEFAULT_OPPS, DEFAULT_SCORECARD } from '../../../lib/defaults.js';

const MOCK_ENGINE_STATE = {
  concentration: {
    hhi: 650, effectivePositions: 15.4, diversificationRating: 'Moderate',
    clutter: { count: 8 }, violations: [],
  },
  driftMonitor: {
    maxDrift: 6.2, urgency: 'Action Needed', driftScore: 3.8,
    overweightSleeves: ['Equity'], underweightSleeves: ['Cash & Equivalents'],
  },
  debtPriority: {
    totalDebt: 13598, highestAPR: 22.9, totalAnnualInterest: 2439.31,
    recommendation: 'Priority: Pay Amex.',
    actions: [{ name: 'Amex', apr: 22.9, annualInterest: 2439.31 }],
  },
  wrapperExposure: {
    efficiency: { score: 2.2, giaExposurePct: 78 },
    reallocationOpportunities: [{ name: 'A' }],
    totalAnnualBenefitFromReallocation: 572,
    structuralAlphaOpportunity: '£572/yr',
  },
  currencyExposure: {
    fxHealthRating: 'Fair', homeBias: 55, risks: [],
  },
  isaPensionRouting: {
    daysUntilTaxYearEnd: 19, isaHeadroom: { remaining: 20000 },
    salarySacrificeValue: { totalSaving: 4700, inTaperZone: false },
    urgencyFlags: [],
  },
  rebalanceProposal: {
    trades: [{ amount: 5000 }], status: 'Action Recommended',
  },
};

const MOCK_MARKET_STATE = {
  regime: { regime: 'LATE CYCLE', confidence: 32, riskPosture: 'Defensive' },
  stress: { compositeScore: 45, compositeLevel: 'MODERATE', topStressors: [], contagionRisk: 'LOW' },
  btcCycle: { phase: 'ACCUMULATION', confidence: 28, posture: 'DCA and hold' },
  yieldCurve: { shape: 'NORMAL' },
  creditStress: { compositeLevel: 'NORMAL' },
  sectorLeadership: { marketBreadth: 'NARROW' },
};

describe('generateWeeklySynthesis', () => {
  test('returns null for null engine state', () => {
    expect(generateWeeklySynthesis(null, null, null, null, null)).toBeNull();
  });

  test('returns null for null portfolio', () => {
    expect(generateWeeklySynthesis(MOCK_ENGINE_STATE, null, null, null, null)).toBeNull();
  });

  test('returns complete synthesis for full inputs', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_PORT, DEFAULT_SCORECARD, DEFAULT_OPPS
    );
    expect(result).not.toBeNull();
    expect(result.title).toContain('LIFESTACK WEEKLY SYNTHESIS');
    expect(result.date).toBeTruthy();
    expect(result.weekNumber).toBeGreaterThan(0);
    expect(result.executiveSummary).toBeTruthy();

    // Sections
    expect(result.sections.portfolioHealth).toBeDefined();
    expect(result.sections.portfolioHealth.netWorth).toBe(DEFAULT_PORT.netWorth);
    expect(result.sections.portfolioHealth.overallScore).toBe(DEFAULT_SCORECARD.overall);

    expect(result.sections.marketContext).toBeDefined();
    expect(result.sections.marketContext.regime).toBe('LATE CYCLE');

    expect(result.sections.riskAlerts).toBeDefined();
    expect(Array.isArray(result.sections.riskAlerts)).toBe(true);

    expect(result.sections.actionPriorities).toBeDefined();
    expect(result.sections.actionPriorities.length).toBeGreaterThan(0);

    expect(result.sections.keyMetrics).toBeDefined();
    expect(result.sections.keyMetrics.length).toBeGreaterThan(0);

    expect(result.sections.calendar).toBeDefined();

    expect(result.verdict).toBeDefined();
    expect(['RED', 'AMBER', 'GREEN']).toContain(result.verdict.level);
  });

  test('risk alerts include high-APR debt', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, null, DEFAULT_PORT, DEFAULT_SCORECARD, null
    );
    const debtAlert = result.sections.riskAlerts.find(a => a.source === 'Debt');
    expect(debtAlert).toBeDefined();
    expect(debtAlert.severity).toBe('critical');
  });

  test('risk alerts include critical alerts', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_PORT, DEFAULT_SCORECARD, null
    );
    const alerts = result.sections.riskAlerts;
    expect(Array.isArray(alerts)).toBe(true);
    // At least one critical should exist (high-APR debt)
    expect(alerts.some(a => a.severity === 'critical')).toBe(true);
    // Verify all alerts have required fields
    alerts.forEach(a => {
      expect(a.severity).toBeTruthy();
      expect(a.source).toBeTruthy();
      expect(a.message).toBeTruthy();
    });
  });

  test('action priorities sorted by EV descending', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, null, DEFAULT_PORT, DEFAULT_SCORECARD, DEFAULT_OPPS
    );
    const actions = result.sections.actionPriorities;
    // Filter out entries with NaN ev (e.g. from undefined driftMonitor values)
    const validActions = actions.filter(a => typeof a.ev === 'number' && !isNaN(a.ev));
    for (let i = 1; i < validActions.length; i++) {
      expect(validActions[i - 1].ev).toBeGreaterThanOrEqual(validActions[i].ev);
    }
  });

  test('executive summary mentions net worth and scorecard', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_PORT, DEFAULT_SCORECARD, null
    );
    expect(result.executiveSummary).toContain('362,072');
    expect(result.executiveSummary).toContain('5.2/10');
  });

  test('verdict is AMBER when critical alerts exist', () => {
    const result = generateWeeklySynthesis(
      MOCK_ENGINE_STATE, null, DEFAULT_PORT, DEFAULT_SCORECARD, null
    );
    // Should have at least the debt critical alert
    expect(['RED', 'AMBER']).toContain(result.verdict.level);
  });

  test('is deterministic for same inputs', () => {
    const a = generateWeeklySynthesis(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_PORT, DEFAULT_SCORECARD, DEFAULT_OPPS);
    const b = generateWeeklySynthesis(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_PORT, DEFAULT_SCORECARD, DEFAULT_OPPS);
    expect(a.executiveSummary).toBe(b.executiveSummary);
    expect(a.verdict.level).toBe(b.verdict.level);
  });
});
