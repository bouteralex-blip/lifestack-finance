// =========================================================================
// LIFESTACK OS — ORCHESTRATOR
// Central scheduler that runs all engines and agents in dependency order.
// Pure ES module — no React dependencies.
// =========================================================================

import {
  computeConcentrationState,
  computeDebtPriorityState,
  computeSleeveExposureState,
  computeWrapperExposureState,
  computeCurrencyExposureState,
  computeDriftMonitorState,
  computeISAPensionRoutingState,
  computeRebalanceProposalState,
  computeCryptoRebalanceState,
  computeCryptoScenarioLab,
  computeRiskBudgetState,
  computeContributionState,
  computeDrawdownState,
  computeScenarioSensitivity,
  computeMonteCarloState,
  computeLiquidityLadderState,
  computeBonusAllocationState,
  computeCapitalEfficiencyState,
} from '../engines/index.js';

import {
  computeRegimeState,
  computeCrossAssetStressState,
  computeBTCCycleState,
  computeYieldCurveState,
  computeCreditStressState,
  computeSectorLeadershipState,
  computeETFFlowState,
  computeCryptoOnChainState,
  computeBTCDominanceState,
  computeCryptoETFFlowState,
  computeCryptoFundingState,
  computeStablecoinLiquidityState,
  computeCryptoSentimentState,
  computeOnChainStressBoard,
  computeCentralBankState,
  computeInflationShockState,
  computeLiquidityDivergenceState,
  computeNarrativePulseState,
  computePolicySurpriseState,
  computeFactorRotationState,
  computeEarningsRevisionState,
  computeCFTCPositioningState,
  computeCorrelationDriftState,
  computeGapRiskState,
  computeCommodityShockState,
  computeFXRegimeState,
} from '../engines/market/index.js';

import {
  generateWeeklySynthesis,
  rankOpportunities,
  computeWhatChanged,
  computeMarketChanges,
  buildActionQueue,
  generateTriggerAlerts,
  generateMorningCommand,
  computeAltcoinRiskCap,
  generatePerformanceBridge,
  computeThesisMonitorState,
  generateDailyBrief,
  generateThemeMemo,
  computeOpportunityRadar,
  computeWatchlistState,
  generateMonthlyReview,
  generateMonthlyLetter,
  computeCalendarDeployment,
  computeDeadlines,
  generateRebalanceApproval,
  computeFreshnessAudit,
  computeTilePriority,
  generateInsightCallouts,
  computeWhatMattersNow,
} from '../engines/agents/index.js';

// =========================================================================
// SAFE COMPUTE — wraps an engine call so a single failure never halts the run
// =========================================================================

function safeCompute(name, fn, ...args) {
  try {
    const result = fn(...args);
    return result;
  } catch (e) {
    console.error(`Orchestrator [${name}]:`, e.message);
    return { error: e.message, engine: name };
  }
}

// =========================================================================
// STAGE 1 — PORTFOLIO ENGINES (deterministic, from raw holdings + config)
// =========================================================================

function computeAllEngines(rawData) {
  const { holdings, portConfig, risk, bonus, crypto, nwWeekly, bridgeItems, stress, factors, opps, monthly, scorecard } = rawData;

  return {
    concentration:       safeCompute('concentration', computeConcentrationState, holdings),
    debtPriority:        safeCompute('debtPriority', computeDebtPriorityState, portConfig),
    sleeveExposure:      safeCompute('sleeveExposure', computeSleeveExposureState, holdings),
    wrapperExposure:     safeCompute('wrapperExposure', computeWrapperExposureState, holdings),
    currencyExposure:    safeCompute('currencyExposure', computeCurrencyExposureState, holdings),
    driftMonitor:        safeCompute('driftMonitor', computeDriftMonitorState, holdings, portConfig),
    isaPensionRouting:   safeCompute('isaPensionRouting', computeISAPensionRoutingState, portConfig, holdings),
    rebalanceProposal:   safeCompute('rebalanceProposal', computeRebalanceProposalState, holdings, portConfig),
    cryptoRebalance:     safeCompute('cryptoRebalance', computeCryptoRebalanceState, holdings, crypto),
    cryptoScenarioLab:   safeCompute('cryptoScenarioLab', computeCryptoScenarioLab, holdings, crypto),
    riskBudget:          safeCompute('riskBudget', computeRiskBudgetState, holdings, risk),
    contribution:        safeCompute('contribution', computeContributionState, holdings, portConfig),
    drawdown:            safeCompute('drawdown', computeDrawdownState, portConfig, nwWeekly),
    scenarioSensitivity: safeCompute('scenarioSensitivity', computeScenarioSensitivity, holdings, stress),
    monteCarlo:          safeCompute('monteCarlo', computeMonteCarloState, portConfig, risk),
    liquidityLadder:     safeCompute('liquidityLadder', computeLiquidityLadderState, holdings),
    bonusAllocation:     safeCompute('bonusAllocation', computeBonusAllocationState, portConfig, bonus),
    capitalEfficiency:   safeCompute('capitalEfficiency', computeCapitalEfficiencyState, portConfig, holdings, risk),
  };
}

