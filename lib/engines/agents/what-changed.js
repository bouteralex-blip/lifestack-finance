// =========================================================================
// LIFESTACK OS — WHAT CHANGED ENGINE
// Phase 4: Research & Decisioning
// Compares current engine snapshots to prior state, produces delta summaries
// =========================================================================

/**
 * Compare two engine state snapshots and produce human-readable deltas
 * Prior state would come from Supabase (stored weekly) or localStorage
 */
export function computeWhatChanged(current, prior) {
  if (!current) return { changes: [], summary: 'No current data available' };
  if (!prior) return { changes: [], summary: 'First run — no prior snapshot for comparison' };

  const changes = [];

  // Portfolio concentration changes
  if (current.concentration && prior.concentration) {
    const hhiDelta = (current.concentration.hhi || 0) - (prior.concentration.hhi || 0);
    if (Math.abs(hhiDelta) > 50) {
      changes.push({
        domain: 'Concentration',
        metric: 'HHI',
        prior: prior.concentration.hhi,
        current: current.concentration.hhi,
        delta: +hhiDelta.toFixed(1),
        direction: hhiDelta > 0 ? 'worsened' : 'improved',
        significance: Math.abs(hhiDelta) > 100 ? 'high' : 'medium',
        message: `HHI ${hhiDelta > 0 ? 'increased' : 'decreased'} by ${Math.abs(hhiDelta).toFixed(0)} — portfolio ${hhiDelta > 0 ? 'more' : 'less'} concentrated`,
      });
    }
  }

  // Drift changes
  if (current.driftMonitor && prior.driftMonitor) {
    const driftDelta = (current.driftMonitor.maxDrift || 0) - (prior.driftMonitor.maxDrift || 0);
    if (Math.abs(driftDelta) > 1) {
      changes.push({
        domain: 'Drift',
        metric: 'Max Drift',
        prior: prior.driftMonitor.maxDrift,
        current: current.driftMonitor.maxDrift,
        delta: +driftDelta.toFixed(2),
        direction: driftDelta > 0 ? 'worsened' : 'improved',
        significance: Math.abs(driftDelta) > 3 ? 'high' : 'medium',
        message: `Max drift ${driftDelta > 0 ? 'widened' : 'narrowed'} to ${current.driftMonitor.maxDrift?.toFixed(1)}% (was ${prior.driftMonitor.maxDrift?.toFixed(1)}%)`,
      });
    }

    // Urgency level change
    if (current.driftMonitor.urgency !== prior.driftMonitor.urgency) {
      changes.push({
        domain: 'Drift',
        metric: 'Urgency',
        prior: prior.driftMonitor.urgency,
        current: current.driftMonitor.urgency,
        direction: 'changed',
        significance: current.driftMonitor.urgency === 'Urgent' ? 'high' : 'medium',
        message: `Rebalance urgency changed: ${prior.driftMonitor.urgency} → ${current.driftMonitor.urgency}`,
      });
    }
  }

  // Debt changes
  if (current.debtPriority && prior.debtPriority) {
    const debtDelta = (current.debtPriority.totalDebt || 0) - (prior.debtPriority.totalDebt || 0);
    if (Math.abs(debtDelta) > 100) {
      changes.push({
        domain: 'Debt',
        metric: 'Total Debt',
        prior: prior.debtPriority.totalDebt,
        current: current.debtPriority.totalDebt,
        delta: +debtDelta.toFixed(0),
        direction: debtDelta > 0 ? 'increased' : 'decreased',
        significance: Math.abs(debtDelta) > 1000 ? 'high' : 'medium',
        message: debtDelta < 0
          ? `Debt reduced by £${Math.abs(debtDelta).toLocaleString()}`
          : `Debt increased by £${debtDelta.toLocaleString()}`,
      });
    }
  }

  // ISA headroom changes
  if (current.isaPensionRouting && prior.isaPensionRouting) {
    const isaChange = (current.isaPensionRouting.isaHeadroom?.remaining || 0) -
      (prior.isaPensionRouting.isaHeadroom?.remaining || 0);
    if (Math.abs(isaChange) > 500) {
      changes.push({
        domain: 'Tax',
        metric: 'ISA Headroom',
        prior: prior.isaPensionRouting.isaHeadroom?.remaining,
        current: current.isaPensionRouting.isaHeadroom?.remaining,
        delta: isaChange,
        direction: isaChange < 0 ? 'used' : 'reset',
        significance: 'medium',
        message: isaChange < 0
          ? `£${Math.abs(isaChange).toLocaleString()} deployed to ISA`
          : 'ISA allowance reset (new tax year)',
      });
    }
  }

  // Wrapper efficiency changes
  if (current.wrapperExposure?.efficiency && prior.wrapperExposure?.efficiency) {
    const effDelta = (current.wrapperExposure.efficiency.score || 0) -
      (prior.wrapperExposure.efficiency.score || 0);
    if (Math.abs(effDelta) > 0.3) {
      changes.push({
        domain: 'Wrapper',
        metric: 'Efficiency Score',
        prior: prior.wrapperExposure.efficiency.score,
        current: current.wrapperExposure.efficiency.score,
        delta: +effDelta.toFixed(1),
        direction: effDelta > 0 ? 'improved' : 'worsened',
        significance: 'medium',
        message: `Wrapper efficiency ${effDelta > 0 ? 'improved' : 'declined'} to ${current.wrapperExposure.efficiency.score?.toFixed(1)}/10`,
      });
    }
  }

  // Summary
  const highSignificance = changes.filter(c => c.significance === 'high');
  const improved = changes.filter(c => c.direction === 'improved' || c.direction === 'decreased' || c.direction === 'used');
  const worsened = changes.filter(c => c.direction === 'worsened' || c.direction === 'increased');

  const summary = changes.length === 0
    ? 'No significant changes since last snapshot.'
    : `${changes.length} change(s) detected: ${improved.length} improved, ${worsened.length} worsened.${highSignificance.length > 0 ? ` ${highSignificance.length} high-significance item(s) require attention.` : ''}`;

  return { changes, summary, improved: improved.length, worsened: worsened.length };
}

