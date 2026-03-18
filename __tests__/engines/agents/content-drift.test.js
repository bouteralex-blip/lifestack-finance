import { computeContentDrift } from '../../../lib/engines/agents/content-drift.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 4.2, urgency: 'Action Needed', driftScore: 6 },
  concentration: { hhi: 1800, effectivePositions: 10, diversificationRating: 'Moderate' },
  debtPriority: { totalDebt: 5000, highestAPR: 12, totalAnnualInterest: 600 },
  isaPensionRouting: { isaHeadroom: { remaining: 15000 }, daysUntilTaxYearEnd: 45 },
};

describe('computeContentDrift', () => {
  test('returns null for null inputs', () => {
    expect(computeContentDrift(null, null)).toBeNull();
    expect(computeContentDrift(null, {})).toBeNull();
    expect(computeContentDrift({}, null)).toBeNull();
  });

  test('returns valid structure with empty displayed values', () => {
    const result = computeContentDrift(MOCK_ENGINE, {});
    expect(result).toBeDefined();
    expect(result.drifts).toEqual([]);
    expect(result.driftCount).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.totalChecked).toBe(0);
    expect(result.timestamp).toBeTruthy();
  });

  test('detects no drift when values match', () => {
    const displayed = { maxDrift: 4.2, hhi: 1800 };
    const result = computeContentDrift(MOCK_ENGINE, displayed);
    expect(result.driftCount).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.totalChecked).toBe(2);
  });

  test('detects drift when values diverge', () => {
    const displayed = { maxDrift: 2.0, hhi: 1800 };
    const result = computeContentDrift(MOCK_ENGINE, displayed);
    expect(result.driftCount).toBe(1);
    expect(result.accuracy).toBeLessThan(100);
    const driftedItem = result.drifts.find(d => d.isDrifted);
    expect(driftedItem).toBeDefined();
    expect(driftedItem.field).toBe('maxDrift');
  });

  test('handles array-format displayed values', () => {
    const displayed = [
      { field: 'maxDrift', value: 4.2 },
      { field: 'hhi', value: 9999 },
    ];
    const result = computeContentDrift(MOCK_ENGINE, displayed);
    expect(result.totalChecked).toBe(2);
    expect(result.driftCount).toBe(1);
  });

  test('handles unknown field gracefully', () => {
    const displayed = { unknownField: 42 };
    const result = computeContentDrift(MOCK_ENGINE, displayed);
    expect(result.totalChecked).toBe(1);
    const drift = result.drifts[0];
    expect(drift.isDrifted).toBe(false);
    expect(drift.engineValue).toBeNull();
  });
});
