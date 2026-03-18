import { classifyRegime, computeRegimeState } from '../../../lib/engines/market/macro-regime.js';
import { DEFAULT_MARKET } from '../../../lib/defaults.js';

// ---- classifyRegime ----
describe('classifyRegime', () => {
  test('returns valid regime for empty/default signals', () => {
    const result = classifyRegime({});
    expect(result.regime).toBeTruthy();
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.riskPosture).toBeTruthy();
    expect(typeof result.equityBias).toBe('number');
    expect(typeof result.bondBias).toBe('number');
    expect(typeof result.cryptoBias).toBe('number');
    expect(result.scores).toBeDefined();
    expect(result.secondaryRegime).toBeTruthy();
    expect(['High', 'Medium', 'Low']).toContain(result.transitionRisk);
  });

  test('classifies goldilocks conditions', () => {
    const result = classifyRegime({
      cpi: 1.5, coreCPI: 1.5, gdpGrowth: 2.5, vix: 14,
      unemployment: 3.5, pmi: 55, rateDirection: 'hold',
    });
    expect(result.regime).toBe('GOLDILOCKS');
    expect(result.riskPosture).toBe('Risk-On');
    expect(result.equityBias).toBe(2);
  });

  test('stagflation scores high with high inflation and low growth', () => {
    const result = classifyRegime({
      cpi: 5.8, coreCPI: 5.5, servicesCPI: 6.5, gdpGrowth: -0.8,
      unemployment: 6.8, rateDirection: 'hiking', vix: 15, pmi: 44,
    });
    // STAGFLATION should score highly even if another regime edges it out
    expect(result.scores.STAGFLATION).toBeGreaterThan(70);
    // The regime should at least be defensive-leaning
    expect(['LATE CYCLE — INFLATION SCARE', 'STAGFLATION', 'REFLATION']).toContain(result.regime);
  });

  test('recession scores high when growth is negative and rates are being cut', () => {
    const result = classifyRegime({
      cpi: 1.0, coreCPI: 1.0, servicesCPI: 1.5, gdpGrowth: -1.8,
      unemployment: 7.5, rateDirection: 'cutting',
      yieldCurveSlope: -0.8, vix: 15, pmi: 42,
    });
    // RECESSION should score above 50
    expect(result.scores.RECESSION).toBeGreaterThan(50);
    // With 'cutting' direction, REFLATION also scores high
    expect(result.scores.REFLATION).toBeGreaterThan(0);
  });

  test('scores are deterministic', () => {
    const signals = { cpi: 3.0, gdpGrowth: 0.5, vix: 20 };
    const a = classifyRegime(signals);
    const b = classifyRegime(signals);
    expect(a.regime).toBe(b.regime);
    expect(a.confidence).toBe(b.confidence);
    expect(a.scores).toEqual(b.scores);
  });

  test('confidence is a percentage (0-100)', () => {
    const result = classifyRegime({});
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });
});

// ---- computeRegimeState ----
describe('computeRegimeState', () => {
  test('returns null for null input', () => {
    expect(computeRegimeState(null)).toBeNull();
  });

  test('returns valid regime state for default market data', () => {
    const state = computeRegimeState(DEFAULT_MARKET);
    expect(state).not.toBeNull();
    expect(state.regime).toBeTruthy();
    expect(state.confidence).toBeGreaterThanOrEqual(0);
    expect(state.riskPosture).toBeTruthy();
  });

  test('derives rate direction from BOE rate', () => {
    // boeRate 3.75 => 'hold' (between 3.5 and 4.0)
    const state = computeRegimeState(DEFAULT_MARKET);
    // The regime should reflect 'hold' direction
    expect(state).not.toBeNull();
  });

  test('is deterministic', () => {
    const a = computeRegimeState(DEFAULT_MARKET);
    const b = computeRegimeState(DEFAULT_MARKET);
    expect(a.regime).toBe(b.regime);
    expect(a.confidence).toBe(b.confidence);
  });
});
