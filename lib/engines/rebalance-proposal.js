// =========================================================================
// LIFESTACK OS — REBALANCE PROPOSAL ENGINE
// Phase 2: Finance Operating System
// Generates tax-aware rebalance proposals with execution priority ranking
// =========================================================================

import { computeDrift } from './drift-monitor.js';

/**
 * Generate specific trade proposals to reduce drift
 * Tax-aware: prioritizes ISA/SIPP trades (no CGT), defers GIA trades
 */
export function generateRebalanceTrades(holdings, targets, wrapperState) {
  if (!holdings?.length) return [];

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const drifts = computeDrift(holdings, targets);
  const trades = [];

  // Find overweight and underweight sleeves
  const overweight = drifts.filter(d => d.drift > 2);
  const underweight = drifts.filter(d => d.drift < -2);

  overweight.forEach(ow => {
    const sellAmount = +((ow.drift / 100) * total).toFixed(0);

    underweight.forEach(uw => {
      const buyAmount = +((Math.abs(uw.drift) / 100) * total).toFixed(0);
      const tradeAmount = Math.min(sellAmount, buyAmount);

      if (tradeAmount > 500) {
        trades.push({
          sellSleeve: ow.name,
          buySleeve: uw.name,
          amount: tradeAmount,
          driftReduction: +((tradeAmount / total) * 100).toFixed(2),
          taxEfficiency: estimateTradeEfficiency(ow.name, wrapperState),
          urgency: ow.absDrift > 5 || uw.absDrift > 5 ? 'High' : 'Medium',
        });
      }
    });
  });

  return trades.sort((a, b) => {
    // Sort by tax efficiency first, then urgency
    if (a.taxEfficiency !== b.taxEfficiency) return b.taxEfficiency - a.taxEfficiency;
    return a.urgency === 'High' ? -1 : 1;
  });
}

/**
 * Estimate tax efficiency of a trade (0-10)
 * ISA/SIPP trades = 10 (no tax), GIA trades = lower
 */
function estimateTradeEfficiency(sleeve, wrapperState) {
  if (!wrapperState) return 5;
  // Simplified: if most of the portfolio is in wrappers, trades are likely efficient
  const giaExposure = wrapperState.efficiency?.giaExposurePct || 50;
  return +(10 - (giaExposure / 10)).toFixed(1);
}

/**
 * Calculate CGT impact for each proposed trade
 */
export function calculateCGTPerTrade(tradeAmount, avgGainPct = 0.08, cgtRate = 0.20, inWrapper = false) {
  if (inWrapper) return 0;
  const estimatedGain = tradeAmount * avgGainPct;
  return +(estimatedGain * cgtRate).toFixed(2);
}

/**
 * Rank trades by efficiency — tax-efficient trades first
 */
export function rankTradesByEfficiency(trades, cgtAllowanceRemaining = 3000) {
  if (!trades?.length) return [];

  let cgtBudget = cgtAllowanceRemaining;

  return trades.map(t => {
    const cgtCost = calculateCGTPerTrade(t.amount, 0.08, 0.20, t.taxEfficiency >= 8);
    const withinAllowance = cgtCost <= cgtBudget;
    if (withinAllowance) cgtBudget -= cgtCost;

    return {
      ...t,
      estimatedCGT: cgtCost,
      withinCGTAllowance: withinAllowance,
      netCost: withinAllowance ? 0 : cgtCost,
      executionPriority: t.urgency === 'High' && cgtCost === 0 ? 1
        : t.urgency === 'High' ? 2
        : cgtCost === 0 ? 3
        : 4,
    };
  }).sort((a, b) => a.executionPriority - b.executionPriority);
}

/**
 * Produce approval memo — summary for review before execution
 */
export function produceApprovalPack(trades, totalValue, drifts) {
  if (!trades?.length) return null;

  const totalTradeValue = trades.reduce((s, t) => s + t.amount, 0);
  const totalCGT = trades.reduce((s, t) => s + (t.estimatedCGT || 0), 0);
  const totalDriftReduction = trades.reduce((s, t) => s + t.driftReduction, 0);
  const maxDriftBefore = drifts?.length > 0 ? Math.max(...drifts.map(d => d.absDrift)) : 0;
  const maxDriftAfter = Math.max(0, maxDriftBefore - totalDriftReduction);

  return {
    tradeCount: trades.length,
    totalTradeValue,
    totalEstimatedCGT: +totalCGT.toFixed(2),
    driftReduction: +totalDriftReduction.toFixed(2),
    maxDriftBefore: +maxDriftBefore.toFixed(2),
    maxDriftAfter: +maxDriftAfter.toFixed(2),
    turnover: totalValue > 0 ? +((totalTradeValue / totalValue) * 100).toFixed(2) : 0,
    approvalRequired: totalCGT > 100 || totalTradeValue > totalValue * 0.1,
    executionWindow: maxDriftBefore > 10 ? 'This week' : maxDriftBefore > 5 ? 'By month-end' : 'Next rebalance cycle',
  };
}

/**
 * Master function: compute full rebalance proposal state
 */
export function computeRebalanceProposalState(holdings, targets, wrapperState, cgtAllowanceRemaining = 3000) {
  if (!holdings?.length) return null;

  const total = holdings.reduce((s, h) => s + h.val, 0);
  const drifts = computeDrift(holdings, targets);
  const maxDrift = drifts.length > 0 ? drifts[0].absDrift : 0;

  // Only generate proposals if drift warrants action
  if (maxDrift < 2) {
    return {
      status: 'No Action Needed',
      maxDrift,
      trades: [],
      approvalPack: null,
      nextReview: 'Next scheduled rebalance',
    };
  }

  const rawTrades = generateRebalanceTrades(holdings, targets, wrapperState);
  const rankedTrades = rankTradesByEfficiency(rawTrades, cgtAllowanceRemaining);
  const approvalPack = produceApprovalPack(rankedTrades, total, drifts);

  return {
    status: maxDrift > 5 ? 'Action Recommended' : 'Monitor',
    maxDrift,
    trades: rankedTrades,
    approvalPack,
    nextReview: approvalPack?.executionWindow || 'Next rebalance cycle',
    drifts,
  };
}
