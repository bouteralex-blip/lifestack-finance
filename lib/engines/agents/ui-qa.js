// =========================================================================
// LIFESTACK OS — UI QA CHECK ENGINE
// Phase 4: Research & Decisioning
// Validates that all engine outputs have valid data for UI rendering
// =========================================================================

const UI_CHECKS = [
  // Portfolio engine checks
  { component: 'DriftMonitor', field: 'maxDrift', path: 'driftMonitor.maxDrift', type: 'number', min: 0, max: 100 },
  { component: 'DriftMonitor', field: 'urgency', path: 'driftMonitor.urgency', type: 'string' },
  { component: 'DriftMonitor', field: 'driftScore', path: 'driftMonitor.driftScore', type: 'number', min: 0, max: 10 },
  { component: 'Concentration', field: 'hhi', path: 'concentration.hhi', type: 'number', min: 0, max: 10000 },
  { component: 'Concentration', field: 'effectivePositions', path: 'concentration.effectivePositions', type: 'number', min: 0 },
  { component: 'Concentration', field: 'diversificationRating', path: 'concentration.diversificationRating', type: 'string' },
  { component: 'DebtPriority', field: 'totalDebt', path: 'debtPriority.totalDebt', type: 'number', min: 0 },
  { component: 'DebtPriority', field: 'highestAPR', path: 'debtPriority.highestAPR', type: 'number', min: 0, max: 100 },
  { component: 'ISARouter', field: 'isaRemaining', path: 'isaPensionRouting.isaHeadroom.remaining', type: 'number', min: 0 },
  { component: 'ISARouter', field: 'daysUntilTaxYearEnd', path: 'isaPensionRouting.daysUntilTaxYearEnd', type: 'number', min: 0, max: 366 },
  { component: 'WrapperExposure', field: 'efficiencyScore', path: 'wrapperExposure.efficiency.score', type: 'number', min: 0, max: 10 },
  { component: 'WrapperExposure', field: 'giaExposurePct', path: 'wrapperExposure.efficiency.giaExposurePct', type: 'number', min: 0, max: 100 },
  { component: 'CurrencyExposure', field: 'fxHealthRating', path: 'currencyExposure.fxHealthRating', type: 'string' },
  { component: 'CurrencyExposure', field: 'homeBias', path: 'currencyExposure.homeBias', type: 'number', min: 0, max: 100 },
];

const MARKET_CHECKS = [
  { component: 'Regime', field: 'regime', path: 'regime.regime', type: 'string' },
  { component: 'Regime', field: 'confidence', path: 'regime.confidence', type: 'number', min: 0, max: 100 },
  { component: 'Regime', field: 'riskPosture', path: 'regime.riskPosture', type: 'string' },
  { component: 'Stress', field: 'compositeScore', path: 'stress.compositeScore', type: 'number', min: 0, max: 100 },
  { component: 'Stress', field: 'compositeLevel', path: 'stress.compositeLevel', type: 'string' },
  { component: 'BTCCycle', field: 'phase', path: 'btcCycle.phase', type: 'string' },
  { component: 'BTCCycle', field: 'bias', path: 'btcCycle.bias', type: 'number', min: -5, max: 5 },
  { component: 'CreditStress', field: 'compositeScore', path: 'creditStress.compositeScore', type: 'number', min: 0, max: 100 },
  { component: 'YieldCurve', field: 'shape', path: 'yieldCurve.shape', type: 'string' },
  { component: 'SectorLeadership', field: 'marketBreadth', path: 'sectorLeadership.marketBreadth', type: 'string' },
];

/**
 * Run UI QA checks against all engine outputs
 * Validates that every field expected by the UI is present, correctly typed,
 * and within valid ranges
 */
export function computeUIQAChecks(engineState, marketState, agentState) {
  if (!engineState && !marketState) return null;

  const checks = [];

  // Run engine state checks
  if (engineState) {
    UI_CHECKS.forEach(check => {
      const result = validateField(engineState, check);
      checks.push(result);
    });
  }

  // Run market state checks
  if (marketState) {
    MARKET_CHECKS.forEach(check => {
      const result = validateField(marketState, check);
      checks.push(result);
    });
  }

  // Run agent state checks
  if (agentState) {
    const agentChecks = buildAgentChecks(agentState);
    checks.push(...agentChecks);
  }

  const passed = checks.filter(c => c.status === 'ok');
  const failures = checks.filter(c => c.status !== 'ok');
  const passRate = checks.length > 0 ? +(passed.length / checks.length * 100).toFixed(1) : 0;

  return {
    checks,
    passRate,
    failures,
    totalChecks: checks.length,
    passed: passed.length,
    failed: failures.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate a single field against its specification
 */
function validateField(state, check) {
  const value = getNestedValue(state, check.path);

  // Check for null/undefined
  if (value == null) {
    return {
      component: check.component,
      field: check.field,
      status: 'missing',
      value: null,
      expected: check.type,
      note: `${check.path} is null or undefined`,
    };
  }

  // Check type
  const actualType = typeof value;
  if (check.type === 'number' && actualType !== 'number') {
    return {
      component: check.component,
      field: check.field,
      status: 'missing',
      value,
      expected: 'number',
      note: `Expected number, got ${actualType}`,
    };
  }
  if (check.type === 'string' && actualType !== 'string') {
    return {
      component: check.component,
      field: check.field,
      status: 'missing',
      value,
      expected: 'string',
      note: `Expected string, got ${actualType}`,
    };
  }

  // Check NaN
  if (check.type === 'number' && isNaN(value)) {
    return {
      component: check.component,
      field: check.field,
      status: 'missing',
      value: 'NaN',
      expected: 'valid number',
      note: 'Value is NaN',
    };
  }

  // Check range
  if (check.type === 'number') {
    if (check.min != null && value < check.min) {
      return {
        component: check.component,
        field: check.field,
        status: 'stale',
        value,
        expected: `>= ${check.min}`,
        note: `Value ${value} below minimum ${check.min}`,
      };
    }
    if (check.max != null && value > check.max) {
      return {
        component: check.component,
        field: check.field,
        status: 'stale',
        value,
        expected: `<= ${check.max}`,
        note: `Value ${value} above maximum ${check.max}`,
      };
    }
  }

  // Check empty string
  if (check.type === 'string' && value === '') {
    return {
      component: check.component,
      field: check.field,
      status: 'missing',
      value: '',
      expected: 'non-empty string',
      note: 'Value is empty string',
    };
  }

  return {
    component: check.component,
    field: check.field,
    status: 'ok',
    value,
  };
}

/**
 * Build agent-specific checks
 */
function buildAgentChecks(agentState) {
  const checks = [];

  // Trigger alerts
  if (agentState.triggerAlerts !== undefined) {
    checks.push(validateField(agentState, {
      component: 'TriggerAlerts',
      field: 'alerts',
      path: 'triggerAlerts.alerts',
      type: 'object', // array
    }));
  }

  // Action queue
  if (agentState.actionQueue !== undefined) {
    checks.push(validateField(agentState, {
      component: 'ActionQueue',
      field: 'queue',
      path: 'actionQueue.queue',
      type: 'object', // array
    }));
  }

  return checks;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((current, key) => {
    if (current == null) return undefined;
    return current[key];
  }, obj);
}
