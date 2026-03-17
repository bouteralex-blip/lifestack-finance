// =========================================================================
// LIFESTACK OS — ACTION QUEUE GENERATOR
// Phase 4: Research & Decisioning
// Builds a unified, ranked action queue from all engine outputs
// =========================================================================

/**
 * Build unified action queue from all engine states
 * Merges debt, tax, wrapper, rebalance, and opportunity actions into one ranked list
 */
export function buildActionQueue(engineState, marketState, opportunities) {
  if (!engineState) return { queue: [], summary: null };

  const queue = [];

  // 1. Debt paydown actions (guaranteed alpha)
  if (engineState.debtPriority?.actions?.length > 0) {
    engineState.debtPriority.actions.filter(a => a.apr > 0).forEach(a => {
      queue.push({
        id: `debt-${a.name}`.replace(/\s+/g, '-').toLowerCase(),
        action: `Pay down ${a.name}`,
        category: 'debt',
        ev: a.annualInterest || 0,
        urgency: a.apr > 15 ? 'immediate' : a.apr > 5 ? 'this-month' : 'this-quarter',
        confidence: 10, // guaranteed return
        rationale: `${a.apr}% APR — guaranteed £${Math.round(a.annualInterest || 0).toLocaleString()}/yr alpha`,
        blockers: [],
        status: 'pending',
      });
    });
  }

  // 2. ISA deployment
  if (engineState.isaPensionRouting?.isaHeadroom?.remaining > 0) {
    const days = engineState.isaPensionRouting.daysUntilTaxYearEnd || 365;
    const remaining = engineState.isaPensionRouting.isaHeadroom.remaining;
    queue.push({
      id: 'isa-deployment',
      action: `Fund ISA — £${remaining.toLocaleString()} headroom`,
      category: 'tax',
      ev: remaining * 0.008, // ~80bps annual tax drag avoided
      urgency: days <= 14 ? 'immediate' : days <= 30 ? 'this-week' : days <= 90 ? 'this-month' : 'this-quarter',
      confidence: 9,
      rationale: `${days} days until tax year end. £${remaining.toLocaleString()} unused allowance.`,
      blockers: remaining > 5000 ? ['Ensure cash available for transfer'] : [],
      status: 'pending',
    });
  }

  // 3. Pension / salary sacrifice
  if (engineState.isaPensionRouting?.salarySacrificeValue?.totalSaving > 0) {
    const ss = engineState.isaPensionRouting.salarySacrificeValue;
    queue.push({
      id: 'salary-sacrifice',
      action: 'Arrange salary sacrifice with payroll',
      category: 'tax',
      ev: ss.totalSaving,
      urgency: ss.inTaperZone ? 'immediate' : 'this-quarter',
      confidence: 9,
      rationale: ss.inTaperZone
        ? `In £100-125k taper zone — 60% effective benefit. £${Math.round(ss.totalSaving).toLocaleString()}/yr saved.`
        : `£${Math.round(ss.totalSaving).toLocaleString()}/yr tax saved via employer pension contribution.`,
      blockers: ['Requires payroll department action'],
      status: 'pending',
    });
  }

  // 4. Wrapper reallocation (Bed & ISA)
  if (engineState.wrapperExposure?.reallocationOpportunities?.length > 0) {
    const opps = engineState.wrapperExposure.reallocationOpportunities;
    const benefit = engineState.wrapperExposure.totalAnnualBenefitFromReallocation || 0;
    queue.push({
      id: 'bed-and-isa',
      action: `Bed & ISA ${opps.length} GIA holdings`,
      category: 'wrapper',
      ev: benefit,
      urgency: 'this-quarter',
      confidence: 8,
      rationale: `£${benefit}/yr structural alpha from moving GIA → ISA. ${opps.length} candidates identified.`,
      blockers: ['Check CGT crystallisation impact before executing'],
      status: 'pending',
    });
  }

  // 5. Rebalance execution
  if (engineState.rebalanceProposal?.trades?.length > 0) {
    const trades = engineState.rebalanceProposal.trades;
    const maxDrift = engineState.driftMonitor?.maxDrift || 0;
    queue.push({
      id: 'rebalance',
      action: `Execute rebalance (${trades.length} trades)`,
      category: 'allocation',
      ev: maxDrift * 100, // rough EV proxy
      urgency: engineState.driftMonitor?.urgency === 'Urgent' ? 'this-week' : 'this-month',
      confidence: 7,
      rationale: `Max drift ${maxDrift.toFixed(1)}%. ${trades.length} trades to restore target allocation.`,
      blockers: trades.some(t => t.cgtImpact > 0) ? ['Review CGT impact before selling'] : [],
      status: 'pending',
    });
  }

  // 6. Clutter cleanup
  if (engineState.concentration?.clutter?.count > 5) {
    const clutter = engineState.concentration.clutter;
    queue.push({
      id: 'clutter-cleanup',
      action: `Consolidate ${clutter.count} clutter positions`,
      category: 'structure',
      ev: (clutter.totalValue || 0) * 0.02,
      urgency: 'this-quarter',
      confidence: 6,
      rationale: `${clutter.count} positions each <1% of portfolio. Simplify and reduce noise.`,
      blockers: [],
      status: 'pending',
    });
  }

  // 7. Market-driven actions
  if (marketState) {
    // Defensive positioning in high stress
    if (marketState.stress?.compositeScore > 60) {
      queue.push({
        id: 'stress-review',
        action: 'Review risk exposure — elevated market stress',
        category: 'risk',
        ev: 0,
        urgency: 'this-week',
        confidence: 7,
        rationale: `Cross-asset stress at ${marketState.stress.compositeScore}/100. ${marketState.stress.compositeAction || 'Consider defensive positioning.'}`,
        blockers: [],
        status: 'pending',
      });
    }

    // BTC accumulation opportunity
    if (marketState.btcCycle?.bias >= 2 && marketState.btcCycle?.phase) {
      queue.push({
        id: 'btc-accumulation',
        action: `BTC accumulation — ${marketState.btcCycle.phase} phase`,
        category: 'opportunity',
        ev: 0,
        urgency: 'this-month',
        confidence: marketState.btcCycle.confidence || 5,
        rationale: `BTC in ${marketState.btcCycle.phase} with accumulation bias of ${marketState.btcCycle.bias}/5.`,
        blockers: [],
        status: 'pending',
      });
    }
  }

  // 8. Top portfolio opportunities
  if (opportunities?.length > 0) {
    opportunities.slice(0, 3).forEach((o, i) => {
      queue.push({
        id: `opp-${i}-${(o.t || '').replace(/\s+/g, '-').toLowerCase().slice(0, 20)}`,
        action: o.t || 'Unnamed opportunity',
        category: 'opportunity',
        ev: o.val || 0,
        urgency: o.tm >= 8 ? 'this-week' : o.tm >= 5 ? 'this-month' : 'this-quarter',
        confidence: o.c || 5,
        rationale: o.alpha || '',
        blockers: [],
        status: 'pending',
      });
    });
  }

  // Sort by: urgency tier then EV
  const urgencyOrder = { immediate: 0, 'this-week': 1, 'this-month': 2, 'this-quarter': 3 };
  queue.sort((a, b) => {
    const urgDiff = (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4);
    if (urgDiff !== 0) return urgDiff;
    return b.ev - a.ev;
  });

  // Assign rank
  queue.forEach((item, i) => { item.rank = i + 1; });

  const totalEV = queue.reduce((s, q) => s + q.ev, 0);
  const immediate = queue.filter(q => q.urgency === 'immediate');

  return {
    queue,
    summary: {
      totalActions: queue.length,
      immediateActions: immediate.length,
      totalAnnualEV: Math.round(totalEV),
      topAction: queue[0]?.action || 'None',
      categories: [...new Set(queue.map(q => q.category))],
    },
  };
}
