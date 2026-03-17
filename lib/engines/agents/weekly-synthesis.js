// =========================================================================
// LIFESTACK OS — WEEKLY SYNTHESIS WRITER
// Phase 4: Research & Decisioning
// Aggregates all engine states into a structured CIO-style weekly memo
// =========================================================================

/**
 * Generate the weekly synthesis from all engine states
 * This is the "one document that tells you everything" — the CIO memo
 */
export function generateWeeklySynthesis(engineState, marketEngineState, portfolio, scorecard, opportunities) {
  if (!engineState || !portfolio) return null;

  const now = new Date();
  const weekNum = getISOWeek(now);

  // 1. Portfolio Health Summary
  const portfolioHealth = synthesizePortfolioHealth(engineState, portfolio, scorecard);

  // 2. Market Regime Context
  const marketContext = synthesizeMarketContext(marketEngineState);

  // 3. Risk Alerts
  const riskAlerts = synthesizeRiskAlerts(engineState, marketEngineState);

  // 4. Action Priorities (ranked)
  const actionPriorities = synthesizeActions(engineState, opportunities);

  // 5. Key Metrics Dashboard
  const keyMetrics = synthesizeKeyMetrics(engineState, portfolio);

  // 6. Forward Calendar
  const calendar = synthesizeCalendar(engineState);

  return {
    title: `LIFESTACK WEEKLY SYNTHESIS — W${weekNum} ${now.getFullYear()}`,
    date: now.toISOString().split('T')[0],
    weekNumber: weekNum,

    executiveSummary: buildExecutiveSummary(portfolioHealth, marketContext, riskAlerts, actionPriorities),

    sections: {
      portfolioHealth,
      marketContext,
      riskAlerts,
      actionPriorities,
      keyMetrics,
      calendar,
    },

    verdict: buildVerdict(portfolioHealth, marketContext, riskAlerts),
  };
}

/**
 * Portfolio health from Phase 2 engines
 */
function synthesizePortfolioHealth(eng, port, scorecard) {
  const conc = eng.concentration;
  const drift = eng.driftMonitor;
  const debt = eng.debtPriority;
  const wrapper = eng.wrapperExposure;
  const currency = eng.currencyExposure;

  return {
    netWorth: port.netWorth,
    overallScore: scorecard?.overall || 0,
    concentration: {
      hhi: conc?.hhi || 0,
      effectivePositions: conc?.effectivePositions || 0,
      rating: conc?.diversificationRating || 'Unknown',
      clutter: conc?.clutter?.count || 0,
      violations: conc?.violations?.length || 0,
    },
    drift: {
      maxDrift: drift?.maxDrift || 0,
      urgency: drift?.urgency || 'Unknown',
      overweight: drift?.overweightSleeves || [],
      underweight: drift?.underweightSleeves || [],
    },
    debt: {
      totalDebt: debt?.totalDebt || 0,
      highestAPR: debt?.highestAPR || 0,
      recommendation: debt?.recommendation || '',
    },
    wrapperEfficiency: {
      score: wrapper?.efficiency?.score || 0,
      giaExposure: wrapper?.efficiency?.giaExposurePct || 0,
      structuralAlpha: wrapper?.structuralAlphaOpportunity || '',
    },
    fxHealth: currency?.fxHealthRating || 'Unknown',
    homeBias: currency?.homeBias || 0,
  };
}

/**
 * Market context from Phase 3 engines
 */
function synthesizeMarketContext(mkt) {
  if (!mkt) return { regime: 'Unknown', stress: 0, btcPhase: 'Unknown' };

  return {
    regime: mkt.regime?.regime || 'Unknown',
    regimeConfidence: mkt.regime?.confidence || 0,
    riskPosture: mkt.regime?.riskPosture || 'Unknown',
    stressScore: mkt.stress?.compositeScore || 0,
    stressLevel: mkt.stress?.compositeLevel || 'Unknown',
    topStressors: mkt.stress?.topStressors || [],
    contagionRisk: mkt.stress?.contagionRisk || 'LOW',
    btcPhase: mkt.btcCycle?.phase || 'Unknown',
    btcConfidence: mkt.btcCycle?.confidence || 0,
    btcPosture: mkt.btcCycle?.posture || '',
    yieldCurve: mkt.yieldCurve?.shape || 'Unknown',
    creditStress: mkt.creditStress?.compositeLevel || 'Unknown',
    sectorBreadth: mkt.sectorLeadership?.marketBreadth || 'Unknown',
  };
}

/**
 * Aggregate risk alerts from all engines
 */
