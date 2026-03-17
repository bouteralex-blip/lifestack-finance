// =========================================================================
// LIFESTACK OS — SCENARIO SENSITIVITY ENGINE
// Phase 2: Finance Operating System
// Portfolio impact under stress scenarios with per-holding detail
// =========================================================================

/**
 * Compute scenario sensitivity for a portfolio under each stress scenario
 * Each scenario defines per-asset-class shocks applied to holdings
 */
export function computeScenarioSensitivity(holdings, stressScenarios) {
  if (!holdings?.length) return null;
  if (!stressScenarios?.length) return null;

  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  if (totalValue <= 0) return null;

  const scenarios = stressScenarios.map(scenario => {
    const shocks = scenario.shocks || {};

    // Apply shocks to each holding
    const holdingImpacts = holdings.map(h => {
      const value = h.value || h.val || 0;
      const cls = h.assetClass || h.cls || 'Unknown';
      const ticker = h.ticker || h.name || 'Unknown';
      const shockPct = shocks[cls] || shocks[ticker] || 0;
      const impact = +(value * shockPct / 100).toFixed(2);
      const weight = +((value / totalValue) * 100).toFixed(2);
      const contribution = +(weight * shockPct / 100).toFixed(4);

      return {
        ticker,
        name: h.name || ticker,
        value: +value.toFixed(2),
        weight,
        shockPct,
        impact,
        contribution,
      };
    }).sort((a, b) => a.impact - b.impact);

    const portfolioImpact = +holdingImpacts.reduce((s, h) => s + h.contribution, 0).toFixed(2);
    const absoluteImpact = +holdingImpacts.reduce((s, h) => s + h.impact, 0).toFixed(2);

    const topLosers = holdingImpacts
      .filter(h => h.impact < 0)
      .slice(0, 5)
      .map(h => ({
        ticker: h.ticker,
        impact: h.impact,
        contribution: h.contribution,
      }));

    const topGainers = holdingImpacts
      .filter(h => h.impact > 0)
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5)
      .map(h => ({
        ticker: h.ticker,
        impact: h.impact,
        contribution: h.contribution,
      }));

    return {
      name: scenario.name || 'Unnamed',
      description: scenario.description || '',
      portfolioImpact,
      absoluteImpact,
      topLosers,
      topGainers,
    };
  }).sort((a, b) => a.portfolioImpact - b.portfolioImpact);

  const worstCase = scenarios[0] || null;
  const bestCase = scenarios[scenarios.length - 1] || null;
  const avgDownside = +(scenarios
    .filter(s => s.portfolioImpact < 0)
    .reduce((s, sc) => s + sc.portfolioImpact, 0)
    / Math.max(1, scenarios.filter(s => s.portfolioImpact < 0).length)
  ).toFixed(2);

  // Implication
  let implication;
  if (worstCase && worstCase.portfolioImpact < -20) {
    implication = `Worst-case scenario ("${worstCase.name}") implies ${worstCase.portfolioImpact.toFixed(1)}% drawdown — consider tail-risk hedging.`;
  } else if (worstCase && worstCase.portfolioImpact < -10) {
    implication = `Moderate downside risk under stress — worst case is ${worstCase.portfolioImpact.toFixed(1)}% ("${worstCase.name}").`;
  } else if (avgDownside > -5) {
    implication = 'Portfolio is relatively resilient across stress scenarios.';
  } else {
    implication = 'Mixed scenario exposure — review concentrated risk factors.';
  }

  return {
    scenarios,
    worstCase: worstCase ? { name: worstCase.name, impact: worstCase.portfolioImpact } : null,
    bestCase: bestCase ? { name: bestCase.name, impact: bestCase.portfolioImpact } : null,
    avgDownside,
    scenarioCount: scenarios.length,
    implication,
  };
}
