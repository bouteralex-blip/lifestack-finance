import {
  computeDriftMonitorState,
  computeDrift,
  classifyRebalanceUrgency,
  estimateTaxCostOfRebalance,
  generateRebalanceTrades,
} from '../../lib/engines/drift-monitor.js';
import { DEFAULT_HOLDINGS } from '../../lib/defaults.js';

// ---- computeDrift ----
describe('computeDrift', () => {
  test('returns empty array for empty holdings', () => {
    expect(computeDrift([])).toEqual([]);
  });

  test('computes drift for each sleeve with default holdings', () => {
    const drifts = computeDrift(DEFAULT_HOLDINGS);
    expect(drifts.length).toBeGreaterThan(0);
    drifts.forEach(d => {
      expect(d.name).toBeTruthy();
      expect(typeof d.actual).toBe('number');
      expect(typeof d.target).toBe('number');
      expect(typeof d.drift).toBe('number');
      expect(d.drift).toBeCloseTo(d.actual - d.target, 1);
      expect(['OW', 'UW', '—']).toContain(d.direction);
      expect(['Urgent', 'Minor', 'OK']).toContain(d.status);
    });
  });

  test('sorted by absolute drift descending', () => {
    const drifts = computeDrift(DEFAULT_HOLDINGS);
    for (let i = 1; i < drifts.length; i++) {
      expect(drifts[i - 1].absDrift).toBeGreaterThanOrEqual(drifts[i].absDrift);
    }
  });

  test('custom targets produce different drifts', () => {
    const defaultDrifts = computeDrift(DEFAULT_HOLDINGS);
    const customDrifts = computeDrift(DEFAULT_HOLDINGS, { Equity: 90, Crypto: 1 });
    expect(defaultDrifts[0].drift).not.toBe(customDrifts[0].drift);
  });
});

// ---- classifyRebalanceUrgency ----
describe('classifyRebalanceUrgency', () => {
  test('returns Clean for empty drifts', () => {
    expect(classifyRebalanceUrgency([])).toBe('Clean');
    expect(classifyRebalanceUrgency(null)).toBe('Clean');
  });

  test('returns Urgent when multiple sleeves exceed threshold', () => {
    const drifts = [
      { absDrift: 8, status: 'Urgent' },
      { absDrift: 7, status: 'Urgent' },
    ];
    expect(classifyRebalanceUrgency(drifts)).toBe('Urgent');
  });

  test('returns Action Needed when scheduled rebalance is due', () => {
    const drifts = [{ absDrift: 1, status: 'OK' }];
    expect(classifyRebalanceUrgency(drifts, 5, 100, 90)).toBe('Action Needed');
  });

  test('returns Monitor for minor drift', () => {
    const drifts = [{ absDrift: 3, status: 'Minor' }];
    expect(classifyRebalanceUrgency(drifts)).toBe('Monitor');
  });

  test('returns Clean for minimal drift', () => {
    const drifts = [{ absDrift: 1, status: 'OK' }];
    expect(classifyRebalanceUrgency(drifts)).toBe('Clean');
  });
});

// ---- estimateTaxCostOfRebalance ----
describe('estimateTaxCostOfRebalance', () => {
  test('returns 0 for empty drifts or zero portfolio', () => {
    expect(estimateTaxCostOfRebalance([], 100000)).toBe(0);
    expect(estimateTaxCostOfRebalance([{ drift: 5 }], 0)).toBe(0);
  });

  test('estimates positive tax cost for overweight selling', () => {
    const drifts = [{ drift: 10 }]; // 10% overweight
    const cost = estimateTaxCostOfRebalance(drifts, 100000);
    expect(cost).toBeGreaterThan(0);
  });

  test('no cost if nothing is overweight', () => {
    const drifts = [{ drift: -5 }]; // underweight only
    const cost = estimateTaxCostOfRebalance(drifts, 100000);
    expect(cost).toBe(0);
  });
});

// ---- generateRebalanceTrades ----
describe('generateRebalanceTrades', () => {
  test('returns empty for null/empty drifts or zero portfolio', () => {
    expect(generateRebalanceTrades([], 100000)).toEqual([]);
    expect(generateRebalanceTrades([{ drift: 1 }], 0)).toEqual([]);
  });

  test('generates sells for overweight and buys for underweight', () => {
    const drifts = [
      { name: 'Crypto', drift: 8 },
      { name: 'Equity', drift: -6 },
    ];
    const trades = generateRebalanceTrades(drifts, 100000);
    expect(trades.some(t => t.action === 'Sell')).toBe(true);
    expect(trades.some(t => t.action === 'Buy')).toBe(true);
  });

  test('ignores small drifts (within 2% tolerance)', () => {
    const drifts = [
      { name: 'Cash', drift: 1 },
      { name: 'Equity', drift: -1 },
    ];
    expect(generateRebalanceTrades(drifts, 100000)).toEqual([]);
  });
});

// ---- computeDriftMonitorState (master function) ----
describe('computeDriftMonitorState', () => {
  test('returns null for null/empty input', () => {
    expect(computeDriftMonitorState(null)).toBeNull();
    expect(computeDriftMonitorState([])).toBeNull();
  });

  test('returns complete state for default holdings', () => {
    const state = computeDriftMonitorState(DEFAULT_HOLDINGS);
    expect(state).not.toBeNull();
    expect(state.drifts.length).toBeGreaterThan(0);
    expect(state.maxDrift).toBeGreaterThanOrEqual(0);
    expect(['Urgent', 'Action Needed', 'Monitor', 'Clean']).toContain(state.urgency);
    expect(state.estimatedTaxCost).toBeGreaterThanOrEqual(0);
    expect(state.driftScore).toBeGreaterThanOrEqual(0);
    expect(state.driftScore).toBeLessThanOrEqual(10);
  });

  test('is deterministic', () => {
    const a = computeDriftMonitorState(DEFAULT_HOLDINGS);
    const b = computeDriftMonitorState(DEFAULT_HOLDINGS);
    expect(a.maxDrift).toBe(b.maxDrift);
    expect(a.urgency).toBe(b.urgency);
    expect(a.driftScore).toBe(b.driftScore);
  });

  test('daysSinceRebalance is included in output', () => {
    const state = computeDriftMonitorState(DEFAULT_HOLDINGS, undefined, 45);
    expect(state.daysSinceRebalance).toBe(45);
  });
});
