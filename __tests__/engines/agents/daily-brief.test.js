import { generateDailyBrief } from '../../../lib/engines/agents/daily-brief.js';

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', regimeChanged: false, confidence: 75 },
  stress: { compositeScore: 35, compositeLevel: 'Normal', topStressors: [] },
  yieldCurve: { shape: 'Normal', signal: 'Neutral' },
  creditStress: { compositeScore: 20, compositeLevel: 'Low' },
  btcCycle: { phase: 'Accumulation', posture: 'Accumulate', phaseChanged: false },
  sectorLeadership: { marketBreadth: 'Healthy', leaders: ['Technology'] },
};

const MOCK_ENGINE = {
  concentration: { hhi: 1500 },
  driftMonitor: { maxDrift: 2.5, urgency: 'Normal' },
};

const MOCK_PORT = { netWorth: 200000 };

describe('generateDailyBrief', () => {
  test('returns null for null/undefined marketState', () => {
    expect(generateDailyBrief(null)).toBeNull();
    expect(generateDailyBrief(undefined)).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generateDailyBrief(MOCK_MARKET, MOCK_ENGINE, MOCK_PORT);
    expect(result).not.toBeNull();
    expect(result.date).toBeTruthy();
    expect(result.timestamp).toBeTruthy();
    expect(result.headline).toBeTruthy();
    expect(result.marketSnapshot).toBeDefined();
    expect(Array.isArray(result.marketSnapshot)).toBe(true);
    expect(result.keyMoves).toBeDefined();
    expect(result.portfolioRelevance).toBeDefined();
    expect(result.outlook).toBeTruthy();
    expect(result.riskFlags).toBeDefined();
  });

  test('market snapshot has 6 metrics', () => {
    const result = generateDailyBrief(MOCK_MARKET, MOCK_ENGINE, MOCK_PORT);
    expect(result.marketSnapshot.length).toBe(6);
  });

  test('each snapshot metric has required fields', () => {
    const result = generateDailyBrief(MOCK_MARKET, MOCK_ENGINE, MOCK_PORT);
    result.marketSnapshot.forEach(m => {
      expect(m.metric).toBeTruthy();
      expect(m.signal).toBeTruthy();
    });
  });

  test('elevated stress produces defensive headline', () => {
    const stressed = { ...MOCK_MARKET, stress: { compositeScore: 75, compositeLevel: 'Elevated', topStressors: ['VIX spike'] } };
    const result = generateDailyBrief(stressed, MOCK_ENGINE, MOCK_PORT);
    expect(result.headline).toContain('stress elevated');
  });

  test('regime change produces regime shift headline', () => {
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateDailyBrief(shifted, MOCK_ENGINE, MOCK_PORT);
    expect(result.headline).toContain('Regime shift');
  });

  test('key moves includes regime change when present', () => {
    const shifted = { ...MOCK_MARKET, regime: { ...MOCK_MARKET.regime, regimeChanged: true } };
    const result = generateDailyBrief(shifted, MOCK_ENGINE, MOCK_PORT);
    expect(result.keyMoves.some(m => m.type === 'Regime')).toBe(true);
  });

  test('risk flags include high stress', () => {
    const stressed = { ...MOCK_MARKET, stress: { compositeScore: 65, compositeLevel: 'Elevated' } };
    const result = generateDailyBrief(stressed, MOCK_ENGINE, MOCK_PORT);
    expect(result.riskFlags.some(f => f.level === 'high')).toBe(true);
  });

  test('works with minimal market state', () => {
    const result = generateDailyBrief({});
    expect(result).not.toBeNull();
    expect(result.headline).toBeTruthy();
  });

  test('is deterministic for same inputs', () => {
    const a = generateDailyBrief(MOCK_MARKET, MOCK_ENGINE, MOCK_PORT);
    const b = generateDailyBrief(MOCK_MARKET, MOCK_ENGINE, MOCK_PORT);
    expect(a.headline).toBe(b.headline);
    expect(a.outlook).toBe(b.outlook);
  });
});
