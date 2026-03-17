// =========================================================================
// LIFESTACK OS — CONTENT DRIFT DETECTOR
// Phase 4: Research & Decisioning
// Detects when displayed UI copy diverges from engine-computed values
// Ensures dashboard always reflects the latest engine state
// =========================================================================

/**
 * Compute content drift between engine values and displayed values
 * Flags any divergence where the UI is showing stale or incorrect data
 */
export function computeContentDrift(engineState, displayedValues) {
  if (!engineState || !displayedValues) return null;

  const drifts = [];

  // Compare all displayed values against engine state
  if (typeof displayedValues === 'object' && !Array.isArray(displayedValues)) {
    Object.keys(displayedValues).forEach(field => {
      const displayed = displayedValues[field];
      const engine = resolveEngineValue(field, engineState);
      const drift = compareDriftValues(field, engine, displayed);
      drifts.push(drift);
    });
  }

  if (Array.isArray(displayedValues)) {
    displayedValues.forEach(item => {
      if (item.field && item.value !== undefined) {
        const engine = resolveEngineValue(item.field, engineState);
        const drift = compareDriftValues(item.field, engine, item.value);
        drifts.push(drift);
      }
    });
  }

  const driftCount = drifts.filter(d => d.isDrifted).length;
  const totalChecked = drifts.length;
  const accuracy = totalChecked > 0
    ? +((1 - driftCount / totalChecked) * 100).toFixed(1)
    : 100;

  return {
    drifts,
    driftCount,
    accuracy,
    totalChecked,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Resolve an engine value from a field name
 * Supports dot-notation paths and common field aliases
 */
function resolveEngineValue(field, engineState) {
  // Direct dot-notation path
  const dotValue = getNestedValue(engineState, field);
  if (dotValue !== undefined) return dotValue;

  // Common field aliases
  const aliases = {
    'netWorth': null, // computed externally
    'maxDrift': 'driftMonitor.maxDrift',
    'driftUrgency': 'driftMonitor.urgency',
    'driftScore': 'driftMonitor.driftScore',
    'hhi': 'concentration.hhi',
    'effectivePositions': 'concentration.effectivePositions',
    'diversificationRating': 'concentration.diversificationRating',
    'totalDebt': 'debtPriority.totalDebt',
    'highestAPR': 'debtPriority.highestAPR',
    'annualInterest': 'debtPriority.totalAnnualInterest',
    'isaRemaining': 'isaPensionRouting.isaHeadroom.remaining',
    'daysUntilTaxYearEnd': 'isaPensionRouting.daysUntilTaxYearEnd',
    'wrapperEfficiency': 'wrapperExposure.efficiency.score',
    'giaExposure': 'wrapperExposure.efficiency.giaExposurePct',
    'fxHealth': 'currencyExposure.fxHealthRating',
    'homeBias': 'currencyExposure.homeBias',
  };

  const aliasPath = aliases[field];
  if (aliasPath) return getNestedValue(engineState, aliasPath);

  return undefined;
}

/**
 * Compare an engine value to a displayed value and detect drift
 */
function compareDriftValues(field, engineValue, displayedValue) {
  // Engine value not available — cannot determine drift
  if (engineValue === undefined || engineValue === null) {
    return {
      field,
      engineValue: null,
      displayedValue,
      isDrifted: false,
      note: 'Engine value not available — cannot assess drift',
    };
  }

  // Both are numbers — compare with tolerance
  if (typeof engineValue === 'number' && typeof displayedValue === 'number') {
    // Allow small floating point tolerance
    const tolerance = Math.abs(engineValue) * 0.001 + 0.01;
    const isDrifted = Math.abs(engineValue - displayedValue) > tolerance;

    return {
      field,
      engineValue,
      displayedValue,
      isDrifted,
      note: isDrifted
        ? `Drift detected: engine=${engineValue}, displayed=${displayedValue}`
        : 'Values match',
    };
  }

  // String comparison
  if (typeof engineValue === 'string' && typeof displayedValue === 'string') {
    const isDrifted = engineValue !== displayedValue;
    return {
      field,
      engineValue,
      displayedValue,
      isDrifted,
      note: isDrifted
        ? `Drift detected: engine="${engineValue}", displayed="${displayedValue}"`
        : 'Values match',
    };
  }

  // Type mismatch
  if (typeof engineValue !== typeof displayedValue) {
    // Try string coercion comparison
    const coerced = String(engineValue) === String(displayedValue);
    return {
      field,
      engineValue,
      displayedValue,
      isDrifted: !coerced,
      note: coerced
        ? 'Values match after type coercion'
        : `Type mismatch: engine=${typeof engineValue}, displayed=${typeof displayedValue}`,
    };
  }

  // Deep comparison for objects/arrays
  const isDrifted = JSON.stringify(engineValue) !== JSON.stringify(displayedValue);
  return {
    field,
    engineValue,
    displayedValue,
    isDrifted,
    note: isDrifted ? 'Object/array drift detected' : 'Values match',
  };
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
