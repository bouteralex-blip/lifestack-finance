import { generateMorningCommand } from '../../../lib/engines/agents/morning-command.js';

const MOCK_ENGINE_STATE = {
  driftMonitor: { maxDrift: 6.2, urgency: 'Action Needed' },
  concentration: { hhi: 650, diversificationRating: 'Moderate' },
  debtPriority: { totalDebt: 13598, highestAPR: 22.9 },
  wrapperExposure: { efficiency: { score: 2.2, giaExposurePct: 78 } },
  isaPensionRouting: { daysUntilTaxYearEnd: 19, isaHeadroom: { remaining: 20000 } },
};

const MOCK_MARKET_STATE = {
  regime: { regime: 'LATE CYCLE', riskPosture: 'Defensive' },
  stress: { compositeScore: 45, compositeLevel: 'MODERATE', compositeAction: 'Monitor closely' },
  btcCycle: { phase: 'ACCUMULATION', posture: 'DCA and hold' },
  creditStress: { compositeLevel: 'NORMAL' },
  yieldCurve: { shape: 'NORMAL' },
};

const MOCK_ACTION_QUEUE = {
  queue: [
    { rank: 1, action: 'Pay down Amex', urgency: 'immediate', ev: 2439, category: 'debt' },
    { rank: 2, action: 'Fund ISA', urgency: 'this-week', ev: 160, category: 'tax' },
  ],
  summary: { totalActions: 5, immediateActions: 1, totalAnnualEV: 5000, topAction: 'Pay down Amex' },
};

const MOCK_ALERTS = {
  alerts: [
    { severity: 'critical', title: 'High-APR debt', domain: 'Debt', action: 'Pay down Amex' },
    { severity: 'warning', title: 'ISA deadline', domain: 'Tax', action: 'Deploy ISA' },
  ],
  summary: { total: 2, critical: 1, warnings: 1 },
};

const MOCK_WHAT_CHANGED = {
  changes: [
    { domain: 'Drift', message: 'Drift widened to 6.2%', significance: 'high' },
  ],
  summary: '1 change(s) detected.',
  improved: 0,
  worsened: 1,
};

const MOCK_SYNTHESIS = {
  sections: {
    portfolioHealth: { netWorth: 362072 },
  },
};

describe('generateMorningCommand', () => {
  test('returns null-safe result with all null inputs', () => {
    const result = generateMorningCommand(null, null, null, null, null, null);
    expect(result).toBeDefined();
    expect(result.title).toContain('Good morning');
    expect(result.headline).toBeTruthy();
    expect(result.sections).toBeDefined();
    expect(result.verdict).toBeDefined();
  });

  test('returns complete command for full inputs', () => {
    const result = generateMorningCommand(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, MOCK_ACTION_QUEUE,
      MOCK_ALERTS, MOCK_WHAT_CHANGED, MOCK_SYNTHESIS
    );
    expect(result.title).toContain('Good morning');
    expect(result.timestamp).toBeTruthy();
    expect(result.headline).toBeTruthy();

    // Sections
    expect(result.sections.overnightChanges).toBeDefined();
    expect(result.sections.overnightChanges.hasChanges).toBe(true);
    expect(result.sections.overnightChanges.count).toBe(1);

    expect(result.sections.todaysPriorities).toBeDefined();
    expect(result.sections.todaysPriorities.actions.length).toBe(2);
    expect(result.sections.todaysPriorities.totalQueued).toBe(2);

    expect(result.sections.marketPulse).toBeDefined();
    expect(result.sections.marketPulse.available).toBe(true);
    expect(result.sections.marketPulse.regime).toBe('LATE CYCLE');

    expect(result.sections.portfolioVitals).toBeDefined();
    expect(result.sections.portfolioVitals.available).toBe(true);

    expect(result.sections.activeAlerts.count).toBe(2);
    expect(result.sections.activeAlerts.critical).toBe(1);

    expect(result.sections.calendarItems.length).toBeGreaterThan(0);
  });

  test('headline reflects critical alerts', () => {
    const result = generateMorningCommand(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, MOCK_ACTION_QUEUE,
      MOCK_ALERTS, null, null
    );
    expect(result.headline).toContain('critical alert');
  });

  test('headline reflects no alerts scenario', () => {
    const noAlerts = { alerts: [], summary: { critical: 0, warnings: 0 } };
    const result = generateMorningCommand(
      { driftMonitor: { urgency: 'Clean' } }, null, null,
      noAlerts, null, null
    );
    expect(result.headline).toContain('operating normally');
  });

  test('verdict is RED for multiple criticals', () => {
    const manyAlerts = { ...MOCK_ALERTS, summary: { critical: 3, warnings: 2 } };
    const manyImmediate = { ...MOCK_ACTION_QUEUE, summary: { ...MOCK_ACTION_QUEUE.summary, immediateActions: 3 } };
    const result = generateMorningCommand(null, null, manyImmediate, manyAlerts, null, null);
    expect(result.verdict.level).toBe('RED');
  });

  test('verdict is GREEN when all clear', () => {
    const noAlerts = { alerts: [], summary: { critical: 0, warnings: 0 } };
    const noQueue = { queue: [], summary: { immediateActions: 0 } };
    const result = generateMorningCommand(null, null, noQueue, noAlerts, null, null);
    expect(result.verdict.level).toBe('GREEN');
    expect(result.verdict.message).toContain('All clear');
  });

  test('quickStats includes key metrics', () => {
    const result = generateMorningCommand(
      MOCK_ENGINE_STATE, MOCK_MARKET_STATE, MOCK_ACTION_QUEUE,
      MOCK_ALERTS, null, MOCK_SYNTHESIS
    );
    expect(result.quickStats.netWorth).toBe(362072);
    expect(result.quickStats.alertCount).toBe(2);
    expect(result.quickStats.criticalCount).toBe(1);
    expect(result.quickStats.regime).toBe('LATE CYCLE');
    expect(result.quickStats.stress).toBe(45);
  });

  test('no overnight changes shows appropriate message', () => {
    const result = generateMorningCommand(null, null, null, null, null, null);
    expect(result.sections.overnightChanges.hasChanges).toBe(false);
  });
});
