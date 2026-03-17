// =========================================================================
// LIFESTACK OS — MORNING COMMAND CENTER
// Phase 4: Research & Decisioning
// Daily digest: what matters today, what changed overnight, what to do
// =========================================================================

/**
 * Generate the morning command center digest
 * This is the "open the app and know everything" view
 */
export function generateMorningCommand(engineState, marketState, actionQueue, triggerAlerts, whatChanged, synthesis) {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Headline — one sentence summary
  const headline = buildHeadline(engineState, marketState, triggerAlerts);

  // 2. Overnight changes
  const overnightChanges = buildOvernightSection(whatChanged);

  // 3. Today's priorities (top 3 from action queue)
  const todaysPriorities = buildPriorities(actionQueue);

  // 4. Market pulse
  const marketPulse = buildMarketPulse(marketState);

  // 5. Portfolio vitals
  const portfolioVitals = buildPortfolioVitals(engineState);

  // 6. Active alerts
  const activeAlerts = buildAlertSummary(triggerAlerts);

  // 7. Calendar awareness
  const calendarItems = buildCalendarAwareness(engineState);

  // 8. Verdict badge
  const verdict = buildDayVerdict(triggerAlerts, actionQueue);

  return {
    title: `Good morning — ${dayOfWeek}, ${dateStr}`,
    timestamp: now.toISOString(),
    headline,

    sections: {
      overnightChanges,
      todaysPriorities,
      marketPulse,
      portfolioVitals,
      activeAlerts,
      calendarItems,
    },

    verdict,

    // Quick stats for header bar
    quickStats: {
      netWorth: synthesis?.sections?.portfolioHealth?.netWorth || 0,
      alertCount: triggerAlerts?.alerts?.length || 0,
      criticalCount: triggerAlerts?.summary?.critical || 0,
      topAction: actionQueue?.queue?.[0]?.action || 'No actions',
      regime: marketState?.regime?.regime || 'Unknown',
      stress: marketState?.stress?.compositeScore || 0,
    },
  };
}

/**
 * One-sentence headline for the day
 */
function buildHeadline(eng, mkt, alerts) {
  const criticals = alerts?.summary?.critical || 0;
  const regime = mkt?.regime?.regime || '';
  const stress = mkt?.stress?.compositeLevel || '';
  const drift = eng?.driftMonitor?.urgency || '';

  if (criticals >= 3) {
    return `${criticals} critical alerts require attention. Review immediately.`;
  }
  if (criticals >= 1) {
    return `${criticals} critical alert active. ${alerts?.alerts?.[0]?.title || 'Action needed'}.`;
  }
  if (drift === 'Urgent') {
    return `Rebalance urgent — portfolio drift exceeds threshold.`;
  }
  if (stress === 'Elevated' || stress === 'Crisis') {
    return `Market stress ${stress.toLowerCase()}. ${regime} regime. Monitor risk exposure.`;
  }
  return `Portfolio operating normally. ${regime ? regime + ' regime.' : ''} No critical alerts.`;
}

/**
 * What changed since last check
 */
function buildOvernightSection(whatChanged) {
  if (!whatChanged || !whatChanged.changes?.length) {
    return { hasChanges: false, message: 'No significant changes since last snapshot.' };
  }

  return {
    hasChanges: true,
    count: whatChanged.changes.length,
    improved: whatChanged.improved || 0,
    worsened: whatChanged.worsened || 0,
    summary: whatChanged.summary,
    topChanges: whatChanged.changes.slice(0, 3).map(c => ({
      domain: c.domain,
      message: c.message,
      significance: c.significance,
    })),
  };
}

/**
 * Top 3 actions for today
 */
function buildPriorities(actionQueue) {
  if (!actionQueue?.queue?.length) {
    return { actions: [], message: 'No actions queued. Portfolio on autopilot.' };
  }

  const top = actionQueue.queue.slice(0, 3);
  return {
    actions: top.map(a => ({
      rank: a.rank,
      action: a.action,
      urgency: a.urgency,
      ev: a.ev,
      category: a.category,
    })),
    totalQueued: actionQueue.queue.length,
    totalEV: actionQueue.summary?.totalAnnualEV || 0,
  };
}

/**
 * Market conditions snapshot
 */
