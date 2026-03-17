import { generateTriggerNote } from '../../../lib/engines/agents/trigger-note.js';

const MOCK_ALERT = {
  id: 'drift-breach',
  domain: 'Allocation',
  message: 'Max drift exceeded 5% threshold',
  metric: 6.2,
  threshold: 5,
  severity: 'warning',
};

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 6.2, urgency: 'Urgent', overweightSleeves: [{ sleeve: 'Equity', drift: 3.1 }] },
  concentration: { hhi: 1800, effectivePositions: 8, diversificationRating: 'Good' },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On' },
  stress: { compositeScore: 35, compositeLevel: 'Normal' },
};

describe('generateTriggerNote', () => {
  test('returns null for null/undefined alert', () => {
    expect(generateTriggerNote(null)).toBeNull();
    expect(generateTriggerNote(undefined)).toBeNull();
  });

  test('returns complete state for valid alert', () => {
    const result = generateTriggerNote(MOCK_ALERT, MOCK_ENGINE, MOCK_MARKET);
    expect(result).not.toBeNull();
    expect(result.alertType).toBeTruthy();
    expect(result.title).toBeTruthy();
    expect(result.context).toBeTruthy();
    expect(result.historicalContext).toBeTruthy();
    expect(result.recommendation).toBeTruthy();
    expect(result.urgency).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
    expect(result.domain).toBe('Allocation');
  });

  test('classifies allocation alert correctly', () => {
    const result = generateTriggerNote(MOCK_ALERT, MOCK_ENGINE, MOCK_MARKET);
    expect(result.alertType).toBe('Portfolio Structure');
  });

  test('classifies market alert correctly', () => {
    const alert = { domain: 'Market', metric: 75, severity: 'warning' };
    const result = generateTriggerNote(alert, MOCK_ENGINE, MOCK_MARKET);
    expect(result.alertType).toBe('Market Risk');
  });

  test('classifies deadline alert correctly', () => {
    const alert = { type: 'deadline', domain: 'Tax', severity: 'critical' };
    const result = generateTriggerNote(alert, MOCK_ENGINE, MOCK_MARKET);
    expect(result.alertType).toBe('Deadline');
  });

  test('urgency reflects severity correctly', () => {
    const critical = generateTriggerNote({ ...MOCK_ALERT, severity: 'critical', type: 'deadline' }, MOCK_ENGINE, MOCK_MARKET);
    expect(critical.urgency).toContain('Immediate');

    const warning = generateTriggerNote({ ...MOCK_ALERT, severity: 'warning' }, MOCK_ENGINE, MOCK_MARKET);
    expect(warning.urgency).toContain('Medium');
  });

  test('context enriched with engine data for allocation alerts', () => {
    const result = generateTriggerNote(MOCK_ALERT, MOCK_ENGINE, MOCK_MARKET);
    expect(result.context).toContain('6.2');
  });

  test('uses custom action if provided', () => {
    const alert = { ...MOCK_ALERT, action: 'Custom action here' };
    const result = generateTriggerNote(alert, MOCK_ENGINE, MOCK_MARKET);
    expect(result.recommendation).toBe('Custom action here');
  });

  test('works with minimal alert', () => {
    const result = generateTriggerNote({ id: 'test' });
    expect(result).not.toBeNull();
    expect(result.alertType).toBe('Threshold Breach');
  });

  test('is deterministic', () => {
    const a = generateTriggerNote(MOCK_ALERT, MOCK_ENGINE, MOCK_MARKET);
    const b = generateTriggerNote(MOCK_ALERT, MOCK_ENGINE, MOCK_MARKET);
    expect(a.alertType).toBe(b.alertType);
    expect(a.urgency).toBe(b.urgency);
    expect(a.recommendation).toBe(b.recommendation);
  });
});
