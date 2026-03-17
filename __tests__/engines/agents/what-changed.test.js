import { computeWhatChanged, computeMarketChanges } from '../../../lib/engines/agents/what-changed.js';

// ---- computeWhatChanged ----
describe('computeWhatChanged', () => {
  test('returns no data message for null current', () => {
    const result = computeWhatChanged(null, {});
    expect(result.changes).toEqual([]);
    expect(result.summary).toContain('No current data');
  });

  test('returns first run message for null prior', () => {
    const result = computeWhatChanged({}, null);
    expect(result.changes).toEqual([]);
    expect(result.summary).toContain('First run');
  });

  test('returns no changes when states are identical', () => {
    const state = {
      concentration: { hhi: 650 },
      driftMonitor: { maxDrift: 6.2, urgency: 'Action Needed' },
      debtPriority: { totalDebt: 13598 },
      isaPensionRouting: { isaHeadroom: { remaining: 20000 } },
      wrapperExposure: { efficiency: { score: 2.2 } },
    };
    const result = computeWhatChanged(state, state);
    expect(result.changes).toEqual([]);
    expect(result.summary).toContain('No significant changes');
  });

  test('detects HHI change', () => {
    const prior = { concentration: { hhi: 600 } };
    const current = { concentration: { hhi: 750 } };
    const result = computeWhatChanged(current, prior);
    expect(result.changes.length).toBe(1);
    expect(result.changes[0].domain).toBe('Concentration');
    expect(result.changes[0].direction).toBe('worsened');
    expect(result.worsened).toBe(1);
  });

  test('detects drift improvement', () => {
    const prior = { driftMonitor: { maxDrift: 8, urgency: 'Urgent' } };
    const current = { driftMonitor: { maxDrift: 3, urgency: 'Monitor' } };
    const result = computeWhatChanged(current, prior);
    const driftChange = result.changes.find(c => c.metric === 'Max Drift');
    expect(driftChange).toBeDefined();
    expect(driftChange.direction).toBe('improved');
    expect(result.improved).toBeGreaterThanOrEqual(1);
  });

  test('detects urgency level change', () => {
    const prior = { driftMonitor: { maxDrift: 3, urgency: 'Monitor' } };
    const current = { driftMonitor: { maxDrift: 3, urgency: 'Urgent' } };
    const result = computeWhatChanged(current, prior);
    const urgencyChange = result.changes.find(c => c.metric === 'Urgency');
    expect(urgencyChange).toBeDefined();
    expect(urgencyChange.significance).toBe('high');
  });

  test('detects debt decrease', () => {
    const prior = { debtPriority: { totalDebt: 13598 } };
    const current = { debtPriority: { totalDebt: 10000 } };
    const result = computeWhatChanged(current, prior);
    const debtChange = result.changes.find(c => c.domain === 'Debt');
    expect(debtChange).toBeDefined();
    expect(debtChange.direction).toBe('decreased');
    expect(debtChange.message).toContain('reduced');
  });

  test('detects ISA deployment', () => {
    const prior = { isaPensionRouting: { isaHeadroom: { remaining: 20000 } } };
    const current = { isaPensionRouting: { isaHeadroom: { remaining: 12000 } } };
    const result = computeWhatChanged(current, prior);
    const isaChange = result.changes.find(c => c.domain === 'Tax');
    expect(isaChange).toBeDefined();
    expect(isaChange.direction).toBe('used');
  });

  test('detects wrapper efficiency improvement', () => {
    const prior = { wrapperExposure: { efficiency: { score: 2.2 } } };
    const current = { wrapperExposure: { efficiency: { score: 3.5 } } };
    const result = computeWhatChanged(current, prior);
    const effChange = result.changes.find(c => c.domain === 'Wrapper');
    expect(effChange).toBeDefined();
    expect(effChange.direction).toBe('improved');
  });

  test('ignores small changes below threshold', () => {
    const prior = { concentration: { hhi: 650 }, debtPriority: { totalDebt: 13598 } };
    const current = { concentration: { hhi: 655 }, debtPriority: { totalDebt: 13590 } };
    const result = computeWhatChanged(current, prior);
    expect(result.changes).toEqual([]);
  });

  test('summary includes high-significance count', () => {
    const prior = { concentration: { hhi: 500 } };
    const current = { concentration: { hhi: 800 } };
    const result = computeWhatChanged(current, prior);
    if (result.changes.some(c => c.significance === 'high')) {
      expect(result.summary).toContain('high-significance');
    }
  });
});

// ---- computeMarketChanges ----
describe('computeMarketChanges', () => {
  test('returns pending message for null inputs', () => {
    expect(computeMarketChanges(null, {}).summary).toContain('pending');
    expect(computeMarketChanges({}, null).summary).toContain('pending');
  });

  test('detects no changes when states are identical', () => {
    const state = {
      regime: { regime: 'LATE CYCLE' },
      stress: { compositeLevel: 'MODERATE', compositeScore: 45 },
      btcCycle: { phase: 'ACCUMULATION' },
      creditStress: { compositeLevel: 'NORMAL' },
      yieldCurve: { shape: 'NORMAL' },
    };
    const result = computeMarketChanges(state, state);
    expect(result.changes).toEqual([]);
    expect(result.summary).toContain('No significant');
  });

  test('detects regime shift', () => {
    const prior = { regime: { regime: 'LATE CYCLE' } };
    const current = { regime: { regime: 'RECESSION' } };
    const result = computeMarketChanges(current, prior);
    const regimeChange = result.changes.find(c => c.domain === 'Macro');
    expect(regimeChange).toBeDefined();
    expect(regimeChange.significance).toBe('high');
    expect(regimeChange.message).toContain('LATE CYCLE');
    expect(regimeChange.message).toContain('RECESSION');
  });

  test('detects stress level change', () => {
    const prior = { stress: { compositeLevel: 'CALM', compositeScore: 20 } };
    const current = { stress: { compositeLevel: 'ELEVATED', compositeScore: 55 } };
    const result = computeMarketChanges(current, prior);
    const stressChange = result.changes.find(c => c.domain === 'Stress');
    expect(stressChange).toBeDefined();
  });

  test('detects BTC cycle phase change', () => {
    const prior = { btcCycle: { phase: 'ACCUMULATION' } };
    const current = { btcCycle: { phase: 'EARLY BULL' } };
    const result = computeMarketChanges(current, prior);
    const btcChange = result.changes.find(c => c.domain === 'Crypto');
    expect(btcChange).toBeDefined();
    expect(btcChange.significance).toBe('high');
  });

  test('detects yield curve shape change', () => {
    const prior = { yieldCurve: { shape: 'NORMAL' } };
    const current = { yieldCurve: { shape: 'INVERTED' } };
    const result = computeMarketChanges(current, prior);
    const curveChange = result.changes.find(c => c.domain === 'Rates');
    expect(curveChange).toBeDefined();
    expect(curveChange.significance).toBe('high');
  });

  test('summary counts high-significance changes', () => {
    const prior = { regime: { regime: 'LATE CYCLE' }, btcCycle: { phase: 'ACCUMULATION' } };
    const current = { regime: { regime: 'RECESSION' }, btcCycle: { phase: 'CAPITULATION' } };
    const result = computeMarketChanges(current, prior);
    expect(result.summary).toContain('2 market change');
    expect(result.summary).toContain('2 high-significance');
  });
});