function synthesizeRiskAlerts(eng, mkt) {
  const alerts = [];

  // Concentration violations
  if (eng.concentration?.violations?.length > 0) {
    eng.concentration.violations.forEach(v => {
      alerts.push({
        severity: v.severity,
        source: 'Concentration',
        message: `${v.type}: ${v.item} at ${v.actual}% (limit: ${v.limit}%)`,
      });
    });
  }

  // Drift urgency
  if (eng.driftMonitor?.urgency === 'Urgent' || eng.driftMonitor?.urgency === 'Action Needed') {
    alerts.push({
      severity: 'warning',
      source: 'Drift',
      message: `Rebalance ${eng.driftMonitor.urgency}: max drift ${eng.driftMonitor.maxDrift?.toFixed(1)}%`,
    });
  }

  // High-APR debt
  if (eng.debtPriority?.highestAPR > 10) {
    alerts.push({
      severity: 'critical',
      source: 'Debt',
      message: `${eng.debtPriority.highestAPR}% APR debt outstanding — guaranteed alpha to pay down`,
    });
  }

  // ISA deadline
  if (eng.isaPensionRouting?.daysUntilTaxYearEnd <= 30) {
    alerts.push({
      severity: 'critical',
      source: 'Tax',
      message: `ISA deadline in ${eng.isaPensionRouting.daysUntilTaxYearEnd} days — £${(eng.isaPensionRouting.isaHeadroom?.remaining || 0).toLocaleString()} unused`,
    });
  }

  // Market stress
  if (mkt?.stress?.compositeScore > 60) {
    alerts.push({
      severity: 'critical',
      source: 'Market',
      message: `Cross-asset stress ELEVATED (${mkt.stress.compositeScore}/100) — ${mkt.stress.compositeAction}`,
    });
  }

  // Currency risk
  if (eng.currencyExposure?.risks?.length > 0) {
    eng.currencyExposure.risks.forEach(r => {
      alerts.push({
        severity: 'warning',
        source: 'FX',
        message: r.alert,
      });
    });
  }

  return alerts.sort((a, b) => {
    const sev = { critical: 0, warning: 1 };
    return (sev[a.severity] || 2) - (sev[b.severity] || 2);
  });
}

/**
 * Rank all actionable items by expected value and urgency
 */
function synthesizeActions(eng, opportunities) {
  const actions = [];

  // Debt paydown
  if (eng.debtPriority?.actions?.length > 0) {
    eng.debtPriority.actions.filter(a => a.apr > 0).forEach(a => {
      actions.push({
        action: `Pay down ${a.name}`,
        value: `£${Math.round(a.annualInterest).toLocaleString()}/yr saved`,
        urgency: a.apr > 15 ? 'Immediate' : 'This quarter',
        category: 'Debt',
        ev: a.annualInterest,
      });
    });
  }

  // ISA deployment
  if (eng.isaPensionRouting?.isaHeadroom?.remaining > 0) {
    const days = eng.isaPensionRouting.daysUntilTaxYearEnd;
    actions.push({
      action: `Fund ISA — £${eng.isaPensionRouting.isaHeadroom.remaining.toLocaleString()} remaining`,
      value: '80-120bps/yr tax-free growth',
      urgency: days <= 30 ? 'Immediate' : days <= 90 ? 'This quarter' : 'This year',
      category: 'Tax',
      ev: eng.isaPensionRouting.isaHeadroom.remaining * 0.008,
    });
  }

  // Salary sacrifice
  if (eng.isaPensionRouting?.salarySacrificeValue?.totalSaving > 0) {
    actions.push({
      action: 'Arrange salary sacrifice with payroll',
      value: `£${Math.round(eng.isaPensionRouting.salarySacrificeValue.totalSaving).toLocaleString()}/yr tax saved`,
      urgency: eng.isaPensionRouting.salarySacrificeValue.inTaperZone ? 'Immediate' : 'This quarter',
      category: 'Tax',
      ev: eng.isaPensionRouting.salarySacrificeValue.totalSaving,
    });
  }

  // Wrapper reallocation
  if (eng.wrapperExposure?.reallocationOpportunities?.length > 0) {
    actions.push({
      action: `Bed & ISA top GIA holdings (${eng.wrapperExposure.reallocationOpportunities.length} candidates)`,
      value: `£${eng.wrapperExposure.totalAnnualBenefitFromReallocation}/yr structural alpha`,
      urgency: 'This quarter',
      category: 'Wrapper',
      ev: eng.wrapperExposure.totalAnnualBenefitFromReallocation,
    });
  }

  // Clutter cleanup
  if (eng.concentration?.clutter?.count > 5) {
    actions.push({
      action: `Consolidate ${eng.concentration.clutter.count} clutter positions (<1% each)`,
      value: 'Reduce complexity, improve signal-to-noise',
      urgency: 'This quarter',
      category: 'Structure',
      ev: eng.concentration.clutter.totalValue * 0.02,
    });
  }

  // Rebalance
  if (eng.rebalanceProposal?.trades?.length > 0) {
    actions.push({
      action: `Execute rebalance (${eng.rebalanceProposal.trades.length} trades)`,
      value: `Reduce max drift from ${eng.driftMonitor?.maxDrift?.toFixed(1)}%`,
      urgency: eng.rebalanceProposal.status === 'Action Recommended' ? 'This month' : 'Next cycle',
      category: 'Allocation',
      ev: eng.driftMonitor?.maxDrift * 100 || 0,
    });
  }

  // Top opportunities from portfolio
  if (opportunities?.length > 0) {
    opportunities.slice(0, 3).forEach(o => {
      actions.push({
        action: o.t,
        value: o.alpha,
        urgency: o.tm >= 8 ? 'Immediate' : 'This quarter',
        category: 'Opportunity',
        ev: o.val || 0,
      });
    });
  }

  return actions.sort((a, b) => b.ev - a.ev);
}

