import { generatePerformanceBridge } from '../../../lib/engines/agents/performance-bridge.js';

const MOCK_BRIDGE = [
  { label: 'Market Return', value: 8000 },
  { label: 'Contributions', value: 5000 },
  { label: 'Dividends', value: 1200 },
  { label: 'Fees & Costs', value: -400 },
  { label: 'FX Impact', value: -300 },
];

const MOCK_PORT = {
  openingNW: 200000,
  netWorth: 213500,
};

const MOCK_MONTHLY = [
  { month: 'Jan', return: 2.5, absoluteChange: 5000 },
  { month: 'Feb', return: -0.5, absoluteChange: -1000 },
  { month: 'Mar', return: 1.8, absoluteChange: 3600 },
];

describe('generatePerformanceBridge', () => {
  test('returns null for null inputs', () => {
    expect(generatePerformanceBridge(null, null)).toBeNull();
    expect(generatePerformanceBridge(undefined, undefined)).toBeNull();
  });

  test('returns null when both opening and closing are zero', () => {
    expect(generatePerformanceBridge([], { openingNW: 0, netWorth: 0 })).toBeNull();
  });

  test('returns complete state for valid inputs', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT, MOCK_MONTHLY);
    expect(result).not.toBeNull();
    expect(result.memo).toBeDefined();
    expect(result.memo.opening).toBe(200000);
    expect(result.memo.closing).toBe(213500);
    expect(typeof result.memo.change).toBe('number');
    expect(typeof result.memo.changePct).toBe('number');
    expect(result.memo.components).toBeDefined();
    expect(Array.isArray(result.memo.components)).toBe(true);
    expect(result.topDriver).toBeDefined();
    expect(result.narrative).toBeTruthy();
    expect(result.implication).toBeTruthy();
  });

  test('change computed correctly', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT);
    expect(result.memo.change).toBeCloseTo(13500, 0);
  });

  test('components include residual if they do not sum to change', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT);
    const componentSum = result.memo.components.reduce((s, c) => s + c.value, 0);
    expect(componentSum).toBeCloseTo(result.memo.change, 0);
  });

  test('top driver is the component with largest absolute value', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT);
    expect(result.topDriver).not.toBeNull();
    expect(result.topDriver.label).toBe('Market Return');
  });

  test('monthly breakdown populated when provided', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT, MOCK_MONTHLY);
    expect(result.monthlyBreakdown.length).toBe(3);
    result.monthlyBreakdown.forEach(m => {
      expect(m.month).toBeTruthy();
      expect(typeof m.return).toBe('number');
    });
  });

  test('positive change produces positive implication', () => {
    const result = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT);
    expect(result.narrative).toContain('gained');
  });

  test('negative change produces loss narrative', () => {
    const result = generatePerformanceBridge(
      [{ label: 'Market Return', value: -15000 }],
      { openingNW: 200000, netWorth: 185000 }
    );
    expect(result.narrative).toContain('lost');
  });

  test('uses default components when bridge items empty', () => {
    const result = generatePerformanceBridge([], MOCK_PORT);
    expect(result).not.toBeNull();
    expect(result.memo.components.length).toBeGreaterThan(0);
  });

  test('is deterministic', () => {
    const a = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT, MOCK_MONTHLY);
    const b = generatePerformanceBridge(MOCK_BRIDGE, MOCK_PORT, MOCK_MONTHLY);
    expect(a.memo.change).toBe(b.memo.change);
    expect(a.topDriver.label).toBe(b.topDriver.label);
  });
});
