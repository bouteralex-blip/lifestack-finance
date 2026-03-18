// =========================================================================
// LIFESTACK OS — INFLATION SHOCK DETECTOR
// Phase 3: Market Intelligence
// CPI trends, breakeven analysis, oil/energy pass-through scoring
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
 * Classify inflation trend from headline vs core relationship
 */
function classifyTrend(cpi, coreCPI, pceDeflator) {
  const avg = (cpi + coreCPI + pceDeflator) / 3;
  if (cpi > coreCPI + 0.3 && avg > 3.0) return 'accelerating';
  if (cpi < coreCPI - 0.3 || avg < 2.5) return 'decelerating';
  return 'stable';
}

/**
 * Compute energy pass-through score
 * High oil + high nat gas = higher pass-through risk
 */
function computeEnergyPassThrough(oilPrice, natGasPrice) {
  const oilScore = clamp(mapRange(oilPrice, 50, 120, 0, 50));
  const gasScore = clamp(mapRange(natGasPrice, 2.0, 6.0, 0, 50));
  return +(oilScore + gasScore).toFixed(0);
}

/**
 * Compute inflation shock probability
 */
function computeShockProbability(cpi, coreCPI, breakeven5Y, energyPassThrough) {
  const cpiScore = clamp(mapRange(cpi, 2.0, 6.0, 0, 30));
  const coreScore = clamp(mapRange(coreCPI, 2.0, 5.0, 0, 25));
  const beScore = clamp(mapRange(breakeven5Y, 2.0, 4.0, 0, 25));
  const energyScore = clamp(mapRange(energyPassThrough, 20, 80, 0, 20));
  return clamp(+(cpiScore + coreScore + beScore + energyScore).toFixed(0));
}

/**
 * Compute inflation shock state from market data
 */
export function computeInflationShockState(marketData) {
  if (!marketData) return null;

  const cpi = marketData.cpi ?? 3.2;
  const coreCPI = marketData.coreCPI ?? 3.4;
  const breakeven5Y = marketData.breakeven5Y ?? 2.35;
  const oilPrice = marketData.oilPrice ?? 78;
  const natGasPrice = marketData.natGasPrice ?? 3.20;
  const pceDeflator = marketData.pceDeflator ?? 2.8;

  const trend = classifyTrend(cpi, coreCPI, pceDeflator);
  const energyPassThrough = computeEnergyPassThrough(oilPrice, natGasPrice);
  const shockProbability = computeShockProbability(cpi, coreCPI, breakeven5Y, energyPassThrough);

  let implication;
  if (shockProbability > 65) {
    implication = 'Inflation shock risk elevated — favour TIPS, commodities, short duration. Avoid long bonds.';
  } else if (shockProbability > 35) {
    implication = 'Inflation moderately sticky — maintain inflation hedges. Monitor energy prices.';
  } else {
    implication = 'Inflation contained — disinflation trend supportive for bonds and growth equities.';
  }

  return {
    headline: cpi,
    core: coreCPI,
    trend,
    breakeven: breakeven5Y,
    energyPassThrough,
    shockProbability,
    implication,
  };
}
