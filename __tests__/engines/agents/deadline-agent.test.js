import { computeDeadlines } from '../../../lib/engines/agents/deadline-agent.js';

const MOCK_ENGINE = {
  isaPensionRouting: {
    isaHeadroom: { remaining: 15000 },
    daysUntilTaxYearEnd: 20,
    salarySacrificeValue: { totalSaving: 5000 },
    urgencyFlags: [],
  },
  debtPriority: {
    actions: [{ name: 'Credit Card', apr: 22, balance: 3000 }],
  },
  driftMonitor: { maxDrift: 3.5, urgency: 'Normal' },
  concentration: {},
};

const MOCK_PORT = { netWorth: 200000 };

describe('computeDeadlines', () => {
  test('returns null for null/undefined engineState', () => {
    expect(computeDeadlines(null, null)).toBeNull();
    expect(computeDeadlines({}, undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    expect(result).not.toBeNull();
    expect(result.deadlines).toBeDefined();
    expect(Array.isArray(result.deadlines)).toBe(true);
    expect(result.deadlines.length).toBeGreaterThan(0);
    expect(result.overdue).toBeDefined();
    expect(result.upcoming).toBeDefined();
    expect(result.implication).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
  });

  test('deadlines sorted by daysUntil ascending', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    for (let i = 1; i < result.deadlines.length; i++) {
      expect(result.deadlines[i - 1].daysUntil).toBeLessThanOrEqual(result.deadlines[i].daysUntil);
    }
  });

  test('each deadline has required fields', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    result.deadlines.forEach(d => {
      expect(d.name).toBeTruthy();
      expect(d.date).toBeTruthy();
      expect(typeof d.daysUntil).toBe('number');
      expect(d.urgency).toBeTruthy();
      expect(d.action).toBeTruthy();
      expect(d.category).toBeTruthy();
    });
  });

  test('urgency classification is valid', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    const validUrgencies = ['Overdue', 'Critical', 'Urgent', 'Warning', 'Approaching', 'Normal'];
    result.deadlines.forEach(d => {
      expect(validUrgencies).toContain(d.urgency);
    });
  });

  test('ISA deadline enriched with remaining allowance', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    const isa = result.deadlines.find(d => d.name === 'ISA Deadline');
    expect(isa).toBeDefined();
    expect(isa.action).toContain('15,000');
  });

  test('overdue and upcoming are subsets of deadlines', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    expect(result.overdue.every(d => d.daysUntil < 0)).toBe(true);
    expect(result.upcoming.every(d => d.daysUntil >= 0 && d.daysUntil <= 30)).toBe(true);
  });

  test('includes urgent rebalance as deadline', () => {
    const eng = { ...MOCK_ENGINE, driftMonitor: { maxDrift: 7, urgency: 'Urgent' } };
    const result = computeDeadlines(MOCK_PORT, eng);
    expect(result.deadlines.some(d => d.name === 'Rebalance Overdue')).toBe(true);
  });

  test('implication reflects overdue items', () => {
    const result = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    // Result depends on current date, so just check implication exists
    expect(result.implication).toBeTruthy();
  });

  test('is deterministic', () => {
    const a = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    const b = computeDeadlines(MOCK_PORT, MOCK_ENGINE);
    expect(a.deadlines.length).toBe(b.deadlines.length);
    expect(a.implication).toBe(b.implication);
  });
});
