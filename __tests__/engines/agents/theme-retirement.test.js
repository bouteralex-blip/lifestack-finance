import { computeThemeRetirement } from '../../../lib/engines/agents/theme-retirement.js';

const MOCK_DECISION_LOG = {
  themes: [
    {
      name: 'AI Infrastructure',
      type: 'theme',
      createdAt: '2026-02-01',
      performance: 12,
      conviction: 8,
    },
    {
      name: 'Emerging Market Bonds',
      type: 'theme',
      createdAt: '2024-06-01',
      performance: -8,
      conviction: 4,
    },
    {
      name: 'Green Energy',
      type: 'theme',
      createdAt: '2024-03-01',
      performance: -2,
      conviction: 6,
    },
    {
      name: 'Gold Hedge',
      type: 'theme',
      createdAt: '2025-10-01',
      performance: 3,
      conviction: 7,
      thesisInvalidated: true,
    },
  ],
};

const MOCK_ENGINE = {
  driftMonitor: { maxDrift: 3 },
  concentration: { hhi: 1500 },
};

describe('computeThemeRetirement', () => {
  test('returns null for null decisionLog', () => {
    expect(computeThemeRetirement(null, null)).toBeNull();
    expect(computeThemeRetirement(undefined, {})).toBeNull();
  });

  test('returns valid structure with empty decision log', () => {
    const result = computeThemeRetirement({}, null);
    expect(result).toBeDefined();
    expect(Array.isArray(result.staleThemes)).toBe(true);
    expect(Array.isArray(result.activeThemes)).toBe(true);
    expect(Array.isArray(result.retirementCandidates)).toBe(true);
    expect(typeof result.implication).toBe('string');
    expect(typeof result.totalThemes).toBe('number');
    expect(result.timestamp).toBeTruthy();
  });

  test('returns valid structure with array-format decision log', () => {
    const arrayLog = [
      { type: 'theme', name: 'Test Theme', createdAt: '2025-12-01', performance: 5 },
    ];
    const result = computeThemeRetirement(arrayLog, null);
    expect(result).toBeDefined();
    expect(result.totalThemes).toBe(1);
  });

  test('identifies invalidated theme as retirement candidate', () => {
    const result = computeThemeRetirement(MOCK_DECISION_LOG, MOCK_ENGINE);
    const goldHedge = result.retirementCandidates.find(t => t.theme === 'Gold Hedge');
    expect(goldHedge).toBeDefined();
    expect(goldHedge.status).toBe('retire');
    expect(goldHedge.thesisValid).toBe(false);
  });

  test('identifies old negative-performance theme as retirement candidate', () => {
    const result = computeThemeRetirement(MOCK_DECISION_LOG, MOCK_ENGINE);
    const emBonds = result.retirementCandidates.find(t => t.theme === 'Emerging Market Bonds');
    expect(emBonds).toBeDefined();
    expect(emBonds.status).toBe('retire');
    expect(emBonds.performance).toBeLessThan(-5);
  });

  test('keeps strong recent theme as active', () => {
    const result = computeThemeRetirement(MOCK_DECISION_LOG, MOCK_ENGINE);
    const aiTheme = result.activeThemes.find(t => t.theme === 'AI Infrastructure');
    expect(aiTheme).toBeDefined();
    expect(aiTheme.status).toBe('active');
    expect(aiTheme.thesisValid).toBe(true);
  });

  test('each theme has required enriched fields', () => {
    const result = computeThemeRetirement(MOCK_DECISION_LOG, MOCK_ENGINE);
    const allThemes = [...result.activeThemes, ...result.staleThemes, ...result.retirementCandidates];
    allThemes.forEach(theme => {
      expect(theme.theme).toBeTruthy();
      expect(typeof theme.age).toBe('number');
      expect(typeof theme.ageLabel).toBe('string');
      expect(typeof theme.performance).toBe('number');
      expect(typeof theme.performanceLabel).toBe('string');
      expect(typeof theme.thesisValid).toBe('boolean');
      expect(typeof theme.reason).toBe('string');
      expect(theme.status).toBeTruthy();
    });
  });
});