function buildMarketPulse(mkt) {
  if (!mkt) return { available: false };

  return {
    available: true,
    regime: mkt.regime?.regime || 'Unknown',
    riskPosture: mkt.regime?.riskPosture || 'Unknown',
    stress: {
      score: mkt.stress?.compositeScore || 0,
      level: mkt.stress?.compositeLevel || 'Unknown',
    },
    btc: {
      phase: mkt.btcCycle?.phase || 'Unknown',
      posture: mkt.btcCycle?.posture || '',
    },
    credit: mkt.creditStress?.compositeLevel || 'Unknown',
    yieldCurve: mkt.yieldCurve?.shape || 'Unknown',
  };
}

/**
 * Portfolio vital signs
 */
function buildPortfolioVitals(eng) {
  if (!eng) return { available: false };

  return {
    available: true,
    drift: {
      max: eng.driftMonitor?.maxDrift || 0,
      urgency: eng.driftMonitor?.urgency || 'Unknown',
    },
    concentration: {
      hhi: eng.concentration?.hhi || 0,
      rating: eng.concentration?.diversificationRating || 'Unknown',
    },
    debt: {
      total: eng.debtPriority?.totalDebt || 0,
      highestAPR: eng.debtPriority?.highestAPR || 0,
    },
    wrapper: {
      efficiency: eng.wrapperExposure?.efficiency?.score || 0,
      giaPercent: eng.wrapperExposure?.efficiency?.giaExposurePct || 0,
    },
    isa: {
      remaining: eng.isaPensionRouting?.isaHeadroom?.remaining || 0,
      daysLeft: eng.isaPensionRouting?.daysUntilTaxYearEnd || 0,
    },
  };
}

/**
 * Alert summary for badge display
 */
function buildAlertSummary(triggerAlerts) {
  if (!triggerAlerts?.alerts?.length) {
    return { count: 0, alerts: [], message: 'All clear — no active alerts.' };
  }

  return {
    count: triggerAlerts.alerts.length,
    critical: triggerAlerts.summary?.critical || 0,
    warnings: triggerAlerts.summary?.warnings || 0,
    alerts: triggerAlerts.alerts.slice(0, 5).map(a => ({
      severity: a.severity,
      title: a.title,
      domain: a.domain,
      action: a.action,
    })),
  };
}

/**
 * Upcoming deadlines and calendar items
 */
function buildCalendarAwareness(eng) {
  const items = [];

  if (eng?.isaPensionRouting?.daysUntilTaxYearEnd) {
    const days = eng.isaPensionRouting.daysUntilTaxYearEnd;
    items.push({
      event: 'ISA / Tax Year Deadline',
      daysUntil: days,
      urgency: days <= 14 ? 'critical' : days <= 30 ? 'warning' : 'normal',
      action: days <= 30
        ? `Deploy £${(eng.isaPensionRouting.isaHeadroom?.remaining || 0).toLocaleString()} before 5 April`
        : null,
    });
  }

  // Quarterly rebalance
  const drift = eng?.driftMonitor?.maxDrift || 0;
  if (drift > 3) {
    items.push({
      event: 'Rebalance Review Due',
      daysUntil: null,
      urgency: drift > 5 ? 'warning' : 'normal',
      action: `Max drift ${drift.toFixed(1)}% — review allocation`,
    });
  }

  return items;
}

/**
 * Overall day verdict
 */
function buildDayVerdict(triggerAlerts, actionQueue) {
  const criticals = triggerAlerts?.summary?.critical || 0;
  const warnings = triggerAlerts?.summary?.warnings || 0;
  const immediateActions = actionQueue?.summary?.immediateActions || 0;

  if (criticals >= 2 || immediateActions >= 3) {
    return {
      level: 'RED',
      emoji: null,
      message: 'Multiple items need attention today',
      action: `Address ${criticals} critical alert(s) and ${immediateActions} immediate action(s)`,
    };
  }
  if (criticals >= 1 || immediateActions >= 1) {
    return {
      level: 'AMBER',
      emoji: null,
      message: 'Action items pending',
      action: `Review ${criticals + immediateActions} item(s) requiring attention`,
    };
  }
  if (warnings >= 2) {
    return {
      level: 'AMBER',
      emoji: null,
      message: 'Minor items to monitor',
      action: 'No urgent action — review warnings at convenience',
    };
  }
  return {
    level: 'GREEN',
    emoji: null,
    message: 'All clear — portfolio operating within parameters',
    action: 'No action required today',
  };
}
