// =========================================================================
// LIFESTACK OS — PERFORMANCE BRIDGE ENGINE
// Phase 4: Research & Decisioning
// NAV bridge memo — opening NW to closing NW with all components
// =========================================================================

/**
 * Generate performance bridge (waterfall) from opening to closing NW
 * Decomposes change into market return, contributions, withdrawals, fees, FX, etc.
 */
export function generatePerformanceBridge(bridgeItems, portConfig, monthlyReturns) {
  if (!bridgeItems?.length && !portConfig) return null;

  const opening = portConfig?.openingNW || portConfig?.previousNW || 0;
  const closing = portConfig?.netWorth || portConfig?.closingNW || 0;

  if (opening <= 0 && closing <= 0) return null;

  const change = +(closing - opening).toFixed(2);
  const changePct = opening > 0 ? +((change / opening) * 100).toFixed(2) : 0;

  // Default bridge components if not provided
  const defaultComponents = [
    { label: 'Market Return', value: 0 },
    { label: 'Contributions', value: 0 },
    { label: 'Withdrawals', value: 0 },
    { label: 'Dividends', value: 0 },
    { label: 'Fees & Costs', value: 0 },
    { label: 'FX Impact', value: 0 },
  ];

  const components = (bridgeItems?.length ? bridgeItems : defaultComponents).map(item => {
    const value = +(item.value || 0).toFixed(2);
    const pct = opening > 0 ? +((value / opening) * 100).toFixed(2) : 0;
    return {
      label: item.label || 'Other',
      value,
      pct,
    };
  });

  // If components don't sum to actual change, add residual
  const componentSum = components.reduce((s, c) => s + c.value, 0);
  const residual = +(change - componentSum).toFixed(2);
  if (Math.abs(residual) > 0.01) {
    components.push({
      label: 'Unexplained / Residual',
      value: residual,
      pct: opening > 0 ? +((residual / opening) * 100).toFixed(2) : 0,
    });
  }

  // Monthly breakdown (if available)
  const monthlyBreakdown = Array.isArray(monthlyReturns) && monthlyReturns.length > 0
    ? monthlyReturns.map(m => ({
        month: m.month || m.label || '',
        return: +(m.return || m.portfolioReturn || 0).toFixed(2),
        absoluteChange: +(m.absoluteChange || 0).toFixed(2),
      }))
    : [];

  // Identify top driver
  const sorted = [...components].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const topDriver = sorted.length > 0 ? sorted[0] : null;

  // Build narrative
  const gainOrLoss = change >= 0 ? 'gained' : 'lost';
  const topDriverLabel = topDriver ? topDriver.label : 'unknown factors';
  const narrative = `Portfolio ${gainOrLoss} ${Math.abs(changePct).toFixed(1)}% (£${Math.abs(change).toLocaleString()}) over the period, primarily driven by ${topDriverLabel}.`;

  // Implication
  let implication;
  if (changePct > 10) {
    implication = `Strong period — ${changePct}% gain. Review whether gains are sustainable or driven by concentration.`;
  } else if (changePct > 0) {
    implication = `Positive period (${changePct}%). ${topDriverLabel} was the primary driver.`;
  } else if (changePct > -5) {
    implication = `Mild decline (${changePct}%). Monitor but no action needed unless trend persists.`;
  } else {
    implication = `Significant decline (${changePct}%). Review largest detractors and assess whether thesis is intact.`;
  }

  return {
    memo: {
      opening: +opening.toFixed(2),
      closing: +closing.toFixed(2),
      change,
      changePct,
      components,
    },
    monthlyBreakdown,
    topDriver: topDriver ? { label: topDriver.label, value: topDriver.value, pct: topDriver.pct } : null,
    narrative,
    implication,
  };
}