/**
 * Key metrics dashboard
 */
function synthesizeKeyMetrics(eng, port) {
  return [
    { label: 'Net Worth', value: `£${(port.netWorth || 0).toLocaleString()}`, delta: null },
    { label: 'Drift Score', value: `${eng.driftMonitor?.driftScore?.toFixed(1) || '—'}/10`, delta: eng.driftMonitor?.urgency },
    { label: 'Concentration Score', value: `${eng.concentration?.concentrationScore?.toFixed(1) || '—'}/10`, delta: eng.concentration?.diversificationRating },
    { label: 'Wrapper Efficiency', value: `${eng.wrapperExposure?.efficiency?.score?.toFixed(1) || '—'}/10`, delta: `${eng.wrapperExposure?.efficiency?.giaExposurePct || 0}% GIA` },
    { label: 'Total Debt', value: `£${(eng.debtPriority?.totalDebt || 0).toLocaleString()}`, delta: eng.debtPriority?.recommendation?.split('.')[0] },
    { label: 'ISA Remaining', value: `£${(eng.isaPensionRouting?.isaHeadroom?.remaining || 0).toLocaleString()}`, delta: `${eng.isaPensionRouting?.daysUntilTaxYearEnd || 0}d left` },
    { label: 'FX Health', value: eng.currencyExposure?.fxHealthRating || '—', delta: `${eng.currencyExposure?.homeBias || 0}% home bias` },
    { label: 'Annual Drag', value: eng.debtPriority?.totalAnnualInterest ? `£${eng.debtPriority.totalAnnualInterest.toLocaleString()}` : '£0', delta: 'Fixable friction' },
  ];
}

/**
 * Forward calendar of deadlines and events
 */
function synthesizeCalendar(eng) {
  const events = [];

  if (eng.isaPensionRouting?.daysUntilTaxYearEnd) {
    events.push({
      date: '5 April',
      event: 'ISA / Tax Year Deadline',
      daysUntil: eng.isaPensionRouting.daysUntilTaxYearEnd,
      urgency: eng.isaPensionRouting.daysUntilTaxYearEnd <= 30 ? 'critical' : 'normal',
    });
  }

  if (eng.isaPensionRouting?.urgencyFlags?.length > 0) {
    eng.isaPensionRouting.urgencyFlags.forEach(f => {
      events.push({
        date: f.daysLeft ? `${f.daysLeft}d` : 'Ongoing',
        event: f.item,
        action: f.action,
        urgency: f.daysLeft && f.daysLeft <= 30 ? 'critical' : 'normal',
      });
    });
  }

  // Quarterly rebalance reminder
  events.push({
    date: 'Quarterly',
    event: 'Scheduled Rebalance Review',
    action: `Current drift: ${eng.driftMonitor?.maxDrift?.toFixed(1) || 0}%`,
    urgency: eng.driftMonitor?.urgency === 'Urgent' ? 'critical' : 'normal',
  });

  return events.sort((a, b) => (a.daysUntil || 999) - (b.daysUntil || 999));
}

/**
 * Build 3-sentence executive summary
 */
function buildExecutiveSummary(health, market, alerts, actions) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const topAction = actions[0];

  const line1 = `Portfolio at £${(health.netWorth || 0).toLocaleString()} (${health.overallScore}/10 scorecard). ${health.drift.urgency} rebalance status with ${health.concentration.rating} diversification.`;

  const line2 = market.regime !== 'Unknown'
    ? `Market regime: ${market.regime} (${market.regimeConfidence}% confidence). Stress ${market.stressLevel} (${market.stressScore}/100). Risk posture: ${market.riskPosture}.`
    : 'Market engine data pending.';

  const line3 = criticalAlerts.length > 0
    ? `${criticalAlerts.length} critical alert(s): ${criticalAlerts[0].message}. Top action: ${topAction?.action || 'None'}.`
    : topAction
      ? `No critical alerts. Top action: ${topAction.action} (${topAction.value}).`
      : 'No critical alerts. Portfolio on autopilot.';

  return `${line1} ${line2} ${line3}`;
}

/**
 * Build overall verdict
 */
function buildVerdict(health, market, alerts) {
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const warnCount = alerts.filter(a => a.severity === 'warning').length;

  if (critCount >= 3) return { level: 'RED', message: 'Multiple critical issues require immediate attention', action: 'Review and execute top 3 actions this week' };
  if (critCount >= 1) return { level: 'AMBER', message: `${critCount} critical + ${warnCount} warning alerts active`, action: 'Address critical items within 7 days' };
  if (warnCount >= 3) return { level: 'AMBER', message: `${warnCount} warnings — portfolio needs maintenance`, action: 'Schedule review this week' };
  return { level: 'GREEN', message: 'Portfolio operating within parameters', action: 'Continue monitoring, no urgent actions' };
}

/**
 * Get ISO week number
 */
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
