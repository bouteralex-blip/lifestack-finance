// =========================================================================
// LIFESTACK OS — YIELD CURVE WATCHER
// Phase 3: Market Intelligence
// Monitors yield curve shape, inversions, and steepening/flattening signals
// =========================================================================

/**
 * Standard tenors for yield curve analysis
 */
const TENORS = ['3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '30Y'];

/**
 * Compute yield curve metrics from curve data
 */
export function computeYieldCurveState(curveData, country = 'UK') {
  if (!curveData?.length) return null;

  // Extract key points
  const get = (tenor) => curveData.find(p => p.t === tenor);
  const y2 = get('2Y');
  const y10 = get('10Y');
  const y30 = get('30Y');
  const y3m = get('3M');

  if (!y2 || !y10) return null;

  // Key spreads
  const spread2s10s = +((y10.uk || y10.us) - (y2.uk || y2.us)).toFixed(2);
  const spread2s30s = y30 ? +((y30.uk || y30.us) - (y2.uk || y2.us)).toFixed(2) : null;
  const spread3m10y = y3m ? +((y10.uk || y10.us) - (y3m.uk || y3m.us)).toFixed(2) : null;

  // Curve shape classification
  const isInverted = spread2s10s < 0;
  const isSteep = spread2s10s > 1.0;
  const isFlat = Math.abs(spread2s10s) < 0.3;

  let shape, signal, implication;
  if (isInverted) {
    shape = 'INVERTED';
    signal = 'Recession signal';
    implication = 'Historically precedes recession by 12-18 months. Favour short duration, cash, defensive equity.';
  } else if (isFlat) {
    shape = 'FLAT';
    signal = 'Late cycle';
    implication = 'Curve flattening often signals tightening financial conditions. Growth slowing.';
  } else if (isSteep) {
    shape = 'STEEP';
    signal = 'Recovery / Reflation';
    implication = 'Steep curve favours banks, cyclicals. Suggests growth expectations improving.';
  } else {
    shape = 'NORMAL';
    signal = 'Neutral';
    implication = 'Normal upward slope. No strong duration signal.';
  }

  // Compute curve steepness score (0 = deeply inverted, 10 = very steep)
  const steepnessScore = Math.min(10, Math.max(0, +(5 + spread2s10s * 3).toFixed(1)));

  // Build full curve for visualization
  const points = curveData.map(p => ({
    tenor: p.t,
    uk: p.uk || null,
    us: p.us || null,
    spread: p.uk && p.us ? +((p.uk - p.us).toFixed(2)) : null,
  }));

  return {
    country,
    shape,
    signal,
    implication,
    spread2s10s,
    spread2s30s,
    spread3m10y,
    steepnessScore,
    isInverted,
    keyRates: {
      twoYear: y2.uk || y2.us,
      tenYear: y10.uk || y10.us,
      thirtyYear: y30 ? (y30.uk || y30.us) : null,
    },
    points,
    durationBias: isInverted ? 'Short duration' : isSteep ? 'Long duration' : 'Neutral',
  };
}
