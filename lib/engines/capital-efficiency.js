// =========================================================================
// LIFESTACK OS — CAPITAL EFFICIENCY ENGINE
// Phase 2: Finance Operating System
// Scorecard of how efficiently capital is deployed across the portfolio
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
 * Letter grade from numeric score (0-10)
 */
function scoreToGrade(score) {
  if (score >= 8.5) return 'A';
  if (score >= 7) return 'B';
  if (score >= 5) return 'C';
  if (score >= 3) return 'D';
  return 'F';
}

/**
 * Tax efficiency component (0-10)
 * Measures how well holdings use tax-advantaged wrappers
 */
function scoreTaxEfficiency(holdings, totalValue) {
  if (!holdings?.length || totalValue <= 0) return { score: 5, detail: 'No data' };

  let taxAdvantaged = 0;
  holdings.forEach(h => {
    const wrapper = (h.wrapper || '').toUpperCase();
    const value = h.value || h.val || 0;
    if (wrapper === 'ISA' || wrapper === 'SIPP' || wrapper === 'PENSION' || wrapper === 'LISA') {
      taxAdvantaged += value;
    }
  });

  const ratio = (taxAdvantaged / totalValue) * 100;
  const score = clamp(mapRange(ratio, 0, 90, 0, 10), 0, 10);
  const detail = `${ratio.toFixed(0)}% in tax-advantaged wrappers`;

  return { score: +score.toFixed(1), detail };
}

/**
 * Diversification component (0-10)
 * Based on effective number of positions and HHI
 */
function scoreDiversification(holdings, totalValue) {
  if (!holdings?.length || totalValue <= 0) return { score: 5, detail: 'No data' };

  const hhi = holdings.reduce((s, h) => {
    const w = ((h.value || h.val || 0) / totalValue) * 100;
    return s + w * w;
  }, 0);

  const effPositions = hhi > 0 ? 10000 / hhi : 0;
  const score = clamp(mapRange(effPositions, 1, 20, 0, 10), 0, 10);
  const detail = `${effPositions.toFixed(1)} effective positions (HHI: ${hhi.toFixed(0)})`;

  return { score: +score.toFixed(1), detail };
}

/**
 * Cost efficiency component (0-10)
 * Based on weighted average TER/OCF
 */
function scoreCostEfficiency(holdings, totalValue) {
  if (!holdings?.length || totalValue <= 0) return { score: 7, detail: 'No cost data available' };

  const holdingsWithCost = holdings.filter(h => h.ter !== undefined || h.ocf !== undefined);
  if (holdingsWithCost.length === 0) return { score: 7, detail: 'No cost data available — assuming moderate' };

  const weightedTER = holdingsWithCost.reduce((s, h) => {
    const value = h.value || h.val || 0;
    const ter = h.ter || h.ocf || 0;
    return s + (value / totalValue) * ter;
  }, 0);

  // Lower TER = higher score. 0% = 10, 1%+ = 0
  const score = clamp(mapRange(weightedTER, 0, 1, 10, 0), 0, 10);
  const detail = `Weighted TER: ${(weightedTER * 100).toFixed(2)}%`;

  return { score: +score.toFixed(1), detail };
}

/**
 * Risk-adjusted return component (0-10)
 * Based on Sharpe-like ratio
 */
function scoreRiskAdjustedReturn(riskMetrics) {
  const returnPct = riskMetrics?.returnAnnualized || riskMetrics?.returnYTD || 0;
  const vol = riskMetrics?.vol || riskMetrics?.volatility || 0;
  const riskFreeRate = riskMetrics?.riskFreeRate || 4.5;

  if (vol <= 0) return { score: 5, detail: 'Insufficient vol data' };

  const sharpe = (returnPct - riskFreeRate) / vol;
  // Sharpe -1 = 0 score, Sharpe 2+ = 10 score
  const score = clamp(mapRange(sharpe, -1, 2, 0, 10), 0, 10);
  const detail = `Sharpe ratio: ${sharpe.toFixed(2)} (return ${returnPct.toFixed(1)}%, vol ${vol.toFixed(1)}%)`;

  return { score: +score.toFixed(1), detail };
}

/**
 * Liquidity management component (0-10)
 * Based on cash allocation relative to expenses
 */
