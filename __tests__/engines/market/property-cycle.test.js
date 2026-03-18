import { computePropertyCycleState } from '../../../lib/engines/market/property-cycle.js';

describe('computePropertyCycleState', () => {
  test('returns valid structure with defaults', () => {
    const result = computePropertyCycleState({});
    expect(result).toHaveProperty('phase');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('signals');
    expect(result).toHaveProperty('implications');
    expect(result).toHaveProperty('verdict');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('handles null input gracefully', () => {
    const result = computePropertyCycleState(null);
    expect(result.phase).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('detects expansion when conditions favourable', () => {
    const result = computePropertyCycleState({
      mortgage_rate: 3.0,
      hpi_yoy: 6.0,
      reit_return_ytd: 12,
      transactions_yoy: 15,
      affordability_ratio: 5.5,
    });
    expect(result.phase).toBe('expansion');
    expect(result.score).toBeGreaterThan(60);
  });

  test('detects contraction when conditions adverse', () => {
    const result = computePropertyCycleState({
      mortgage_rate: 7.0,
      hpi_yoy: -5.0,
      reit_return_ytd: -15,
      transactions_yoy: -20,
      affordability_ratio: 11,
    });
    expect(['slowdown', 'contraction']).toContain(result.phase);
    expect(result.score).toBeLessThan(40);
  });

  test('generates appropriate signals', () => {
    const result = computePropertyCycleState({ mortgage_rate: 7.0 });
    const mortgageSignal = result.signals.find(s => s.signal.includes('Mortgage'));
    expect(mortgageSignal).toBeDefined();
    expect(mortgageSignal.impact).toBe('negative');
  });

  test('generates implications based on phase', () => {
    const expansion = computePropertyCycleState({ mortgage_rate: 2.5, hpi_yoy: 8, reit_return_ytd: 15, affordability_ratio: 5 });
    expect(expansion.implications.length).toBeGreaterThan(0);
    expect(expansion.implications.some(i => i.includes('REIT'))).toBe(true);
  });
});
