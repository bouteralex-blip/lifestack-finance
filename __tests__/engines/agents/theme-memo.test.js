import { generateThemeMemo } from '../../../lib/engines/agents/theme-memo.js';

const MOCK_MARKET = {
  regime: { regime: 'Expansion', riskPosture: 'Risk On', confidence: 70 },
  stress: { compositeScore: 30, compositeLevel: 'Normal' },
  btcCycle: { phase: 'Accumulation', posture: 'Accumulate', bias: 3, confidence: 65 },
  sectorLeadership: { leaders: ['Technology', 'Industrials'] },
  creditStress: { compositeScore: 20, compositeLevel: 'Low' },
};

const MOCK_HOLDINGS = [
  { ticker: 'NVDA', name: 'NVIDIA', value: 5000, weight: 5 },
  { ticker: 'VWRL', name: 'Vanguard All-World', value: 50000, weight: 50 },
  { ticker: 'BTC', name: 'Bitcoin', value: 10000, weight: 10 },
];

describe('generateThemeMemo', () => {
  test('returns null for null/undefined theme', () => {
    expect(generateThemeMemo(null)).toBeNull();
    expect(generateThemeMemo(undefined)).toBeNull();
  });

  test('returns complete state for string theme', () => {
    const result = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    expect(result).not.toBeNull();
    expect(result.theme).toBeTruthy();
    expect(result.themeId).toBe('ai-semis');
    expect(result.date).toBeTruthy();
    expect(result.thesis).toBeTruthy();
    expect(result.evidence).toBeDefined();
    expect(Array.isArray(result.evidence)).toBe(true);
    expect(result.risks).toBeDefined();
    expect(result.sizing).toBeDefined();
    expect(result.timeline).toBeDefined();
    expect(result.recommendation).toBeTruthy();
    expect(typeof result.conviction).toBe('number');
  });

  test('returns complete state for object theme', () => {
    const result = generateThemeMemo({ id: 'ai-semis', name: 'AI / Semiconductors', sector: 'Technology' }, MOCK_MARKET);
    expect(result).not.toBeNull();
    expect(result.theme).toBe('AI / Semiconductors');
  });

  test('conviction score is between 1 and 10', () => {
    const result = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.conviction).toBeGreaterThanOrEqual(1);
    expect(result.conviction).toBeLessThanOrEqual(10);
  });

  test('evidence includes portfolio exposure', () => {
    const result = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.evidence.some(e => e.source === 'Portfolio')).toBe(true);
  });

  test('BTC theme includes cycle evidence', () => {
    const result = generateThemeMemo('btc-accumulation', MOCK_MARKET, MOCK_HOLDINGS);
    expect(result.evidence.some(e => e.source === 'BTC Cycle Engine')).toBe(true);
  });

  test('sizing has required fields', () => {
    const result = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    expect(typeof result.sizing.currentExposure).toBe('number');
    expect(typeof result.sizing.maxRecommended).toBe('number');
    expect(typeof result.sizing.headroom).toBe('number');
    expect(result.sizing.approach).toBeTruthy();
  });

  test('high stress reduces max sizing', () => {
    const stressed = { ...MOCK_MARKET, stress: { compositeScore: 85, compositeLevel: 'Crisis' } };
    const normal = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    const high = generateThemeMemo('ai-semis', stressed, MOCK_HOLDINGS);
    expect(high.sizing.maxRecommended).toBeLessThan(normal.sizing.maxRecommended);
  });

  test('handles unknown theme gracefully', () => {
    const result = generateThemeMemo('unknown-theme', MOCK_MARKET);
    expect(result).not.toBeNull();
    expect(result.themeId).toBe('unknown-theme');
  });

  test('is deterministic', () => {
    const a = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    const b = generateThemeMemo('ai-semis', MOCK_MARKET, MOCK_HOLDINGS);
    expect(a.conviction).toBe(b.conviction);
    expect(a.thesis).toBe(b.thesis);
  });
});
