// =========================================================================
// LIFESTACK OS — MONTE CARLO ENGINE
// Phase 2: Finance Operating System
// Deterministic percentile wealth projection (10yr horizon)
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Project wealth for a single path at a given z-score
 * Uses deterministic approach: adjustedReturn = expectedReturn + z * vol
 */
function projectPath(startNW, monthlySaving, annualReturn, annualVol, zScore, horizonYears) {
  const monthlyReturn = (annualReturn + zScore * annualVol) / 12 / 100;
  const months = horizonYears * 12;
  const path = [startNW];

  let wealth = startNW;
  for (let m = 1; m <= months; m++) {
    wealth = wealth * (1 + monthlyReturn) + monthlySaving;
    // Record yearly snapshots
    if (m % 12 === 0) {
      path.push(+wealth.toFixed(0));
    }
  }

  return path;
}

/**
 * Compute Monte Carlo state from portfolio config and risk metrics
 * Uses deterministic percentile approach (no random):
 *   p50 = expected, p10/p90 = +/-1.28 sigma, p25/p75 = +/-0.67 sigma
 */
export function computeMonteCarloState(portConfig, riskMetrics) {
  if (!portConfig) return null;

  const netWorth = portConfig.netWorth || 0;
  const monthlySaving = portConfig.monthlySaving || 0;
  const targetReturn = portConfig.targetReturn || 7; // % annual
  const targetNW = portConfig.targetNW || portConfig.fiTarget || 0;
  const horizonYears = portConfig.horizonYears || 10;
  const vol = riskMetrics?.vol || riskMetrics?.volatility || 15; // % annual

  if (netWorth <= 0 && monthlySaving <= 0) return null;

  // Z-scores for percentiles
  const zScores = {
    p10: -1.28,
    p25: -0.67,
    p50: 0,
    p75: 0.67,
    p90: 1.28,
  };

  // Project each percentile path
  const paths = {};
  Object.entries(zScores).forEach(([pct, z]) => {
    paths[pct] = projectPath(netWorth, monthlySaving, targetReturn, vol, z, horizonYears);
  });

  // Terminal values
  const terminalValues = {
    p10: paths.p10[paths.p10.length - 1],
    p25: paths.p25[paths.p25.length - 1],
    p50: paths.p50[paths.p50.length - 1],
    p75: paths.p75[paths.p75.length - 1],
    p90: paths.p90[paths.p90.length - 1],
  };

  // Target hit analysis
  let targetHit = { probability: 0, yearsToTarget: null };
  if (targetNW > 0) {
    // Check each path to see when/if target is hit
    const hitYears = {};
    Object.entries(paths).forEach(([pct, path]) => {
      const hitIdx = path.findIndex(v => v >= targetNW);
      if (hitIdx >= 0) {
        hitYears[pct] = hitIdx;
      }
    });

    // Approximate probability from which percentile paths hit target
    const hitPcts = Object.keys(hitYears);
    if (hitPcts.includes('p10')) targetHit.probability = 90;
    else if (hitPcts.includes('p25')) targetHit.probability = 75;
    else if (hitPcts.includes('p50')) targetHit.probability = 50;
    else if (hitPcts.includes('p75')) targetHit.probability = 25;
    else if (hitPcts.includes('p90')) targetHit.probability = 10;
    else targetHit.probability = 0;

    // Median years to target
    if (hitYears.p50 !== undefined) {
      targetHit.yearsToTarget = hitYears.p50;
    } else if (Object.keys(hitYears).length > 0) {
      targetHit.yearsToTarget = Math.min(...Object.values(hitYears));
    }
  }

  // FI number: 25x annual expenses (4% rule)
  const annualExpenses = (portConfig.monthlyExpenses || 0) * 12;
  const fiNumber = annualExpenses > 0 ? +(annualExpenses * 25).toFixed(0) : 0;

  // Savings rate
  const grossIncome = portConfig.grossIncome || portConfig.monthlyIncome ? (portConfig.monthlyIncome || 0) * 12 : 0;
  const annualSaving = monthlySaving * 12;
  const savingsRate = grossIncome > 0 ? +((annualSaving / grossIncome) * 100).toFixed(1) : 0;

  // Implication
  let implication;
  if (targetHit.probability >= 75) {
    implication = `Strong probability (${targetHit.probability}%) of hitting target in ${targetHit.yearsToTarget || horizonYears} years. Stay the course.`;
  } else if (targetHit.probability >= 50) {
    implication = `Coin-flip odds of reaching target. Consider increasing savings rate or adjusting timeline.`;
  } else if (targetHit.probability > 0) {
    implication = `Low probability (${targetHit.probability}%) of hitting target. Significant increase in savings or return needed.`;
  } else if (targetNW > 0) {
    implication = 'Target appears unreachable under current assumptions. Revisit savings rate, return expectations, or target.';
  } else {
    implication = `Median projected NW at ${horizonYears}yr: ${terminalValues.p50.toLocaleString()}. Downside (p10): ${terminalValues.p10.toLocaleString()}.`;
  }

  return {
    paths,
    terminalValues,
    targetHit,
    fiNumber,
    savingsRate,
    horizonYears,
    assumptions: {
      expectedReturn: targetReturn,
      volatility: vol,
      monthlySaving,
      startingNW: netWorth,
    },
    implication,
  };
}
