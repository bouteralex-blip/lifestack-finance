import { generateTriggerAlerts } from '../../../lib/engines/agents/trigger-alerts.js';

const MOCK_ENGINE_STATE = {
  driftMonitor: { maxDrift: 6.2, urgency: 'Action Needed' },
  concentration: {
    hhi: 650, effectivePositions: 15.4,
    violations: [
      { type: 'top_3', item: 'A, B, C', actual: 42, limit: 50 },
    ],
    clutter: { count: 8 },
  },
  debtPriority: { highestAPR: 22.9, totalAnnualInterest: 2439.31, totalDebt: 13598 },
  isaPensionRouting: {
    daysUntilTaxYearEnd: 19,
    isaHeadroom: { remaining: 20000 },
  },
  wrapperExposure: {
    efficiency: { score: 2.2, giaExposurePct: 78 },
  },
};

const MOCK_MARKET_STATE = {
  stress: { compositeScore: 75, compositeAction: 'Hedge and reduce exposure' },
  creditStress: { compositeScore: 55 },
  regime: { regime: 'LATE CYCLE', riskPosture: 'Defensive', regimeChanged: true },
};

describe('generateTriggerAlerts', () => {
  test('returns empty alerts for null engine state', () => {
    const result = generateTriggerAlerts(null, null, {});
    expect(result.alerts).toEqual([]);
    expect(result.summary).toBeNull();
  });

  test('returns empty alerts for empty engine state', () => {
    const result = generateTriggerAlerts({}, null, {});
    expect(result.alerts).toEqual([]);
  });

  test('generates all applicable alerts from mock state', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBe(result.alerts.length);
    expect(result.summary.requiresAction).toBe(true);
  });

  test('generates drift breach alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, {});
    const driftAlert = result.alerts.find(a => a.id === 'drift-breach');
    expect(driftAlert).toBeDefined();
    expect(driftAlert.domain).toBe('Allocation');
    expect(driftAlert.metric).toBe(6.2);
  });

  test('generates high-APR debt alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, {});
    const debtAlert = result.alerts.find(a => a.id === 'debt-critical');
    expect(debtAlert).toBeDefined();
    expect(debtAlert.severity).toBe('critical');
    expect(debtAlert.domain).toBe('Debt');
  });

  test('generates ISA deadline alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, {});
    const isaAlert = result.alerts.find(a => a.id === 'isa-deadline');
    expect(isaAlert).toBeDefined();
    expect(isaAlert.type).toBe('deadline');
    expect(isaAlert.message).toContain('19 days');
  });

  test('generates GIA over-exposure alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, {});
    const giaAlert = result.alerts.find(a => a.id === 'gia-overexposure');
    expect(giaAlert).toBeDefined();
    expect(giaAlert.severity).toBe('warning');
  });

  test('generates wrapper inefficiency alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, {});
    const wrapperAlert = result.alerts.find(a => a.id === 'wrapper-inefficient');
    expect(wrapperAlert).toBeDefined();
    expect(wrapperAlert.severity).toBe('warning');
  });

  test('generates market stress alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    const stressAlert = result.alerts.find(a => a.id === 'market-stress');
    expect(stressAlert).toBeDefined();
    expect(stressAlert.severity).toBe('critical');
    expect(stressAlert.metric).toBe(75);
  });

  test('generates credit stress alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    const creditAlert = result.alerts.find(a => a.id === 'credit-stress');
    expect(creditAlert).toBeDefined();
    expect(creditAlert.severity).toBe('warning');
  });

  test('generates regime shift alert', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    const regimeAlert = result.alerts.find(a => a.id === 'regime-shift');
    expect(regimeAlert).toBeDefined();
    expect(regimeAlert.severity).toBe('critical');
    expect(regimeAlert.type).toBe('event');
  });

  test('alerts sorted by severity (critical first)', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    const severities = result.alerts.map(a => a.severity);
    const criticalIndex = severities.indexOf('critical');
    const warningIndex = severities.indexOf('warning');
    if (criticalIndex >= 0 && warningIndex >= 0) {
      expect(criticalIndex).toBeLessThan(warningIndex);
    }
  });

  test('summary counts match', () => {
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, {});
    const criticals = result.alerts.filter(a => a.severity === 'critical').length;
    const warnings = result.alerts.filter(a => a.severity === 'warning').length;
    expect(result.summary.critical).toBe(criticals);
    expect(result.summary.warnings).toBe(warnings);
    expect(result.summary.total).toBe(result.alerts.length);
  });

  test('respects custom thresholds', () => {
    // Raise drift threshold so no drift alert fires
    const result = generateTriggerAlerts(MOCK_ENGINE_STATE, null, { maxDrift: 10 });
    const driftAlert = result.alerts.find(a => a.id === 'drift-breach');
    expect(driftAlert).toBeUndefined(); // 6.2 < 10
  });

  test('no alerts when all metrics are within thresholds', () => {
    const clean = {
      driftMonitor: { maxDrift: 1 },
      concentration: { hhi: 500, violations: [], clutter: { count: 3 } },
      debtPriority: { highestAPR: 0, totalDebt: 0, totalAnnualInterest: 0 },
      isaPensionRouting: { daysUntilTaxYearEnd: 200, isaHeadroom: { remaining: 0 } },
      wrapperExposure: { efficiency: { score: 8, giaExposurePct: 20 } },
    };
    const result = generateTriggerAlerts(clean, null, {});
    expect(result.alerts).toEqual([]);
    expect(result.summary.total).toBe(0);
    expect(result.summary.requiresAction).toBe(false);
  });
});
