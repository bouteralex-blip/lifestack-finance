// =========================================================================
// LIFESTACK OS — MONTHLY REVIEW SCORECARD
// Phase 4: Research & Decisioning
// Full monthly operating review across returns, risk, tax, diversification,
// and execution
// =========================================================================

const REVIEW_AREAS = ['Returns', 'Risk', 'Tax efficiency', 'Diversification', 'Execution'];

/**
 * Generate a full monthly operating review scorecard
 * Scores each area out of 10 with trend indicators
 */
export function generateMonthlyReview(engineState, marketState, portConfig, monthlyReturns) {
  if (!engineState) return null;

  const now = new Date();
  const month = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // 1. Build scorecard
  const scorecard = REVIEW_AREAS.map(area => {
    const result = scoreArea(area, engineState, marketState, portConfig, monthlyReturns);
    return { area, ...result };
  });

  // 2. Overall score
  const overallScore = +(scorecard.reduce((sum, s) => sum + s.score, 0) / scorecard.length).toFixed(1);

  // 3. Highlights
  const highlights = buildHighlights(scorecard, engineState, marketState);

  // 4. Concerns
  const concerns = buildConcerns(scorecard, engineState, marketState);

  // 5. Actions tracking
  const actionsCompleted = countCompletedActions(engineState);
  const actionsPending = countPendingActions(engineState);

  return {
    month,
    date: now.toISOString().split('T')[0],
    scorecard,
    overallScore,
    highlights,
    concerns,
    actionsCompleted,
    actionsPending,
    verdict: overallScore >= 7 ? 'Strong' : overallScore >= 5 ? 'Adequate' : 'Needs Attention',
    timestamp: now.toISOString(),
  };
}

/**
 * Score an individual review area
 */
function scoreArea(area, eng, mkt, portConfig, returns) {
  switch (area) {
    case 'Returns':
      return scoreReturns(returns);
    case 'Risk':
      return scoreRisk(eng, mkt);
    case 'Tax efficiency':
      return scoreTaxEfficiency(eng);
    case 'Diversification':
      return scoreDiversification(eng);
    case 'Execution':
      return scoreExecution(eng);
    default:
      return { score: 5, trend: 'Stable', detail: 'No data' };
  }
}

/**
 * Score returns performance
 */
function scoreReturns(returns) {
  if (!returns) return { score: 5, trend: 'Unknown', detail: 'No return data available' };

  const ret = returns.portfolioReturn || returns.return || 0;
  const bench = returns.benchmarkReturn || returns.benchmark || 0;
  const alpha = ret - bench;

  let score = 5;
  if (alpha > 2) score = 9;
  else if (alpha > 1) score = 8;
  else if (alpha > 0) score = 7;
  else if (alpha > -1) score = 5;
  else if (alpha > -2) score = 4;
  else score = 3;

  // Adjust for absolute returns
  if (ret > 5) score = Math.min(10, score + 1);
  if (ret < -5) score = Math.max(1, score - 1);

  const trend = alpha > 0 ? 'Improving' : alpha < -1 ? 'Declining' : 'Stable';

  return {
    score: Math.max(1, Math.min(10, score)),
    trend,
    detail: `Return: ${ret.toFixed(1)}% vs benchmark ${bench.toFixed(1)}% (alpha: ${alpha > 0 ? '+' : ''}${alpha.toFixed(1)}%)`,
  };
}

/**
 * Score risk management
 */
function scoreRisk(eng, mkt) {
  let score = 8; // start optimistic
  const details = [];

  // Drift penalty
  const drift = eng.driftMonitor?.maxDrift || 0;
  if (drift > 5) { score -= 2; details.push(`High drift: ${drift.toFixed(1)}%`); }
  else if (drift > 3) { score -= 1; details.push(`Moderate drift: ${drift.toFixed(1)}%`); }

  // Concentration penalty
  const hhi = eng.concentration?.hhi || 0;
  if (hhi > 2500) { score -= 2; details.push(`Dangerous HHI: ${hhi}`); }
  else if (hhi > 2000) { score -= 1; details.push(`Elevated HHI: ${hhi}`); }

  // Debt risk
  if (eng.debtPriority?.highestAPR > 15) { score -= 1; details.push(`High-APR debt: ${eng.debtPriority.highestAPR}%`); }

  // Market stress awareness
  if (mkt?.stress?.compositeScore > 60) { details.push(`Market stress elevated: ${mkt.stress.compositeScore}/100`); }

  const trend = drift > 5 || hhi > 2500 ? 'Declining' : 'Stable';

  return {
    score: Math.max(1, Math.min(10, score)),
    trend,
    detail: details.length > 0 ? details.join('. ') : 'Risk parameters within acceptable ranges',
  };
}

/**
 * Score tax efficiency
 */
