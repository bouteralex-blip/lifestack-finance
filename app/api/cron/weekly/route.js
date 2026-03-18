// =========================================================================
// LIFESTACK OS — Weekly Cron Route
// Vercel-compatible cron endpoint: weekly synthesis and decision log review
// Schedule: 0 8 * * 1 (8 AM UTC every Monday)
// =========================================================================

import { createClient } from '@supabase/supabase-js';
import {
  computeConcentrationState,
  computeSleeveExposureState,
  computeWrapperExposureState,
  computeCurrencyExposureState,
  computeDriftMonitorState,
  computeISAPensionRoutingState,
  computeDebtPriorityState,
  computeRiskBudgetState,
  computeDrawdownState,
  computeCapitalEfficiencyState,
  computeCryptoRebalanceState,
} from '../../../../lib/engines/index.js';
import {
  computeRegimeState,
  computeCrossAssetStressState,
  computeBTCCycleState,
  computeCreditStressState,
  computeInflationShockState,
} from '../../../../lib/engines/market/index.js';
import {
  generateWeeklySynthesis,
  computeWhatChanged,
  computeMarketChanges,
  processDecisionLog,
  buildActionQueue,
} from '../../../../lib/engines/agents/index.js';
import { saveEngineSnapshot, loadPriorSnapshot, loadDecisionLog } from '../../../../lib/persistence.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ynvfzssakggmmldjkmes.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InludmZ6c3Nha2dnbW1sZGprbWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODU5NTcsImV4cCI6MjA4ODc2MTk1N30.9JenIs9D8B8hmOGQLrLUN5lBZnDr0e9f1qKIIOXZFp4';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  // Verify cron secret from Authorization header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const errors = [];
  const steps = [];

  try {
    // ---------------------------------------------------------------
    // 1. Load current data from Supabase
    // ---------------------------------------------------------------
    const [configRes, holdingsRes, nwRes, riskRes] = await Promise.all([
      supabase.from('portfolio_config').select('*').order('snapshot_date', { ascending: false }).limit(1),
      supabase.from('holdings').select('*').order('value', { ascending: false }),
      supabase.from('net_worth_history').select('*').order('week_ending', { ascending: true }),
      supabase.from('risk_metrics').select('*').order('snapshot_date', { ascending: false }).limit(1),
    ]);

    const portConfig = configRes.data?.[0] || null;
    const holdings = holdingsRes.data || [];
    const nwHistory = nwRes.data || [];
    const riskMetrics = riskRes.data?.[0] || null;

    // ---------------------------------------------------------------
    // 2. Compute current ENGINE state
    // ---------------------------------------------------------------
    const engineState = {};
    const safeCompute = (key, fn) => {
      try { engineState[key] = fn(); } catch (e) { errors.push(`${key}: ${e.message}`); }
    };

    safeCompute('concentration', () => computeConcentrationState(holdings));
    safeCompute('sleeveExposure', () => computeSleeveExposureState(holdings));
    safeCompute('wrapperExposure', () => computeWrapperExposureState(holdings));
    safeCompute('currencyExposure', () => computeCurrencyExposureState(holdings));
    safeCompute('driftMonitor', () => computeDriftMonitorState(holdings));
    safeCompute('isaPensionRouting', () => computeISAPensionRoutingState(portConfig));
    safeCompute('debtPriority', () => computeDebtPriorityState(portConfig));
    safeCompute('riskBudget', () => computeRiskBudgetState(holdings, riskMetrics, portConfig));
    safeCompute('drawdown', () => computeDrawdownState(nwHistory, portConfig));
    safeCompute('capitalEfficiency', () => computeCapitalEfficiencyState(holdings, portConfig, riskMetrics));
    safeCompute('cryptoRebalance', () => computeCryptoRebalanceState(holdings));
    steps.push('engine_computed');

    // ---------------------------------------------------------------
    // 3. Fetch market data and compute MKTENG state
    // ---------------------------------------------------------------
    let marketData = {};
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const marketRes = await fetch(`${baseUrl}/api/market`);
      if (marketRes.ok) {
        const { results } = await marketRes.json();
        for (const [key, val] of Object.entries(results || {})) {
          marketData[key] = val?.value ?? val?.rawData?.value ?? null;
        }
      }
    } catch (e) {
      errors.push(`market_fetch: ${e.message}`);
    }

    const mktengState = {};
    const safeMarket = (key, fn) => {
      try { mktengState[key] = fn(); } catch (e) { errors.push(`mkt:${key}: ${e.message}`); }
    };

    safeMarket('regime', () => computeRegimeState(marketData));
    safeMarket('crossAssetStress', () => computeCrossAssetStressState(marketData));
    safeMarket('btcCycle', () => computeBTCCycleState(marketData));
    safeMarket('creditStress', () => computeCreditStressState(marketData));
    safeMarket('inflationShock', () => computeInflationShockState(marketData));
    steps.push('market_computed');

    // ---------------------------------------------------------------
    // 4. Compute what changed vs. prior weekly snapshot
    // ---------------------------------------------------------------
    let whatChanged = null;
    let marketChanges = null;
    try {
      const priorSnapshot = await loadPriorSnapshot('weekly');
      if (priorSnapshot?.engine_state) {
        whatChanged = computeWhatChanged(engineState, priorSnapshot.engine_state);
      }
      if (priorSnapshot?.market_state) {
        marketChanges = computeMarketChanges(mktengState, priorSnapshot.market_state);
      }
      steps.push('what_changed_computed');
    } catch (e) {
      errors.push(`whatChanged: ${e.message}`);
    }

    // ---------------------------------------------------------------
    // 5. Generate weekly synthesis
    // ---------------------------------------------------------------
    let synthesis = null;
    try {
      const actionQueue = buildActionQueue(engineState, mktengState);
      synthesis = generateWeeklySynthesis(engineState, mktengState, {
        whatChanged,
        marketChanges,
        actionQueue,
      });
      steps.push('synthesis_generated');
    } catch (e) {
      errors.push(`synthesis: ${e.message}`);
    }

    // ---------------------------------------------------------------
    // 6. Save weekly snapshot
    // ---------------------------------------------------------------
    const summary = {
      holdingsCount: holdings.length,
      totalValue: holdings.reduce((s, h) => s + Number(h.value || 0), 0),
      engineKeys: Object.keys(engineState),
      marketKeys: Object.keys(mktengState),
      synthesis: synthesis ? { headline: synthesis.headline, alertCount: synthesis.alerts?.length } : null,
    };

    const saveResult = await saveEngineSnapshot(
      { ...engineState, synthesis, whatChanged },
      mktengState,
      summary,
      'weekly'
    );
    steps.push('snapshot_saved');

    // ---------------------------------------------------------------
    // 7. Process decision log (validate/invalidate theses)
    // ---------------------------------------------------------------
    let decisionLogResult = null;
    try {
      const decisionLog = await loadDecisionLog();
      if (decisionLog?.length) {
        decisionLogResult = processDecisionLog(decisionLog, engineState, marketData);
        steps.push('decision_log_processed');
      }
    } catch (e) {
      errors.push(`decisionLog: ${e.message}`);
    }

    const elapsed = Date.now() - startTime;

    return Response.json({
      success: true,
      steps,
      errors,
      summary,
      synthesis: synthesis ? {
        headline: synthesis.headline,
        alertCount: synthesis.alerts?.length || 0,
        actionCount: synthesis.actions?.length || 0,
      } : null,
      decisionLog: decisionLogResult ? {
        total: decisionLogResult.total,
        validated: decisionLogResult.validated,
        invalidated: decisionLogResult.invalidated,
      } : null,
      saveResult,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({
      success: false,
      error: e.message,
      errors,
      steps,
      elapsed: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
