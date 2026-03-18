// =========================================================================
// LIFESTACK OS — WHAT MATTERS NOW ENGINE
// Phase 4: Research & Decisioning
// Determines the single most important thing right now — the priority bar
// =========================================================================

/**
 * Compute the single most important priority right now
 * Uses strict precedence: ISA deadline > concentration breach > debt paydown >
 * rebalance needed > market stress > opportunities
 */
export function computeWhatMattersNow(engineState, marketState, agentState) {
  if (!engineState) return null;

  const candidates = [];

  // 1. ISA deadline within 30 days (highest precedence)
  const isaCandidate = checkISADeadline(engineState);
  if (isaCandidate) candidates.push(isaCandidate);

  // 2. Critical alerts
  const alertCandidate = checkCriticalAlerts(agentState);
  if (alertCandidate) candidates.push(alertCandidate);

  // 3. Concentration breach
  const concCandidate = checkConcentration(engineState);
  if (concCandidate) candidates.push(concCandidate);

  // 4. High-APR debt
  const debtCandidate = checkDebt(engineState);
  if (debtCandidate) candidates.push(debtCandidate);

  // 5. Rebalance needed
  const rebalCandidate = checkRebalance(engineState);
  if (rebalCandidate) candidates.push(rebalCandidate);

  // 6. Market regime shift
  const regimeCandidate = checkRegimeShift(marketState);
  if (regimeCandidate) candidates.push(regimeCandidate);

  // 7. Market stress
  const stressCandidate = checkMarketStress(marketState);
  if (stressCandidate) candidates.push(stressCandidate);

  // 8. Opportunities
  const oppCandidate = checkOpportunities(agentState);
  if (oppCandidate) candidates.push(oppCandidate);

  // Sort by precedence (lower = higher priority)
  candidates.sort((a, b) => a.precedence - b.precedence);

  // Top priority
  const topPriority = candidates[0] || {
    title: 'All clear',
    detail: 'Portfolio operating within parameters. No immediate action required.',
    urgency: 'low',
    action: 'Continue monitoring',
    deadline: null,
    precedence: 99,
  };

  // Runners up
  const runners = candidates.slice(1, 4).map(c => ({
    title: c.title,
    urgency: c.urgency,
  }));

  // Noise — things explicitly NOT worth worrying about
  const noise = identifyNoise(engineState, marketState);

  return {
    topPriority: {
      title: topPriority.title,
      detail: topPriority.detail,
      urgency: topPriority.urgency,
      action: topPriority.action,
      deadline: topPriority.deadline,
    },
    runners,
    noise,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check ISA deadline urgency
 */
function checkISADeadline(eng) {
  const days = eng.isaPensionRouting?.daysUntilTaxYearEnd;
  const remaining = eng.isaPensionRouting?.isaHeadroom?.remaining || 0;

  if (days == null || remaining <= 0) return null;

  if (days <= 7) {
    return {
      title: `ISA deadline in ${days} days`,
      detail: `£${remaining.toLocaleString()} ISA allowance expires in ${days} days. This cannot be recovered.`,
      urgency: 'critical',
      action: `Transfer £${remaining.toLocaleString()} to ISA immediately`,
      deadline: '5 April',
      precedence: 1,
    };
  }
  if (days <= 30) {
    return {
      title: `ISA deadline in ${days} days`,
      detail: `£${remaining.toLocaleString()} ISA allowance remaining. Schedule deployment before 5 April.`,
      urgency: 'high',
      action: `Plan ISA deployment of £${remaining.toLocaleString()}`,
      deadline: '5 April',
      precedence: 2,
    };
  }
  return null;
}

/**
 * Check for critical alerts
 */
function checkCriticalAlerts(agent) {
  const criticals = agent?.triggerAlerts?.summary?.critical || 0;
  if (criticals < 1) return null;

  const topAlert = agent.triggerAlerts?.alerts?.[0];
  return {
    title: `${criticals} critical alert(s)`,
    detail: topAlert?.message || 'Critical threshold breached. Review immediately.',
    urgency: 'critical',
    action: topAlert?.action || 'Review alerts',
    deadline: null,
    precedence: 3,
  };
}

/**
 * Check concentration risk
 */
function checkConcentration(eng) {
  const hhi = eng.concentration?.hhi || 0;
  const violations = eng.concentration?.violations?.length || 0;

  if (hhi <= 2500 && violations === 0) return null;

  return {
    title: 'Portfolio concentration breach',
    detail: `HHI at ${hhi}${violations > 0 ? ` with ${violations} position limit violation(s)` : ''}. Reduce single-name risk.`,
    urgency: 'high',
    action: 'Trim overweight positions to reduce concentration',
    deadline: null,
    precedence: 4,
  };
}

/**
 * Check debt urgency
 */
function checkDebt(eng) {
  const apr = eng.debtPriority?.highestAPR || 0;
  if (apr <= 10) return null;

  const interest = eng.debtPriority?.totalAnnualInterest || 0;
  return {
    title: `High-APR debt at ${apr}%`,
    detail: `£${Math.round(interest).toLocaleString()}/yr in interest drag. Paying this down is a guaranteed return.`,
    urgency: apr > 20 ? 'critical' : 'high',
    action: 'Prioritise debt paydown over new investments',
    deadline: null,
    precedence: 5,
  };
}

/**
 * Check rebalance need
 */
function checkRebalance(eng) {
  const drift = eng.driftMonitor?.maxDrift || 0;
  if (drift <= 5) return null;

  return {
    title: `Rebalance needed — ${drift.toFixed(1)}% drift`,
    detail: `Max drift ${drift.toFixed(1)}% exceeds threshold. ${eng.rebalanceProposal?.trades?.length || 0} trades proposed.`,
    urgency: drift > 7 ? 'high' : 'medium',
    action: 'Review and execute rebalance proposal',
    deadline: null,
    precedence: 6,
  };
}

/**
 * Check for regime shift
 */
function checkRegimeShift(mkt) {
  if (!mkt?.regime?.regimeChanged) return null;

  return {
    title: `Market regime shift to ${mkt.regime.regime}`,
    detail: `Regime changed. New risk posture: ${mkt.regime.riskPosture}. Review allocation alignment.`,
    urgency: 'high',
    action: 'Review portfolio against new regime positioning',
    deadline: null,
    precedence: 7,
  };
}

/**
 * Check market stress
 */
function checkMarketStress(mkt) {
  const stress = mkt?.stress?.compositeScore || 0;
  if (stress <= 60) return null;

  return {
    title: `Market stress at ${stress}/100`,
    detail: `Cross-asset stress elevated. ${mkt.stress.compositeAction || 'Consider defensive positioning.'}`,
    urgency: stress > 80 ? 'high' : 'medium',
    action: 'Review risk exposure and defensive hedges',
    deadline: null,
    precedence: 8,
  };
}

/**
 * Check for actionable opportunities
 */
function checkOpportunities(agent) {
  const executeNow = agent?.opportunityRanker?.summary?.executeNow || 0;
  if (executeNow < 1) return null;

  return {
    title: `${executeNow} opportunity(ies) to execute`,
    detail: `Top: ${agent.opportunityRanker.summary.topAction || 'Review opportunity list'}. Total annual value: £${(agent.opportunityRanker.summary.totalAnnualEV || 0).toLocaleString()}.`,
    urgency: 'medium',
    action: 'Review and execute top opportunities',
    deadline: null,
    precedence: 9,
  };
}

/**
 * Identify noise items — things that seem important but are not actionable
 */
function identifyNoise(eng, mkt) {
  const noise = [];

  // Normal VIX
  if (mkt?.stress?.compositeScore != null && mkt.stress.compositeScore < 30) {
    noise.push('Market stress low — no action needed.');
  }

  // Tiny drift
  if (eng.driftMonitor?.maxDrift != null && eng.driftMonitor.maxDrift < 2) {
    noise.push('Portfolio drift minimal — no rebalance needed.');
  }

  // No debt
  if (eng.debtPriority?.totalDebt === 0) {
    noise.push('No outstanding debt — not a concern.');
  }

  return noise;
}
