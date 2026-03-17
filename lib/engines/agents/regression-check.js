// =========================================================================
// LIFESTACK OS — REGRESSION CHECK ENGINE
// Phase 4: Research & Decisioning
// Detects unexpected changes in engine outputs vs prior snapshot
// Flags any output that changed by >50% without corresponding market move
// =========================================================================

const MONITORED_FIELDS = [
  { engine: 'driftMonitor', field: 'maxDrift', label: 'Max Drift', threshold: 50 },
  { engine: 'driftMonitor', field: 'driftScore', label: 'Drift Score', threshold: 50 },
  { engine: 'concentration', field: 'hhi', label: 'HHI', threshold: 30 },
  { engine: 'concentration', field: 'effectivePositions', label: 'Effective Positions', threshold: 50 },
  { engine: 'debtPriority', field: 'totalDebt', label: 'Total Debt', threshold: 20 },
  { engine: 'debtPriority', field: 'highestAPR', label: 'Highest APR', threshold: 10 },
  { engine: 'debtPriority', field: 'totalAnnualInterest', label: 'Annual Interest', threshold: 20 },
  { engine: 'isaPensionRouting', field: 'daysUntilTaxYearEnd', label: 'ISA Days Left', threshold: 50 },
  { engine: 'wrapperExposure.efficiency', field: 'score', label: 'Wrapper Efficiency', threshold: 50 },
  { engine: 'wrapperExposure.efficiency', field: 'giaExposurePct', label: 'GIA Exposure %', threshold: 30 },
  { engine: 'currencyExposure', field: 'homeBias', label: 'Home Bias', threshold: 30 },
];

/**
 * Compute regression checks by comparing current engine state to prior snapshot
 * Flags any field that changed by >50% (or custom threshold) without explanation
 */
export function computeRegressionChecks(engineState, priorState) {
  if (!engineState) return null;
  if (!priorState) {
    return {
      checks: [],
      regressionCount: 0,
      stableCount: 0,
      implication: 'First snapshot — no prior state for comparison. Baseline established.',
      timestamp: new Date().toISOString(),
    };
  }

  const checks = [];

  MONITORED_FIELDS.forEach(spec => {
    const current = getNestedField(engineState, spec.engine, spec.field);
    const prior = getNestedField(priorState, spec.engine, spec.field);

    const result = compareValues(spec, current, prior);
    checks.push(result);
  });

  const regressionCount = checks.filter(c => c.isRegression).length;
  const stableCount = checks.filter(c => !c.isRegression).length;

  let implication = 'All engine outputs stable vs prior snapshot.';
  if (regressionCount > 3) {
    implication = `${regressionCount} regression(s) detected — possible data quality issue or significant portfolio change. Manual review recommended.`;
  } else if (regressionCount > 0) {
    implication = `${regressionCount} regression(s) detected. Review flagged fields for data integrity.`;
  }

  return {
    checks,
    regressionCount,
    stableCount,
    implication,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get a potentially nested field value
 */
function getNestedField(state, engine, field) {
  if (!state) return null;

  // Handle nested engine paths (e.g., 'wrapperExposure.efficiency')
  let obj = state;
  const parts = engine.split('.');
  for (const part of parts) {
    if (obj == null) return null;
    obj = obj[part];
  }

  if (obj == null) return null;
  return obj[field] ?? null;
}

/**
 * Compare current vs prior value and determine if it's a regression
 */
function compareValues(spec, current, prior) {
  // Both null — stable
  if (current == null && prior == null) {
    return {
      engine: spec.engine,
      field: spec.field,
      label: spec.label,
      prior: null,
      current: null,
      changePct: 0,
      isRegression: false,
      note: 'Both null — no data',
    };
  }

  // One null — potential regression
  if (current == null && prior != null) {
    return {
      engine: spec.engine,
      field: spec.field,
      label: spec.label,
      prior,
      current: null,
      changePct: -100,
      isRegression: true,
      note: 'Value disappeared — was present in prior snapshot',
    };
  }

  if (current != null && prior == null) {
    return {
      engine: spec.engine,
      field: spec.field,
      label: spec.label,
      prior: null,
      current,
      changePct: 100,
      isRegression: false,
      note: 'New value appeared — not present in prior snapshot',
    };
  }

  // Both numeric — compute percentage change
  if (typeof current === 'number' && typeof prior === 'number') {
    if (prior === 0) {
      const isRegression = Math.abs(current) > 0;
      return {
        engine: spec.engine,
        field: spec.field,
        label: spec.label,
        prior,
        current,
        changePct: current === 0 ? 0 : Infinity,
        isRegression: isRegression && Math.abs(current) > 1,
        note: isRegression ? `Value went from 0 to ${current}` : 'Stable at zero',
      };
    }

    const changePct = +((current - prior) / Math.abs(prior) * 100).toFixed(1);
    const isRegression = Math.abs(changePct) > spec.threshold;

    return {
      engine: spec.engine,
      field: spec.field,
      label: spec.label,
      prior,
      current,
      changePct,
      isRegression,
      note: isRegression
        ? `Changed by ${changePct > 0 ? '+' : ''}${changePct}% (threshold: ${spec.threshold}%)`
        : `Changed by ${changePct > 0 ? '+' : ''}${changePct}% — within tolerance`,
    };
  }

  // Non-numeric comparison
  const changed = current !== prior;
  return {
    engine: spec.engine,
    field: spec.field,
    label: spec.label,
    prior,
    current,
    changePct: changed ? 100 : 0,
    isRegression: changed,
    note: changed ? `Value changed from "${prior}" to "${current}"` : 'Unchanged',
  };
}
