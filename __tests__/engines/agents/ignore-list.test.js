import { computeIgnoreList } from '../../../lib/engines/agents/ignore-list.js';

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 1.5 },
  debtPriority: { totalDebt: 0, highestAPR: 0 },
  concentration: { hhi: 1200, violations: [], clutter: { count: 2 } },
  isaPensionRouting: { isaHeadroom: { remaining: 0 }, daysUntilTaxYearEnd: 200 },
  wrapperExposure: { efficiency: { score: 8 } },
  currencyExposure: { homeBias: 30 },
};

const MOCK_MARKET = {
  stress: { compositeScore: 20 },
  regime: { regime: 'Expansion', regimeChanged: false },
  creditStress: { compositeScore: 15 },
  btcCycle: { bias: 1, phase: 'Neutral' },
  yieldCurve: { shape: 'Normal' },
};

describe('computeIgnoreList', () => {
  test('returns null for null engineState', () => {
    expect(computeIgnoreList(null, null)).toBeNull();
    expect(computeIgnoreList(undefined, {})).toBeNull();
  });

  test('returns valid structure with empty engine state', () => {
    const result = computeIgnoreList({}, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.ignoreItems)).toBe(true);
    expect(Array.isArray(result.focusItems)).toBe(true);
    expect(typeof result.noiseScore).toBe('number');
    expect(result.totalIgnored).toBe(result.ignoreItems.length);
    expect(result.totalFocused).toBe(result.focusItems.length);
    expect(result.timestamp).toBeTruthy();
  });

  test('quiet conditions produce many ignore items', () => {
    const result = computeIgnoreList(MOCK_ENGINE, MOCK_MARKET);
    expect(result.ignoreItems.length).toBeGreaterThan(3);
    expect(result.focusItems.length).toBe(0);
    expect(result.noiseScore).toBeGreaterThan(50);
  });

  test('each ignore item has required fields', () => {
    const result = computeIgnoreList(MOCK_ENGINE, MOCK_MARKET);
    result.ignoreItems.forEach(item => {
      expect(item.topic).toBeTruthy();
      expect(item.reason).toBeTruthy();
      expect(item.expectedValue).toBeDefined();
    });
  });

  test('elevated stress produces focus items instead of ignore', () => {
    const stressedMarket = { ...MOCK_MARKET, stress: { compositeScore: 75 } };
    const result = computeIgnoreList(MOCK_ENGINE, stressedMarket);
    expect(result.focusItems.length).toBeGreaterThan(0);
  });

  test('high drift produces focus item', () => {
    const driftedEngine = { ...MOCK_ENGINE, driftMonitor: { maxDrift: 7 } };
    const result = computeIgnoreList(driftedEngine, MOCK_MARKET);
    const driftFocus = result.focusItems.find(f => f.includes('Drift'));
    expect(driftFocus).toBeDefined();
  });
});
