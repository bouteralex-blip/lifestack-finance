import { computeCalendarDeployment } from '../../../lib/engines/agents/calendar-deploy.js';

const MOCK_ENGINE = {
  isaPensionRouting: {
    isaHeadroom: { remaining: 15000 },
    daysUntilTaxYearEnd: 20,
    salarySacrificeValue: { totalSaving: 5000, inTaperZone: false },
  },
  debtPriority: {
    actions: [{ name: 'Credit Card', apr: 22, balance: 3000, annualInterest: 660 }],
  },
  rebalanceProposal: {
    trades: [{ ticker: 'VWRL', action: 'Buy', amount: 2000 }],
    status: 'Action Recommended',
  },
  driftMonitor: { maxDrift: 4.5 },
  wrapperExposure: { reallocationOpportunities: [{ ticker: 'VUSA' }], totalAnnualBenefitFromReallocation: 500 },
};

const MOCK_PORT = { netWorth: 200000 };

describe('computeCalendarDeployment', () => {
  test('returns null for null/undefined engineState', () => {
    expect(computeCalendarDeployment(null)).toBeNull();
    expect(computeCalendarDeployment(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result).not.toBeNull();
    expect(result.deployments).toBeDefined();
    expect(Array.isArray(result.deployments)).toBe(true);
    expect(result.deployments.length).toBeGreaterThan(0);
    expect(result.nextDeployment).toBeDefined();
    expect(typeof result.totalPending).toBe('number');
    expect(typeof result.isaDeadlineDays).toBe('number');
    expect(result.timestamp).toBeTruthy();
  });

  test('deployments sorted by priority ascending', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    for (let i = 1; i < result.deployments.length; i++) {
      expect(result.deployments[i - 1].priority).toBeLessThanOrEqual(result.deployments[i].priority);
    }
  });

  test('each deployment has required fields', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    result.deployments.forEach(d => {
      expect(d.date).toBeTruthy();
      expect(d.action).toBeTruthy();
      expect(d.rationale).toBeTruthy();
      expect(typeof d.priority).toBe('number');
      expect(d.type).toBeTruthy();
    });
  });

  test('ISA deployment included when headroom available', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result.deployments.some(d => d.action === 'Fund ISA')).toBe(true);
  });

  test('debt deployment included when debt exists', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result.deployments.some(d => d.type === 'debt')).toBe(true);
  });

  test('rebalance deployment included when trades proposed', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result.deployments.some(d => d.type === 'rebalance')).toBe(true);
  });

  test('next deployment is highest priority', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result.nextDeployment.priority).toBe(result.deployments[0].priority);
  });

  test('ISA deadline days is positive', () => {
    const result = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(result.isaDeadlineDays).toBeGreaterThan(0);
  });

  test('is deterministic', () => {
    const a = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    const b = computeCalendarDeployment(MOCK_PORT, MOCK_ENGINE);
    expect(a.totalPending).toBe(b.totalPending);
    expect(a.nextDeployment?.action).toBe(b.nextDeployment?.action);
  });
});
