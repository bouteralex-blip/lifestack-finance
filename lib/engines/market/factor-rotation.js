// =========================================================================
// LIFESTACK OS — FACTOR ROTATION ENGINE
// Phase 3: Market Intelligence
// Value/growth/quality/momentum factor performance and rotation signals
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
 * Default factor returns — late-cycle pattern assumptions
 */
const DEFAULT_FACTOR_RETURNS = {
  value:    { return1m: 1.2, return3m: 4.5 },
  growth:   { return1m: -0.8, return3m: -2.1 },
  quality:  { return1m: 0.9, return3m: 3.2 },
  momentum: { return1m: 0.5, return3m: 1.8 },
  minVol:   { return1m: 1.5, return3m: 5.1 },
  size:     { return1m: -1.2, return3m: -3.5 },
};

/**
 * Classify factor signal from 1m and 3m returns
 */
function classifyFactorSignal(return1m, return3m) {
  if (return1m > 1.0 && return3m > 2.0) return 'strong';
  if (return1m > 0 && return3m > 0) return 'positive';
  if (return1m < -1.0 && return3m < -2.0) return 'weak';
  if (return1m < 0) return 'fading';
  return 'neutral';
}

/**
 * Classify regime from leading factor
 */
function classifyRegime(leadingFactor) {
  const regimes = {
    value:    'Value regime — late cycle / rising rates environment',
    growth:   'Growth regime — falling rates, innovation-led rally',
    quality:  'Quality regime — risk-off, flight to quality',
    momentum: 'Momentum regime — trend-following dominant',
    minVol:   'Defensive regime — low volatility preference, risk aversion',
    size:     'Small-cap regime — risk appetite expanding, early cycle',
  };
  return regimes[leadingFactor] || 'Mixed regime — no single factor dominance';
}

/**
 * Compute factor rotation state from market data
 */
export function computeFactorRotationState(marketData) {
  if (!marketData) return null;

  const factorReturns = marketData.factorReturns || DEFAULT_FACTOR_RETURNS;

  const factors = Object.entries(factorReturns).map(([name, data]) => {
    const return1m = data.return1m ?? 0;
    const return3m = data.return3m ?? 0;
    const momentum = return3m > 0 ? clamp(mapRange(return3m, 0, 10, 0, 100)) : -clamp(mapRange(Math.abs(return3m), 0, 10, 0, 100));
    const signal = classifyFactorSignal(return1m, return3m);

    return { name, return1m, return3m, momentum: +momentum.toFixed(0), signal };
  }).sort((a, b) => b.return3m - a.return3m);

  const leadingFactor = factors[0]?.name || 'unknown';

  // Rotation signal: dispersion between best and worst factor
  const bestReturn = factors[0]?.return3m || 0;
  const worstReturn = factors[factors.length - 1]?.return3m || 0;
  const dispersion = Math.abs(bestReturn - worstReturn);
  const rotationSignal = dispersion > 8 ? 'extreme' : dispersion > 4 ? 'active' : 'low';

  const regime = classifyRegime(leadingFactor);

  let implication;
  if (rotationSignal === 'extreme') {
    implication = `Extreme factor dispersion — ${leadingFactor} dominance. Concentration risk high.`;
  } else if (rotationSignal === 'active') {
    implication = `Active factor rotation — ${leadingFactor} leading. Maintain factor diversification.`;
  } else {
    implication = 'Low factor dispersion — no clear factor leadership. Favour balanced exposure.';
  }

  return {
    factors,
    leadingFactor,
    rotationSignal,
    regime,
    implication,
  };
}
