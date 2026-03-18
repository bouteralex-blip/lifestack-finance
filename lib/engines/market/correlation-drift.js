// =========================================================================
// LIFESTACK OS — CORRELATION DRIFT MONITOR
// Phase 3: Market Intelligence
// Rolling 60-day cross-asset correlations to detect regime breaks
// =========================================================================

/** Utility: clamp value between min and max */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/** Utility: map a value from one range to another */
function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Default historical correlation baselines (long-run averages)
 */
const HISTORICAL_BASELINES = {
  stockBond: -0.30,
  stockGold: -0.10,
  stockBTC:   0.45,
  bondGold:   0.20,
};

/**
 * Classify correlation regime for a pair
 */
function classifyRegime(pair, current, historical) {
  const drift = Math.abs(current - historical);
  if (drift > 0.40) return 'regime break';
  if (drift > 0.20) return 'drifting';
  return 'stable';
}

/**
 * Compute diversification score from correlations
 * Lower cross-asset correlations = better diversification
 */
function computeDiversificationScore(correlations) {
  const avgCorr = Object.values(correlations).reduce((s, v) => s + Math.abs(v), 0) / Object.keys(correlations).length;
  return clamp(+mapRange(avgCorr, 0, 1.0, 100, 0).toFixed(0));
}

/**
 * Compute correlation drift state from market data
 */
export function computeCorrelationDriftState(marketData) {
  if (!marketData) return null;

  const correlations = marketData.correlations || {
    stockBond: -0.15,
    stockGold: 0.05,
    stockBTC: 0.55,
    bondGold: 0.25,
  };

  const pairLabels = {
    stockBond: 'Stocks / Bonds',
    stockGold: 'Stocks / Gold',
    stockBTC:  'Stocks / BTC',
    bondGold:  'Bonds / Gold',
  };

  const pairs = Object.entries(correlations).map(([key, current]) => {
    const historical = HISTORICAL_BASELINES[key] ?? 0;
    const drift = +(current - historical).toFixed(2);
    const regime = classifyRegime(key, current, historical);

    return {
      pair: pairLabels[key] || key,
      current: +current.toFixed(2),
      historical: +historical.toFixed(2),
      drift,
      regime,
    };
  });

  const regimeBreak = pairs.some(p => p.regime === 'regime break');
  const diversificationScore = computeDiversificationScore(correlations);

  let implication;
  if (regimeBreak) {
    implication = 'Correlation regime break detected — traditional hedges may not work. Review portfolio diversification urgently.';
  } else if (diversificationScore < 40) {
    implication = 'High cross-asset correlation — diversification benefits eroding. Consider alternatives and tail hedges.';
  } else if (correlations.stockBond > 0.1) {
    implication = 'Rising stock-bond correlation — bond hedge unreliable. Consider gold or managed futures as alternatives.';
  } else {
    implication = 'Correlations near historical norms — diversification intact. Standard portfolio construction holds.';
  }

  return {
    pairs,
    regimeBreak,
    diversificationScore,
    implication,
  };
}
