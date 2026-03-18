// =========================================================================
// LIFESTACK OS — RESEARCH BACKLOG ENGINE
// Phase 4: Research & Decisioning
// Ranked research backlog — what to investigate next, prioritised by
// expected value and urgency
// =========================================================================

/**
 * Compute the research backlog — ranked list of topics to investigate
 * Sources: engine alerts, market regime changes, new opportunities, thesis reviews
 */
export function computeResearchBacklog(engineState, marketState) {
  if (!engineState) return null;

  const now = new Date();
  const backlog = [];

  // 1. Engine-driven research items
  const engineItems = scanEngineForResearch(engineState);
  backlog.push(...engineItems);

  // 2. Market-driven research items
  const marketItems = scanMarketForResearch(marketState);
  backlog.push(...marketItems);

  // 3. Structural research items
  const structuralItems = scanStructuralResearch(engineState);
  backlog.push(...structuralItems);

  // 4. Periodic review items
  const periodicItems = scanPeriodicResearch(now);
  backlog.push(...periodicItems);

  // Sort by priority (higher = more important)
  backlog.sort((a, b) => b.priority - a.priority);

  // Assign status
  backlog.forEach((item, i) => {
    item.rank = i + 1;
    if (!item.status) item.status = 'pending';
  });

  return {
    backlog,
    topPriority: backlog[0] || null,
    totalItems: backlog.length,
    completedThisWeek: 0, // updated externally
    timestamp: now.toISOString(),
  };
}

/**
 * Scan engine state for research-worthy items
 */
function scanEngineForResearch(eng) {
  const items = [];

  // High drift -> research rebalance timing
  if (eng.driftMonitor?.maxDrift > 3) {
    items.push({
      topic: 'Rebalance timing analysis',
      priority: eng.driftMonitor.maxDrift > 5 ? 9 : 6,
      source: 'Drift Engine',
      estimatedValue: `Reduce drift from ${eng.driftMonitor.maxDrift.toFixed(1)}%`,
      status: 'pending',
    });
  }

  // Concentration violations -> research trim candidates
  if (eng.concentration?.violations?.length > 0) {
    eng.concentration.violations.forEach(v => {
      items.push({
        topic: `Position sizing review: ${v.item}`,
        priority: v.actual > 25 ? 8 : 6,
        source: 'Concentration Engine',
        estimatedValue: `Reduce ${v.item} from ${v.actual}% to ${v.limit}%`,
        status: 'pending',
      });
    });
  }

  // Wrapper inefficiency -> research Bed & ISA
  if (eng.wrapperExposure?.efficiency?.giaExposurePct > 30) {
    items.push({
      topic: 'Bed & ISA candidate analysis',
      priority: 5,
      source: 'Wrapper Engine',
      estimatedValue: `£${(eng.wrapperExposure.totalAnnualBenefitFromReallocation || 0).toLocaleString()}/yr structural alpha`,
      status: 'pending',
    });
  }

  // High-APR debt -> research paydown strategy
  if (eng.debtPriority?.highestAPR > 8) {
    items.push({
      topic: 'Debt paydown vs investment analysis',
      priority: eng.debtPriority.highestAPR > 15 ? 9 : 7,
      source: 'Debt Engine',
      estimatedValue: `${eng.debtPriority.highestAPR}% guaranteed return`,
      status: 'pending',
    });
  }

  // Currency risk -> research hedging
  if (eng.currencyExposure?.risks?.length > 0) {
    items.push({
      topic: 'FX hedging strategy review',
      priority: 4,
      source: 'Currency Engine',
      estimatedValue: 'Reduce FX volatility drag',
      status: 'pending',
    });
  }

  return items;
}

/**
 * Scan market state for research topics
 */
function scanMarketForResearch(mkt) {
  const items = [];
  if (!mkt) return items;

  // Regime change -> research implications
  if (mkt.regime?.regimeChanged) {
    items.push({
      topic: `Regime shift analysis: ${mkt.regime.regime}`,
      priority: 9,
      source: 'Regime Engine',
      estimatedValue: 'Allocation alignment with new regime',
      status: 'pending',
    });
  }

  // Elevated stress -> research defensive positioning
  if (mkt.stress?.compositeScore > 50) {
    items.push({
      topic: 'Defensive positioning review',
      priority: mkt.stress.compositeScore > 70 ? 8 : 5,
      source: 'Stress Engine',
      estimatedValue: 'Risk mitigation during elevated stress',
      status: 'pending',
    });
  }

  // BTC cycle opportunity
  if (mkt.btcCycle?.bias >= 3) {
    items.push({
      topic: `BTC accumulation thesis: ${mkt.btcCycle.phase} phase`,
      priority: 6,
      source: 'BTC Cycle Engine',
      estimatedValue: 'Asymmetric crypto upside',
      status: 'pending',
    });
  }

  // Credit stress -> research bond exposure
  if (mkt.creditStress?.compositeScore > 40) {
    items.push({
      topic: 'Fixed income exposure review',
      priority: 5,
      source: 'Credit Stress Engine',
      estimatedValue: 'Protect against credit deterioration',
      status: 'pending',
    });
  }

  // Sector rotation
  if (mkt.sectorLeadership?.leaders?.length > 0) {
    items.push({
      topic: `Sector rotation analysis: ${mkt.sectorLeadership.leaders.slice(0, 3).join(', ')}`,
      priority: 4,
      source: 'Sector Leadership Engine',
      estimatedValue: 'Factor alignment with leadership',
      status: 'pending',
    });
  }

  return items;
}

/**
 * Scan for structural research needs
 */
function scanStructuralResearch(eng) {
  const items = [];

  // Clutter cleanup research
  if (eng.concentration?.clutter?.count > 5) {
    items.push({
      topic: `Clutter audit: ${eng.concentration.clutter.count} sub-1% positions`,
      priority: 3,
      source: 'Concentration Engine',
      estimatedValue: 'Reduce complexity and improve signal-to-noise',
      status: 'pending',
    });
  }

  // ISA strategy research (if significant headroom)
  if (eng.isaPensionRouting?.isaHeadroom?.remaining > 5000) {
    items.push({
      topic: 'ISA deployment strategy',
      priority: eng.isaPensionRouting.daysUntilTaxYearEnd <= 60 ? 8 : 4,
      source: 'ISA Engine',
      estimatedValue: `£${eng.isaPensionRouting.isaHeadroom.remaining.toLocaleString()} to deploy`,
      status: 'pending',
    });
  }

  return items;
}

/**
 * Periodic research items based on calendar
 */
function scanPeriodicResearch(now) {
  const items = [];
  const month = now.getMonth() + 1;

  // Quarterly: thesis review
  if (month % 3 === 0) {
    items.push({
      topic: 'Quarterly thesis review — re-underwrite all active themes',
      priority: 5,
      source: 'Calendar',
      estimatedValue: 'Maintain investment discipline',
      status: 'pending',
    });
  }

  // Annual: strategic asset allocation review
  if (month === 1) {
    items.push({
      topic: 'Annual strategic asset allocation review',
      priority: 7,
      source: 'Calendar',
      estimatedValue: 'Ensure long-term alignment with goals',
      status: 'pending',
    });
  }

  // Pre-ISA deadline: tax planning
  if (month === 2 || month === 3) {
    items.push({
      topic: 'Tax year-end planning review',
      priority: 7,
      source: 'Calendar',
      estimatedValue: 'Maximise tax efficiency before April',
      status: 'pending',
    });
  }

  return items;
}
