import { rankOpportunities } from '../../../lib/engines/agents/opportunity-ranker.js';
import { DEFAULT_OPPS } from '../../../lib/defaults.js';

const MOCK_ENGINE_STATE = {
  isaPensionRouting: {
    daysUntilTaxYearEnd: 19,
    salarySacrificeValue: { inTaperZone: false },
  },
  debtPriority: { highestAPR: 22.9 },
  wrapperExposure: { efficiency: { giaExposurePct: 47 } },
  concentration: { clutter: { count: 8 } },
};

const MOCK_MARKET_STATE = {
  btcCycle: { bias: 2, phase: 'ACCUMULATION' },
  regime: { regime: 'LATE CYCLE', riskPosture: 'Defensive' },
  sectorLeadership: { leaders: ['Financials'] },
  creditStress: { compositeScore: 30 },
};

describe('rankOpportunities', () => {
  test('returns empty for null/empty opportunities', () => {
    const result = rankOpportunities(null, {}, {});
    expect(result.ranked).toEqual([]);
    expect(result.summary).toBeNull();
  });

  test('returns empty for empty array', () => {
    const result = rankOpportunities([], {}, {});
    expect(result.ranked).toEqual([]);
  });

  test('ranks default opportunities with engine/market context', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    expect(result.ranked.length).toBe(DEFAULT_OPPS.length);
    expect(result.summary).toBeDefined();
    expect(result.summary.totalOpportunities).toBe(DEFAULT_OPPS.length);
    expect(result.summary.topAction).toBeTruthy();
    expect(result.summary.topScore).toBeGreaterThan(0);
  });

  test('ranked in descending composite score', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    for (let i = 1; i < result.ranked.length; i++) {
      expect(result.ranked[i - 1].compositeScore).toBeGreaterThanOrEqual(result.ranked[i].compositeScore);
    }
  });

  test('each opportunity gets a tier classification', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    result.ranked.forEach(r => {
      expect(['EXECUTE NOW', 'HIGH PRIORITY', 'MONITOR', 'BACKLOG']).toContain(r.tier);
      expect(r.tierColor).toBeTruthy();
      expect(r.tierPriority).toBeGreaterThanOrEqual(1);
      expect(r.tierPriority).toBeLessThanOrEqual(4);
    });
  });

  test('ISA deadline bonus applied to ISA-eligible opportunities', () => {
    const isaEngine = { ...MOCK_ENGINE_STATE, isaPensionRouting: { daysUntilTaxYearEnd: 19 } };
    const result = rankOpportunities(DEFAULT_OPPS, isaEngine, null);
    // "Wrapper Optimisation Alpha" has w="ISA+SIPP" => should get ISA bonus
    const wrapperOpp = result.ranked.find(r => r.t === 'Wrapper Optimisation Alpha');
    expect(wrapperOpp.rationale.some(r => r.includes('ISA deadline'))).toBe(true);
  });

  test('BTC accumulation gets bonus in accumulation phase', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    const btcOpp = result.ranked.find(r => r.t === 'BTC Accumulation');
    expect(btcOpp.rationale.some(r => r.includes('accumulation supported'))).toBe(true);
  });

  test('gold/hedge gets defensive bonus in late cycle', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    const goldOpp = result.ranked.find(r => r.t === 'Gold / Commodities Hedge');
    expect(goldOpp.rationale.some(r => r.includes('defensive'))).toBe(true);
  });

  test('summary counts tiers correctly', () => {
    const result = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    const executeNow = result.ranked.filter(r => r.tier === 'EXECUTE NOW').length;
    const highPriority = result.ranked.filter(r => r.tier === 'HIGH PRIORITY').length;
    expect(result.summary.executeNow).toBe(executeNow);
    expect(result.summary.highPriority).toBe(highPriority);
  });

  test('is deterministic', () => {
    const a = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    const b = rankOpportunities(DEFAULT_OPPS, MOCK_ENGINE_STATE, MOCK_MARKET_STATE);
    expect(a.ranked.map(r => r.compositeScore)).toEqual(b.ranked.map(r => r.compositeScore));
    expect(a.summary.topScore).toBe(b.summary.topScore);
  });
});
