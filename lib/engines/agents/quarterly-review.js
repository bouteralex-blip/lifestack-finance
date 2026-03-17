// =========================================================================
// LIFESTACK OS — QUARTERLY REVIEW ENGINE
// Phase 4: Research & Decisioning
// Quarterly allocation review — re-underwrite all positions and themes
// =========================================================================

/**
 * Generate a quarterly allocation review
 * Re-underwrite all sleeves, review themes, and assess risk budget usage
 */
export function generateQuarterlyReview(engineState, marketState, portConfig) {
  if (!engineState) return null;

  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const year = now.getFullYear();

  // 1. Allocation review by sleeve
  const allocations = reviewAllocations(engineState, portConfig);

  // 2. Theme review
  const themeReview = reviewThemes(engineState, marketState);

  // 3. Risk budget usage
  const riskBudgetUsage = assessRiskBudget(engineState, marketState);

  // 4. Strategic changes
  const strategicChanges = identifyStrategicChanges(engineState, marketState, portConfig);

  // 5. Verdict
  const verdict = buildQuarterlyVerdict(allocations, riskBudgetUsage, strategicChanges);

  return {
    quarter: `${quarter} ${year}`,
    date: now.toISOString().split('T')[0],
    allocations,
    themeReview,
    riskBudgetUsage,
    strategicChanges,
    verdict,
    timestamp: now.toISOString(),
  };
}

/**
 * Review allocation per sleeve vs target
 */
function reviewAllocations(eng, portConfig) {
  const drift = eng.driftMonitor;
  if (!drift?.sleeves && !portConfig?.sleeves) return [];

  const sleeves = drift?.sleeves || portConfig?.sleeves || [];

  return sleeves.map(s => {
    const current = s.current || s.actual || 0;
    const target = s.target || 0;
    const diff = +(current - target).toFixed(1);

    let recommendation = 'Hold';
    if (diff > 3) recommendation = 'Trim — overweight';
    else if (diff > 1) recommendation = 'Monitor — slightly overweight';
    else if (diff < -3) recommendation = 'Add — underweight';
    else if (diff < -1) recommendation = 'Monitor — slightly underweight';

    return {
      sleeve: s.sleeve || s.name || 'Unknown',
      current: +current.toFixed(1),
      target: +target.toFixed(1),
      drift: diff,
      recommendation,
    };
  });
}

/**
 * Review active investment themes
 */
function reviewThemes(eng, mkt) {
  const themes = [];

  // Extract themes from engine state if available
  const regime = mkt?.regime?.regime || 'Unknown';
  const stress = mkt?.stress?.compositeLevel || 'Normal';

  // Default theme assessments based on market context
  themes.push({
    theme: 'Growth / Quality',
    status: regime === 'Expansion' || regime === 'Recovery' ? 'Favoured' : 'Neutral',
    review: `${regime} regime ${regime === 'Expansion' || regime === 'Recovery' ? 'supports' : 'is neutral for'} growth factor.`,
  });

  themes.push({
    theme: 'Value / Income',
    status: regime === 'Late Cycle' || regime === 'Recession' ? 'Favoured' : 'Neutral',
    review: `${regime} regime ${regime === 'Late Cycle' || regime === 'Recession' ? 'favours' : 'is neutral for'} defensive value.`,
  });

  themes.push({
    theme: 'Crypto / BTC',
    status: mkt?.btcCycle?.bias >= 3 ? 'Accumulate' : mkt?.btcCycle?.bias >= 1 ? 'Hold' : 'Reduce',
    review: `BTC in ${mkt?.btcCycle?.phase || 'Unknown'} phase. Bias: ${mkt?.btcCycle?.bias || 0}/5.`,
  });

  themes.push({
    theme: 'Fixed Income',
    status: mkt?.creditStress?.compositeScore > 40 ? 'Cautious' : 'Neutral',
    review: `Credit stress: ${mkt?.creditStress?.compositeLevel || 'Normal'}. ${mkt?.yieldCurve?.shape || 'Unknown'} yield curve.`,
  });

  themes.push({
    theme: 'International / EM',
    status: stress === 'Elevated' || stress === 'Crisis' ? 'Reduce' : 'Neutral',
    review: `Stress ${stress.toLowerCase()}. ${mkt?.sectorLeadership?.marketBreadth || 'Unknown'} breadth.`,
  });

  return themes;
}

/**
 * Assess risk budget usage
 */
