// =========================================================================
// LIFESTACK OS — OPPORTUNITY RADAR
// Phase 4: Research & Decisioning
// Scans all engines for actionable opportunities ranked by conviction,
// timing, and expected value
// =========================================================================

/**
 * Compute the opportunity radar — scan all engine states for actionable items
 * Sources: debt paydown, ISA deployment, rebalance trades, market dislocations,
 * concentration fixes
 */
export function computeOpportunityRadar(engineState, marketState, holdings) {
  if (!engineState) return null;

  const opportunities = [];
  let idCounter = 1;

  // 1. Debt paydown opportunities
  const debtOpps = scanDebtOpportunities(engineState, idCounter);
  opportunities.push(...debtOpps);
  idCounter += debtOpps.length;

  // 2. ISA deployment opportunities
  const isaOpps = scanISAOpportunities(engineState, idCounter);
  opportunities.push(...isaOpps);
  idCounter += isaOpps.length;

  // 3. Rebalance trade opportunities
  const rebalanceOpps = scanRebalanceOpportunities(engineState, idCounter);
  opportunities.push(...rebalanceOpps);
  idCounter += rebalanceOpps.length;

  // 4. Market dislocation opportunities
  const marketOpps = scanMarketOpportunities(marketState, idCounter);
  opportunities.push(...marketOpps);
  idCounter += marketOpps.length;

  // 5. Concentration fix opportunities
  const concOpps = scanConcentrationOpportunities(engineState, holdings, idCounter);
  opportunities.push(...concOpps);
  idCounter += concOpps.length;

  // 6. Wrapper optimisation opportunities
  const wrapperOpps = scanWrapperOpportunities(engineState, idCounter);
  opportunities.push(...wrapperOpps);

  // Sort by composite score (conviction * timing * value)
  opportunities.sort((a, b) => {
    const scoreA = a.conviction * a.timing * Math.log10(Math.max(a.expectedValue, 1));
    const scoreB = b.conviction * b.timing * Math.log10(Math.max(b.expectedValue, 1));
    return scoreB - scoreA;
  });

  // Assign ranks
  opportunities.forEach((opp, i) => { opp.rank = i + 1; });

  return {
    opportunities,
    topPick: opportunities[0] || null,
    totalOpportunities: opportunities.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Scan debt engine for paydown opportunities
 */
function scanDebtOpportunities(eng, startId) {
  const opps = [];
  if (!eng.debtPriority?.actions?.length) return opps;

  eng.debtPriority.actions.filter(a => a.apr > 0).forEach((a, i) => {
    opps.push({
      id: `opp-${startId + i}`,
      title: `Pay down ${a.name} (${a.apr}% APR)`,
      source: 'Debt Engine',
      conviction: Math.min(10, Math.round(a.apr / 2)),
      timing: a.apr > 15 ? 10 : a.apr > 8 ? 7 : 5,
      expectedValue: a.annualInterest || 0,
      action: `Allocate £${Math.round(a.balance || 0).toLocaleString()} to paydown`,
      rationale: `${a.apr}% guaranteed return via interest saved. Annual drag: £${Math.round(a.annualInterest || 0).toLocaleString()}.`,
    });
  });

  return opps;
}

/**
 * Scan ISA/pension routing for deployment opportunities
 */
function scanISAOpportunities(eng, startId) {
  const opps = [];
  const isa = eng.isaPensionRouting;
  if (!isa) return opps;

  // ISA headroom
  if (isa.isaHeadroom?.remaining > 0) {
    const days = isa.daysUntilTaxYearEnd || 365;
    opps.push({
      id: `opp-${startId}`,
      title: `Deploy £${isa.isaHeadroom.remaining.toLocaleString()} to ISA`,
      source: 'ISA Engine',
      conviction: 8,
      timing: days <= 14 ? 10 : days <= 30 ? 8 : days <= 90 ? 6 : 4,
      expectedValue: isa.isaHeadroom.remaining * 0.008,
      action: `Fund ISA with £${isa.isaHeadroom.remaining.toLocaleString()} — ${days} days until deadline`,
      rationale: `Tax-free growth worth 80-120bps/yr. ${days <= 30 ? 'Deadline imminent.' : ''}`,
    });
  }

  // Salary sacrifice
  if (isa.salarySacrificeValue?.totalSaving > 0) {
    opps.push({
      id: `opp-${startId + 1}`,
      title: 'Arrange salary sacrifice',
      source: 'ISA Engine',
      conviction: 7,
      timing: isa.salarySacrificeValue.inTaperZone ? 9 : 5,
      expectedValue: isa.salarySacrificeValue.totalSaving,
      action: 'Speak to payroll about pension salary sacrifice',
      rationale: `£${Math.round(isa.salarySacrificeValue.totalSaving).toLocaleString()}/yr tax saved. ${isa.salarySacrificeValue.inTaperZone ? 'In taper zone — 60% effective rate.' : ''}`,
    });
  }

  return opps;
}

/**
 * Scan rebalance engine for trade opportunities
 */
function scanRebalanceOpportunities(eng, startId) {
  const opps = [];
  if (!eng.rebalanceProposal?.trades?.length) return opps;

  const drift = eng.driftMonitor?.maxDrift || 0;
  opps.push({
    id: `opp-${startId}`,
    title: `Execute rebalance (${eng.rebalanceProposal.trades.length} trades)`,
    source: 'Rebalance Engine',
    conviction: drift > 5 ? 8 : drift > 3 ? 6 : 4,
    timing: eng.rebalanceProposal.status === 'Action Recommended' ? 8 : 5,
    expectedValue: drift * 100,
    action: `Rebalance to reduce max drift from ${drift.toFixed(1)}%`,
    rationale: `${eng.rebalanceProposal.trades.length} trades needed. ${eng.rebalanceProposal.status}. Max drift: ${drift.toFixed(1)}%.`,
  });

  return opps;
}

/**
 * Scan market engines for dislocation opportunities
 */
function scanMarketOpportunities(mkt, startId) {
  const opps = [];
  if (!mkt) return opps;

  // Crypto accumulation opportunity
  if (mkt.btcCycle?.bias >= 3) {
    opps.push({
      id: `opp-${startId}`,
      title: `BTC accumulation — ${mkt.btcCycle.phase} phase`,
      source: 'BTC Cycle Engine',
      conviction: Math.min(10, mkt.btcCycle.bias * 2),
      timing: mkt.btcCycle.bias >= 4 ? 9 : 6,
      expectedValue: 5000,
      action: `Accumulate BTC — cycle bias ${mkt.btcCycle.bias}/5`,
      rationale: `${mkt.btcCycle.phase} with ${mkt.btcCycle.confidence || 0}% confidence. ${mkt.btcCycle.posture || ''}`,
    });
  }

  // Stress-driven buying opportunity
  if (mkt.stress?.compositeScore > 70) {
    opps.push({
      id: `opp-${startId + 1}`,
      title: 'Stress-driven buying opportunity',
      source: 'Stress Engine',
      conviction: 6,
      timing: 7,
      expectedValue: 2000,
      action: 'Deploy cash into quality names at discounted prices',
      rationale: `Composite stress ${mkt.stress.compositeScore}/100 — historically elevated levels precede recoveries. Size conservatively.`,
    });
  }

  return opps;
}

/**
 * Scan concentration engine for fixes
 */
function scanConcentrationOpportunities(eng, holdings, startId) {
  const opps = [];
  if (!eng.concentration) return opps;

  // Clutter cleanup
  if (eng.concentration.clutter?.count > 5) {
    opps.push({
      id: `opp-${startId}`,
      title: `Consolidate ${eng.concentration.clutter.count} clutter positions`,
      source: 'Concentration Engine',
      conviction: 5,
      timing: 4,
      expectedValue: (eng.concentration.clutter.totalValue || 0) * 0.02,
      action: `Sell ${eng.concentration.clutter.count} positions under 1% to reduce complexity`,
      rationale: `£${(eng.concentration.clutter.totalValue || 0).toLocaleString()} in sub-1% positions. Consolidation improves signal-to-noise.`,
    });
  }

  // Position violations
  if (eng.concentration.violations?.length > 0) {
    eng.concentration.violations.forEach((v, i) => {
      opps.push({
        id: `opp-${startId + 1 + i}`,
        title: `Trim ${v.item} from ${v.actual}% to ${v.limit}%`,
        source: 'Concentration Engine',
        conviction: 7,
        timing: v.actual > 25 ? 8 : 5,
        expectedValue: 1000,
        action: `Reduce ${v.item} position to below ${v.limit}% limit`,
        rationale: `${v.type}: ${v.item} at ${v.actual}% (limit: ${v.limit}%). Concentration risk.`,
      });
    });
  }

  return opps;
}

/**
 * Scan wrapper engine for optimisation opportunities
 */
function scanWrapperOpportunities(eng, startId) {
  const opps = [];
  if (!eng.wrapperExposure?.reallocationOpportunities?.length) return opps;

  opps.push({
    id: `opp-${startId}`,
    title: `Bed & ISA ${eng.wrapperExposure.reallocationOpportunities.length} positions`,
    source: 'Wrapper Engine',
    conviction: 6,
    timing: 5,
    expectedValue: eng.wrapperExposure.totalAnnualBenefitFromReallocation || 0,
    action: `Move GIA holdings to ISA for £${(eng.wrapperExposure.totalAnnualBenefitFromReallocation || 0).toLocaleString()}/yr structural alpha`,
    rationale: `${eng.wrapperExposure.efficiency?.giaExposurePct || 0}% GIA exposure. Bed & ISA candidates identified.`,
  });

  return opps;
}
