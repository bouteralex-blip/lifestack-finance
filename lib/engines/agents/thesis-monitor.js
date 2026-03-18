// =========================================================================
// LIFESTACK OS — THESIS MONITOR ENGINE
// Phase 4: Research & Decisioning
// Track investment theses against actual market/engine state
// =========================================================================

/**
 * Evaluate a single thesis against current state
 * Returns status: 'tracking' | 'validated' | 'invalidated' | 'expired'
 */
function evaluateThesis(decision, engineState, marketState) {
  const thesis = decision.thesis || {};
  const conditions = thesis.conditions || [];
  const timeHorizon = thesis.timeHorizon || '3-6 months';
  const createdAt = decision.timestamp || decision.createdAt || null;

  // Check expiry
  if (createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const monthsElapsed = (now - created) / (30 * 24 * 60 * 60 * 1000);

    // Parse time horizon for expiry check
    const horizonMonths = parseHorizonMonths(timeHorizon);
    if (monthsElapsed > horizonMonths * 1.5) {
      return {
        status: 'expired',
        evidence: `Thesis expired — ${monthsElapsed.toFixed(0)} months elapsed vs ${horizonMonths}-month horizon.`,
      };
    }
  }

  // If explicit conditions are provided, evaluate them
  if (conditions.length > 0) {
    const results = conditions.map(cond => evaluateCondition(cond, engineState, marketState));
    const metCount = results.filter(r => r.met).length;
    const failedCount = results.filter(r => r.met === false).length;

    if (failedCount > conditions.length / 2) {
      return {
        status: 'invalidated',
        evidence: `${failedCount}/${conditions.length} conditions failed: ${results.filter(r => !r.met).map(r => r.reason).join('; ')}`,
      };
    }
    if (metCount === conditions.length) {
      return {
        status: 'validated',
        evidence: `All ${conditions.length} conditions met: ${results.map(r => r.reason).join('; ')}`,
      };
    }
    return {
      status: 'tracking',
      evidence: `${metCount}/${conditions.length} conditions met so far.`,
    };
  }

  // If success metric is provided, check against engine state
  if (thesis.successMetric) {
    const outcome = checkSuccessMetric(thesis.successMetric, decision, engineState);
    if (outcome) return outcome;
  }

  // Default: still tracking
  return {
    status: 'tracking',
    evidence: 'Thesis is active — no conditions to auto-evaluate.',
  };
}

/**
 * Parse time horizon string to months
 */
function parseHorizonMonths(horizon) {
  if (typeof horizon === 'number') return horizon;
  const str = (horizon || '').toLowerCase();
  if (str.includes('week')) return 0.25;
  if (str.includes('1 month') || str.includes('1-month')) return 1;
  if (str.includes('3 month') || str.includes('3-month') || str.includes('quarter')) return 3;
  if (str.includes('6 month') || str.includes('6-month')) return 6;
  if (str.includes('1 year') || str.includes('12 month') || str.includes('1-year')) return 12;
  if (str.includes('2 year') || str.includes('2-year')) return 24;
  if (str.includes('3-6')) return 6;
  if (str.includes('6-12')) return 12;
  return 6; // default
}

/**
 * Evaluate a single condition against state
 */
function evaluateCondition(condition, engineState, marketState) {
  const { metric, operator, target } = condition;
  if (!metric || target === undefined) {
    return { met: null, reason: `Missing metric or target in condition` };
  }

  // Resolve metric value from engine or market state
  const value = resolveMetric(metric, engineState, marketState);
  if (value === null || value === undefined) {
    return { met: null, reason: `Cannot resolve metric "${metric}"` };
  }

  let met = false;
  switch (operator) {
    case '>': met = value > target; break;
    case '>=': met = value >= target; break;
    case '<': met = value < target; break;
    case '<=': met = value <= target; break;
    case '==': met = value === target; break;
    case '!=': met = value !== target; break;
    default: met = null;
  }

  return {
    met,
    reason: `${metric} = ${typeof value === 'number' ? value.toFixed(2) : value} (target: ${operator} ${target})`,
  };
}

/**
 * Resolve a metric path from engine/market state
 * Supports dot-notation: "concentration.hhi", "market.regime"
 */
function resolveMetric(path, engineState, marketState) {
  const parts = path.split('.');
  let value = null;

  // Try engine state first
  if (engineState) {
    value = parts.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), engineState);
  }

  // Fall back to market state
  if (value === null && marketState) {
    value = parts.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), marketState);
  }

  return value;
}

/**
 * Check a success metric string against decision outcome
 */
function checkSuccessMetric(metric, decision, engineState) {
  // If the decision has an explicit outcome recorded
  if (decision.outcome === 'success') {
    return { status: 'validated', evidence: `Outcome recorded as success: ${metric}` };
  }
  if (decision.outcome === 'failure') {
    return { status: 'invalidated', evidence: `Outcome recorded as failure: ${metric}` };
  }
  return null;
}

/**
 * Compute thesis monitor state from decision log
 * Tracks all theses and evaluates against current state
 */
export function computeThesisMonitorState(decisionLog, engineState, marketState) {
  if (!decisionLog?.length) return null;

  const theses = decisionLog
    .filter(d => d.thesis && (d.thesis.rationale || d.thesis.conditions?.length || d.thesis.expectedOutcome))
    .map(d => {
      const { status, evidence } = evaluateThesis(d, engineState || {}, marketState || {});
      return {
        id: d.id || `thesis-${d.timestamp || Date.now()}`,
        action: d.action || '',
        thesis: d.thesis.rationale || d.thesis.expectedOutcome || '',
        timeHorizon: d.thesis.timeHorizon || '3-6 months',
        conviction: d.thesis.conviction || 5,
        status,
        evidence,
        createdAt: d.timestamp || d.createdAt || null,
      };
    });

  const activeCount = theses.filter(t => t.status === 'tracking').length;
  const validatedCount = theses.filter(t => t.status === 'validated').length;
  const invalidatedCount = theses.filter(t => t.status === 'invalidated').length;
  const expiredCount = theses.filter(t => t.status === 'expired').length;

  // Hit rate: validated / (validated + invalidated)
  const resolved = validatedCount + invalidatedCount;
  const hitRate = resolved > 0 ? +((validatedCount / resolved) * 100).toFixed(1) : 0;

  // Implication
  let implication;
  if (resolved === 0 && activeCount > 0) {
    implication = `${activeCount} active theses tracking — none resolved yet.`;
  } else if (hitRate >= 70) {
    implication = `Strong thesis hit rate (${hitRate}%). Decision framework is calibrated well.`;
  } else if (hitRate >= 50) {
    implication = `Moderate hit rate (${hitRate}%). Review invalidated theses for pattern recognition.`;
  } else if (resolved > 0) {
    implication = `Low hit rate (${hitRate}%). Significant thesis drift — recalibrate decision framework.`;
  } else {
    implication = 'No theses to monitor — log decisions with rationale to enable tracking.';
  }

  return {
    theses,
    activeCount,
    validatedCount,
    invalidatedCount,
    expiredCount,
    totalCount: theses.length,
    hitRate,
    implication,
  };
}
