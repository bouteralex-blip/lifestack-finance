// =========================================================================
// LIFESTACK OS — TRIGGER NOTE GENERATOR
// Phase 4: Research & Decisioning
// Auto-generates a research note when a threshold is breached
// =========================================================================

/**
 * Generate a research note when a trigger alert fires
 * Provides context, historical perspective, and actionable recommendation
 */
export function generateTriggerNote(alert, engineState, marketState) {
  if (!alert) return null;

  const now = new Date();

  // 1. Classify alert type
  const alertType = classifyAlertType(alert);

  // 2. Build title
  const title = buildNoteTitle(alert);

  // 3. Build context
  const context = buildNoteContext(alert, engineState, marketState);

  // 4. Get current and threshold values
  const currentValue = alert.metric ?? alert.value ?? null;
  const threshold = alert.threshold ?? null;

  // 5. Historical context
  const historicalContext = buildHistoricalContext(alert, engineState);

  // 6. Recommendation
  const recommendation = buildNoteRecommendation(alert, engineState, marketState);

  // 7. Urgency
  const urgency = computeNoteUrgency(alert);

  return {
    alertType,
    title,
    context,
    currentValue,
    threshold,
    historicalContext,
    recommendation,
    urgency,
    timestamp: now.toISOString(),
    alertId: alert.id || null,
    domain: alert.domain || 'Unknown',
  };
}

/**
 * Classify the alert type for routing and display
 */
function classifyAlertType(alert) {
  if (alert.type === 'deadline') return 'Deadline';
  if (alert.type === 'event') return 'Market Event';
  if (alert.domain === 'Debt') return 'Debt Alert';
  if (alert.domain === 'Tax' || alert.domain === 'Wrapper') return 'Tax Efficiency';
  if (alert.domain === 'Market' || alert.domain === 'Credit' || alert.domain === 'Macro') return 'Market Risk';
  if (alert.domain === 'Concentration' || alert.domain === 'Allocation') return 'Portfolio Structure';
  return 'Threshold Breach';
}

/**
 * Build a descriptive title for the note
 */
function buildNoteTitle(alert) {
  if (alert.title) return `Research Note: ${alert.title}`;
  if (alert.id) return `Research Note: ${alert.id.replace(/-/g, ' ')}`;
  return 'Research Note: Alert Triggered';
}

/**
 * Build contextual analysis for the alert
 */
function buildNoteContext(alert, eng, mkt) {
  const lines = [];

  lines.push(alert.message || `${alert.domain || 'System'} alert triggered.`);

  // Add engine context based on domain
  if (alert.domain === 'Allocation' && eng?.driftMonitor) {
    lines.push(`Current max drift: ${eng.driftMonitor.maxDrift?.toFixed(1)}%. Urgency level: ${eng.driftMonitor.urgency}.`);
    if (eng.driftMonitor.overweightSleeves?.length > 0) {
      lines.push(`Overweight: ${eng.driftMonitor.overweightSleeves.map(s => s.sleeve || s).join(', ')}.`);
    }
  }

  if (alert.domain === 'Concentration' && eng?.concentration) {
    lines.push(`HHI: ${eng.concentration.hhi}. Effective positions: ${eng.concentration.effectivePositions?.toFixed(0) || '?'}. Rating: ${eng.concentration.diversificationRating}.`);
  }

  if (alert.domain === 'Debt' && eng?.debtPriority) {
    lines.push(`Total debt: £${(eng.debtPriority.totalDebt || 0).toLocaleString()}. Annual interest drag: £${(eng.debtPriority.totalAnnualInterest || 0).toLocaleString()}.`);
  }

  if ((alert.domain === 'Market' || alert.domain === 'Credit') && mkt) {
    lines.push(`Regime: ${mkt.regime?.regime || 'Unknown'}. Risk posture: ${mkt.regime?.riskPosture || 'Unknown'}.`);
    lines.push(`Cross-asset stress: ${mkt.stress?.compositeScore || 0}/100 (${mkt.stress?.compositeLevel || 'Unknown'}).`);
  }

  if (alert.domain === 'Tax' && eng?.isaPensionRouting) {
    lines.push(`Days until tax year end: ${eng.isaPensionRouting.daysUntilTaxYearEnd}. ISA remaining: £${(eng.isaPensionRouting.isaHeadroom?.remaining || 0).toLocaleString()}.`);
  }

  return lines.join(' ');
}