// =========================================================================
// STAGE 2 — MARKET ENGINES (from market data feeds)
// =========================================================================

function computeAllMarketEngines(rawData) {
  const md = rawData.marketData || {};

  return {
    regime:              safeCompute('regime', computeRegimeState, md),
    crossAssetStress:    safeCompute('crossAssetStress', computeCrossAssetStressState, md),
    btcCycle:            safeCompute('btcCycle', computeBTCCycleState, md),
    yieldCurve:          safeCompute('yieldCurve', computeYieldCurveState, md),
    creditStress:        safeCompute('creditStress', computeCreditStressState, md),
    sectorLeadership:    safeCompute('sectorLeadership', computeSectorLeadershipState, md),
    etfFlows:            safeCompute('etfFlows', computeETFFlowState, md),
    cryptoOnChain:       safeCompute('cryptoOnChain', computeCryptoOnChainState, md),
    btcDominance:        safeCompute('btcDominance', computeBTCDominanceState, md),
    cryptoETFFlows:      safeCompute('cryptoETFFlows', computeCryptoETFFlowState, md),
    cryptoFunding:       safeCompute('cryptoFunding', computeCryptoFundingState, md),
    stablecoinLiquidity: safeCompute('stablecoinLiquidity', computeStablecoinLiquidityState, md),
    cryptoSentiment:     safeCompute('cryptoSentiment', computeCryptoSentimentState, md),
    onChainStress:       safeCompute('onChainStress', computeOnChainStressBoard, md),
    centralBank:         safeCompute('centralBank', computeCentralBankState, md),
    inflationShock:      safeCompute('inflationShock', computeInflationShockState, md),
    liquidityDivergence: safeCompute('liquidityDivergence', computeLiquidityDivergenceState, md),
    narrativePulse:      safeCompute('narrativePulse', computeNarrativePulseState, md),
    policySurprise:      safeCompute('policySurprise', computePolicySurpriseState, md),
    factorRotation:      safeCompute('factorRotation', computeFactorRotationState, md),
    earningsRevision:    safeCompute('earningsRevision', computeEarningsRevisionState, md),
    cftcPositioning:     safeCompute('cftcPositioning', computeCFTCPositioningState, md),
    correlationDrift:    safeCompute('correlationDrift', computeCorrelationDriftState, md),
    gapRisk:             safeCompute('gapRisk', computeGapRiskState, md),
    commodityShock:      safeCompute('commodityShock', computeCommodityShockState, md),
    fxRegime:            safeCompute('fxRegime', computeFXRegimeState, md),
  };
}

// =========================================================================
// STAGE 3 — AGENT ENGINES (from ENGINE + MKTENG combined state)
// =========================================================================

