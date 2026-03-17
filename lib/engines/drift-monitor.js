// =========================================================================
// LIFESTACK OS — DRIFT MONITOR ENGINE
// Phase 2: Finance Operating System
// Tracks portfolio drift from target allocation and flags rebalance urgency
// =========================================================================

import { computeSleeveWeights } from './sleeve-exposure.js';

/**
 * Default target allocation (% of portfolio)
 */
const DEFAULT_TARGETS = {
  'Equity': 40,
  'Pension': 22,
  'Cash & Equivalents': 16,
  'Crypto': 13,
  'Multi-Asset': 5,
  'Real Assets': 2,
  'Fixed Income': 2,
};

/**
 * Compute drift between actual sleeve weights and target allocation
 */
export function computeDrift(holdings, targets = DEFAULT_TARGETS) {
  const sleeves = computeSleeveWeights(holdings);
  if (!sleeves.length) return [];

  return sleeves.map(s => {
    const target = targets[s.name] || 0;
    const drift = +(s.weight - target).toFixed(2);
    const absDrift = Math.abs(drift);

    return {
      name: s.name,
      actual: s.weight,
      target,
      drift,
      absDrift,
      direction: drift > 0 ? 'OW' : drift < 0 ? 'UW' : '—',
      status: absDrift > 5 ? 'Urgent' : absDrift > 2 ? 'Minor' : 'OK',
    };
  }).sort((a, b) => b.absDrift - a.absDrift);
}

/**
 * Classify overall rebalance urgency
 */
export function classifyRebalanceUrgency(drifts, tolerance = 5, daysSinceRebalance = 0, rebalanceFrequency = 90) {
  if (!drifts?.length) return 'Clean';

  const maxDrift = Math.max(...drifts.map(d => d.absDrift));
  const urgentCount = drifts.filter(d => d.status === 'Urgent').length;
  const scheduledDue = daysSinceRebalance >= rebalanceFrequency;

  if (urgentCount >= 2 || maxDrift > 10) return 'Urgent';
  if (urgentCount >= 1 || maxDrift > 5 || scheduledDue) return 'Action Needed';
  if (maxDrift > 2) return 'Monitor';
  return 'Clean';
}

/**
 * Estimate CGT cost of rebalancing (simplified)
 * Assumes selling overweight positions triggers some CGT
 */
export function estimateTaxCostOfRebalance(drifts, totalPortfolioValue, cgtRate = 0.20, avgGainPct = 0.08) {
  if (!drifts?.length || totalPortfolioValue <= 0) return 0;

  // Only selling overweight sleeves costs CGT
  const sellAmount = drifts
    .filter(d => d.drift > 0)
    .reduce((s, d) => s + (d.drift / 100) * totalPortfolioValue, 0);

  // Estimated gain on sold portion
  const estimatedGain = sellAmount * avgGainPct;
  const cgtCost = estimatedGain * cgtRate;

  return +cgtCost.toFixed(2);
}

/**
 * Generate rebalance trade suggestions
 */
export function generateRebalanceTrades(drifts, totalPortfolioValue) {
  if (!drifts?.length || totalPortfolioValue <= 0) return [];

  const sells = drifts.filter(d => d.drift > 2).map(d => ({
    sleeve: d.name,
    action: 'Sell',
    amount: +((d.drift / 100) * totalPortfolioValue).toFixed(0),
    driftReduction: d.drift,
  }));

  const buys = drifts.filter(d => d.drift < -2).map(d => ({
    sleeve: d.name,
    action: 'Buy',
    amount: +((Math.abs(d.drift) / 100) * totalPortfolioValue).toFixed(0),
    driftReduction: Math.abs(d.drift),
  }));

  return [...sells, ...buys].sort((a, b) => b.driftReduction - a.driftReduction);
}

/**
 * Master function: compute full drift monitor state
 */
export function computeDriftMonitorState(holdings, targets = DEFAULT_TARGETS, daysSinceRebalance = 0) {
  if (!holdings?.length) return null;

  const totalValue = holdings.reduce((s, h) => s + h.val, 0);
  const drifts = computeDrift(holdings, targets);
  const urgency = classifyRebalanceUrgency(drifts, 5, daysSinceRebalance);
  const maxDrift = drifts.length > 0 ? drifts[0].absDrift : 0;
  const taxCost = estimateTaxCostOfRebalance(drifts, totalValue);
  const trades = generateRebalanceTrades(drifts, totalValue);

  return {
    drifts,
    maxDrift,
    urgency,
    estimatedTaxCost: taxCost,
    suggestedTrades: trades,
    daysSinceRebalance,
    overweightSleeves: drifts.filter(d => d.drift > 2).map(d => d.name),
    underweightSleeves: drifts.filter(d => d.drift < -2).map(d => d.name),
    driftScore: +(10 - Math.min(10, maxDrift)).toFixed(1), // 10 = no drift, 0 = max drift
  };
}
