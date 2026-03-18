// =========================================================================
// LIFESTACK OS — DRAWDOWN MONITOR ENGINE
// Phase 2: Finance Operating System
// Current drawdown from peak, max drawdown, recovery time estimation
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Classify drawdown severity level
 */
function classifyDrawdown(ddPct) {
  if (ddPct <= 0) return 'none';
  if (ddPct < 5) return 'none';
  if (ddPct < 10) return 'mild';
  if (ddPct < 20) return 'moderate';
  return 'severe';
}

/**
 * Compute drawdown state from net worth history
 * Tracks current drawdown, max drawdown, recovery estimates
 */
export function computeDrawdownState(nwHistory, portConfig) {
  if (!nwHistory?.length || nwHistory.length < 2) return null;

  const values = nwHistory.map(entry => {
    if (typeof entry === 'number') return entry;
    return entry.value || entry.nw || entry.netWorth || 0;
  }).filter(v => v > 0);

  if (values.length < 2) return null;

  // Compute running peak and drawdowns
  let runningPeak = values[0];
  let maxDD = 0;
  let maxDDPeak = values[0];
  let maxDDTrough = values[0];
  let currentDD = 0;
  let currentPeak = values[0];
  let currentTrough = values[values.length - 1];
  let weeksInDD = 0;
  let ddStartIdx = -1;

  const drawdownSeries = [];

  values.forEach((v, i) => {
    if (v > runningPeak) {
      runningPeak = v;
    }

    const dd = runningPeak > 0 ? ((runningPeak - v) / runningPeak) * 100 : 0;
    drawdownSeries.push(+dd.toFixed(2));

    if (dd > maxDD) {
      maxDD = dd;
      maxDDPeak = runningPeak;
      maxDDTrough = v;
    }
  });

  // Current drawdown (from latest peak to current value)
  const latestValue = values[values.length - 1];
  let peakValue = 0;
  let peakIdx = 0;

  values.forEach((v, i) => {
    if (v >= peakValue) {
      peakValue = v;
      peakIdx = i;
    }
  });

  currentDD = peakValue > 0 ? +((((peakValue - latestValue) / peakValue) * 100)).toFixed(2) : 0;
  currentDD = Math.max(0, currentDD);
  currentPeak = peakValue;
  currentTrough = latestValue;

  // Weeks in current drawdown
  if (currentDD > 0) {
    weeksInDD = values.length - 1 - peakIdx;
  }

  // Recovery estimate based on historical average weekly return
  const weeklyReturns = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) {
      weeklyReturns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
  }
  const avgWeeklyReturn = weeklyReturns.length > 0
    ? weeklyReturns.reduce((s, r) => s + r, 0) / weeklyReturns.length
    : 0;

  let recoveryEstimate = null;
  if (currentDD > 0 && avgWeeklyReturn > 0) {
    // Weeks needed to recover from current trough to peak
    const gapPct = (currentPeak - latestValue) / latestValue;
    recoveryEstimate = Math.ceil(Math.log(1 + gapPct) / Math.log(1 + avgWeeklyReturn));
  }

  const drawdownLevel = classifyDrawdown(currentDD);

  // Implication
  let implication;
  if (drawdownLevel === 'severe') {
    implication = `Portfolio is in severe drawdown (${currentDD.toFixed(1)}% from peak). Review risk exposure and consider defensive rebalancing.`;
  } else if (drawdownLevel === 'moderate') {
    implication = `Moderate drawdown of ${currentDD.toFixed(1)}%. Monitor closely — avoid panic selling but consider tightening stops.`;
  } else if (drawdownLevel === 'mild') {
    implication = `Mild drawdown of ${currentDD.toFixed(1)}%. Normal market fluctuation — stay the course.`;
  } else {
    implication = 'No significant drawdown — portfolio near or at all-time high.';
  }

  return {
    currentDD,
    maxDD: +maxDD.toFixed(2),
    peak: +currentPeak.toFixed(2),
    trough: +currentTrough.toFixed(2),
    maxDDPeak: +maxDDPeak.toFixed(2),
    maxDDTrough: +maxDDTrough.toFixed(2),
    recoveringFrom: currentDD > 0 ? +currentPeak.toFixed(2) : null,
    weeksInDD,
    recoveryEstimate,
    drawdownLevel,
    drawdownSeries,
    drawdownScore: clamp(+(10 - (currentDD / 3)).toFixed(1), 0, 10),
    implication,
  };
}
