// =========================================================================
// LIFESTACK OS — CONTRIBUTION ATTRIBUTION ENGINE
// Phase 2: Finance Operating System
// PnL attribution by holding — who contributed, who detracted
// =========================================================================

/**
 * Clamp a value between min and max
 */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Compute contribution attribution state from holdings and returns
 * contribution = weight * return for each holding
 */
export function computeContributionState(holdings, monthlyReturns) {
  if (!holdings?.length) return null;

  const totalValue = holdings.reduce((s, h) => s + (h.value || h.val || 0), 0);
  if (totalValue <= 0) return null;

  // Compute per-holding contribution
  const attributed = holdings.map(h => {
    const value = h.value || h.val || 0;
    const weight = (value / totalValue) * 100;
    const returnPct = h.returnYTD || h.returnPct || 0;
    const contribution = +(weight * returnPct / 100).toFixed(4);

    return {
      ticker: h.ticker || h.name || 'Unknown',
      name: h.name || h.ticker || 'Unknown',
      weight: +weight.toFixed(2),
      returnPct: +returnPct.toFixed(2),
      contribution: +contribution.toFixed(4),
      value: +value.toFixed(2),
    };
  }).sort((a, b) => b.contribution - a.contribution);

  const contributors = attributed.filter(a => a.contribution > 0);
  const detractors = attributed.filter(a => a.contribution < 0)
    .sort((a, b) => a.contribution - b.contribution);
  const flat = attributed.filter(a => a.contribution === 0);

  const topContributor = contributors.length > 0 ? contributors[0] : null;
  const worstDetractor = detractors.length > 0 ? detractors[0] : null;

  // Total portfolio return (sum of contributions)
  const totalReturn = +attributed.reduce((s, a) => s + a.contribution, 0).toFixed(4);

  // Concentration of returns: what % of positive contribution comes from top 3
  const totalPositive = contributors.reduce((s, c) => s + c.contribution, 0);
  const top3Positive = contributors.slice(0, 3).reduce((s, c) => s + c.contribution, 0);
  const concentrationOfReturns = totalPositive > 0
    ? +((top3Positive / totalPositive) * 100).toFixed(1)
    : 0;

  // Monthly contribution breakdown (if available)
  const monthlyAttribution = Array.isArray(monthlyReturns) && monthlyReturns.length > 0
    ? monthlyReturns.map(m => ({
        month: m.month || m.label || '',
        portfolioReturn: +(m.portfolioReturn || m.return || 0).toFixed(2),
        benchmark: +(m.benchmark || 0).toFixed(2),
        alpha: +((m.portfolioReturn || m.return || 0) - (m.benchmark || 0)).toFixed(2),
      }))
    : [];

  // Implication
  let implication;
  if (concentrationOfReturns > 80) {
    implication = `Returns heavily concentrated — top 3 account for ${concentrationOfReturns}% of gains. High key-person risk.`;
  } else if (detractors.length > contributors.length) {
    implication = 'More detractors than contributors — broad weakness across holdings.';
  } else if (topContributor && topContributor.contribution > Math.abs(totalReturn) * 0.5) {
    implication = `${topContributor.ticker} is carrying the portfolio — single-stock dependency.`;
  } else if (totalReturn > 0 && contributors.length > 5) {
    implication = 'Returns are broadly distributed across multiple positions — healthy attribution profile.';
  } else {
    implication = 'Mixed attribution — no single holding dominates returns.';
  }

  return {
    totalReturn,
    contributors,
    detractors,
    flat,
    topContributor,
    worstDetractor,
    concentrationOfReturns,
    contributorCount: contributors.length,
    detractorCount: detractors.length,
    monthlyAttribution,
    implication,
  };
}
