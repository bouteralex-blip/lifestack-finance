// =========================================================================
// LIFESTACK OS — INSIGHT CALLOUT GENERATOR
// Phase 4: Research & Decisioning
// Generates plain-English insight callouts for key findings across all engines
// =========================================================================

/**
 * Generate plain-English insight callouts for dashboard display
 * Scans all engine states for noteworthy findings and translates to
 * human-readable callouts
 */
export function generateInsightCallouts(engineState, marketState, agentState) {
  if (!engineState) return null;

  const callouts = [];

  // Portfolio engine insights
  const portfolioInsights = generatePortfolioInsights(engineState);
  callouts.push(...portfolioInsights);

  // Market engine insights
  const marketInsights = generateMarketInsights(marketState);
  callouts.push(...marketInsights);

  // Agent-level insights
  const agentInsights = generateAgentInsights(agentState);
  callouts.push(...agentInsights);

  // Tax/wrapper insights
  const taxInsights = generateTaxInsights(engineState);
  callouts.push(...taxInsights);

  // Sort by severity (critical first, then actionable)
  const sevOrder = { critical: 0, warning: 1, info: 2 };
  callouts.sort((a, b) => {
    const sevDiff = (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
    if (sevDiff !== 0) return sevDiff;
    return (b.actionable ? 1 : 0) - (a.actionable ? 1 : 0);
  });

  return {
    callouts,
    topInsight: callouts[0]?.text || 'Portfolio operating within normal parameters.',
    totalCallouts: callouts.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate portfolio-level insights
 */
function generatePortfolioInsights(eng) {
  const insights = [];

  // Concentration insight
  if (eng.concentration) {
    const hhi = eng.concentration.hhi || 0;
    const effectivePositions = eng.concentration.effectivePositions || 0;
    const topHoldings = eng.concentration.topHoldings || [];
    const topPct = topHoldings.slice(0, 3).reduce((sum, h) => sum + (h.weight || h.pct || 0), 0);

    if (hhi > 2000) {
      insights.push({
        text: `Your HHI is ${hhi} — top 3 holdings are ${topPct.toFixed(0)}% of portfolio. Consider trimming to reduce concentration.`,
        source: 'Concentration Engine',
        severity: hhi > 2500 ? 'critical' : 'warning',
        actionable: true,
      });
    } else if (effectivePositions < 10) {
      insights.push({
        text: `Portfolio has ${effectivePositions.toFixed(0)} effective positions. Diversification could improve risk-adjusted returns.`,
        source: 'Concentration Engine',
        severity: 'info',
        actionable: true,
      });
    }

    if (eng.concentration.clutter?.count > 10) {
      insights.push({
        text: `${eng.concentration.clutter.count} positions are below 1% each — consider consolidating to reduce noise.`,
        source: 'Concentration Engine',
        severity: 'info',
        actionable: true,
      });
    }
  }

  // Drift insight
  if (eng.driftMonitor?.maxDrift > 3) {
    const drift = eng.driftMonitor.maxDrift;
    insights.push({
      text: `Portfolio drift at ${drift.toFixed(1)}% — ${drift > 5 ? 'rebalance recommended' : 'approaching rebalance threshold'}.`,
      source: 'Drift Engine',
      severity: drift > 5 ? 'warning' : 'info',
      actionable: drift > 5,
    });
  }

  // Debt insight
  if (eng.debtPriority?.highestAPR > 8) {
    const apr = eng.debtPriority.highestAPR;
    const interest = eng.debtPriority.totalAnnualInterest || 0;
    insights.push({
      text: `Paying £${Math.round(interest).toLocaleString()}/yr in interest at ${apr}% APR. Paying this down is a guaranteed return no investment can match.`,
      source: 'Debt Engine',
      severity: apr > 15 ? 'critical' : 'warning',
      actionable: true,
    });
  }

  return insights;
}

/**
 * Generate market-level insights
 */
function generateMarketInsights(mkt) {
  const insights = [];
  if (!mkt) return insights;

  // Regime insight
  if (mkt.regime?.regimeChanged) {
    insights.push({
      text: `Market regime shifted to ${mkt.regime.regime}. Risk posture now ${mkt.regime.riskPosture}. Review allocation alignment.`,
      source: 'Regime Engine',
      severity: 'critical',
      actionable: true,
    });
  }

  // Stress insight
  if (mkt.stress?.compositeScore > 60) {
    insights.push({
      text: `Cross-asset stress at ${mkt.stress.compositeScore}/100 — historically this level precedes elevated volatility. Consider defensive tilts.`,
      source: 'Stress Engine',
      severity: 'warning',
      actionable: true,
    });
  }

  // BTC insight
  if (mkt.btcCycle?.bias >= 4) {
    insights.push({
      text: `BTC in ${mkt.btcCycle.phase} phase with strong accumulation signal (bias ${mkt.btcCycle.bias}/5). Consider adding to crypto allocation.`,
      source: 'BTC Cycle Engine',
      severity: 'info',
      actionable: true,
    });
  }

  // Credit insight
  if (mkt.creditStress?.compositeScore > 50) {
    insights.push({
      text: `Credit stress elevated at ${mkt.creditStress.compositeScore}/100. Avoid adding high-yield or credit exposure.`,
      source: 'Credit Stress Engine',
      severity: 'warning',
      actionable: true,
    });
  }

  // Yield curve insight
  if (mkt.yieldCurve?.shape === 'Inverted') {
    insights.push({
      text: 'Yield curve inverted — historically associated with recession risk within 12-18 months. Monitor for regime shift.',
      source: 'Yield Curve Engine',
      severity: 'warning',
      actionable: false,
    });
  }

  return insights;
}

/**
 * Generate agent-level insights
 */
function generateAgentInsights(agent) {
  const insights = [];
  if (!agent) return insights;

  // Trigger alerts summary
  const criticals = agent.triggerAlerts?.summary?.critical || 0;
  if (criticals > 0) {
    insights.push({
      text: `${criticals} critical alert(s) active. Top: ${agent.triggerAlerts.summary.topAlert || 'Unknown'}. Review immediately.`,
      source: 'Trigger Alerts',
      severity: 'critical',
      actionable: true,
    });
  }

  // Opportunity count
  const executeNow = agent.opportunityRanker?.summary?.executeNow || 0;
  if (executeNow > 0) {
    insights.push({
      text: `${executeNow} high-conviction opportunity(ies) ready to execute. Total annual value: £${(agent.opportunityRanker.summary.totalAnnualEV || 0).toLocaleString()}.`,
      source: 'Opportunity Ranker',
      severity: 'info',
      actionable: true,
    });
  }

  return insights;
}

/**
 * Generate tax/wrapper insights
 */
function generateTaxInsights(eng) {
  const insights = [];

  // ISA deadline
  if (eng.isaPensionRouting) {
    const days = eng.isaPensionRouting.daysUntilTaxYearEnd;
    const remaining = eng.isaPensionRouting.isaHeadroom?.remaining || 0;

    if (days <= 30 && remaining > 0) {
      insights.push({
        text: `ISA deadline in ${days} days with £${remaining.toLocaleString()} unused. This allowance is lost permanently if not used. Deploy now.`,
        source: 'ISA Engine',
        severity: days <= 7 ? 'critical' : 'warning',
        actionable: true,
      });
    }

    // Taper zone
    if (eng.isaPensionRouting.salarySacrificeValue?.inTaperZone) {
      insights.push({
        text: `Income in the £100-125k taper zone. Salary sacrifice has a 60% effective tax rate benefit — worth £${Math.round(eng.isaPensionRouting.salarySacrificeValue.totalSaving || 0).toLocaleString()}/yr.`,
        source: 'ISA Engine',
        severity: 'info',
        actionable: true,
      });
    }
  }

  // Wrapper efficiency
  if (eng.wrapperExposure?.efficiency?.giaExposurePct > 40) {
    insights.push({
      text: `${eng.wrapperExposure.efficiency.giaExposurePct}% of portfolio in GIA — structural alpha available by sheltering in ISA/pension.`,
      source: 'Wrapper Engine',
      severity: 'info',
      actionable: true,
    });
  }

  return insights;
}