function scoreLiquidityManagement(holdings, portConfig, totalValue) {
  const monthlyExpenses = portConfig?.monthlyExpenses || 0;
  if (!holdings?.length || totalValue <= 0) return { score: 5, detail: 'No data' };

  let cashValue = 0;
  holdings.forEach(h => {
    const cls = (h.assetClass || h.cls || '').toLowerCase();
    const name = (h.name || '').toLowerCase();
    if (cls.includes('cash') || name.includes('cash') || name.includes('deposit')) {
      cashValue += h.value || h.val || 0;
    }
  });

  if (monthlyExpenses <= 0) {
    // Without expenses, score on cash ratio
    const cashRatio = (cashValue / totalValue) * 100;
    const score = cashRatio >= 5 && cashRatio <= 20 ? 8 : cashRatio < 5 ? 4 : 6;
    return { score, detail: `${cashRatio.toFixed(1)}% in cash (no expense data)` };
  }

  const months = cashValue / monthlyExpenses;
  // Optimal: 3-6 months. <1 = risky, >12 = drag
  let score;
  if (months >= 3 && months <= 6) score = 10;
  else if (months >= 2 && months <= 9) score = 7;
  else if (months >= 1 && months <= 12) score = 5;
  else if (months < 1) score = 2;
  else score = 4; // too much cash

  const detail = `${months.toFixed(1)} months expenses in cash`;
  return { score: +clamp(score, 0, 10).toFixed(1), detail };
}

/**
 * Compute capital efficiency scorecard
 * Combines 5 components into a weighted overall score
 */
export function computeCapitalEfficiencyState(holdings, portConfig, riskMetrics) {
  if (!holdings?.length) return null;

  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  if (totalValue <= 0) return null;

  const componentWeights = {
    taxEfficiency: 0.25,
    diversification: 0.20,
    costEfficiency: 0.20,
    riskAdjustedReturn: 0.20,
    liquidityManagement: 0.15,
  };

  const taxEff = scoreTaxEfficiency(holdings, totalValue);
  const divScore = scoreDiversification(holdings, totalValue);
  const costEff = scoreCostEfficiency(holdings, totalValue);
  const riskAdj = scoreRiskAdjustedReturn(riskMetrics || {});
  const liqMgmt = scoreLiquidityManagement(holdings, portConfig || {}, totalValue);

  const components = [
    { name: 'Tax Efficiency', score: taxEff.score, weight: componentWeights.taxEfficiency, detail: taxEff.detail },
    { name: 'Diversification', score: divScore.score, weight: componentWeights.diversification, detail: divScore.detail },
    { name: 'Cost Efficiency', score: costEff.score, weight: componentWeights.costEfficiency, detail: costEff.detail },
    { name: 'Risk-Adjusted Return', score: riskAdj.score, weight: componentWeights.riskAdjustedReturn, detail: riskAdj.detail },
    { name: 'Liquidity Management', score: liqMgmt.score, weight: componentWeights.liquidityManagement, detail: liqMgmt.detail },
  ];

  const overallScore = +components.reduce((s, c) => s + c.score * c.weight, 0).toFixed(1);
  const grade = scoreToGrade(overallScore);

  const sorted = [...components].sort((a, b) => a.score - b.score);
  const weakestLink = sorted[0];
  const strongestArea = sorted[sorted.length - 1];

  // Implication
  let implication;
  if (grade === 'A') {
    implication = 'Capital is deployed efficiently across all dimensions. Maintain current structure.';
  } else if (grade === 'B') {
    implication = `Good efficiency overall. Weakest area: ${weakestLink.name} (${weakestLink.score}/10) — focus improvement here.`;
  } else if (grade === 'C') {
    implication = `Moderate efficiency. ${weakestLink.name} is dragging the score — address to unlock material improvement.`;
  } else {
    implication = `Capital efficiency is poor. Priority: improve ${weakestLink.name} (${weakestLink.score}/10) and ${sorted[1]?.name} (${sorted[1]?.score}/10).`;
  }

  return {
    score: overallScore,
    grade,
    components,
    weakestLink: { name: weakestLink.name, score: weakestLink.score },
    strongestArea: { name: strongestArea.name, score: strongestArea.score },
    implication,
  };
}
