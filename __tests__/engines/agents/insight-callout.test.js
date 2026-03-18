import { generateInsightCallouts } from '../../../lib/engines/agents/insight-callout.js';

const MOCK_ENGINE = {
  concentration: { hhi: 1200, effectivePositions: 15, violations: [] },
  driftMonitor: { maxDrift: 2.0 },
  debtPriority: { highestAPR: 5, totalAnnualInterest: 200 },
  isaPensionRouting: { daysUntilTaxYearEnd: 100, isaHeadroom: { remaining: 10000 } },
  wrapperExposure: { efficiency: { giaExposurePct: 20 } },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  btcCycle: { bias: 2, phase: 'Neutral' },
  creditStress: { compositeScore: 20 },
  yieldCurve: { shape: 'Normal' },
};

const MOCK_AGENT = {
  triggerAlerts: { summary: { critical: 0 }, alerts: [] },
  opportunityRanker: { summary: { executeNow: 0 } },
};

describe('generateInsightCallouts', () => {
  test('returns null for null engineState', () => {
    expect(generateInsightCallouts(null)).toBeNull();
    expect(generateInsightCallouts(undefined)).toBeNull();
  });

  test('returns valid structure with minimal inputs', () => {
    const result = generateInsightCallouts({});
    expect(result).toBeDefined();
    expect(Array.isArray(result.callouts)).toBe(true);
    expect(typeof result.topInsight).toBe('string');
    expect(typeof result.totalCallouts).toBe('number');
    expect(result.timestamp).toBeTruthy();
  });

  test('quiet state produces default top insight', () => {
    const result = generateInsightCallouts(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.topInsight).toBeTruthy();
    expect(result.callouts.length).toBe(0);
  });

  test('high HHI produces concentration callout', () => {
    const concentrated = { ...MOCK_ENGINE, concentration: { hhi: 3000, effectivePositions: 5, topHoldings: [{ weight: 30 }, { weight: 20 }, { weight: 15 }] } };
    const result = generateInsightCallouts(concentrated, MOCK_MARKET, MOCK_AGENT);
    const concCallout = result.callouts.find(c => c.source === 'Concentration Engine');
    expect(concCallout).toBeDefined();
    expect(concCallout.severity).toBe('critical');
  });

  test('regime change produces critical callout', () => {
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateInsightCallouts(MOCK_ENGINE, shifted, MOCK_AGENT);
    const regimeCallout = result.callouts.find(c => c.source === 'Regime Engine');
    expect(regimeCallout).toBeDefined();
    expect(regimeCallout.severity).toBe('critical');
  });

  test('callouts sorted by severity (critical first)', () => {
    const concentrated = { ...MOCK_ENGINE, concentration: { hhi: 3000, topHoldings: [] }, debtPriority: { highestAPR: 20, totalAnnualInterest: 2000 } };
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateInsightCallouts(concentrated, shifted, MOCK_AGENT);
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    for (let i = 1; i < result.callouts.length; i++) {
      const prev = sevOrder[result.callouts[i - 1].severity] ?? 3;
      const curr = sevOrder[result.callouts[i].severity] ?? 3;
      expect(prev).toBeLessThanOrEqual(curr);
    }
  });
});
