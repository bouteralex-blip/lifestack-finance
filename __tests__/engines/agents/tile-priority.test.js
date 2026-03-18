import { computeTilePriority } from '../../../lib/engines/agents/tile-priority.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 2.0, urgency: 'Normal' },
  concentration: { hhi: 1200, violations: [] },
  debtPriority: { highestAPR: 5, totalDebt: 2000 },
  isaPensionRouting: { isaHeadroom: { remaining: 10000 }, daysUntilTaxYearEnd: 100 },
  wrapperExposure: { efficiency: { score: 7, giaExposurePct: 20 } },
  rebalanceProposal: { status: 'On Track' },
  currencyExposure: { risks: [] },
};

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false },
  stress: { compositeScore: 25, compositeLevel: 'Normal' },
  btcCycle: { bias: 1, phase: 'Neutral', phaseChanged: false },
};

const MOCK_AGENT = {
  triggerAlerts: { summary: { critical: 0 }, alerts: [] },
  opportunityRanker: { summary: { executeNow: 0 } },
  actionQueue: { summary: { immediateActions: 0 } },
};

describe('computeTilePriority', () => {
  test('returns null for null engineState', () => {
    expect(computeTilePriority(null, null, null)).toBeNull();
    expect(computeTilePriority(undefined, {}, {})).toBeNull();
  });

  test('returns valid structure with minimal engine state', () => {
    const result = computeTilePriority({}, null, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.tiles)).toBe(true);
    expect(Array.isArray(result.suppressedTiles)).toBe(true);
    expect(result.timestamp).toBeTruthy();
  });

  test('produces expected output shape with populated state', () => {
    const result = computeTilePriority(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    expect(result.tiles.length).toBeGreaterThan(0);
    expect(result.topTile).toBeDefined();
    expect(result.topTile.id).toBeTruthy();
    expect(result.topTile.label).toBeTruthy();
    expect(typeof result.topTile.priority).toBe('number');
  });

  test('each tile has required fields', () => {
    const result = computeTilePriority(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    result.tiles.forEach(tile => {
      expect(tile.id).toBeTruthy();
      expect(tile.label).toBeTruthy();
      expect(typeof tile.priority).toBe('number');
      expect(tile.priority).toBeGreaterThanOrEqual(0);
      expect(tile.priority).toBeLessThanOrEqual(10);
      expect(tile.reason).toBeTruthy();
      expect(tile.urgency).toBeTruthy();
    });
  });

  test('tiles sorted by priority descending', () => {
    const result = computeTilePriority(MOCK_ENGINE, MOCK_MARKET, MOCK_AGENT);
    for (let i = 1; i < result.tiles.length; i++) {
      expect(result.tiles[i - 1].priority).toBeGreaterThanOrEqual(result.tiles[i].priority);
    }
  });

  test('ISA deadline boosts priority when imminent', () => {
    const urgentISA = {
      ...MOCK_ENGINE,
      isaPensionRouting: { isaHeadroom: { remaining: 15000 }, daysUntilTaxYearEnd: 10 },
    };
    const result = computeTilePriority(urgentISA, MOCK_MARKET, MOCK_AGENT);
    const isaTile = result.tiles.find(t => t.id === 'isa-deadline');
    expect(isaTile).toBeDefined();
    expect(isaTile.urgency).toBe('critical');
    expect(isaTile.priority).toBeGreaterThanOrEqual(8);
  });

  test('high drift boosts drift tile priority', () => {
    const driftedEngine = {
      ...MOCK_ENGINE,
      driftMonitor: { maxDrift: 7.0, urgency: 'Action Needed' },
    };
    const result = computeTilePriority(driftedEngine, MOCK_MARKET, MOCK_AGENT);
    const driftTile = result.tiles.find(t => t.id === 'drift');
    expect(driftTile).toBeDefined();
    expect(driftTile.urgency).toBe('critical');
  });

  test('critical alerts boost alerts tile', () => {
    const alertAgent = {
      ...MOCK_AGENT,
      triggerAlerts: { summary: { critical: 3 }, alerts: [] },
    };
    const result = computeTilePriority(MOCK_ENGINE, MOCK_MARKET, alertAgent);
    const alertsTile = result.tiles.find(t => t.id === 'alerts');
    expect(alertsTile).toBeDefined();
    expect(alertsTile.urgency).toBe('critical');
  });

  test('no-debt engine suppresses debt tile', () => {
    const noDebt = { ...MOCK_ENGINE, debtPriority: { highestAPR: 0, totalDebt: 0 } };
    const result = computeTilePriority(noDebt, MOCK_MARKET, MOCK_AGENT);
    const debtTile = result.tiles.find(t => t.id === 'debt');
    if (debtTile) {
      expect(debtTile.priority).toBeLessThanOrEqual(4);
    }
  });
});
