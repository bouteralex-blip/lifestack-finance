import { computeUIQAChecks } from '../../../lib/engines/agents/ui-qa.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 3.5, urgency: 'Normal', driftScore: 5 },
  concentration: { hhi: 1500, effectivePositions: 12, diversificationRating: 'Good' },
  debtPriority: { totalDebt: 5000, highestAPR: 10 },
  isaPensionRouting: { isaHeadroom: { remaining: 10000 }, daysUntilTaxYearEnd: 60 },
  wrapperExposure: { efficiency: { score: 7, giaExposurePct: 30 } },
  currencyExposure: { fxHealthRating: 'Good', homeBias: 35 },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', confidence: 75, riskPosture: 'Risk On' },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  btcCycle: { phase: 'Accumulation', bias: 2 },
  creditStress: { compositeScore: 20 },
  yieldCurve: { shape: 'Normal' },
  sectorLeadership: { marketBreadth: 'Healthy' },
};

const MOCK_AGENT = {
  triggerAlerts: { alerts: [{ message: 'test' }] },
  actionQueue: { queue: [{ id: 'test' }] },
};

describe('computeUIQAChecks', () => {
  test('returns null when both states are null', () => {
    expect(computeUIQAChecks(null, null, null)).toBeNull();
    expect(computeUIQAChecks(undefined, undefined, undefined)).toBeNull();
  });

  test('returns valid structure with engine state only', () => {
    const result = computeUIQAChecks(MOCK_ENGINE, null, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.checks)).toBe(true);
    expect(typeof result.passRate).toBe('number');
    expect(Array.isArray(result.failures)).toBe(true);
    expect(typeof result.totalChecks).toBe('number');
    expect(typeof result.passed).toBe('number');
    expect(typeof result.failed).toBe('number');
    expect(result.timestamp).toBeTruthy();
  });

  test('fully populated state yields high pass rate', () => {
    const result = computeUIQAChecks(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.passRate).toBeGreaterThan(80);
    expect(result.passed).toBeGreaterThan(0);
    expect(result.totalChecks).toBeGreaterThan(10);
  });

  test('each check has required fields', () => {
    const result = computeUIQAChecks(MOCK_ENGINE, MOCK_MARKET, null);
    result.checks.forEach(check => {
      expect(check.component).toBeTruthy();
      expect(check.field).toBeTruthy();
      expect(check.status).toBeTruthy();
    });
  });

  test('missing fields are flagged as failures', () => {
    const sparseEngine = { driftMonitor: { maxDrift: 3 } };
    const result = computeUIQAChecks(sparseEngine, null, null);
    expect(result.failures.length).toBeGreaterThan(0);
    const missingChecks = result.failures.filter(f => f.status === 'missing');
    expect(missingChecks.length).toBeGreaterThan(0);
  });

  test('out-of-range values flagged as stale', () => {
    const badEngine = {
      ...MOCK_ENGINE,
      driftMonitor: { maxDrift: 200, urgency: 'Normal', driftScore: 5 },
    };
    const result = computeUIQAChecks(badEngine, null, null);
    const driftCheck = result.checks.find(c => c.field === 'maxDrift');
    expect(driftCheck.status).toBe('stale');
  });

  test('agent checks included when agent state provided', () => {
    const result = computeUIQAChecks(MOCK_ENGINE, null, MOCK_AGENT);
    const agentChecks = result.checks.filter(c =>
      c.component === 'TriggerAlerts' || c.component === 'ActionQueue'
    );
    expect(agentChecks.length).toBeGreaterThan(0);
  });
});