function computeAllAgents(ENGINE, MKTENG, rawData) {
  const combined = { ENGINE, MKTENG, rawData };

  return {
    whatChanged:         safeCompute('whatChanged', computeWhatChanged, ENGINE, rawData.priorSnapshot),
    marketChanges:       safeCompute('marketChanges', computeMarketChanges, MKTENG, rawData.priorMarketSnapshot),
    actionQueue:         safeCompute('actionQueue', buildActionQueue, ENGINE, MKTENG, rawData),
    triggerAlerts:       safeCompute('triggerAlerts', generateTriggerAlerts, ENGINE, MKTENG),
    morningCommand:      safeCompute('morningCommand', generateMorningCommand, ENGINE, MKTENG, rawData),
    dailyBrief:          safeCompute('dailyBrief', generateDailyBrief, ENGINE, MKTENG, rawData),
    opportunityRanker:   safeCompute('opportunityRanker', rankOpportunities, rawData.opps, ENGINE, MKTENG),
    altcoinRiskCap:      safeCompute('altcoinRiskCap', computeAltcoinRiskCap, ENGINE, MKTENG),
    performanceBridge:   safeCompute('performanceBridge', generatePerformanceBridge, ENGINE, rawData),
    thesisMonitor:       safeCompute('thesisMonitor', computeThesisMonitorState, rawData.decisionLog, ENGINE, MKTENG),
    opportunityRadar:    safeCompute('opportunityRadar', computeOpportunityRadar, rawData.opps, ENGINE, MKTENG),
    watchlist:           safeCompute('watchlist', computeWatchlistState, rawData.watchlist, MKTENG),
    calendarDeployment:  safeCompute('calendarDeployment', computeCalendarDeployment, ENGINE, rawData),
    deadlines:           safeCompute('deadlines', computeDeadlines, ENGINE, rawData),
    rebalanceApproval:   safeCompute('rebalanceApproval', generateRebalanceApproval, ENGINE, MKTENG),
    freshnessAudit:      safeCompute('freshnessAudit', computeFreshnessAudit, rawData),
    tilePriority:        safeCompute('tilePriority', computeTilePriority, ENGINE, MKTENG),
    insightCallouts:     safeCompute('insightCallouts', generateInsightCallouts, ENGINE, MKTENG, rawData),
    whatMattersNow:      safeCompute('whatMattersNow', computeWhatMattersNow, ENGINE, MKTENG, rawData),
  };
}

// =========================================================================
// DAILY ORCHESTRATION — full 3-stage pipeline
// =========================================================================

export function runDailyOrchestration(rawData) {
  const start = performance.now();

  // Stage 1: Portfolio engines
  const ENGINE = computeAllEngines(rawData);

  // Stage 2: Market engines
  const MKTENG = computeAllMarketEngines(rawData);

  // Stage 3: Agent engines (depend on ENGINE + MKTENG)
  const AGENT = computeAllAgents(ENGINE, MKTENG, rawData);

  const duration = Math.round(performance.now() - start);
  const computedAt = new Date().toISOString();

  return { ENGINE, MKTENG, AGENT, computedAt, duration };
}

// =========================================================================
// WEEKLY ORCHESTRATION — daily + synthesis / review / CIO memo
// =========================================================================

export function runWeeklyOrchestration(rawData) {
  const dailyResult = runDailyOrchestration(rawData);

  const synthesis = safeCompute('weeklySynthesis', generateWeeklySynthesis, dailyResult.ENGINE, dailyResult.MKTENG, rawData);
  const review    = safeCompute('monthlyReview', generateMonthlyReview, dailyResult.ENGINE, dailyResult.MKTENG, rawData);
  const memo      = safeCompute('monthlyLetter', generateMonthlyLetter, dailyResult.ENGINE, dailyResult.MKTENG, rawData);

  return {
    ...dailyResult,
    weekly: { synthesis, review, memo },
  };
}

// =========================================================================
// EVENT ORCHESTRATION — targeted re-computation for a specific event
// =========================================================================

const EVENT_AGENT_MAP = {
  market_move: [
    'regime', 'crossAssetStress', 'btcCycle', 'creditStress',
    'triggerAlerts', 'whatMattersNow', 'dailyBrief',
  ],
  holding_change: [
    'concentration', 'sleeveExposure', 'wrapperExposure', 'currencyExposure',
    'driftMonitor', 'rebalanceProposal', 'riskBudget', 'whatChanged',
    'actionQueue', 'rebalanceApproval',
  ],
  deadline_approaching: [
    'isaPensionRouting', 'calendarDeployment', 'deadlines',
    'actionQueue', 'triggerAlerts',
  ],
  threshold_breach: [
    'driftMonitor', 'drawdown', 'concentration',
    'triggerAlerts', 'actionQueue', 'whatMattersNow',
  ],
};

export function runEventOrchestration(event, rawData) {
  const start = performance.now();
  const eventType = typeof event === 'string' ? event : event?.type;
  const affectedAgents = EVENT_AGENT_MAP[eventType] || [];

  if (affectedAgents.length === 0) {
    console.warn(`Orchestrator: Unknown event type "${eventType}", running full daily orchestration`);
    return { event: eventType, affectedAgents: ['*'], results: runDailyOrchestration(rawData) };
  }

  // Run the full pipeline — the cost is low and guarantees consistency —
  // but tag which agents were the reason for the run.
  const results = runDailyOrchestration(rawData);
  const duration = Math.round(performance.now() - start);

  return {
    event: eventType,
    affectedAgents,
    results,
    duration,
  };
}