/**
 * Build historical context for the alert metric
 */
function buildHistoricalContext(alert, eng) {
  if (!alert.metric && !alert.threshold) {
    return 'No historical data available for this metric.';
  }

  const domain = alert.domain || '';

  if (domain === 'Concentration') {
    const hhi = alert.metric || 0;
    if (hhi > 3000) return `HHI at ${hhi} is extremely concentrated — equivalent to fewer than 3 effective positions. This level historically indicates dangerous single-name risk.`;
    if (hhi > 2500) return `HHI at ${hhi} is above critical threshold. A well-diversified portfolio typically has HHI below 1500.`;
    return `HHI at ${hhi} indicates moderate concentration. Monitor for further increases.`;
  }

  if (domain === 'Allocation') {
    const drift = alert.metric || 0;
    if (drift > 7) return `Drift at ${drift.toFixed(1)}% is significantly above rebalance threshold. Extended periods of high drift reduce risk-adjusted returns.`;
    if (drift > 5) return `Drift at ${drift.toFixed(1)}% exceeds standard threshold. Academic research suggests rebalancing at 5% drift optimises between tracking error and transaction costs.`;
    return `Drift at ${drift.toFixed(1)}% is approaching threshold. Monitor and prepare rebalance if trend continues.`;
  }

  if (domain === 'Market' || domain === 'Credit') {
    const stress = alert.metric || 0;
    if (stress > 80) return `Stress at ${stress}/100 is in the top decile historically. Prior readings at this level have preceded significant drawdowns within 1-3 months.`;
    if (stress > 60) return `Stress at ${stress}/100 is elevated. This level has historically been associated with increased volatility but not necessarily sustained drawdowns.`;
    return `Stress at ${stress}/100 warrants monitoring but is within normal range.`;
  }

  if (domain === 'Tax') {
    const days = alert.metric || 0;
    return `${days} days until tax year end. Unused ISA allowance is lost permanently — there is no carryforward. This represents a one-way door decision.`;
  }

  if (domain === 'Debt') {
    const apr = alert.metric || 0;
    return `${apr}% APR debt represents a guaranteed return when paid down. No market investment can reliably match this rate on a risk-adjusted basis.`;
  }

  return `Current value: ${alert.metric}. Threshold: ${alert.threshold}. Review historical pattern for context.`;
}

/**
 * Build actionable recommendation
 */
function buildNoteRecommendation(alert, eng, mkt) {
  if (alert.action) return alert.action;

  const domain = alert.domain || '';
  const severity = alert.severity || 'info';

  if (domain === 'Allocation') return 'Review rebalance proposal and execute if drift exceeds 5%.';
  if (domain === 'Concentration') return 'Trim overweight positions to reduce single-name risk.';
  if (domain === 'Debt') return 'Prioritise debt paydown over new investments — guaranteed return.';
  if (domain === 'Tax') return 'Fund ISA immediately to capture remaining allowance.';
  if (domain === 'Market') return 'Review risk exposure. Consider reducing equity beta if stress persists.';
  if (domain === 'Credit') return 'Avoid adding credit risk. Favour quality and short duration.';
  if (domain === 'Wrapper') return 'Review Bed & ISA strategy for GIA holdings.';

  return severity === 'critical' ? 'Immediate review required.' : 'Monitor and review at next scheduled checkpoint.';
}

/**
 * Compute urgency level for the note
 */
function computeNoteUrgency(alert) {
  const severity = alert.severity || 'info';
  const type = alert.type || 'threshold';

  if (severity === 'critical' && type === 'deadline') return 'Immediate — deadline-driven';
  if (severity === 'critical') return 'High — action within 24 hours';
  if (severity === 'warning') return 'Medium — action within 7 days';
  return 'Low — review at next scheduled checkpoint';
}