function assessRiskBudget(eng, mkt) {
  const hhi = eng.concentration?.hhi || 0;
  const drift = eng.driftMonitor?.maxDrift || 0;
  const stress = mkt?.stress?.compositeScore || 0;
  const giaExposure = eng.wrapperExposure?.efficiency?.giaExposurePct || 0;

  // Compute usage as percentage of budget
  const concentrationUsage = Math.min(100, (hhi / 2500) * 100);
  const driftUsage = Math.min(100, (drift / 5) * 100);
  const stressUsage = Math.min(100, stress);
  const wrapperUsage = Math.min(100, (giaExposure / 50) * 100);

  const overall = +((concentrationUsage + driftUsage + stressUsage + wrapperUsage) / 4).toFixed(0);

  return {
    overall,
    breakdown: {
      concentration: { usage: +concentrationUsage.toFixed(0), metric: hhi, limit: 2500 },
      drift: { usage: +driftUsage.toFixed(0), metric: +drift.toFixed(1), limit: 5 },
      marketStress: { usage: +stressUsage.toFixed(0), metric: stress, limit: 100 },
      wrapperInefficiency: { usage: +wrapperUsage.toFixed(0), metric: +giaExposure.toFixed(1), limit: 50 },
    },
    status: overall > 75 ? 'Over budget' : overall > 50 ? 'Moderate' : 'Within budget',
  };
}

/**
 * Identify strategic changes needed
 */
function identifyStrategicChanges(eng, mkt, portConfig) {
  const changes = [];

  // Regime-driven changes
  if (mkt?.regime?.regimeChanged) {
    changes.push({
      change: `Adjust for new ${mkt.regime.regime} regime`,
      rationale: `Regime shift detected. New risk posture: ${mkt.regime.riskPosture}.`,
      priority: 'High',
    });
  }

  // Drift-driven changes
  if (eng.driftMonitor?.maxDrift > 5) {
    changes.push({
      change: 'Execute rebalance to target weights',
      rationale: `Max drift ${eng.driftMonitor.maxDrift.toFixed(1)}% exceeds threshold.`,
      priority: 'High',
    });
  }

  // Concentration-driven changes
  if (eng.concentration?.hhi > 2500) {
    changes.push({
      change: 'Diversify — reduce top holdings',
      rationale: `HHI at ${eng.concentration.hhi} indicates dangerous concentration.`,
      priority: 'High',
    });
  }

  // Wrapper-driven changes
  if (eng.wrapperExposure?.efficiency?.giaExposurePct > 40) {
    changes.push({
      change: 'Optimise wrapper allocation via Bed & ISA',
      rationale: `${eng.wrapperExposure.efficiency.giaExposurePct}% GIA exposure. Structural alpha available.`,
      priority: 'Medium',
    });
  }

  // BTC cycle changes
  if (mkt?.btcCycle?.bias >= 4) {
    changes.push({
      change: 'Increase BTC allocation — strong cycle signal',
      rationale: `BTC bias ${mkt.btcCycle.bias}/5 in ${mkt.btcCycle.phase} phase.`,
      priority: 'Medium',
    });
  }

  if (changes.length === 0) {
    changes.push({
      change: 'No strategic changes required',
      rationale: 'Portfolio aligned with targets and market conditions.',
      priority: 'None',
    });
  }

  return changes;
}

/**
 * Build quarterly verdict
 */
function buildQuarterlyVerdict(allocations, riskBudget, changes) {
  const highPriorityChanges = changes.filter(c => c.priority === 'High').length;
  const overweightCount = allocations.filter(a => a.drift > 3).length;
  const riskStatus = riskBudget.status;

  if (highPriorityChanges >= 2 || riskStatus === 'Over budget') {
    return {
      level: 'ACTION REQUIRED',
      message: `${highPriorityChanges} high-priority changes needed. Risk budget: ${riskStatus}.`,
      action: 'Execute strategic changes this quarter.',
    };
  }
  if (highPriorityChanges >= 1 || overweightCount >= 2) {
    return {
      level: 'REVIEW',
      message: `${highPriorityChanges} change(s) recommended. ${overweightCount} overweight sleeve(s).`,
      action: 'Schedule review and address priority items.',
    };
  }
  return {
    level: 'ON TRACK',
    message: 'Portfolio aligned with strategic targets. No major changes needed.',
    action: 'Continue monitoring. Next review next quarter.',
  };
}
