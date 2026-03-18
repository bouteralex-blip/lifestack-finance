import { computeResearchBacklog } from '../../../lib/engines/agents/research-backlog.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 6.0 },
  concentration: { violations: [{ item: 'NVDA', actual: 28, limit: 15 }], clutter: { count: 8 } },
  debtPriority: { highestAPR: 18 },
  wrapperExposure: { efficiency: { giaExposurePct: 40 }, totalAnnualBenefitFromReallocation: 500 },
  isaPensionRouting: { isaHeadroom: { remaining: 8000 }, daysUntilTaxYearEnd: 45 },
  currencyExposure: { risks: [{ currency: 'USD', exposure: 60 }] },
};

const MOCK_MARKET = {
  regime: { regime: 'Contraction', regimeChanged: true },
  stress: { compositeScore: 65 },
  btcCycle: { bias: 4, phase: 'Accumulation' },
  creditStress: { compositeScore: 55 },
  sectorLeadership: { leaders: ['Technology', 'Healthcare'] },
};

describe('computeResearchBacklog', () => {
  test('returns null for null engineState', () => {
    expect(computeResearchBacklog(null, null)).toBeNull();
    expect(computeResearchBacklog(undefined, {})).toBeNull();
  });

  test('returns valid structure with empty engine state', () => {
    const result = computeResearchBacklog({}, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.backlog)).toBe(true);
    expect(result.totalItems).toBe(result.backlog.length);
    expect(result.timestamp).toBeTruthy();
  });

  test('produces ranked backlog from populated state', () => {
    const result = computeResearchBacklog(MOCK_ENGINE, MOCK_MARKET);
    expect(result.backlog.length).toBeGreaterThan(3);
    expect(result.topPriority).toBeDefined();
    expect(result.topPriority.priority).toBeGreaterThanOrEqual(8);
  });

  test('backlog sorted by priority descending', () => {
    const result = computeResearchBacklog(MOCK_ENGINE, MOCK_MARKET);
    for (let i = 1; i < result.backlog.length; i++) {
      expect(result.backlog[i - 1].priority).toBeGreaterThanOrEqual(result.backlog[i].priority);
    }
  });

  test('each item has rank and required fields', () => {
    const result = computeResearchBacklog(MOCK_ENGINE, MOCK_MARKET);
    result.backlog.forEach((item, i) => {
      expect(item.rank).toBe(i + 1);
      expect(item.topic).toBeTruthy();
      expect(typeof item.priority).toBe('number');
      expect(item.source).toBeTruthy();
      expect(item.status).toBe('pending');
    });
  });

  test('regime change generates high-priority research item', () => {
    const result = computeResearchBacklog(MOCK_ENGINE, MOCK_MARKET);
    const regimeItem = result.backlog.find(b => b.topic.includes('Regime'));
    expect(regimeItem).toBeDefined();
    expect(regimeItem.priority).toBe(9);
  });
});
