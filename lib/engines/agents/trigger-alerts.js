// =========================================================================
// LIFESTACK OS — TRIGGER ALERT WRITER
// Phase 4: Research & Decisioning
// Monitors engine states against thresholds, generates alert events
// =========================================================================

const DEFAULT_THRESHOLDS = {
  // Portfolio thresholds
  maxDrift: 5, // % before urgent alert
  hhiCritical: 2500, // HHI above this = dangerous concentration
  singlePositionMax: 25, // % single position limit
  clutterMax: 15, // too many tiny positions
  debtAPRCritical: 15, // % APR that demands immediate paydown
  giaExposureMax: 50, // % in GIA when ISA available

  // Tax thresholds
  isaDeadlineDays: 30, // days before tax year end
  pensionDeadlineDays: 60,
  taperZoneLower: 100000, // £100k personal allowance taper
  taperZoneUpper: 125140,

  // Market thresholds
  stressCritical: 60, // composite stress score
  creditStressCritical: 50,

  // Wrapper thresholds
  wrapperEfficiencyMin: 4, // score out of 10
};

/**
 * Check all engine states against thresholds and generate alerts
 */
export function generateTriggerAlerts(engineState, marketState, thresholds) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const alerts = [];

  if (!engineState) return { alerts, summary: null };

  // --- Portfolio Alerts ---

  // Drift breach
  if (engineState.driftMonitor?.maxDrift > t.maxDrift) {
    alerts.push({
      id: 'drift-breach',
      type: 'threshold',
      severity: engineState.driftMonitor.maxDrift > t.maxDrift * 1.5 ? 'critical' : 'warning',
      domain: 'Allocation',
      title: 'Drift threshold breached',
      message: `Max drift ${engineState.driftMonitor.maxDrift.toFixed(1)}% exceeds ${t.maxDrift}% threshold.`,
      metric: engineState.driftMonitor.maxDrift,
      threshold: t.maxDrift,
      action: 'Review rebalance proposal',
      timestamp: new Date().toISOString(),
    });
  }

  // Concentration breach (HHI)
  if (engineState.concentration?.hhi > t.hhiCritical) {
    alerts.push({
      id: 'hhi-breach',
      type: 'threshold',
      severity: 'critical',
      domain: 'Concentration',
      title: 'Portfolio dangerously concentrated',
      message: `HHI at ${engineState.concentration.hhi} (threshold: ${t.hhiCritical}). Effective positions: ${engineState.concentration.effectivePositions?.toFixed(0) || '?'}.`,
      metric: engineState.concentration.hhi,
      threshold: t.hhiCritical,
      action: 'Diversify — reduce top holdings',
      timestamp: new Date().toISOString(),
    });
  }

  // Single position violation
  if (engineState.concentration?.violations?.length > 0) {
    engineState.concentration.violations
      .filter(v => v.actual > t.singlePositionMax)
      .forEach(v => {
        alerts.push({
          id: `position-breach-${v.item}`,
          type: 'threshold',
          severity: 'warning',
          domain: 'Concentration',
          title: `${v.item} exceeds position limit`,
          message: `${v.item} at ${v.actual}% (limit: ${t.singlePositionMax}%).`,
          metric: v.actual,
          threshold: t.singlePositionMax,
          action: `Trim ${v.item} to below ${t.singlePositionMax}%`,
          timestamp: new Date().toISOString(),
        });
      });
  }

  // Clutter overload
  if (engineState.concentration?.clutter?.count > t.clutterMax) {
    alerts.push({
      id: 'clutter-overload',
      type: 'threshold',
      severity: 'info',
      domain: 'Structure',
      title: 'Excessive portfolio clutter',
      message: `${engineState.concentration.clutter.count} positions below 1% each (threshold: ${t.clutterMax}).`,
      metric: engineState.concentration.clutter.count,
      threshold: t.clutterMax,
      action: 'Consolidate small positions',
      timestamp: new Date().toISOString(),
    });
  }

  // High-APR debt
  if (engineState.debtPriority?.highestAPR > t.debtAPRCritical) {
    alerts.push({
      id: 'debt-critical',
      type: 'threshold',
      severity: 'critical',
      domain: 'Debt',
      title: 'High-APR debt outstanding',
      message: `${engineState.debtPriority.highestAPR}% APR debt — guaranteed alpha to pay down. Annual drag: £${(engineState.debtPriority.totalAnnualInterest || 0).toLocaleString()}.`,
      metric: engineState.debtPriority.highestAPR,
      threshold: t.debtAPRCritical,
      action: 'Prioritise debt paydown over new investments',
      timestamp: new Date().toISOString(),
    });
  }

  // --- Tax Alerts ---

  // ISA deadline
  if (engineState.isaPensionRouting?.daysUntilTaxYearEnd <= t.isaDeadlineDays) {
    const days = engineState.isaPensionRouting.daysUntilTaxYearEnd;
    const remaining = engineState.isaPensionRouting.isaHeadroom?.remaining || 0;
    if (remaining > 0) {
      alerts.push({
        id: 'isa-deadline',
        type: 'deadline',
        severity: days <= 7 ? 'critical' : 'warning',
        domain: 'Tax',
        title: 'ISA deadline approaching',
        message: `${days} days until tax year end. £${remaining.toLocaleString()} ISA allowance unused.`,
        metric: days,
        threshold: t.isaDeadlineDays,
        action: `Deploy £${remaining.toLocaleString()} to ISA before 5 April`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // GIA over-exposure
  if (engineState.wrapperExposure?.efficiency?.giaExposurePct > t.giaExposureMax) {
    alerts.push({
      id: 'gia-overexposure',
      type: 'threshold',
      severity: 'warning',
      domain: 'Wrapper',
      title: 'Excessive GIA exposure',
      message: `${engineState.wrapperExposure.efficiency.giaExposurePct}% of portfolio in GIA (threshold: ${t.giaExposureMax}%).`,
      metric: engineState.wrapperExposure.efficiency.giaExposurePct,
      threshold: t.giaExposureMax,
      action: 'Consider Bed & ISA to shelter from CGT/income tax',
      timestamp: new Date().toISOString(),
    });
  }

  // Wrapper efficiency too low
  if (engineState.wrapperExposure?.efficiency?.score < t.wrapperEfficiencyMin) {
    alerts.push({
      id: 'wrapper-inefficient',
      type: 'threshold',
      severity: 'warning',
      domain: 'Wrapper',
      title: 'Low wrapper efficiency',
      message: `Wrapper efficiency score ${engineState.wrapperExposure.efficiency.score?.toFixed(1)}/10 (minimum: ${t.wrapperEfficiencyMin}).`,
      metric: engineState.wrapperExposure.efficiency.score,
      threshold: t.wrapperEfficiencyMin,
      action: 'Review wrapper allocation strategy',
      timestamp: new Date().toISOString(),
    });
  }

  // --- Market Alerts ---

  if (marketState) {
    // Cross-asset stress
    if (marketState.stress?.compositeScore > t.stressCritical) {
      alerts.push({
        id: 'market-stress',
        type: 'threshold',
        severity: 'critical',
        domain: 'Market',
        title: 'Elevated cross-asset stress',
        message: `Composite stress ${marketState.stress.compositeScore}/100 (threshold: ${t.stressCritical}). ${marketState.stress.compositeAction || ''}`,
        metric: marketState.stress.compositeScore,
        threshold: t.stressCritical,
        action: 'Review risk exposure and consider defensive posture',
        timestamp: new Date().toISOString(),
      });
    }

    // Credit stress
    if (marketState.creditStress?.compositeScore > t.creditStressCritical) {
      alerts.push({
        id: 'credit-stress',
        type: 'threshold',
        severity: 'warning',
        domain: 'Credit',
        title: 'Credit stress elevated',
        message: `Credit stress ${marketState.creditStress.compositeScore}/100. Avoid adding HY/credit exposure.`,
        metric: marketState.creditStress.compositeScore,
        threshold: t.creditStressCritical,
        action: 'Reduce credit exposure, favour quality',
        timestamp: new Date().toISOString(),
      });
    }

    // Regime shift (event-based, not threshold)
    if (marketState.regime?.regimeChanged) {
      alerts.push({
        id: 'regime-shift',
        type: 'event',
        severity: 'critical',
        domain: 'Macro',
        title: 'Market regime shift detected',
        message: `Regime changed to ${marketState.regime.regime}. Risk posture: ${marketState.regime.riskPosture}.`,
        action: 'Review allocation against new regime positioning',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Sort by severity
  const sevOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3));

  const critical = alerts.filter(a => a.severity === 'critical');
  const warnings = alerts.filter(a => a.severity === 'warning');

  return {
    alerts,
    summary: {
      total: alerts.length,
      critical: critical.length,
      warnings: warnings.length,
      info: alerts.length - critical.length - warnings.length,
      topAlert: alerts[0]?.title || 'None',
      requiresAction: critical.length > 0,
    },
  };
}
