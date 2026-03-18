// =========================================================================
// LIFESTACK OS — DAILY BRIEF GENERATOR
// Phase 4: Research & Decisioning
// 1-page daily market brief: snapshot, key moves, portfolio relevance
// =========================================================================

/**
 * Generate a concise daily market brief
 * One-page summary of market conditions, key moves, and portfolio impact
 */
export function generateDailyBrief(marketState, engineState, portConfig) {
  if (!marketState) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Headline
  const headline = buildBriefHeadline(marketState, engineState);

  // 2. Market snapshot
  const marketSnapshot = buildMarketSnapshot(marketState);

  // 3. Key moves
  const keyMoves = buildKeyMoves(marketState);

  // 4. Portfolio relevance
  const portfolioRelevance = assessPortfolioRelevance(marketState, engineState, portConfig);

  // 5. Outlook
  const outlook = buildOutlook(marketState);

  // 6. Risk flags
  const riskFlags = buildRiskFlags(marketState, engineState);

  return {
    date: dateStr,
    timestamp: now.toISOString(),
    headline,
    marketSnapshot,
    keyMoves,
    portfolioRelevance,
    outlook,
    riskFlags,
  };
}

/**
 * Build headline from market conditions
 */
function buildBriefHeadline(mkt, eng) {
  const regime = mkt.regime?.regime || '';
  const stress = mkt.stress?.compositeLevel || '';
  const stressScore = mkt.stress?.compositeScore || 0;

  if (stressScore > 70) {
    return `Market stress elevated at ${stressScore}/100. ${regime} regime. Defensive posture warranted.`;
  }
  if (mkt.regime?.regimeChanged) {
    return `Regime shift to ${regime}. Risk posture: ${mkt.regime.riskPosture}. Review positioning.`;
  }
  if (stress === 'Low' || stress === 'Normal') {
    return `Markets quiet. ${regime} regime. Stress ${stressScore}/100. No immediate action required.`;
  }
  return `${regime} regime continues. Stress ${stress.toLowerCase()} (${stressScore}/100). Monitor conditions.`;
}

/**
 * Structured market snapshot metrics
 */
function buildMarketSnapshot(mkt) {
  const snapshot = [];

  snapshot.push({
    metric: 'Market Regime',
    value: mkt.regime?.regime || 'Unknown',
    change: mkt.regime?.regimeChanged ? 'Changed' : 'Stable',
    signal: mkt.regime?.riskPosture || 'Neutral',
  });

  snapshot.push({
    metric: 'Stress Score',
    value: mkt.stress?.compositeScore || 0,
    change: null,
    signal: mkt.stress?.compositeLevel || 'Unknown',
  });

  snapshot.push({
    metric: 'Yield Curve',
    value: mkt.yieldCurve?.shape || 'Unknown',
    change: null,
    signal: mkt.yieldCurve?.signal || 'Neutral',
  });

  snapshot.push({
    metric: 'Credit Stress',
    value: mkt.creditStress?.compositeScore || 0,
    change: null,
    signal: mkt.creditStress?.compositeLevel || 'Unknown',
  });

  snapshot.push({
    metric: 'BTC Cycle',
    value: mkt.btcCycle?.phase || 'Unknown',
    change: null,
    signal: mkt.btcCycle?.posture || 'Neutral',
  });

  snapshot.push({
    metric: 'Sector Breadth',
    value: mkt.sectorLeadership?.marketBreadth || 'Unknown',
    change: null,
    signal: mkt.sectorLeadership?.leaders?.[0] || 'None',
  });

  return snapshot;
}

/**
 * Identify key market moves worth noting
 */
function buildKeyMoves(mkt) {
  const moves = [];

  if (mkt.regime?.regimeChanged) {
    moves.push({
      type: 'Regime',
      description: `Market regime shifted to ${mkt.regime.regime}`,
      impact: 'High',
    });
  }

  if (mkt.stress?.topStressors?.length > 0) {
    mkt.stress.topStressors.slice(0, 3).forEach(s => {
      moves.push({
        type: 'Stress',
        description: typeof s === 'string' ? s : s.description || s.metric || 'Elevated stress factor',
        impact: 'Medium',
      });
    });
  }

  if (mkt.btcCycle?.phaseChanged) {
    moves.push({
      type: 'Crypto',
      description: `BTC cycle moved to ${mkt.btcCycle.phase}`,
      impact: 'Medium',
    });
  }

  if (mkt.creditStress?.compositeScore > 40) {
    moves.push({
      type: 'Credit',
      description: `Credit stress at ${mkt.creditStress.compositeScore}/100 — monitor HY exposure`,
      impact: mkt.creditStress.compositeScore > 60 ? 'High' : 'Medium',
    });
  }

  return moves;
}

