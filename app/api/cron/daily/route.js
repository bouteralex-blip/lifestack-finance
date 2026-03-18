// =========================================================================
// LIFESTACK OS — Daily Cron Route
// Vercel-compatible cron endpoint: runs all engine computations daily
// Schedule: 0 7 * * * (7 AM UTC)
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
  computeMonteCarloState,
  computeLiquidityLadderState,
  computeCapitalEfficiencyState,
  computeCryptoRebalanceState,
} from '../../../../lib/engines/index.js';
import {
  computeRegimeState,
  computeCrossAssetStressState,
  computeBTCCycleState,
  computeYieldCurveState,
  computeCreditStressState,
  computeCryptoOnChainState,
  computeCryptoSentimentState,
  computeInflationShockState,
  computeCommodityShockState,
  computeFXRegimeState,
  computeCorrelationDriftState,
  computeGapRiskState,
} from '../../../../lib/engines/market/index.js';
import {
  buildActionQueue,
  generateTriggerAlerts,
  computeWhatChanged,
  computeMarketChanges,
} from '../../../../lib/engines/agents/index.js';
import { saveEngineSnapshot, loadPriorSnapshot } from '../../../../lib/persistence.js';

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
  const computed = [];

  try {
    // ---------------------------------------------------------------
    // 1. Load current data from Supabase
    // ---------------------------------------------------------------
    const [configRes, holdingsRes, nwRes, riskRes, cryptoRes] = await Promise.all([
      supabase.from('portfolio_config').select('*').order('snapshot_date', { ascending: false }).limit(1),
      supabase.from('holdings').select('*').order('value', { ascending: false }),
      supabase.from('net_worth_history').select('*').order('week_ending', { ascending: true }),
      supabase.from('risk_metrics').select('*').order('snapshot_date', { ascending: false }).limit(1),
      supabase.from('crypto_metrics').select('*').order('snapshot_date', { ascending: false }).limit(1),
    ]);

    const portConfig = configRes.data?.[0] || null;
    const holdings = holdingsRes.data || [];
    const nwHistory = nwRes.data || [];
    const riskMetrics = riskRes.data?.[0] || null;

    // ---------------------------------------------------------------
    // 2. Compute ENGINE state from portfolio data
    // ---------------------------------------------------------------
    const engineState = {};

    const safeCompute = (key, fn) => {
      try {
        engineState[key] = fn();
        computed.push(key);
      } catch (e) {
        errors.push(`${key}: ${e.message}`);
      }
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
    safeCompute('monteCarlo', () => computeMonteCarloState(portConfig, riskMetrics));
    safeCompute('liquidityLadder', () => computeLiquidityLadderState(holdings, portConfig));
    safeCompute('capitalEfficiency', () => computeCapitalEfficiencyState(holdings, portConfig, riskMetrics));
    safeCompute('cryptoRebalance', () => computeCryptoRebalanceState(holdings));

    // ---------------------------------------------------------------
    // 3. Fetch market data and compute MKTENG state
    // ---------------------------------------------------------------
    let marketData = {};
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const marketRes = await fetch(`${baseUrl}/api/market?refresh=true`);
      if (marketRes.ok) {
        const { results } = await marketRes.json();
        // Flatten market results into a simple key-value map
        for (const [key, val] of Object.entries(results || {})) {
          marketData[key] = val?.value ?? val?.rawData?.value ?? null;
        }
      }
    } catch (e) {
      errors.push(`market_fetch: ${e.message}`);
    }

    const mktengState = {};

    const safeMarketCompute = (key, fn) => {
      try {
        mktengState[key] = fn();
        computed.push(`mkt:${key}`);
      } catch (e) {
        errors.push(`mkt:${key}: ${e.message}`);
      }
    };

    safeMarketCompute('regime', () => computeRegimeState(marketData));
    safeMarketCompute('crossAssetStress', () => computeCrossAssetStressState(marketData));
    safeMarketCompute('btcCycle', () => computeBTCCycleState(marketData));
    safeMarketCompute('yieldCurve', () => computeYieldCurveState(marketData));
    safeMarketCompute('creditStress', () => computeCreditStressState(marketData));
    safeMarketCompute('cryptoOnChain', () => computeCryptoOnChainState(marketData));
    safeMarketCompute('cryptoSentiment', () => computeCryptoSentimentState(marketData));
    safeMarketCompute('inflationShock', () => computeInflationShockState(marketData));
    safeMarketCompute('commodityShock', () => computeCommodityShockState(marketData));
    safeMarketCompute('fxRegime', () => computeFXRegimeState(marketData));
    safeMarketCompute('correlationDrift', () => computeCorrelationDriftState(marketData));
    safeMarketCompute('gapRisk', () => computeGapRiskState(marketData));

    // ---------------------------------------------------------------
    // 4. Compute AGENT state from ENGINE + MKTENG
    // ---------------------------------------------------------------
    const agentState = {};

    try {
      const priorSnapshot = await loadPriorSnapshot('daily');
      if (priorSnapshot?.engine_state) {
        agentState.whatChanged = computeWhatChanged(engineState, priorSnapshot.engine_state);
      }
      if (priorSnapshot?.market_state) {
        agentState.marketChanges = computeMarketChanges(mktengState, priorSnapshot.market_state);
      }
    } catch (e) {
      errors.push(`whatChanged: ${e.message}`);
    }

    try {
      agentState.actionQueue = buildActionQueue(engineState, mktengState);
      computed.push('agent:actionQueue');
    } catch (e) {
      errors.push(`actionQueue: ${e.message}`);
    }

    try {
      agentState.triggerAlerts = generateTriggerAlerts(engineState, mktengState);
      computed.push('agent:triggerAlerts');
    } catch (e) {
      errors.push(`triggerAlerts: ${e.message}`);
    }

    // ---------------------------------------------------------------
    // 5. Save snapshot via persistence layer
    // ---------------------------------------------------------------
    const summary = {
      holdingsCount: holdings.length,
      totalValue: holdings.reduce((s, h) => s + Number(h.value || 0), 0),
      engineKeys: Object.keys(engineState),
      marketKeys: Object.keys(mktengState),
      agentKeys: Object.keys(agentState),
    };

    const saveResult = await saveEngineSnapshot(
      { ...engineState, agent: agentState },
      mktengState,
      summary,
      'daily'
    );

    const elapsed = Date.now() - startTime;

    return Response.json({
      success: true,
      computed,
      errors,
      summary,
      saveResult,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({
      success: false,
      error: e.message,
      errors,
      computed,
      elapsed: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
