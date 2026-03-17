// =========================================================================
// LIFESTACK OS — CFTC POSITIONING ENGINE
// Phase 3: Market Intelligence
// CFTC futures positioning for crowdedness and contrarian signals
// =========================================================================

/** Utility: clamp value between min and max */
function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Default CFTC positions for major futures
 */
const DEFAULT_POSITIONS = [
  { asset: 'S&P 500',   netLong: 120000,  percentile: 72, signal: 'moderate long' },
  { asset: '10Y UST',   netLong: -85000,  percentile: 25, signal: 'short' },
  { asset: 'USD',       netLong: 45000,   percentile: 82, signal: 'crowded long' },
  { asset: 'Gold',      netLong: 180000,  percentile: 88, signal: 'crowded long' },
  { asset: 'Crude',     netLong: 95000,   percentile: 55, signal: 'neutral' },
  { asset: 'EUR',       netLong: -30000,  percentile: 35, signal: 'moderate short' },
];

/**
 * Classify crowdedness from percentile
 */
function classifyCrowdedness(percentile) {
  if (percentile >= 90) return 'extremely crowded long';
  if (percentile >= 75) return 'crowded long';
  if (percentile <= 10) return 'extremely crowded short';
  if (percentile <= 25) return 'crowded short';
  return 'neutral';
}

/**
 * Compute CFTC positioning state from market data
 */
export function computeCFTCPositioningState(marketData) {
  if (!marketData) return null;

  const rawPositions = marketData.cftcPositions || DEFAULT_POSITIONS;

  const positions = rawPositions.map(p => {
    const percentile = clamp(p.percentile ?? 50);
    const crowdedness = classifyCrowdedness(percentile);

    return {
      asset: p.asset,
      netLong: p.netLong ?? 0,
      percentile,
      crowdedness,
    };
  });

  // Find extremes (>90th or <10th percentile)
  const extremes = positions.filter(p => p.percentile >= 90 || p.percentile <= 10);

  // Contrarian signals: extreme positioning suggests mean reversion risk
  const contrarianSignals = extremes.map(p => ({
    asset: p.asset,
    signal: p.percentile >= 90
      ? `Extremely crowded long — contrarian short opportunity`
      : `Extremely crowded short — contrarian long opportunity`,
    percentile: p.percentile,
  }));

  let implication;
  if (extremes.length > 2) {
    implication = 'Multiple positioning extremes — high mean-reversion risk across assets. Reduce directional bets.';
  } else if (extremes.length > 0) {
    implication = `Positioning extreme in ${extremes.map(e => e.asset).join(', ')} — contrarian signals active.`;
  } else {
    implication = 'Positioning balanced — no extreme crowding detected. Trend-following environment.';
  }

  return {
    positions,
    extremes,
    contrarianSignals,
    implication,
  };
}
