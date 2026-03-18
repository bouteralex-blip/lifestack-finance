// =========================================================================
// LIFESTACK OS — EARNINGS REVISION ENGINE
// Phase 3: Market Intelligence
// Consensus EPS revision breadth for S&P 500 and key sector analysis
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
 * Classify revision direction from breadth score
 * Breadth > 55% = more upgrades than downgrades
 * Breadth < 45% = more downgrades than upgrades
 */
function classifyDirection(breadth) {
  if (breadth > 55) return 'upgrading';
  if (breadth < 45) return 'downgrading';
  return 'stable';
}

/**
 * Classify risk level from forward PE and earnings direction
 */
function classifyRisk(forwardPE, direction, earningsGrowth) {
  if (forwardPE > 22 && direction === 'downgrading') return 'high';
  if (forwardPE > 20 && earningsGrowth < 5) return 'elevated';
  if (forwardPE < 16 && direction === 'upgrading') return 'low';
  return 'moderate';
}

/**
 * Compute earnings revision state from market data
 */
export function computeEarningsRevisionState(marketData) {
  if (!marketData) return null;

  const breadth = marketData.epsRevisionBreadth ?? 48;      // % of upgrades vs total revisions
  const forwardPE = marketData.sp500ForwardPE ?? 19.5;
  const earningsGrowth = marketData.earningsGrowth ?? 8.2;  // % YoY
  const sectorRevisions = marketData.sectorRevisions || null;

  const direction = classifyDirection(breadth);
  const riskLevel = classifyRisk(forwardPE, direction, earningsGrowth);

  let implication;
  if (direction === 'downgrading' && riskLevel === 'high') {
    implication = 'Earnings downgrades accelerating on rich valuations — significant drawdown risk. Reduce equity beta.';
  } else if (direction === 'downgrading') {
    implication = 'Earnings estimates drifting lower — caution warranted. Favour quality and defensive sectors.';
  } else if (direction === 'upgrading') {
    implication = 'Earnings upgrades broadening — fundamental support for equities. Favour cyclicals and growth.';
  } else {
    implication = 'Earnings revisions stable — no strong directional signal. Monitor sector-level trends.';
  }

  return {
    breadth,
    direction,
    forwardPE,
    earningsGrowth,
    riskLevel,
    implication,
  };
}
