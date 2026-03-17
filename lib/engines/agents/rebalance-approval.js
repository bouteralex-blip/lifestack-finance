// =========================================================================
// LIFESTACK OS — REBALANCE APPROVAL PACK
// Phase 4: Research & Decisioning
// Full approval pack for rebalancing decision with CGT impact analysis
// =========================================================================

/**
 * Generate a full rebalance approval pack
 * Includes drift summary, proposed trades, CGT impact, and approval status
 */
export function generateRebalanceApproval(engineState, holdings) {
  if (!engineState) return null;

  // 1. Drift summary
  const driftSummary = buildDriftSummary(engineState);

  // 2. Proposed trades with CGT impact
  const trades = buildTradeList(engineState, holdings);

  // 3. Total CGT cost
  const totalCGT = trades.reduce((sum, t) => sum + (t.cgtCost || 0), 0);

  // 4. Net benefit
  const netBenefit = computeNetBenefit(engineState, totalCGT);

  // 5. Risk reduction
  const riskReduction = computeRiskReduction(engineState);

  // 6. Approval status
  const approvalStatus = computeApprovalStatus(driftSummary, netBenefit, trades);

  // 7. Full pack summary
  const pack = buildApprovalPack(driftSummary, trades, totalCGT, netBenefit, riskReduction, approvalStatus);

  return {
    driftSummary,
    trades,
    totalCGT: +totalCGT.toFixed(2),
    netBenefit,
    riskReduction,
    approvalStatus,
    pack,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build drift summary from engine state
 */
function buildDriftSummary(eng) {
  const drift = eng.driftMonitor;
  if (!drift) return { available: false, message: 'No drift data available' };

  return {
    available: true,
    maxDrift: drift.maxDrift || 0,
    driftScore: drift.driftScore || 0,
    urgency: drift.urgency || 'Unknown',
    overweightSleeves: (drift.overweightSleeves || []).map(s => ({
      sleeve: s.sleeve || s,
      drift: s.drift || 0,
    })),
    underweightSleeves: (drift.underweightSleeves || []).map(s => ({
      sleeve: s.sleeve || s,
      drift: s.drift || 0,
    })),
    totalSleeves: (drift.overweightSleeves?.length || 0) + (drift.underweightSleeves?.length || 0),
  };
}

/**
 * Build trade list with CGT estimates
 */
function buildTradeList(eng, holdings) {
  if (!eng.rebalanceProposal?.trades?.length) return [];

  return eng.rebalanceProposal.trades.map(trade => {
    const ticker = trade.ticker || trade.sleeve || 'Unknown';
    const action = trade.action || (trade.amount > 0 ? 'Buy' : 'Sell');
    const amount = Math.abs(trade.amount || 0);

    // Estimate CGT for sells
    let cgtCost = 0;
    if (action === 'Sell' || action === 'Trim') {
      const holding = findHolding(ticker, holdings);
      cgtCost = estimateCGT(amount, holding);
    }

    return {
      ticker,
      action,
      amount: +amount.toFixed(2),
      rationale: trade.rationale || `${action} to reduce drift`,
      cgtCost: +cgtCost.toFixed(2),
      wrapper: trade.wrapper || findWrapper(ticker, holdings),
      isaTaxFree: (trade.wrapper || findWrapper(ticker, holdings)) === 'ISA',
    };
  });
}

/**
 * Find holding data for a ticker
 */
function findHolding(ticker, holdings) {
  if (!holdings?.length) return null;
  return holdings.find(h =>
    (h.ticker || h.symbol || h.name || '').toLowerCase() === ticker.toLowerCase()
  );
}

/**
 * Find wrapper for a ticker
 */
function findWrapper(ticker, holdings) {
  const holding = findHolding(ticker, holdings);
  return holding?.wrapper || holding?.account || 'Unknown';
}

/**
 * Estimate CGT on a sale
 * Simplified: assumes 20% CGT rate on estimated gain
 */
function estimateCGT(saleAmount, holding) {
  if (!holding) return 0;

  const wrapper = (holding.wrapper || holding.account || '').toUpperCase();
  // No CGT in ISA or Pension
  if (wrapper === 'ISA' || wrapper === 'SIPP' || wrapper === 'PENSION') return 0;

  // Estimate gain as percentage of value
  const gainPct = holding.gainPct || holding.unrealisedGainPct || 0;
  if (gainPct <= 0) return 0;

  const estimatedGain = saleAmount * (gainPct / 100);
  // 20% CGT rate (simplified — actual rate depends on income)
  return Math.max(0, estimatedGain * 0.2);
}

/**
 * Compute net benefit of rebalancing after CGT costs
 */
function computeNetBenefit(eng, totalCGT) {
  const drift = eng.driftMonitor?.maxDrift || 0;
  // Estimated benefit: drift reduction * portfolio value * expected improvement
  const portfolioValue = eng.concentration?.totalValue || 100000;
  const driftBenefit = drift * portfolioValue * 0.001; // 0.1% per unit drift

  const gross = +driftBenefit.toFixed(2);
  const net = +(gross - totalCGT).toFixed(2);

  return {
    grossBenefit: gross,
    cgtCost: +totalCGT.toFixed(2),
    netBenefit: net,
    isPositive: net > 0,
    note: net > 0
      ? `Net positive after CGT — rebalance adds £${net.toLocaleString()} expected value.`
      : `CGT cost (£${totalCGT.toFixed(0)}) exceeds drift benefit (£${gross.toFixed(0)}). Consider ISA-only rebalance.`,
  };
}

/**
 * Compute risk reduction from rebalancing
 */
function computeRiskReduction(eng) {
  const drift = eng.driftMonitor?.maxDrift || 0;
  const hhi = eng.concentration?.hhi || 0;

  return {
    driftReduction: `${drift.toFixed(1)}% -> target 0%`,
    concentrationImpact: hhi > 2000 ? 'Rebalance will reduce concentration risk' : 'Concentration within acceptable range',
    riskScoreImprovement: drift > 5 ? 'Significant' : drift > 3 ? 'Moderate' : 'Marginal',
    note: `Rebalance reduces max drift from ${drift.toFixed(1)}% to near 0%. ${hhi > 2500 ? 'Also addresses dangerous concentration.' : ''}`,
  };
}

/**
 * Determine approval status
 */
function computeApprovalStatus(driftSummary, netBenefit, trades) {
  if (!driftSummary.available || trades.length === 0) return 'not_needed';

  const maxDrift = driftSummary.maxDrift || 0;
  const urgency = driftSummary.urgency || '';

  if (maxDrift > 5 && netBenefit.isPositive) return 'recommended';
  if (urgency === 'Urgent' || urgency === 'Action Needed') return 'recommended';
  if (maxDrift > 3 && netBenefit.isPositive) return 'optional';
  if (maxDrift > 3 && !netBenefit.isPositive) return 'optional';
  return 'not_needed';
}

/**
 * Build full approval pack narrative
 */
function buildApprovalPack(drift, trades, cgt, benefit, risk, status) {
  const lines = [];

  lines.push(`REBALANCE APPROVAL PACK — Status: ${status.toUpperCase()}`);
  lines.push('');

  if (drift.available) {
    lines.push(`Drift: Max ${drift.maxDrift.toFixed(1)}% (${drift.urgency}). ${drift.totalSleeves} sleeves affected.`);
  }

  lines.push(`Trades: ${trades.length} proposed. ${trades.filter(t => t.action === 'Buy').length} buys, ${trades.filter(t => t.action === 'Sell' || t.action === 'Trim').length} sells.`);
  lines.push(`CGT Impact: £${cgt.toFixed(0)} estimated tax cost.`);
  lines.push(`Net Benefit: ${benefit.note}`);
  lines.push(`Risk: ${risk.note}`);
  lines.push('');

  if (status === 'recommended') {
    lines.push('RECOMMENDATION: Execute rebalance. Net positive after CGT with meaningful risk reduction.');
  } else if (status === 'optional') {
    lines.push('RECOMMENDATION: Optional. Drift is moderate. Execute at next scheduled checkpoint or if conditions worsen.');
  } else {
    lines.push('RECOMMENDATION: No rebalance needed. Portfolio within target bands.');
  }

  return lines.join('\n');
}