function scoreTaxEfficiency(eng) {
  let score = 7;
  const details = [];

  // Wrapper efficiency
  const wrapperScore = eng.wrapperExposure?.efficiency?.score || 5;
  score = Math.round((score + wrapperScore) / 2);

  // GIA exposure penalty
  const giaExposure = eng.wrapperExposure?.efficiency?.giaExposurePct || 0;
  if (giaExposure > 50) { score -= 1; details.push(`GIA exposure: ${giaExposure}%`); }
  if (giaExposure > 70) { score -= 1; details.push('Excessive GIA exposure'); }

  // ISA utilisation
  const isaRemaining = eng.isaPensionRouting?.isaHeadroom?.remaining || 0;
  const daysLeft = eng.isaPensionRouting?.daysUntilTaxYearEnd || 365;
  if (isaRemaining > 0 && daysLeft <= 30) { score -= 1; details.push(`£${isaRemaining.toLocaleString()} ISA unused with ${daysLeft}d left`); }

  // Salary sacrifice
  if (eng.isaPensionRouting?.salarySacrificeValue?.inTaperZone) {
    details.push('In taper zone — salary sacrifice high value');
  }

  const trend = giaExposure > 50 ? 'Needs work' : 'Stable';

  return {
    score: Math.max(1, Math.min(10, score)),
    trend,
    detail: details.length > 0 ? details.join('. ') : `Wrapper efficiency: ${wrapperScore}/10`,
  };
}

/**
 * Score diversification
 */
function scoreDiversification(eng) {
  const conc = eng.concentration;
  if (!conc) return { score: 5, trend: 'Unknown', detail: 'No concentration data' };

  let score = 5;
  const hhi = conc.hhi || 0;
  const effectivePositions = conc.effectivePositions || 0;
  const violations = conc.violations?.length || 0;

  if (hhi < 1000) score = 9;
  else if (hhi < 1500) score = 8;
  else if (hhi < 2000) score = 6;
  else if (hhi < 2500) score = 4;
  else score = 2;

  if (violations > 0) score = Math.max(1, score - violations);

  const details = [`HHI: ${hhi}`, `Effective positions: ${effectivePositions.toFixed(0)}`, `Rating: ${conc.diversificationRating || 'Unknown'}`];
  if (violations > 0) details.push(`${violations} violation(s)`);

  return {
    score: Math.max(1, Math.min(10, score)),
    trend: hhi > 2000 ? 'Declining' : 'Stable',
    detail: details.join('. '),
  };
}

/**
 * Score execution discipline
 */
function scoreExecution(eng) {
  let score = 7;
  const details = [];

  // Rebalance execution
  if (eng.rebalanceProposal?.status === 'Action Recommended' && eng.driftMonitor?.maxDrift > 5) {
    score -= 2;
    details.push('Overdue rebalance not executed');
  }

  // Debt paydown execution
  if (eng.debtPriority?.highestAPR > 15) {
    score -= 1;
    details.push('High-APR debt still outstanding');
  }

  // ISA execution
  if (eng.isaPensionRouting?.daysUntilTaxYearEnd <= 30 && eng.isaPensionRouting?.isaHeadroom?.remaining > 5000) {
    score -= 1;
    details.push('ISA deadline approaching with significant unused allowance');
  }

  const trend = score >= 7 ? 'Stable' : 'Needs work';

  return {
    score: Math.max(1, Math.min(10, score)),
    trend,
    detail: details.length > 0 ? details.join('. ') : 'Execution on track — actions being addressed timely',
  };
}

/**
 * Build highlights list
 */
function buildHighlights(scorecard, eng, mkt) {
  const highlights = [];

  scorecard.filter(s => s.score >= 7).forEach(s => {
    highlights.push(`${s.area}: ${s.score}/10 — ${s.detail}`);
  });

  if (eng.driftMonitor?.maxDrift < 2) {
    highlights.push('Portfolio tightly aligned with targets — minimal drift.');
  }

  return highlights;
}

/**
 * Build concerns list
 */
function buildConcerns(scorecard, eng, mkt) {
  const concerns = [];

  scorecard.filter(s => s.score < 5).forEach(s => {
    concerns.push(`${s.area}: ${s.score}/10 — ${s.detail}`);
  });

  if (mkt?.stress?.compositeScore > 60) {
    concerns.push(`Market stress elevated at ${mkt.stress.compositeScore}/100 — monitor closely.`);
  }

  return concerns;
}

/**
 * Count completed actions (simplified — based on engine state)
 */
function countCompletedActions(eng) {
  let count = 0;
  if (eng.driftMonitor?.maxDrift < 2) count++; // Rebalance done
  if (eng.isaPensionRouting?.isaHeadroom?.remaining === 0) count++; // ISA fully funded
  if (!eng.debtPriority?.highestAPR || eng.debtPriority.highestAPR < 5) count++; // No high debt
  return count;
}

/**
 * Count pending actions
 */
function countPendingActions(eng) {
  let count = 0;
  if (eng.driftMonitor?.maxDrift > 3) count++;
  if (eng.isaPensionRouting?.isaHeadroom?.remaining > 0) count++;
  if (eng.debtPriority?.highestAPR > 10) count++;
  if (eng.concentration?.violations?.length > 0) count++;
  if (eng.wrapperExposure?.reallocationOpportunities?.length > 0) count++;
  return count;
}
