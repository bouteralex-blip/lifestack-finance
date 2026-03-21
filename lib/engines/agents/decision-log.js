// =========================================================================
// LIFESTACK OS — DECISION LOG + THESIS MONITOR + CONVICTION TRACKING
// Phase 4: Research & Decisioning
// Records trade decisions with thesis, tracks whether thesis played out,
// and learns from outcomes to improve conviction calibration
// =========================================================================

/**
 * Create a new decision log entry with conviction tracking
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

    // Conviction tracking (NEW)
    conviction: {
      initialConviction: context?.conviction || action.confidence || 50,  // 0-100 scale
      confidence: context?.confidence || 'MEDIUM',  // HIGH | MEDIUM | LOW
      origin: context?.agentOrigin || 'manual',  // Which agent generated this opportunity
      calibrationFactor: 1.0,  // Will be updated from agent accuracy history
    },

    // Snapshot at decision time
    snapshot: {
      regime: context?.marketRegime || 'Unknown',
      stressLevel: context?.stressLevel || 'Unknown',
      portfolioScore: context?.portfolioScore || 0,
      driftAtDecision: context?.drift || 0,
      totalDebt: context?.totalDebt || 0,
      isaRemaining: context?.isaRemaining || 0,
    },

    // Tracking
    status: 'open', // open | validated | invalidated | expired
    outcome: null,
    outcomeDate: null,
    actualImpact: null,  // Actual portfolio impact when outcome is recorded
    reviewDate: new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0], // +90 days
    notes: [],
  };
}

/**
 * Record outcome for a decision and update conviction history
 * Called 90+ days after decision, or when outcome is clear
 */
export async function recordDecisionOutcome(decisionId, outcome, supabaseClient) {
  if (!supabaseClient) {
    console.warn('No Supabase client provided, conviction tracking skipped');
    return;
  }

  try {
    // Fetch the decision from database
    const { data: decision, error: fetchError } = await supabaseClient
      .from('decision_log')
      .select('*')
      .eq('id', decisionId)
      .single();

    if (fetchError) throw fetchError;
    if (!decision) throw new Error('Decision not found');

    // Determine outcome status
    const actualImpact = outcome?.actualImpact || outcome?.impact || 0;
    const expectedImpact = decision.thesis?.expectedOutcome || 0;
    const impactDelta = Math.abs(actualImpact - expectedImpact);
    
    let outcomeStatus = 'INCONCLUSIVE';
    if (impactDelta < 50) outcomeStatus = 'SUCCESS';
    else if (impactDelta < 150) outcomeStatus = 'PARTIAL';
    else outcomeStatus = 'FAILURE';

    const convictionHistory = {
      opportunity_id: decisionId,
      decision_id: decisionId,
      agent_name: decision.conviction?.origin || 'manual',
      initial_conviction: decision.conviction?.initialConviction || 50,
      initial_impact: expectedImpact,
      initial_confidence: decision.conviction?.confidence || 'MEDIUM',
      initial_rationale: decision.thesis?.rationale || '',
      
      actual_outcome: actualImpact,
      outcome_date: new Date(),
      outcome_status: outcomeStatus,
      outcome_notes: outcome?.notes || outcome?.description || '',
      
      opportunity_type: decision.category,
      market_regime_at_decision: decision.snapshot?.regime || 'Unknown',
      market_regime_at_outcome: outcome?.currentRegime || 'Unknown',
      
      agent_accuracy_factor: decision.conviction?.calibrationFactor || 1.0,
    };

    // Insert conviction history record
    const { error: insertError } = await supabaseClient
      .from('conviction_history')
      .insert([convictionHistory]);

    if (insertError) throw insertError;

    // Update decision log with outcome
    const { error: updateError } = await supabaseClient
      .from('decision_log')
      .update({
        status: 'validated',
        outcome: outcomeStatus,
        updated_at: new Date(),
      })
      .eq('id', decisionId);

    if (updateError) throw updateError;

    // Trigger agent accuracy summary update
    await updateAgentAccuracySummary(decision.conviction?.origin || 'manual', supabaseClient);

    return {
      success: true,
      decisionId,
      outcomeStatus,
      convictionHistoryId: convictionHistory.id,
    };
  } catch (error) {
    console.error('Failed to record decision outcome:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update agent accuracy summary and calculate new accuracy factor
 */
async function updateAgentAccuracySummary(agentName, supabaseClient) {
  try {
    // Call stored procedure to update accuracy summary
    const { error } = await supabaseClient.rpc('update_agent_accuracy_summary', {
      agent_name_param: agentName,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to update agent accuracy summary:', error);
    return false;
  }
}

/**
 * Fetch agent accuracy factor for use in opportunity ranking
 */
export async function getAgentAccuracyFactor(agentName, supabaseClient) {
  if (!supabaseClient) return 1.0;  // Default if no DB

  try {
    const { data, error } = await supabaseClient
      .from('agent_accuracy_summary')
      .select('accuracy_factor, success_rate, total_opportunities')
      .eq('agent_name', agentName)
      .single();

    if (error) return 1.0;  // Default on error
    return data?.accuracy_factor || 1.0;
  } catch (error) {
    console.error('Failed to fetch agent accuracy factor:', error);
    return 1.0;
  }
}

/**
 * Update conviction with historical accuracy factor
 */
export async function calibrateConvictionWithHistory(decision, supabaseClient) {
  if (!supabaseClient || !decision?.conviction?.origin) return decision;

  const accuracy = await getAgentAccuracyFactor(decision.conviction.origin, supabaseClient);
  return {
    ...decision,
    conviction: {
      ...decision.conviction,
      calibrationFactor: accuracy,
      calibratedConviction: (decision.conviction.initialConviction || 50) * accuracy,
    },
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
