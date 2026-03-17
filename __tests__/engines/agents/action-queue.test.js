import { buildActionQueue } from '../../../lib/engines/agents/action-queue.js';
import { DEFAULT_OPPS } from '../../../lib/defaults.js';

const MOCK_ENGINE_STATE = {
  debtPriority: {
    actions: [
      { name: 'Amex Credit Card', apr: 22.9, annualInterest: 2439.31, minPayment: 213.04 },
      { name: 'Monzo Flex', apr: 0, annualInterest: 0, minPayment: 246 },
    ],
    totalDebt: 13598,
    highestAPR: 22.9,
    totalAnnualInterest: 2439.31,
  },
  isaPensionRouting: {
    daysUntilTaxYearEnd: 19,
    isaHeadroom: { remaining: 20000 },
    salarySacrificeValue: { totalSaving: 4700, inTaperZone: false },
  },
  wrapperExposure: {
    reallocationOpportunities: [{ name: 'BTC', value: 29854 }],
    totalAnnualBenefitFromReallocation: 572.78,
    efficiency: { giaExposurePct: 47 },
  },
  rebalanceProposal: {
    trades: [{ amount: 5000 }, { amount: 3000 }],
  },
  driftMonitor: {
    maxDrift: 6.2,
    urgency: 'Action Needed',
  },
  concentration: {
    clutter: { count: 8, totalValue: 5000 },
  },
};

const MOCK_MARKET_STATE = {
  stress: { compositeScore: 45, compositeAction: 'Monitor closely' },
  btcCycle: { bias: 2, phase: 'ACCUMULATION', confidence: 28 },
};

describe('buildActionQueue', () => {
  test('returns empty queue for null engine state', () => {
    const result = buildActionQueue(null, null, null);
    expect(result.queue).toEqual([]);
    expect(result.summary).toBeNull();
  });

  test('returns empty queue for empty engine state', () => {
    const result = buildActionQueue({}, null, null);
    expect(result.queue).toEqual([]);
  });

  test('builds complete queue from mock engine state', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_OPPS);
    expect(result.queue.length).toBeGreaterThan(0);
    expect(result.summary).toBeDefined();
    expect(result.summary.totalActions).toBe(result.queue.length);
    expect(result.summary.topAction).toBeTruthy();
  });

  test('debt paydown actions have highest confidence', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, null, null);
    const debtAction = result.queue.find(q => q.category === 'debt');
    expect(debtAction).toBeDefined();
    expect(debtAction.confidence).toBe(10);
    expect(debtAction.urgency).toBe('immediate'); // 22.9% > 15%
  });

  test('ISA deployment reflects deadline urgency', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, null, null);
    const isaAction = result.queue.find(q => q.id === 'isa-deployment');
    expect(isaAction).toBeDefined();
    // 19 days left => 'this-week' urgency (14 < 19 <= 30)
    expect(isaAction.urgency).toBe('this-week');
  });

  test('queue is sorted by urgency then EV', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_OPPS);
    const urgencyOrder = { immediate: 0, 'this-week': 1, 'this-month': 2, 'this-quarter': 3 };
    for (let i = 1; i < result.queue.length; i++) {
      const prevUrg = urgencyOrder[result.queue[i - 1].urgency] ?? 4;
      const currUrg = urgencyOrder[result.queue[i].urgency] ?? 4;
      if (prevUrg === currUrg) {
        expect(result.queue[i - 1].ev).toBeGreaterThanOrEqual(result.queue[i].ev);
      } else {
        expect(prevUrg).toBeLessThanOrEqual(currUrg);
      }
    }
  });

  test('each item has a rank', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, DEFAULT_OPPS);
    result.queue.forEach((item, i) => {
      expect(item.rank).toBe(i + 1);
    });
  });

  test('BTC accumulation appears when bias >= 2', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, null);
    const btcAction = result.queue.find(q => q.id === 'btc-accumulation');
    expect(btcAction).toBeDefined();
    expect(btcAction.category).toBe('opportunity');
  });

  test('stress review does not appear when stress is moderate', () => {
    const result = buildActionQueue(MOCK_ENGINE_STATE, MOCK_MARKET_STATE, null);
    const stressAction = result.queue.find(q => q.id === 'stress-review');
    expect(stressAction).toBeUndefined(); // compositeScore 45 < 60
  });

  test('stress review appears when stress is elevated', () => {
    const highStress = { ...MOCK_MARKET_STATE, stress: { compositeScore: 75, compositeAction: 'De-risk' } };
    const result = buildActionQueue(MOCK_ENGINE_STATE, highStress, null);
    const stressAction = result.queue.find(q => q.id === 'stress-review');
    expect(stressAction).toBeDefined();
  });

  test('includes top 3 opportunities', () => {
    const result = buildActionQueue({}, null, DEFAULT_OPPS);
    const oppActions = result.queue.filter(q => q.category === 'opportunity');
    expect(oppActions.length).toBe(3);
  });
});
