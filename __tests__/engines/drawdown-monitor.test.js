import { computeDrawdownState } from '../../lib/engines/drawdown-monitor.js';

// Simulated weekly net worth history: peak then decline then partial recovery
const NW_HISTORY = [100000, 105000, 110000, 108000, 102000, 95000, 98000, 100000, 103000];

describe('computeDrawdownState', () => {
  test('returns null for null/undefined/empty input', () => {
    expect(computeDrawdownState(null)).toBeNull();
    expect(computeDrawdownState(undefined)).toBeNull();
    expect(computeDrawdownState([])).toBeNull();
  });

  test('returns null for single-entry history', () => {
    expect(computeDrawdownState([100000])).toBeNull();
  });

  test('returns complete state for valid history', () => {
    const result = computeDrawdownState(NW_HISTORY);
    expect(result).not.toBeNull();
    expect(typeof result.currentDD).toBe('number');
    expect(typeof result.maxDD).toBe('number');
    expect(typeof result.peak).toBe('number');
    expect(typeof result.trough).toBe('number');
    expect(result.drawdownLevel).toBeTruthy();
    expect(result.drawdownSeries).toBeDefined();
    expect(Array.isArray(result.drawdownSeries)).toBe(true);
    expect(typeof result.drawdownScore).toBe('number');
    expect(result.implication).toBeTruthy();
  });

  test('current drawdown is non-negative', () => {
    const result = computeDrawdownState(NW_HISTORY);
    expect(result.currentDD).toBeGreaterThanOrEqual(0);
  });

  test('max drawdown is at least as large as current drawdown', () => {
    const result = computeDrawdownState(NW_HISTORY);
    expect(result.maxDD).toBeGreaterThanOrEqual(result.currentDD);
  });

  test('classifies no drawdown at all-time high', () => {
    const rising = [100000, 105000, 110000, 115000, 120000];
    const result = computeDrawdownState(rising);
    expect(result.currentDD).toBe(0);
    expect(result.drawdownLevel).toBe('none');
  });

  test('classifies severe drawdown correctly', () => {
    const crash = [100000, 105000, 110000, 80000, 75000];
    const result = computeDrawdownState(crash);
    expect(result.drawdownLevel).toBe('severe');
    expect(result.implication).toContain('severe drawdown');
  });

  test('drawdown score stays in 0-10 range', () => {
    const result = computeDrawdownState(NW_HISTORY);
    expect(result.drawdownScore).toBeGreaterThanOrEqual(0);
    expect(result.drawdownScore).toBeLessThanOrEqual(10);

    const crash = [100000, 50000];
    const severe = computeDrawdownState(crash);
    expect(severe.drawdownScore).toBeGreaterThanOrEqual(0);
    expect(severe.drawdownScore).toBeLessThanOrEqual(10);
  });

  test('recovery estimate is positive when in drawdown with positive avg return', () => {
    // History with overall positive trend but currently in drawdown
    const history = [100000, 110000, 120000, 115000, 112000];
    const result = computeDrawdownState(history);
    if (result.currentDD > 0 && result.recoveryEstimate !== null) {
      expect(result.recoveryEstimate).toBeGreaterThan(0);
    }
  });

  test('supports object-style entries', () => {
    const history = [
      { value: 100000 }, { value: 105000 }, { value: 110000 }, { value: 100000 },
    ];
    const result = computeDrawdownState(history);
    expect(result).not.toBeNull();
    expect(result.currentDD).toBeGreaterThan(0);
  });

  test('is deterministic', () => {
    const a = computeDrawdownState(NW_HISTORY);
    const b = computeDrawdownState(NW_HISTORY);
    expect(a.currentDD).toBe(b.currentDD);
    expect(a.maxDD).toBe(b.maxDD);
    expect(a.drawdownScore).toBe(b.drawdownScore);
  });
});