/**
 * Compare market engine snapshots
 */
export function computeMarketChanges(current, prior) {
  if (!current || !prior) return { changes: [], summary: 'Market comparison pending prior snapshot' };

  const changes = [];

  // Regime change
  if (current.regime?.regime !== prior.regime?.regime) {
    changes.push({
      domain: 'Macro',
      metric: 'Regime',
      prior: prior.regime?.regime,
      current: current.regime?.regime,
      significance: 'high',
      message: `Regime shift: ${prior.regime?.regime} → ${current.regime?.regime}`,
    });
  }

  // Stress level change
  if (current.stress?.compositeLevel !== prior.stress?.compositeLevel) {
    changes.push({
      domain: 'Stress',
      metric: 'Composite Level',
      prior: prior.stress?.compositeLevel,
      current: current.stress?.compositeLevel,
      significance: current.stress?.compositeScore > 60 ? 'high' : 'medium',
      message: `Stress level: ${prior.stress?.compositeLevel} → ${current.stress?.compositeLevel} (${current.stress?.compositeScore}/100)`,
    });
  }

  // BTC cycle phase change
  if (current.btcCycle?.phase !== prior.btcCycle?.phase) {
    changes.push({
      domain: 'Crypto',
      metric: 'BTC Cycle Phase',
      prior: prior.btcCycle?.phase,
      current: current.btcCycle?.phase,
      significance: 'high',
      message: `BTC cycle shifted: ${prior.btcCycle?.phase} → ${current.btcCycle?.phase}`,
    });
  }

  // Credit stress
  if (current.creditStress?.compositeLevel !== prior.creditStress?.compositeLevel) {
    changes.push({
      domain: 'Credit',
      metric: 'Credit Stress',
      prior: prior.creditStress?.compositeLevel,
      current: current.creditStress?.compositeLevel,
      significance: 'medium',
      message: `Credit conditions: ${prior.creditStress?.compositeLevel} → ${current.creditStress?.compositeLevel}`,
    });
  }

  // Yield curve shape
  if (current.yieldCurve?.shape !== prior.yieldCurve?.shape) {
    changes.push({
      domain: 'Rates',
      metric: 'Yield Curve Shape',
      prior: prior.yieldCurve?.shape,
      current: current.yieldCurve?.shape,
      significance: 'high',
      message: `Yield curve: ${prior.yieldCurve?.shape} → ${current.yieldCurve?.shape}`,
    });
  }

  const summary = changes.length === 0
    ? 'No significant market regime changes.'
    : `${changes.length} market change(s): ${changes.filter(c => c.significance === 'high').length} high-significance.`;

  return { changes, summary };
}