/**
 * Assess how today's market conditions affect the portfolio
 */
function assessPortfolioRelevance(mkt, eng, portConfig) {
  const points = [];

  // Regime vs allocation alignment
  const regime = mkt.regime?.regime || '';
  const riskPosture = mkt.regime?.riskPosture || '';
  if (riskPosture === 'Defensive' || riskPosture === 'Max Defensive') {
    points.push(`${regime} regime suggests defensive posture — review equity weight.`);
  }
  if (riskPosture === 'Risk On' || riskPosture === 'Max Risk On') {
    points.push(`${regime} regime supports risk-on positioning — current allocation aligned.`);
  }

  // BTC cycle vs crypto holdings
  if (mkt.btcCycle?.posture && eng?.concentration) {
    points.push(`BTC in ${mkt.btcCycle.phase} — ${mkt.btcCycle.posture}.`);
  }

  // Credit stress vs bond exposure
  if (mkt.creditStress?.compositeScore > 40) {
    points.push(`Credit stress elevated — avoid adding fixed income risk.`);
  }

  // Drift relevance
  if (eng?.driftMonitor?.maxDrift > 3) {
    points.push(`Portfolio drift at ${eng.driftMonitor.maxDrift.toFixed(1)}% — market moves may be widening allocation gap.`);
  }

  if (points.length === 0) {
    return 'No significant market-portfolio interactions today.';
  }
  return points.join(' ');
}

/**
 * Build forward-looking outlook
 */
function buildOutlook(mkt) {
  const regime = mkt.regime?.regime || 'Unknown';
  const stress = mkt.stress?.compositeLevel || 'Normal';
  const riskPosture = mkt.regime?.riskPosture || 'Neutral';

  if (stress === 'Crisis' || stress === 'Elevated') {
    return `Stress ${stress.toLowerCase()} — focus on capital preservation. ${riskPosture} posture. Avoid adding risk until stress subsides below 40.`;
  }
  if (regime === 'Late Cycle' || regime === 'Recession') {
    return `${regime} environment — favour quality, reduce beta. Credit spreads and yield curve warrant close monitoring.`;
  }
  if (regime === 'Recovery' || regime === 'Expansion') {
    return `${regime} regime — constructive backdrop for risk assets. Maintain diversified exposure with bias toward growth.`;
  }
  return `${regime} regime with ${stress.toLowerCase()} stress. Maintain current positioning and monitor for regime transitions.`;
}

/**
 * Flag risks that need attention
 */
function buildRiskFlags(mkt, eng) {
  const flags = [];

  if (mkt.stress?.compositeScore > 60) {
    flags.push({
      flag: 'Cross-asset stress elevated',
      level: 'high',
      detail: `Composite stress ${mkt.stress.compositeScore}/100`,
    });
  }

  if (mkt.creditStress?.compositeScore > 50) {
    flags.push({
      flag: 'Credit market stress',
      level: 'medium',
      detail: `Credit stress ${mkt.creditStress.compositeScore}/100`,
    });
  }

  if (mkt.regime?.regimeChanged) {
    flags.push({
      flag: 'Regime transition',
      level: 'high',
      detail: `New regime: ${mkt.regime.regime}`,
    });
  }

  if (eng?.concentration?.hhi > 2000) {
    flags.push({
      flag: 'Portfolio concentration',
      level: 'medium',
      detail: `HHI at ${eng.concentration.hhi} — elevated single-name risk`,
    });
  }

  if (eng?.driftMonitor?.maxDrift > 5) {
    flags.push({
      flag: 'Drift threshold breached',
      level: 'high',
      detail: `Max drift ${eng.driftMonitor.maxDrift.toFixed(1)}%`,
    });
  }

  return flags;
}
