// lib/agents/portfolio-advisor.js
// Portfolio Advisor Agent — identifies highest-impact portfolio action

export function computePortfolioAdvisor(ENGINE, MKTENG, rawData) {
  const regime = MKTENG?.regime || {};
  const holdings = rawData?.holdings || [];
  const concentration = ENGINE?.concentration || {};
  const drift = ENGINE?.driftMonitor || {};
  const riskBudget = ENGINE?.riskBudget || {};
  const rebalance = ENGINE?.rebalanceProposal || {};
  const drawdown = ENGINE?.drawdown || {};
  const capitalEff = ENGINE?.capitalEfficiency || {};
  const wrapper = ENGINE?.wrapperExposure || {};
  const isaPension = ENGINE?.isaPensionRouting || {};

  // Score each holding against current regime
  const holdingScores = holdings.map(h => {
    let score = 50; // neutral baseline
    const reasons = [];

    // Regime alignment
    const regimeLabel = regime.label || 'unknown';
    if (regimeLabel === 'risk-on' || regimeLabel === 'expansion') {
      if (h.assetClass === 'equity') { score += 15; reasons.push('Equities favored in expansion'); }
      if (h.assetClass === 'bond') { score -= 10; reasons.push('Bonds less attractive in expansion'); }
    } else if (regimeLabel === 'risk-off' || regimeLabel === 'contraction') {
      if (h.assetClass === 'bond' || h.assetClass === 'cash') { score += 15; reasons.push('Defensive assets favored'); }
      if (h.assetClass === 'equity') { score -= 10; reasons.push('Equities face headwinds'); }
      if (h.assetClass === 'crypto') { score -= 20; reasons.push('Crypto risky in contraction'); }
    }

    // Concentration penalty
    const concHoldings = concentration.holdings || [];
    const concEntry = concHoldings.find(c => c.ticker === h.ticker || c.name === h.name);
    if (concEntry && concEntry.weight > 0.15) {
      score -= 15;
      reasons.push(`Concentration risk: ${(concEntry.weight * 100).toFixed(1)}% of portfolio`);
    }

    // Drawdown penalty
    if (h.drawdownPct && h.drawdownPct < -0.2) {
      score -= 10;
      reasons.push(`In significant drawdown: ${(h.drawdownPct * 100).toFixed(1)}%`);
    }

    // Wrapper efficiency bonus
    const wrapperItems = wrapper.items || [];
    const wrapperEntry = wrapperItems.find(w => w.ticker === h.ticker);
    if (wrapperEntry && wrapperEntry.taxDrag && wrapperEntry.taxDrag > 0.01) {
      score -= 5;
      reasons.push('Suboptimal wrapper placement');
    }

    return {
      ticker: h.ticker || h.name,
      name: h.name || h.ticker,
      score: Math.max(0, Math.min(100, score)),
      reasons,
    };
  });

  // Regime alignment summary
  const avgScore = holdingScores.length > 0
    ? holdingScores.reduce((s, h) => s + h.score, 0) / holdingScores.length
    : 50;
  const regimeAlignment = {
    regime: regime.label || 'unknown',
    confidence: regime.confidence || 0,
    portfolioFit: avgScore >= 60 ? 'good' : avgScore >= 45 ? 'moderate' : 'poor',
    avgHoldingScore: Math.round(avgScore),
  };

  // Identify top action candidates, ranked by impact
  const candidates = [];

  // Check drift
  const driftUrgency = drift.urgency || drift.rebalanceUrgency || 'low';
  if (driftUrgency === 'high' || driftUrgency === 'RED') {
    candidates.push({ action: 'rebalance', impact: 90, label: 'Rebalance portfolio — drift is critical', detail: drift.summary || 'Significant drift from target allocation detected' });
  } else if (driftUrgency === 'medium' || driftUrgency === 'AMBER') {
    candidates.push({ action: 'rebalance', impact: 55, label: 'Consider rebalancing — moderate drift', detail: drift.summary || 'Portfolio drifting from targets' });
  }

  // Check ISA/pension optimization
  const isaActions = isaPension.actions || isaPension.recommendations || [];
  if (isaActions.length > 0) {
    candidates.push({ action: 'tax-optimize', impact: 75, label: 'Optimize wrapper placement for tax efficiency', detail: `${isaActions.length} tax optimization action(s) available` });
  }

  // Check concentration
  const concBreaches = (concentration.holdings || []).filter(c => c.weight > 0.15);
  if (concBreaches.length > 0) {
    candidates.push({ action: 'reduce-concentration', impact: 70, label: `Reduce concentration in ${concBreaches[0].ticker || concBreaches[0].name}`, detail: `${concBreaches.length} holding(s) above 15% weight` });
  }

  // Check drawdown
  const ddLevel = drawdown.level || drawdown.severity || 'normal';
  if (ddLevel === 'severe' || ddLevel === 'critical') {
    candidates.push({ action: 'risk-reduce', impact: 85, label: 'Reduce risk exposure — severe drawdown detected', detail: drawdown.summary || 'Portfolio in significant drawdown' });
  }

  // Check risk budget
  const riskUtil = riskBudget.utilisation || riskBudget.utilization || 0;
  if (riskUtil > 1.1) {
    candidates.push({ action: 'trim-risk', impact: 80, label: 'Trim positions — risk budget exceeded', detail: `Risk utilisation at ${(riskUtil * 100).toFixed(0)}%` });
  }

  // Sort by impact descending
  candidates.sort((a, b) => b.impact - a.impact);
  const topAction = candidates[0] || { action: 'hold', impact: 0, label: 'No immediate action required', detail: 'Portfolio is well-positioned' };

  // Build narrative
  const narrativeParts = [];
  narrativeParts.push(`Market regime: ${regimeAlignment.regime} (confidence ${((regimeAlignment.confidence || 0) * 100).toFixed(0)}%).`);
  narrativeParts.push(`Portfolio-regime fit: ${regimeAlignment.portfolioFit} (avg score ${regimeAlignment.avgHoldingScore}/100).`);
  if (topAction.action !== 'hold') {
    narrativeParts.push(`Top recommendation: ${topAction.label}.`);
    narrativeParts.push(topAction.detail);
  } else {
    narrativeParts.push('No urgent actions needed — stay the course.');
  }
  if (candidates.length > 1) {
    narrativeParts.push(`${candidates.length - 1} additional action(s) worth reviewing.`);
  }
  const narrative = narrativeParts.join(' ');

  return { topAction, holdingScores, regimeAlignment, narrative };
}

