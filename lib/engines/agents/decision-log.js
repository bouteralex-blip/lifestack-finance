// =========================================================================
// LIFESTACK OS — DECISION LOG + THESIS MONITOR
// Phase 4: Research & Decisioning
// Records trade decisions with thesis, tracks whether thesis played out
// =========================================================================

/**
 * Create a new decision log entry
 * Called when user executes or plans a trade
 */
export function createDecisionEntry(action, context) {
  const now = new Date();
  return {
    id: `dec-${now.getTime()}`,
    timestamp: now.toISOString(),
    action: action.action || action,
    category: action.category || 'general',

    // Thesis capture
    thesis: {
      rationale: action.rationale || context?.rationale || '',
      expectedOutcome: context?.expectedOutcome || '',
      timeHorizon: context?.timeHorizon || '3-6 months',
      successMetric: context?.successMetric || '',
      conviction: context?.conviction || action.confidence || 5,
    },

    // Snapshot at decision time
    snapshot: {
      regime: context?.marketRegime || 'Unknown',
      stressLevel: context?.stressLevel || 'Unknown',
      portfolioScore: context?.portfolioScore || 0,
      driftAtDecision: context?.drift || 0,
    },

    // Tracking
    status: 'open', // open | validated | invalidated | expired
    outcome: null,
    reviewDate: new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0], // +90 days
    notes: [],
  };
}

/**
 * Validate a thesis against current state
 * Returns assessment of whether the thesis is playing out
 */
export function validateThesis(entry, currentEngineState, currentMarketState) {
  if (!entry?.thesis) return { status: 'unknown', message: 'No thesis to validate' };

  const validations = [];
  const now = new Date();
  const entryDate = new Date(entry.timestamp);
  const daysSince = Math.floor((now - entryDate) / 86400000);

  // Check if past review date
  const pastReview = entry.reviewDate && new Date(entry.reviewDate) < now;

  // Category-specific validation
  switch (entry.category) {
    case 'debt': {
      const currentDebt = currentEngineState?.debtPriority?.totalDebt || 0;
      const snapshotDebt = entry.snapshot?.totalDebt;
      if (snapshotDebt && currentDebt < snapshotDebt) {
        validations.push({ signal: 'positive', message: `Debt reduced from £${snapshotDebt.toLocaleString()} to £${currentDebt.toLocaleString()}` });
      }
      break;
    }

    case 'tax': {
      const isaUsed = currentEngineState?.isaPensionRouting?.isaHeadroom?.used || 0;
      if (isaUsed > 0) {
        validations.push({ signal: 'positive', message: `£${isaUsed.toLocaleString()} deployed to ISA` });
      }
      break;
    }

    case 'allocation': {
      const currentDrift = currentEngineState?.driftMonitor?.maxDrift || 0;
      const priorDrift = entry.snapshot?.driftAtDecision || 0;
      if (currentDrift < priorDrift) {
        validations.push({ signal: 'positive', message: `Drift improved: ${priorDrift.toFixed(1)}% → ${currentDrift.toFixed(1)}%` });
      } else if (currentDrift > priorDrift * 1.5) {
        validations.push({ signal: 'negative', message: `Drift worsened: ${priorDrift.toFixed(1)}% → ${currentDrift.toFixed(1)}%` });
      }
      break;
    }

    case 'opportunity': {
      // Regime change check
      if (entry.snapshot?.regime && currentMarketState?.regime?.regime) {
        if (entry.snapshot.regime !== currentMarketState.regime.regime) {
          validations.push({
            signal: 'warning',
            message: `Regime shifted since decision: ${entry.snapshot.regime} → ${currentMarketState.regime.regime}`,
          });
        }
      }
      break;
    }

    default:
      break;
  }

  // Time-based checks
  if (daysSince > 180) {
    validations.push({ signal: 'warning', message: `Decision ${daysSince} days old — consider closing or refreshing thesis` });
  }

  const positives = validations.filter(v => v.signal === 'positive').length;
  const negatives = validations.filter(v => v.signal === 'negative').length;
  const warnings = validations.filter(v => v.signal === 'warning').length;

  let status = 'tracking';
  if (positives > 0 && negatives === 0) status = 'on-track';
  if (negatives > positives) status = 'at-risk';
  if (pastReview) status = 'needs-review';

  return {
    status,
    daysSince,
    pastReview,
    validations,
    summary: validations.length === 0
      ? `No signals yet (${daysSince}d since decision)`
      : `${positives} positive, ${negatives} negative, ${warnings} warning signal(s)`,
  };
}

/**
 * Process full decision log: validate all open entries
 */
export function processDecisionLog(entries, engineState, marketState) {
  if (!entries?.length) return { entries: [], summary: { total: 0, open: 0, atRisk: 0, needsReview: 0 } };

  const processed = entries.map(entry => {
    if (entry.status === 'open' || entry.status === 'tracking') {
      const validation = validateThesis(entry, engineState, marketState);
      return { ...entry, latestValidation: validation };
    }
    return entry;
  });

  const open = processed.filter(e => e.status === 'open' || e.status === 'tracking');
  const atRisk = processed.filter(e => e.latestValidation?.status === 'at-risk');
  const needsReview = processed.filter(e => e.latestValidation?.status === 'needs-review');

  return {
    entries: processed,
    summary: {
      total: processed.length,
      open: open.length,
      atRisk: atRisk.length,
      needsReview: needsReview.length,
      validated: processed.filter(e => e.status === 'validated').length,
      invalidated: processed.filter(e => e.status === 'invalidated').length,
    },
  };
}
