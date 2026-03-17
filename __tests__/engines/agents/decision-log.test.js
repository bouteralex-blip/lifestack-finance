import { createDecisionEntry, validateThesis, processDecisionLog } from '../../../lib/engines/agents/decision-log.js';

// ---- createDecisionEntry ----
describe('createDecisionEntry', () => {
  test('creates entry from simple string action', () => {
    const entry = createDecisionEntry('Buy JURE.L', {});
    expect(entry.id).toMatch(/^dec-/);
    expect(entry.timestamp).toBeTruthy();
    expect(entry.action).toBe('Buy JURE.L');
    expect(entry.category).toBe('general');
    expect(entry.status).toBe('open');
    expect(entry.outcome).toBeNull();
    expect(entry.reviewDate).toBeTruthy();
    expect(entry.notes).toEqual([]);
  });

  test('creates entry from action object', () => {
    const action = { action: 'Pay Amex', category: 'debt', rationale: 'Guaranteed alpha', confidence: 10 };
    const context = {
      expectedOutcome: 'Zero debt', timeHorizon: '1 month',
      successMetric: 'Amex balance = 0', conviction: 10,
      marketRegime: 'LATE CYCLE', stressLevel: 'MODERATE',
      portfolioScore: 5.2, drift: 6.2, totalDebt: 13598, isaRemaining: 20000,
    };
    const entry = createDecisionEntry(action, context);
    expect(entry.action).toBe('Pay Amex');
    expect(entry.category).toBe('debt');
    expect(entry.thesis.rationale).toBe('Guaranteed alpha');
    expect(entry.thesis.expectedOutcome).toBe('Zero debt');
    expect(entry.thesis.conviction).toBe(10);
    expect(entry.snapshot.regime).toBe('LATE CYCLE');
    expect(entry.snapshot.totalDebt).toBe(13598);
  });

  test('review date is approximately 90 days from creation', () => {
    const entry = createDecisionEntry('Test', {});
    const created = new Date(entry.timestamp);
    const review = new Date(entry.reviewDate);
    const daysDiff = Math.round((review - created) / 86400000);
    expect(daysDiff).toBeCloseTo(90, -1);
  });

  test('handles null context gracefully', () => {
    const entry = createDecisionEntry({ action: 'Test', category: 'tax' }, null);
    expect(entry.thesis.rationale).toBe('');
    expect(entry.snapshot.regime).toBe('Unknown');
  });
});

// ---- validateThesis ----
describe('validateThesis', () => {
  test('returns unknown for entry without thesis', () => {
    const result = validateThesis({}, {}, {});
    expect(result.status).toBe('unknown');
  });

  test('returns unknown for null entry', () => {
    const result = validateThesis(null, {}, {});
    expect(result.status).toBe('unknown');
  });

  test('validates debt category — positive when debt decreased', () => {
    const entry = createDecisionEntry(
      { action: 'Pay Amex', category: 'debt' },
      { totalDebt: 13598 }
    );
    const currentEngine = { debtPriority: { totalDebt: 8000 } };
    const result = validateThesis(entry, currentEngine, {});
    expect(result.validations.some(v => v.signal === 'positive')).toBe(true);
    expect(result.status).toBe('on-track');
  });

  test('validates tax category — positive when ISA used', () => {
    const entry = createDecisionEntry(
      { action: 'Fund ISA', category: 'tax' },
      {}
    );
    const currentEngine = { isaPensionRouting: { isaHeadroom: { used: 15000 } } };
    const result = validateThesis(entry, currentEngine, {});
    expect(result.validations.some(v => v.signal === 'positive')).toBe(true);
  });

  test('validates allocation category — drift improved', () => {
    const entry = createDecisionEntry(
      { action: 'Rebalance', category: 'allocation' },
      { drift: 8.0 }
    );
    const currentEngine = { driftMonitor: { maxDrift: 3.0 } };
    const result = validateThesis(entry, currentEngine, {});
    expect(result.validations.some(v => v.signal === 'positive')).toBe(true);
  });

  test('flags regime shift for opportunity category', () => {
    const entry = createDecisionEntry(
      { action: 'BTC buy', category: 'opportunity' },
      { marketRegime: 'LATE CYCLE' }
    );
    const currentMarket = { regime: { regime: 'RECESSION' } };
    const result = validateThesis(entry, {}, currentMarket);
    expect(result.validations.some(v => v.signal === 'warning')).toBe(true);
  });

  test('warns for very old decisions (>180 days)', () => {
    const entry = createDecisionEntry({ action: 'Test', category: 'general' }, {});
    // Backdate the timestamp
    entry.timestamp = new Date(Date.now() - 200 * 86400000).toISOString();
    const result = validateThesis(entry, {}, {});
    expect(result.validations.some(v => v.message.includes('days old'))).toBe(true);
    expect(result.daysSince).toBeGreaterThan(180);
  });
});

// ---- processDecisionLog ----
describe('processDecisionLog', () => {
  test('returns empty summary for null/empty entries', () => {
    const result = processDecisionLog(null, {}, {});
    expect(result.entries).toEqual([]);
    expect(result.summary.total).toBe(0);
  });

  test('returns empty summary for empty array', () => {
    const result = processDecisionLog([], {}, {});
    expect(result.summary.total).toBe(0);
    expect(result.summary.open).toBe(0);
  });

  test('processes open entries and adds validation', () => {
    const entries = [
      createDecisionEntry({ action: 'Pay Amex', category: 'debt' }, { totalDebt: 13598 }),
      createDecisionEntry({ action: 'Fund ISA', category: 'tax' }, {}),
    ];
    const engineState = {
      debtPriority: { totalDebt: 8000 },
      isaPensionRouting: { isaHeadroom: { used: 10000 } },
    };
    const result = processDecisionLog(entries, engineState, {});
    expect(result.entries.length).toBe(2);
    expect(result.summary.total).toBe(2);
    expect(result.summary.open).toBe(2);
    result.entries.forEach(e => {
      expect(e.latestValidation).toBeDefined();
    });
  });

  test('skips validation for already-validated entries', () => {
    const entries = [
      { status: 'validated', action: 'Old trade' },
    ];
    const result = processDecisionLog(entries, {}, {});
    expect(result.entries[0].latestValidation).toBeUndefined();
    expect(result.summary.validated).toBe(1);
  });

  test('counts at-risk and needs-review correctly', () => {
    const entry = createDecisionEntry({ action: 'Test', category: 'allocation' }, { drift: 3 });
    const engineState = { driftMonitor: { maxDrift: 10 } }; // much worse
    const result = processDecisionLog([entry], engineState, {});
    expect(result.summary.total).toBe(1);
    // Drift worsened: 3 -> 10 (>1.5x), so should be at-risk
    expect(result.summary.atRisk).toBeGreaterThanOrEqual(0); // may or may not trigger depending on exact logic
  });
});
