// =========================================================================
// LIFESTACK OS — RISK BUDGET ENGINE
// Phase 2: Finance Operating System
// Vol budget, beta budget, factor load limits
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Map a value from one range to another
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Default factor exposure limits (%)
 */
const DEFAULT_FACTOR_LIMITS = {
  momentum: 30,
  value: 30,
  quality: 40,
  size: 25,
  volatility: 25,
  growth: 35,
  yield: 30,
};

/**
 * Compute risk budget state from holdings, risk metrics, and portfolio config
 */
export function computeRiskBudgetState(holdings, riskMetrics, portConfig) {
  if (!holdings?.length) return null;

  const targetVol = portConfig?.targetVol || 12;
  const maxBeta = portConfig?.maxBeta || 1.2;

  // Portfolio volatility
  const portfolioVol = riskMetrics?.vol || riskMetrics?.volatility || 0;

  // Vol budget
  const volUsed = clamp(portfolioVol, 0, targetVol * 2);
  const volRemaining = Math.max(0, targetVol - portfolioVol);
  const volUtilization = targetVol > 0 ? clamp(+((portfolioVol / targetVol) * 100).toFixed(1), 0, 200) : 0;

  // Beta budget
  const currentBeta = riskMetrics?.beta || 1.0;
  const betaHeadroom = +(maxBeta - currentBeta).toFixed(2);

  // Factor loads
  const factorExposures = riskMetrics?.factorExposures || {};
  const factorLimits = portConfig?.factorLimits || DEFAULT_FACTOR_LIMITS;
  const factorLoads = Object.entries(factorExposures).map(([factor, exposure]) => {
    const limit = factorLimits[factor] || 30;
    const utilization = limit > 0 ? clamp(+((Math.abs(exposure) / limit) * 100).toFixed(1), 0, 200) : 0;
    return {
      factor,
      exposure: +exposure.toFixed(2),
      limit,
      utilization,
      status: utilization > 100 ? 'Breached' : utilization > 80 ? 'Warning' : 'OK',
    };
  }).sort((a, b) => b.utilization - a.utilization);

  // Breached factors
  const breachedFactors = factorLoads.filter(f => f.status === 'Breached');
  const warningFactors = factorLoads.filter(f => f.status === 'Warning');

  // Risk efficiency: return per unit of vol
  const portfolioReturn = riskMetrics?.returnAnnualized || riskMetrics?.returnYTD || 0;
  const riskEfficiency = portfolioVol > 0 ? +(portfolioReturn / portfolioVol).toFixed(2) : 0;

  // Overall risk budget score (0-10)
  let score = 10;
  if (volUtilization > 120) score -= 3;
  else if (volUtilization > 100) score -= 1.5;
  if (currentBeta > maxBeta) score -= 2;
  else if (currentBeta > maxBeta * 0.9) score -= 1;
  score -= breachedFactors.length * 1.5;
  score -= warningFactors.length * 0.5;
  score = clamp(+score.toFixed(1), 0, 10);

  // Implication
  let implication;
  if (volUtilization > 120 || currentBeta > maxBeta) {
    implication = 'Portfolio is running above risk limits — consider de-risking or hedging.';
  } else if (volUtilization > 90) {
    implication = 'Risk budget nearly exhausted — limited room for new high-vol positions.';
  } else if (volUtilization < 50) {
    implication = 'Significant risk budget remaining — room to add return-seeking assets.';
  } else {
    implication = 'Risk budget is well-utilised within tolerance.';
  }

  return {
    portfolioVol: +portfolioVol.toFixed(2),
    volBudget: {
      used: +volUsed.toFixed(2),
      remaining: +volRemaining.toFixed(2),
      target: targetVol,
      utilization: volUtilization,
    },
    betaBudget: {
      current: +currentBeta.toFixed(2),
      max: maxBeta,
      headroom: betaHeadroom,
      status: currentBeta > maxBeta ? 'Breached' : currentBeta > maxBeta * 0.9 ? 'Warning' : 'OK',
    },
    factorLoads,
    breachedFactors: breachedFactors.length,
    warningFactors: warningFactors.length,
    riskEfficiency,
    riskBudgetScore: score,
    implication,
  };
}
